/**
 * Tool Access Middleware
 * 
 * Helper functions to check and enforce tool access based on payment status
 * and usage limits.
 */

import { checkToolAccess, recordToolUsage } from './usage';
import { getUserFromToken } from './auth';

/**
 * Error class for payment required
 */
export class PaymentRequiredError extends Error {
  public readonly requiresPayment = true;
  public readonly messagesRemaining: number;
  public readonly checkoutUrl?: string;

  constructor(message: string, messagesRemaining: number = 0, checkoutUrl?: string) {
    super(message);
    this.name = 'PaymentRequiredError';
    this.messagesRemaining = messagesRemaining;
    this.checkoutUrl = checkoutUrl;
  }
}

/**
 * Error class for authentication required
 */
export class AuthenticationRequiredError extends Error {
  constructor(message: string = 'Please register or login to continue') {
    super(message);
    this.name = 'AuthenticationRequiredError';
  }
}

/**
 * Validate session token and get user
 */
export async function validateSession(sessionToken: string | undefined) {
  if (!sessionToken) {
    throw new AuthenticationRequiredError('Session token is required');
  }

  const user = await getUserFromToken(sessionToken);
  
  if (!user) {
    throw new AuthenticationRequiredError('Invalid session token. Please login again.');
  }

  return user;
}

/**
 * Check if user can access a tool and record usage
 * 
 * This should be called at the beginning of every tool that requires payment gating.
 */
export async function checkAndRecordToolAccess(
  sessionToken: string | undefined,
  toolName: string
): Promise<{
  allowed: boolean;
  user: any;
  usage: {
    messageCount: number;
    messagesRemaining: number;
  };
}> {
  // Validate session
  const user = await validateSession(sessionToken);

  // Check tool access
  const accessCheck = await checkToolAccess(sessionToken!, toolName);

  if (!accessCheck.allowed) {
    throw new PaymentRequiredError(
      accessCheck.reason || 'Payment required',
      accessCheck.messagesRemaining || 0
    );
  }

  // Record usage
  const usage = await recordToolUsage(sessionToken!, toolName);

  return {
    allowed: true,
    user,
    usage,
  };
}

/**
 * Format error response for MCP tools
 */
export function formatErrorResponse(error: unknown): {
  isError: true;
  message: string;
  requiresPayment?: boolean;
  messagesRemaining?: number;
  checkoutUrl?: string;
} {
  if (error instanceof PaymentRequiredError) {
    return {
      isError: true,
      message: error.message,
      requiresPayment: error.requiresPayment,
      messagesRemaining: error.messagesRemaining,
      checkoutUrl: error.checkoutUrl,
    };
  }

  if (error instanceof AuthenticationRequiredError) {
    return {
      isError: true,
      message: error.message,
    };
  }

  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  
  return {
    isError: true,
    message,
  };
}

/**
 * Wrapper for tool execution with automatic access checking
 */
export async function executeToolWithAccessCheck<TInput, TResult>(
  toolName: string,
  input: TInput & { session_token?: string },
  handler: (input: TInput, user: any) => Promise<TResult>
): Promise<TResult> {
  try {
    // Check access and record usage
    const { user, usage } = await checkAndRecordToolAccess(
      input.session_token,
      toolName
    );

    // Execute the tool handler
    const result = await handler(input, user);

    return result;
  } catch (error) {
    // Re-throw to be handled by the calling code
    throw error;
  }
}

/**
 * Get usage warning message for user
 */
export function getUsageWarningMessage(messagesRemaining: number): string | null {
  if (messagesRemaining === 0) {
    return null; // No warning needed, they'll get payment required error
  }

  if (messagesRemaining === 1) {
    return '⚠️ This is your last free message. Upgrade for unlimited access!';
  }

  if (messagesRemaining === 2) {
    return '⚠️ You have 2 free messages remaining.';
  }

  return null;
}
