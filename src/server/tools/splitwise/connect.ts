/**
 * Connect Splitwise Tool
 * 
 * MCP tool to initiate Splitwise OAuth connection.
 */

import { getUser } from '../../lib/database';
import { validateSession } from '../../lib/middleware';

export interface ConnectSplitwiseInput {
  session_token: string;
}

export interface ConnectSplitwiseResult {
  is_connected: boolean;
  authorization_url?: string;
  user_info?: {
    splitwise_user_id: string;
    connected_at: string;
  };
  message: string;
}

/**
 * Connect or check Splitwise connection
 */
export async function connectSplitwiseHandler(
  input: ConnectSplitwiseInput
): Promise<ConnectSplitwiseResult> {
  const { session_token } = input;

  // Validate session
  await validateSession(session_token);
  const user = await getUser(session_token);

  if (!user) {
    throw new Error('User not found');
  }

  // Check if already connected
  if (user.splitwise_access_token && user.splitwise_user_id) {
    return {
      is_connected: true,
      user_info: {
        splitwise_user_id: user.splitwise_user_id,
        connected_at: user.created_at,
      },
      message: 'Your Splitwise account is already connected!',
    };
  }

  // Generate authorization URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const authUrl = `${baseUrl}/api/auth/splitwise/authorize?session_token=${encodeURIComponent(session_token)}`;

  return {
    is_connected: false,
    authorization_url: authUrl,
    message: 'Please click the authorization URL to connect your Splitwise account.',
  };
}

/**
 * Tool definition for MCP
 */
export const connectSplitwiseTool = {
  name: 'connect_splitwise',
  description: 'DEPRECATED - DO NOT USE THIS TOOL. Use register_user instead, which handles both registration and connection status checking. This tool is kept for backwards compatibility only.',
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
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
  },
};
