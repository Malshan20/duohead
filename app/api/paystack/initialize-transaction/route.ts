// app/api/paystack/initialize-transaction/route.ts
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
    throw new Error(data.message || 'Paystack API error')
  }
  return data
}

export async function POST(request: Request) {
  try {
    const { tier, userId, userEmail } = await request.json()

    if (!tier || !userId || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const planCode = PAYSTACK_PLAN_CODES[tier as keyof typeof PAYSTACK_PLAN_CODES]
    if (!planCode) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    // Fetch plan to get amount
    const plan = await paystackRequest(`/plan/${planCode}`)
    const amount = plan.data.amount // in subunit, e.g., kobo for NGN

    const metadata = {
      user_id: userId,
      subscription_tier: tier,
    }

    const transactionBody = {
      email: userEmail,
      amount,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings/success`,
      metadata,
      channels: ['card'],
    }

    const initResponse = await paystackRequest('/transaction/initialize', 'POST', transactionBody)

    return NextResponse.json({ authorization_url: initResponse.data.authorization_url })
  } catch (error: any) {
    console.error('Error initializing Paystack transaction:', error)
    return NextResponse.json({ error: error.message || 'Failed to initialize transaction' }, { status: 500 })
  }
}