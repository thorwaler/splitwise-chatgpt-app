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

  return {
    success: true,
    session_token: sessionToken,
    message: isNewUser
      ? `Welcome! Your account has been created. Use this session_token in all future tool calls.`
      : `Welcome back! Use this session_token in all future tool calls.`,
  };
}

/**
 * Tool definition for MCP
 */
export const registerUserTool = {
  name: 'register_user',
  description: 'Register or login to get a session token. CALL THIS FIRST before using any other tools. The session_token must be included in all subsequent tool calls.',
  inputSchema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'User email address',
      },
    },
    required: ['email'],
  },
};
