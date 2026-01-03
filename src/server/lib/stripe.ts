/**
 * Stripe Payment Library
 * 
 * Handles all Stripe-related operations including checkout session creation,
 * payment verification, and webhook processing.
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

/**
 * Product configuration
 */
export const PRODUCT_CONFIG = {
  name: 'Splitwise ChatGPT App - Lifetime Access',
  description: 'Unlimited access to Splitwise ChatGPT App features',
  price: parseInt(process.env.NEXT_PUBLIC_PRICE_AMOUNT || '99'), // $0.99 in cents
  currency: (process.env.NEXT_PUBLIC_PRICE_CURRENCY || 'USD').toLowerCase(),
  originalPrice: parseInt(process.env.NEXT_PUBLIC_ORIGINAL_PRICE || '999'), // $9.99 in cents
};

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession(
  sessionToken: string,
  userEmail: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<Stripe.Checkout.Session> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: PRODUCT_CONFIG.currency,
          product_data: {
            name: PRODUCT_CONFIG.name,
            description: PRODUCT_CONFIG.description,
          },
          unit_amount: PRODUCT_CONFIG.price,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl || `${baseUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${baseUrl}/?payment=cancelled`,
    metadata: {
      session_token: sessionToken,
      user_email: userEmail,
    },
    // Enable automatic tax calculation (optional)
    automatic_tax: {
      enabled: false,
    },
    // Customer can only purchase once
    payment_intent_data: {
      metadata: {
        session_token: sessionToken,
        user_email: userEmail,
      },
    },
  });

  return session;
}

/**
 * Retrieve a checkout session
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return null;
  }
}

/**
 * Retrieve a payment intent
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent | null> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return null;
  }
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
    return event;
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error}`);
  }
}

/**
 * Check if a payment was successful
 */
export function isPaymentSuccessful(
  paymentIntent: Stripe.PaymentIntent
): boolean {
  return paymentIntent.status === 'succeeded';
}

/**
 * Extract session token from payment intent metadata
 */
export function getSessionTokenFromPaymentIntent(
  paymentIntent: Stripe.PaymentIntent
): string | null {
  return paymentIntent.metadata?.session_token || null;
}

/**
 * Create a customer portal session (for future use)
 */
export async function createPortalSession(
  customerId: string,
  returnUrl?: string
): Promise<Stripe.BillingPortal.Session> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || baseUrl,
  });

  return session;
}

/**
 * Calculate discount percentage
 */
export function getDiscountPercentage(): number {
  const percentage = Math.round(
    ((PRODUCT_CONFIG.originalPrice - PRODUCT_CONFIG.price) / 
    PRODUCT_CONFIG.originalPrice) * 100
  );
  return percentage;
}

/**
 * Format price for display
 */
export function formatPrice(amountInCents: number, currency: string = 'USD'): string {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

/**
 * Get pricing information
 */
export function getPricingInfo() {
  return {
    price: PRODUCT_CONFIG.price,
    originalPrice: PRODUCT_CONFIG.originalPrice,
    currency: PRODUCT_CONFIG.currency,
    formattedPrice: formatPrice(PRODUCT_CONFIG.price, PRODUCT_CONFIG.currency),
    formattedOriginalPrice: formatPrice(PRODUCT_CONFIG.originalPrice, PRODUCT_CONFIG.currency),
    discountPercentage: getDiscountPercentage(),
  };
}
