/**
 * Initiate Payment Tool
 * 
 * MCP tool to create a Stripe checkout session for the user.
 */

import { createCheckoutSession, getPricingInfo } from '../../lib/stripe';
import { getUser } from '../../lib/database';

export interface InitiatePaymentInput {
  session_token: string;
  success_url?: string;
  cancel_url?: string;
}

export interface InitiatePaymentResult {
  checkout_url: string;
  session_id: string;
  pricing: {
    price: string;
    original_price: string;
    discount_percentage: number;
  };
  expires_at: number;
  display_instructions: string;
}

/**
 * Create a Stripe checkout session
 */
export async function initiatePayment(
  input: InitiatePaymentInput
): Promise<InitiatePaymentResult> {
  const { session_token, success_url, cancel_url } = input;

  // Get user
  const user = await getUser(session_token);
  
  if (!user) {
    throw new Error('User not found. Please register first.');
  }

  // Check if user already paid
  if (user.payment_status === 'paid') {
    throw new Error('You already have lifetime access! No payment needed.');
  }

  // Create checkout session
  const checkoutSession = await createCheckoutSession(
    session_token,
    user.email,
    success_url,
    cancel_url
  );

  if (!checkoutSession.url) {
    throw new Error('Failed to create checkout session');
  }

  // Get pricing info
  const pricing = getPricingInfo();

  return {
    checkout_url: checkoutSession.url,
    session_id: checkoutSession.id,
    pricing: {
      price: pricing.formattedPrice,
      original_price: pricing.formattedOriginalPrice,
      discount_percentage: pricing.discountPercentage,
    },
    expires_at: checkoutSession.expires_at,
    display_instructions: 'IMPORTANT: Display the full checkout_url exactly as provided, including all characters after the # symbol. Do not truncate or modify the URL. Present it as a clickable link.',
  };
}

/**
 * Tool definition for MCP
 */
export const initiatePaymentTool = {
  name: 'initiate_payment',
  description: 'Create a Stripe checkout session for the user to upgrade to paid access. Returns a checkout URL. CRITICAL: The checkout_url contains a hash fragment (#) with encrypted payment data - you MUST display the COMPLETE URL including everything after the # symbol. Do not truncate the URL at the hash. Present it as a clickable link to the user.',
  inputSchema: {
    type: 'object',
    properties: {
      session_token: {
        type: 'string',
        description: 'User session token',
      },
      success_url: {
        type: 'string',
        description: 'URL to redirect after successful payment (optional)',
      },
      cancel_url: {
        type: 'string',
        description: 'URL to redirect if payment is cancelled (optional)',
      },
    },
    required: ['session_token'],
  },
  annotations: {
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
  },
};
