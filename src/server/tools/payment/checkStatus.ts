/**
 * Check Payment Status Tool
 * 
 * MCP tool to check if a user needs to pay and get usage summary.
 */

import { getUsageSummary } from '../../lib/usage';
import { getUser } from '../../lib/database';
import { getPricingInfo } from '../../lib/stripe';

export interface CheckPaymentStatusInput {
  session_token: string;
}

export interface CheckPaymentStatusResult {
  payment_required: boolean;
  payment_status: 'free' | 'paid';
  message_count: number;
  messages_remaining: number;
  pricing: {
    price: string;
    original_price: string;
    discount_percentage: number;
  };
  user_info?: {
    email: string;
    created_at: string;
  };
}

/**
 * Check user's payment status and usage
 */
export async function checkPaymentStatus(
  input: CheckPaymentStatusInput
): Promise<CheckPaymentStatusResult> {
  const { session_token } = input;

  // Get user
  const user = await getUser(session_token);
  
  if (!user) {
    throw new Error('User not found. Please register first.');
  }

  // Get usage summary
  const usage = await getUsageSummary(session_token);

  // Get pricing info
  const pricing = getPricingInfo();

  return {
    payment_required: usage.requiresPayment,
    payment_status: usage.paymentStatus,
    message_count: usage.messageCount,
    messages_remaining: usage.messagesRemaining,
    pricing: {
      price: pricing.formattedPrice,
      original_price: pricing.formattedOriginalPrice,
      discount_percentage: pricing.discountPercentage,
    },
    user_info: {
      email: user.email,
      created_at: user.created_at,
    },
  };
}

/**
 * Tool definition for MCP
 */
export const checkPaymentStatusTool = {
  name: 'check_payment_status',
  description: 'Check if the user needs to pay and get their usage summary. Use this before any paid operations.',
  inputSchema: {
    type: 'object',
    properties: {
      session_token: {
        type: 'string',
        description: 'User session token',
      },
    },
    required: ['session_token'],
  },
  annotations: {
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
  },
};
