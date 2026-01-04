/**
 * Splitwise OAuth Authorization Endpoint
 * 
 * GET /api/auth/splitwise/authorize
 * 
 * Initiates OAuth flow by redirecting to Splitwise authorization page.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/src/server/lib/splitwise';
import { getUserFromToken } from '@/src/server/lib/auth';

// Force dynamic rendering (uses query parameters)
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/splitwise/authorize
 * 
 * Query params:
 * - session_token: User's JWT session token
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionToken = searchParams.get('session_token');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'session_token is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await getUserFromToken(sessionToken);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session token' },
        { status: 401 }
      );
    }

    // Use session token as state parameter for callback verification
    const authUrl = getAuthorizationUrl(sessionToken);

    // Redirect to Splitwise authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('OAuth authorization error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Authorization failed';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
