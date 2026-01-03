/**
 * User Registration API
 * 
 * POST /api/user - Register or login a user by email
 * GET /api/user - Get current user info by session token
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerOrGetUser, getUserFromToken } from '@/src/server/lib/auth';
import { getUsageSummary } from '@/src/server/lib/usage';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Handle OPTIONS request (CORS preflight)
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * POST /api/user - Register or get existing user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Register or get user
    const result = await registerOrGetUser(email);

    // Get usage summary
    const usage = await getUsageSummary(result.sessionToken);

    return NextResponse.json(
      {
        success: true,
        user: {
          email: result.user.email,
          created_at: result.user.created_at,
          payment_status: result.user.payment_status,
        },
        session_token: result.sessionToken,
        is_new_user: result.isNewUser,
        usage: {
          message_count: usage.messageCount,
          messages_remaining: usage.messagesRemaining,
          payment_status: usage.paymentStatus,
          requires_payment: usage.requiresPayment,
        },
      },
      { status: result.isNewUser ? 201 : 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('User registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 400, headers: corsHeaders }
    );
  }
}

/**
 * GET /api/user - Get current user info
 */
export async function GET(request: NextRequest) {
  try {
    // Get session token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const sessionToken = authHeader?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Get user
    const user = await getUserFromToken(sessionToken);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session token' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Get usage summary
    const usage = await getUsageSummary(sessionToken);

    return NextResponse.json(
      {
        success: true,
        user: {
          email: user.email,
          created_at: user.created_at,
          payment_status: user.payment_status,
          splitwise_connected: !!user.splitwise_user_id,
          default_group_id: user.default_group_id,
          default_split_type: user.default_split_type,
        },
        usage: {
          message_count: usage.messageCount,
          messages_remaining: usage.messagesRemaining,
          payment_status: usage.paymentStatus,
          requires_payment: usage.requiresPayment,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Get user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: corsHeaders }
    );
  }
}
