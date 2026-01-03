/**
 * Stripe Webhook Handler
 * 
 * POST /api/stripe/webhook - Handle Stripe webhook events
 * 
 * Handles payment events and updates user payment status.
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import {
  constructWebhookEvent,
  isPaymentSuccessful,
  getSessionTokenFromPaymentIntent,
} from '@/src/server/lib/stripe';
import {
  markUserAsPaid,
  createPayment,
  updatePaymentStatus,
  getUser,
} from '@/src/server/lib/database';
import type Stripe from 'stripe';

/**
 * Disable body parsing - Stripe requires raw body for signature verification
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/webhook - Handle webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body
    const body = await request.text();
    
    // Get Stripe signature
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature and construct event
    let event: Stripe.Event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  console.log('Checkout session completed:', session.id);

  const sessionToken = session.metadata?.session_token;
  const userEmail = session.metadata?.user_email;

  if (!sessionToken) {
    console.error('Missing session_token in checkout session metadata');
    return;
  }

  // Verify user exists
  const user = await getUser(sessionToken);
  if (!user) {
    console.error(`User not found for session token: ${sessionToken}`);
    return;
  }

  // Create payment record
  const paymentIntentId = session.payment_intent as string;
  if (paymentIntentId) {
    await createPayment({
      payment_intent_id: paymentIntentId,
      user_session_token: sessionToken,
      amount: session.amount_total || 0,
      status: 'pending',
      created_at: new Date().toISOString(),
    });
  }

  console.log(`Checkout session completed for user: ${userEmail}`);
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  console.log('Payment intent succeeded:', paymentIntent.id);

  const sessionToken = getSessionTokenFromPaymentIntent(paymentIntent);

  if (!sessionToken) {
    console.error('Missing session_token in payment intent metadata');
    return;
  }

  // Verify payment was successful
  if (!isPaymentSuccessful(paymentIntent)) {
    console.error(`Payment intent not successful: ${paymentIntent.status}`);
    return;
  }

  // Update payment status
  await updatePaymentStatus(paymentIntent.id, 'completed');

  // Mark user as paid
  await markUserAsPaid(sessionToken);

  console.log(`User upgraded to paid: ${sessionToken}`);

  // Optional: Send confirmation email here
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  console.log('Payment intent failed:', paymentIntent.id);

  // Update payment status
  await updatePaymentStatus(paymentIntent.id, 'failed');

  const sessionToken = getSessionTokenFromPaymentIntent(paymentIntent);
  
  console.error(`Payment failed for user: ${sessionToken}`);

  // Optional: Send failure notification email here
}

/**
 * Handle charge.refunded event
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  console.log('Charge refunded:', charge.id);

  const paymentIntentId = charge.payment_intent as string;

  if (paymentIntentId) {
    // Update payment status
    await updatePaymentStatus(paymentIntentId, 'failed');

    // Note: You might want to revoke user's paid access here
    // For now, we'll just log it
    console.warn(`Refund issued for payment intent: ${paymentIntentId}`);
  }
}

/**
 * GET handler - Return webhook info
 */
export async function GET() {
  return NextResponse.json({
    service: 'Stripe Webhook Handler',
    version: '1.0.0',
    events: [
      'checkout.session.completed',
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'charge.refunded',
    ],
  });
}
