/**
 * Analytics API Route
 * 
 * Returns analytics data for the visualization page
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsEnhanced } from '@/src/server/tools/splitwise/getAnalyticsEnhanced';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionToken = searchParams.get('session_token');
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Missing session_token' },
        { status: 400 }
      );
    }

    const input: any = {
      session_token: sessionToken,
      include_charts: false, // Not needed for this route
    };

    // Optional parameters
    const groupId = searchParams.get('group_id');
    if (groupId) {
      input.group_id = parseInt(groupId);
    }

    const month = searchParams.get('month');
    if (month) {
      input.month = month;
    }

    const days = searchParams.get('days');
    if (days) {
      input.days = parseInt(days);
    }

    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    if (dateFrom && dateTo) {
      input.date_from = dateFrom;
      input.date_to = dateTo;
    }

    const result = await getAnalyticsEnhanced(input);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
