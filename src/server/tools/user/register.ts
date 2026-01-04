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
  description: '⚠️ REQUIRED FIRST STEP ⚠️ You MUST call this tool BEFORE any other tools will work. This registers the user and returns a session_token that is required for ALL subsequent tool calls. Call this immediately when the user first interacts with this app. Pass the user\'s email address to create their account and receive their session_token.',
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
