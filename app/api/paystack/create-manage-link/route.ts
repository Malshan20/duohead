import { NextResponse } from 'next/server'

const PAYSTACK_BASE_URL = 'https://api.paystack.co'
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

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
    const { subscription_code } = await request.json()

    if (!subscription_code) {
      return NextResponse.json({ error: 'Missing subscription_code' }, { status: 400 })
    }

    const manageResponse = await paystackRequest(`/subscription/${subscription_code}/manage/link`)

    return NextResponse.json({ url: manageResponse.data.link })
  } catch (error: any) {
    console.error('Error creating Paystack manage link:', error)
    return NextResponse.json({ error: error.message || 'Failed to create manage link' }, { status: 500 })
  }
}