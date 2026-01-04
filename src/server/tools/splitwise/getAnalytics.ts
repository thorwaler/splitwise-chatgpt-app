/**
 * Get Expense Analytics Tool
 * 
 * MCP tool to analyze user's Splitwise expenses with insights and trends.
 */

import { createSplitwiseClient, SplitwiseExpense } from '../../lib/splitwise';
import { validateSession } from '../../lib/middleware';

export interface GetExpenseAnalyticsInput {
  session_token: string;
  group_id?: number;
  days?: number; // Look back period in days
}

export interface GetExpenseAnalyticsResult {
  summary: {
    total_expenses: number;
    total_amount: number;
    average_expense: number;
    period_days: number;
  };
  by_category: Array<{
    category: string;
    count: number;
    total: number;
    percentage: number;
  }>;
  recent_expenses: Array<{
    description: string;
    amount: number;
    category: string;
    date: string;
  }>;
  insights: string[];
  message: string;
}

/**
 * Get expense analytics and insights
 */
export async function getExpenseAnalyticsHandler(
  input: GetExpenseAnalyticsInput
): Promise<GetExpenseAnalyticsResult> {
  const { session_token, group_id, days = 30 } = input;

  // Validate session (read-only, doesn't count toward limit)
  await validateSession(session_token);

  // Create Splitwise client
  const client = await createSplitwiseClient(session_token);

  // Calculate date range
  const datedAfter = new Date();
  datedAfter.setDate(datedAfter.getDate() - days);
  const datedAfterStr = datedAfter.toISOString().split('T')[0];

  // Fetch expenses
  const expenses = await client.getExpenses({
    group_id,
    dated_after: datedAfterStr,
    limit: 100,
  });

  // Calculate summary
  const totalAmount = expenses.reduce(
    (sum, exp) => sum + parseFloat(exp.cost),
    0
  );
  const averageExpense = expenses.length > 0 ? totalAmount / expenses.length : 0;

  // Group by category
  const categoryMap = new Map<string, { count: number; total: number }>();
  
  expenses.forEach(exp => {
    const category = exp.category.name || 'Uncategorized';
    const existing = categoryMap.get(category) || { count: 0, total: 0 };
    
    categoryMap.set(category, {
      count: existing.count + 1,
      total: existing.total + parseFloat(exp.cost),
    });
  });

  // Convert to array and calculate percentages
  const byCategory = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      count: data.count,
      total: Math.round(data.total * 100) / 100,
      percentage: totalAmount > 0 
        ? Math.round((data.total / totalAmount) * 100) 
        : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Get recent expenses
  const recentExpenses = expenses
    .slice(0, 5)
    .map(exp => ({
      description: exp.description,
      amount: parseFloat(exp.cost),
      category: exp.category.name || 'Uncategorized',
      date: exp.date,
    }));

  // Generate insights
  const insights = generateInsights(expenses, byCategory, totalAmount, days);

  return {
    summary: {
      total_expenses: expenses.length,
      total_amount: Math.round(totalAmount * 100) / 100,
      average_expense: Math.round(averageExpense * 100) / 100,
      period_days: days,
    },
    by_category: byCategory,
    recent_expenses: recentExpenses,
    insights,
    message: `Analyzed ${expenses.length} expenses over the last ${days} days`,
  };
}

/**
 * Generate insights from expense data
 */
function generateInsights(
  expenses: SplitwiseExpense[],
  byCategory: Array<{ category: string; total: number; percentage: number }>,
  totalAmount: number,
  days: number
): string[] {
  const insights: string[] = [];

  if (expenses.length === 0) {
    insights.push('No expenses found in this period');
    return insights;
  }

  // Top spending category
  if (byCategory.length > 0) {
    const topCategory = byCategory[0];
    insights.push(
      `Your top spending category is ${topCategory.category} ($${topCategory.total.toFixed(2)}, ${topCategory.percentage}%)`
    );
  }

  // Daily average
  const dailyAverage = totalAmount / days;
  insights.push(
    `You're spending an average of $${dailyAverage.toFixed(2)} per day`
  );

  // Expense frequency
  const expensesPerWeek = (expenses.length / days) * 7;
  insights.push(
    `You log about ${Math.round(expensesPerWeek)} expenses per week`
  );

  // Category diversity
  if (byCategory.length >= 5) {
    insights.push(
      `Your expenses are well-distributed across ${byCategory.length} categories`
    );
  } else if (byCategory.length === 1) {
    insights.push(
      `All expenses are in one category. Consider categorizing for better insights`
    );
  }

  // High percentage warning
  if (byCategory.length > 0 && byCategory[0].percentage >= 60) {
    insights.push(
      `⚠️ ${byCategory[0].category} makes up ${byCategory[0].percentage}% of your spending`
    );
  }

  return insights;
}

/**
 * Tool definition for MCP
 */
export const getExpenseAnalyticsTool = {
  name: 'get_expense_analytics',
  description: 'DEPRECATED - Use get_analytics_enhanced instead. This legacy tool only supports "last N days" lookback. The enhanced version supports specific months (e.g., "Sept 2025"), custom date ranges, visual charts, and more. Only use this tool if get_analytics_enhanced is unavailable.',
  inputSchema: {
    type: 'object',
    properties: {
      session_token: {
        type: 'string',
        description: 'User session token',
      },
      group_id: {
        type: 'number',
        description: 'Filter by group ID (optional)',
      },
      days: {
        type: 'number',
        description: 'Look back period in days (default: 30)',
        default: 30,
      },
    },
    required: ['session_token'],
  },
};
