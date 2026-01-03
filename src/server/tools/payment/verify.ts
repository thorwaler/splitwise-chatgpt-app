/**
 * Verify Payment Tool
 * 
 * MCP tool to verify if a user's payment has been completed.
 */

import { getCheckoutSession } from '../../lib/stripe';
import { getUser, getPayment } from '../../lib/database';

export interface VerifyPaymentInput {
  session_token: string;
  checkout_session_id?: string;
}

export interface VerifyPaymentResult {
  payment_verified: boolean;
  payment_status: 'free' | 'paid';
  message: string;
  checkout_session?: {
    id: string;
    status: string;
    amount_paid: number;
    currency: string;
  };
}

/**
 * Verify if a user's payment has been completed
 */
export async function verifyPayment(
  input: VerifyPaymentInput
): Promise<VerifyPaymentResult> {
  const { session_token, checkout_session_id } = input;

  // Get user
  const user = await getUser(session_token);
  
  if (!user) {
    throw new Error('User not found. Please register first.');
  }

  // If user is already paid, return success
  if (user.payment_status === 'paid') {
    return {
      payment_verified: true,
      payment_status: 'paid',
      message: 'Payment verified! You have lifetime access.',
    };
  }

  // If checkout session ID provided, check Stripe
  if (checkout_session_id) {
    const checkoutSession = await getCheckoutSession(checkout_session_id);
    
    if (!checkoutSession) {
      throw new Error('Checkout session not found');
    }

    // Check if payment is complete
    if (checkoutSession.payment_status === 'paid') {
      return {
        payment_verified: true,
        payment_status: 'paid',
        message: 'Payment verified! Processing your upgrade...',
        checkout_session: {
          id: checkoutSession.id,
          status: checkoutSession.payment_status,
          amount_paid: checkoutSession.amount_total || 0,
          currency: checkoutSession.currency || 'usd',
        },
      };
    }

    // Payment not completed yet
    return {
      payment_verified: false,
      payment_status: 'free',
      message: `Payment status: ${checkoutSession.payment_status}. Please complete the payment.`,
      checkout_session: {
        id: checkoutSession.id,
        status: checkoutSession.payment_status,
        amount_paid: 0,
        currency: checkoutSession.currency || 'usd',
      },
    };
  }

  // No checkout session ID provided, just return current status
  return {
    payment_verified: false,
    payment_status: 'free',
    message: 'No payment found. Please upgrade to continue using paid features.',
  };
}

/**
 * Tool definition for MCP
 */
export const verifyPaymentTool = {
  name: 'verify_payment',
  description: 'Verify if a user\'s payment has been completed. Can check by checkout session ID.',
  inputSchema: {
    type: 'object',
    properties: {
      session_token: {
        type: 'string',
        description: 'User session token',
      },
      checkout_session_id: {
        type: 'string',
        description: 'Stripe checkout session ID to verify (optional)',
      },
    },
    required: ['session_token'],
  },
};
