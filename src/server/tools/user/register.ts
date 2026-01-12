/**
 * Register User Tool
 * 
 * MCP tool to register/login a user and get a session token.
 * This should be called before any other tools.
 */

import { registerOrGetUser } from '../../lib/auth';

export interface RegisterUserInput {
  email: string;
}

export interface RegisterUserResult {
  success: boolean;
  session_token: string;
  oauth_url: string;
  is_connected: boolean;
  message: string;
}

/**
 * Register or login a user
 */
export async function registerUserHandler(
  input: RegisterUserInput
): Promise<RegisterUserResult> {
  const { email } = input;

  if (!email || !email.includes('@')) {
    throw new Error('Valid email address is required');
  }

  // Register or get existing user
  const { sessionToken, isNewUser } = await registerOrGetUser(email);
  
  // Generate OAuth URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const oauthUrl = `${baseUrl}/api/auth/splitwise/authorize?session_token=${sessionToken}`;
  
  // Check if user is already connected (has Splitwise token)
  const { getUser } = await import('../../lib/database');
  const user = await getUser(sessionToken);
  const isConnected = !!(user && user.splitwise_access_token);

  return {
    success: true,
    session_token: sessionToken,
    oauth_url: oauthUrl,
    is_connected: isConnected,
    message: isNewUser
      ? `Welcome! Your account has been created. ${isConnected ? 'Your Splitwise account is already connected.' : 'Please authorize Splitwise at the oauth_url provided.'} Use the session_token in all future tool calls.`
      : `Welcome back! ${isConnected ? 'Your Splitwise account is connected.' : 'Please authorize Splitwise at the oauth_url provided.'} Use the session_token in all future tool calls.`,
  };
}

/**
 * Tool definition for MCP
 */
export const registerUserTool = {
  name: 'register_user',
  description: '⚠️ REQUIRED FIRST STEP ⚠️ You MUST call this tool BEFORE any other tools will work. This registers the user and returns: (1) session_token for all future calls, (2) oauth_url for Splitwise authorization, (3) is_connected status. IMPORTANT: If is_connected is false, provide the oauth_url to the user IMMEDIATELY in your response and ask them to click it to authorize. Once they return and say "connected" or similar, you can proceed with their request. If is_connected is true, proceed directly with their request. ALWAYS ask for the user\'s email AND their complete request details (expense description, amount, etc.) in your FIRST response to avoid multiple back-and-forth messages.',
  inputSchema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'User email address for registration. This will create a new account or login existing user.',
      },
    },
    required: ['email'],
  },
};
