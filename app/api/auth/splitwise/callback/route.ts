/**
 * Splitwise OAuth Callback Endpoint
 * 
 * GET /api/auth/splitwise/callback
 * 
 * Handles the OAuth callback from Splitwise, exchanges code for tokens,
 * and stores them in the database.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForTokens,
  createSplitwiseClient,
} from '@/src/server/lib/splitwise';
import { updateUser, getUser } from '@/src/server/lib/database';
import { encrypt } from '@/src/server/lib/encryption';
import { getUserFromToken } from '@/src/server/lib/auth';

// Force dynamic rendering (uses query parameters)
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/splitwise/callback
 * 
 * Query params from Splitwise:
 * - code: Authorization code
 * - state: Session token (for verification)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This is the session_token

    // Validate parameters
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code not provided' },
        { status: 400 }
      );
    }

    if (!state) {
      return NextResponse.json(
        { error: 'State parameter missing' },
        { status: 400 }
      );
    }

    // Verify session token
    const sessionToken = state;
    const user = await getUserFromToken(sessionToken);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session token' },
        { status: 401 }
      );
    }

    // Exchange code for tokens
    const tokenData = await exchangeCodeForTokens(code);

    // Calculate token expiry (default to 90 days if not provided)
    const expiresInSeconds = tokenData.expires_in || 7776000; // 90 days default
    const expiresAt = new Date(
      Date.now() + (expiresInSeconds * 1000)
    ).toISOString();

    // Encrypt and store tokens
    await updateUser(sessionToken, {
      splitwise_access_token: encrypt(tokenData.access_token),
      splitwise_refresh_token: tokenData.refresh_token 
        ? encrypt(tokenData.refresh_token)
        : undefined,
      splitwise_token_expires: expiresAt,
    });

    // Get Splitwise user info and store ID
    const client = await createSplitwiseClient(sessionToken);
    const splitwiseUser = await client.getCurrentUser();
    
    await updateUser(sessionToken, {
      splitwise_user_id: String(splitwiseUser.id),
    });

    // Success! Redirect to success page or back to app
    const successUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${successUrl}/?splitwise=connected&user=${encodeURIComponent(splitwiseUser.first_name)}`
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Callback failed';
    
    // Redirect to error page
    const errorUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${errorUrl}/?splitwise=error&message=${encodeURIComponent(errorMessage)}`
    );
  }
}
