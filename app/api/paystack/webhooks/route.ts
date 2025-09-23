import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { buffer } from 'micro'; // Already installed
// @ts-ignore: No types for 'paystack'
import Paystack from 'paystack'; // Import Paystack SDK

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const paystack = new Paystack(PAYSTACK_SECRET_KEY);

export async function POST(req: Request) {
  const sigHeader = req.headers.get('x-paystack-signature');
  const rawBody = await buffer(req as any); // 'micro' buffer for raw body

  if (!sigHeader || !PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: 'Missing signature or secret key' }, { status: 400 });
  }

  // Verify the webhook signature using Paystack SDK
  const isValid = paystack.util.webhooks.verifyHmac(
    rawBody.toString(),
    sigHeader,
    PAYSTACK_SECRET_KEY
  );

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody.toString());
  console.log('Received Paystack webhook event:', event.event, event.data);

  const supabase = createServerClient();

  try {
    const { data: eventData } = event;
    const metadata = eventData.metadata || {};
    const userId = metadata.user_id;
    const tier = metadata.subscription_tier || eventData.plan?.name; // Fallback to plan name

    if (!userId) {
      console.warn('Webhook missing user_id in metadata:', event);
      return NextResponse.json({ received: true });
    }

    switch (event.event) {
      case 'subscription.create':
      case 'subscription.update':
        if (tier && eventData.status === 'active') {
          const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              subscription_tier: tier,
              subscription_status: 'active',
            },
          });
          if (authError) throw authError;

          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              subscription_tier: tier,
              subscription_status: 'active',
              paystack_customer_code: eventData.customer?.customer_code,
              paystack_subscription_code: eventData.subscription_code,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
          if (profileError) throw profileError;

          console.log(`Subscription activated/updated for user ${userId}: ${tier}`);
        }
        break;

      case 'subscription.disable':
        const { error: authErrorDisable } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            subscription_status: eventData.status === 'cancelled' ? 'cancelled' : 'expired',
          },
        });
        if (authErrorDisable) throw authErrorDisable;

        const { error: profileErrorDisable } = await supabase
          .from('profiles')
          .update({
            subscription_status: eventData.status === 'cancelled' ? 'cancelled' : 'expired',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
        if (profileErrorDisable) throw profileErrorDisable;

        console.log(`Subscription disabled for user ${userId}: ${eventData.status}`);
        break;

      case 'charge.success':
        if (tier && eventData.status === 'success') {
          const { error: authErrorCharge } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              subscription_status: 'active',
            },
          });
          if (authErrorCharge) throw authErrorCharge;

          const { error: profileErrorCharge } = await supabase
            .from('profiles')
            .update({
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
          if (profileErrorCharge) throw profileErrorCharge;

          console.log(`Charge successful (renewal) for user ${userId}: ${tier}`);
        }
        break;

      case 'charge.failed':
        const { error: authErrorFailed } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            subscription_status: 'past_due',
          },
        });
        if (authErrorFailed) throw authErrorFailed;

        const { error: profileErrorFailed } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
        if (profileErrorFailed) throw profileErrorFailed;

        console.log(`Charge failed for user ${userId}`);
        break;

      case 'subscription.expiring_cards':
        console.log(`Expiring cards notification for user ${userId}`);
        // TODO: Implement email notification logic here
        break;

      default:
        console.log('Unhandled Paystack event:', event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing Paystack webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing to access raw body
  },
};