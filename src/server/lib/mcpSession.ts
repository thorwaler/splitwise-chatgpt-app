/**
 * Session Management for Single-User MCP App
 * 
 * Since ChatGPT's MCP doesn't support OAuth or persistent sessions,
 * we create a single shared session for all MCP requests.
 */

import { registerOrGetUser } from './auth';

const SHARED_SESSION_EMAIL = 'chatgpt-mcp@splitwise-app.local';

let cachedSessionToken: string | null = null;

/**
 * Get or create the shared MCP session token
 */
export async function getMCPSessionToken(): Promise<string> {
  if (cachedSessionToken) {
    return cachedSessionToken;
  }

  const { sessionToken } = await registerOrGetUser(SHARED_SESSION_EMAIL);
  cachedSessionToken = sessionToken;
  
  return sessionToken;
}

/**
 * Clear the cached session (for testing/debugging)
 */
export function clearMCPSession(): void {
  cachedSessionToken = null;
}
