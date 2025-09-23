import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const PAYSTACK_BASE_URL = 'https://api.paystack.co'
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

const PAYSTACK_PLAN_CODES = {
  "Forest Guardian": "PLN_os0c04ttztct7ve",
  "Jungle Master": "PLN_4lanypztz0ktaj7",
}

async function paystackRequest(endpoint: string, method: string = 'GET', body?: any) {
  const headers = {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()
  if (!response.ok) {
    console.error(`Paystack API Error for ${endpoint}:`, data);
    throw new Error(data.message || 'Paystack API error');
  }
  return data
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get('reference')

  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
  }

  const supabase = createServerClient()

  try {
    console.log(`Verifying transaction with reference: ${reference}`);
    const verifyResponse = await paystackRequest(`/transaction/verify/${reference}`)
    console.log('Transaction verification response:', verifyResponse);

    const transaction = verifyResponse.data || verifyResponse; // Handle if data is at root level
    if (!transaction) {
      return NextResponse.json({ error: 'No transaction data found' }, { status: 400 })
    }

    if (transaction.status !== 'success') {
      return NextResponse.json({ error: `Transaction not successful: ${transaction.status}` }, { status: 400 })
    }

    const metadata = transaction.metadata || {}
    const userId = metadata.user_id
    const tier = metadata.subscription_tier

    if (!userId || !tier) {
      return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
    }

    const planCode = PAYSTACK_PLAN_CODES[tier as keyof typeof PAYSTACK_PLAN_CODES]
    if (!planCode) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    // Handle varying authorization and customer code structure
    let authorizationCode = transaction.authorization?.authorization_code || 
                           transaction.data?.authorization?.authorization_code;
    let customerCode = transaction.customer?.customer_code || 
                      transaction.data?.customer?.customer_code;

    if (!authorizationCode || !customerCode) {
      console.error('Transaction response structure:', transaction);
      return NextResponse.json({ error: 'Missing authorization or customer code' }, { status: 400 })
    }

    // List all subscriptions for this customer
    console.log(`Listing subscriptions for customer: ${customerCode}`);
    const listResponse = await paystackRequest(`/subscription?customer=${customerCode}&perPage=100`)
    console.log('Subscription list response:', listResponse);

    let existingActiveSub = null;
    if (listResponse.data && Array.isArray(listResponse.data)) {
      existingActiveSub = listResponse.data.find((sub: any) => 
        sub.status === 'active' && sub.plan?.plan_code === planCode
      );
    } else {
      console.error('Invalid subscription list response:', listResponse);
    }

    if (existingActiveSub) {
      // Subscription already active for this plan
      console.log('Found existing active subscription:', existingActiveSub);
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: tier,
          subscription_status: 'active',
          paystack_customer_code: customerCode,
          paystack_subscription_code: existingActiveSub.subscription_code,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (profileError) throw profileError

      const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          subscription_tier: tier,
          subscription_status: 'active',
        },
      })
      if (authError) throw authError

      // Attempt to enable or update the existing subscription if needed
      try {
        const updateResponse = await paystackRequest(`/subscription/enable`, 'POST', {
          code: existingActiveSub.subscription_code,
          token: authorizationCode,
        });
        console.log('Subscription enable/update response:', updateResponse);
      } catch (updateError) {
        console.warn('Failed to update existing subscription:', updateError.message);
        // Proceed even if update fails, as the subscription is already active
      }

      return NextResponse.json({ success: true, message: 'Subscription already active' })
    }

    // Create new subscription if no active subscription exists
    const subscriptionBody = {
      customer: customerCode,
      plan: planCode,
      authorization: authorizationCode,
    }

    console.log('Creating subscription with body:', subscriptionBody);
    const subResponse = await paystackRequest('/subscription', 'POST', subscriptionBody)
    console.log('Subscription creation response:', subResponse);

    const subscription = subResponse.data

    if (subscription.status !== 'active') {
      return NextResponse.json({ error: 'Subscription not active after creation' }, { status: 400 })
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        subscription_tier: tier,
        subscription_status: 'active',
      },
    })
    if (authError) throw authError

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        paystack_customer_code: customerCode,
        paystack_subscription_code: subscription.subscription_code,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (profileError) throw profileError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error completing Paystack checkout:', error)
    return NextResponse.json({ error: error.message || 'Failed to complete checkout' }, { status: 500 })
  }
}