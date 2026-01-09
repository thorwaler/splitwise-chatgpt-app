/**
 * Usage Tracking
 * 
 * Tracks tool usage and enforces message limits for free users.
 */

import {
  getUser,
  incrementMessageCount,
  trackUsage,
  hasExceededFreeLimit,
} from './database';

/**
 * Tool types that count towards message limit
 */
const COUNTED_TOOLS = new Set([
  'add_expense',
  'set_defaults',
  'create_payment',
]);

/**
 * Tool types that don't count (read-only operations)
 */
const FREE_TOOLS = new Set([
  'get_groups',
  'get_categories',
  'get_expense_analytics',
  'get_budget_status',
  'check_payment_status',
  'connect_splitwise',
]);

/**
 * Check if a tool should count towards message limit
 */
export function shouldCountTool(toolName: string): boolean {
  return COUNTED_TOOLS.has(toolName);
}

/**
 * Check if user can use a tool
 */
export async function checkToolAccess(
  sessionToken: string,
  toolName: string
): Promise<{
  allowed: boolean;
  reason?: string;
  messagesRemaining?: number;
  requiresPayment?: boolean;
}> {
  const user = await getUser(sessionToken);
  
  if (!user) {
    return {
      allowed: false,
      reason: 'User not found. Please register first.',
    };
  }
  
  // Paid users have unlimited access
  if (user.payment_status === 'paid') {
    return { allowed: true };
  }
  
  // Free tools don't count towards limit
  if (FREE_TOOLS.has(toolName)) {
    return { allowed: true };
  }
  
  // Check if tool counts towards limit
  if (!shouldCountTool(toolName)) {
    return { allowed: true };
  }
  
  // Check if user has exceeded free limit
  const exceeded = await hasExceededFreeLimit(sessionToken);
  
  if (exceeded) {
    const freeLimit = parseInt(process.env.NEXT_PUBLIC_FREE_MESSAGE_LIMIT || '10');
    return {
      allowed: false,
      reason: `You've used all ${freeLimit} free messages. Please upgrade to continue.`,
      messagesRemaining: 0,
      requiresPayment: true,
    };
  }
  
  // Calculate remaining messages
  const freeLimit = parseInt(process.env.NEXT_PUBLIC_FREE_MESSAGE_LIMIT || '10');
  const messagesRemaining = freeLimit - user.message_count;
  
  return {
    allowed: true,
    messagesRemaining,
  };
}

/**
 * Record tool usage
 */
export async function recordToolUsage(
  sessionToken: string,
  toolName: string
): Promise<{
  messageCount: number;
  messagesRemaining: number;
}> {
  // Track usage in logs
  await trackUsage(sessionToken, toolName);
  
  // Only increment count for counted tools
  let messageCount = 0;
  if (shouldCountTool(toolName)) {
    messageCount = await incrementMessageCount(sessionToken);
  } else {
    const user = await getUser(sessionToken);
    messageCount = user?.message_count || 0;
  }
  
  const freeLimit = parseInt(process.env.NEXT_PUBLIC_FREE_MESSAGE_LIMIT || '10');
  const messagesRemaining = Math.max(0, freeLimit - messageCount);
  
  return {
    messageCount,
    messagesRemaining,
  };
}

/**
 * Get usage summary for user
 */
export async function getUsageSummary(sessionToken: string): Promise<{
  messageCount: number;
  messagesRemaining: number;
  paymentStatus: 'free' | 'paid';
  requiresPayment: boolean;
}> {
  const user = await getUser(sessionToken);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const freeLimit = parseInt(process.env.NEXT_PUBLIC_FREE_MESSAGE_LIMIT || '10');
  const messagesRemaining = user.payment_status === 'paid' 
    ? Infinity 
    : Math.max(0, freeLimit - user.message_count);
  
  const requiresPayment = user.payment_status === 'free' && user.message_count >= freeLimit;
  
  return {
    messageCount: user.message_count,
    messagesRemaining: messagesRemaining === Infinity ? 999 : messagesRemaining,
    paymentStatus: user.payment_status,
    requiresPayment,
  };
}
