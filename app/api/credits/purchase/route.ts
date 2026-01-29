import { NextResponse } from 'next/server';
import stripe from '../../../../lib/stripe';

export async function POST(request: Request) {
  // Create a Stripe Checkout session for purchasing credits
  const body = await request.json().catch(() => ({}));
  const { success_url, cancel_url, quantity = 1 } = body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Aura Credits' },
            unit_amount: 1000
          },
          quantity
        }
      ],
      success_url: success_url || 'https://example.com/success',
      cancel_url: cancel_url || 'https://example.com/cancel'
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'stripe error' }, { status: 500 });
  }
}

