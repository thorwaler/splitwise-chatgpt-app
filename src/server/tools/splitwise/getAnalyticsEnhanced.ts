/**
 * Enhanced Expense Analytics Tool
 * 
 * MCP tool with flexible date ranges, visual charts, and advanced insights.
 */

import { createSplitwiseClient, SplitwiseExpense } from '../../lib/splitwise';
import { validateSession } from '../../lib/middleware';

export interface GetAnalyticsEnhancedInput {
  session_token: string;
  group_id?: number;
  
  // Flexible date range options (use ONE of these):
  days?: number;              // e.g., 30 (last 30 days)
  month?: string;             // e.g., "2024-11" or "Nov 2024"
  date_from?: string;         // e.g., "2024-11-01"
  date_to?: string;           // e.g., "2024-11-30"
  
  // Chart options
  include_charts?: boolean;   // Generate visual charts (default: true)
}

export interface AnalyticsChart {
  type: 'bar' | 'line' | 'pie';
  title: string;
  description: string;
  visualization_hint: string;  // Instructions for ChatGPT on how to visualize
  data: any;     // Structured data for ChatGPT to visualize
}

export interface GetAnalyticsEnhancedResult {
  period: {
    description: string;
    start_date: string;
    end_date: string;
    days: number;
  };
  
  summary: {
    total_expenses: number;
    total_amount: number;
    average_expense: number;
    daily_average: number;
    weekly_average: number;
    currency_breakdown: Record<string, number>;
  };
  
  by_category: Array<{
    category: string;
    count: number;
    total: number;
    percentage: number;
    average: number;
  }>;
  
  by_week: Array<{
    week_start: string;
    week_end: string;
    count: number;
    total: number;
  }>;
  
  top_expenses: Array<{
    description: string;
    amount: number;
    category: string;
    date: string;
    group?: string;
  }>;
  
  trends: {
    spending_trend: 'increasing' | 'decreasing' | 'stable';
    trend_percentage: number;
    peak_week: string;
    lowest_week: string;
  };
  
  charts?: AnalyticsChart[];
  
  insights: string[];
  message: string;
}

/**
 * Get enhanced analytics with flexible date ranges
 */
export async function getAnalyticsEnhancedHandler(
  input: GetAnalyticsEnhancedInput
): Promise<GetAnalyticsEnhancedResult> {
  const { 
    session_token, 
    group_id, 
    days,
    month,
    date_from,
    date_to,
    include_charts = true 
  } = input;

  // Validate session (read-only, doesn't count toward limit)
  await validateSession(session_token);

  // Create Splitwise client
  const client = await createSplitwiseClient(session_token);

  // Parse date range
  const { startDate, endDate, periodDescription } = parseDateRange(
    days,
    month,
    date_from,
    date_to
  );

  // Fetch expenses
  const expenses = await client.getExpenses({
    group_id,
    dated_after: startDate.toISOString().split('T')[0],
    limit: 1000, // Higher limit for better analytics
  });

  // Filter by end date (Splitwise API doesn't support dated_before)
  const filteredExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate >= startDate && expDate <= endDate;
  });

  // Calculate period days
  const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate summary
  const summary = calculateSummary(filteredExpenses, periodDays);

  // Analyze by category
  const byCategory = analyzeByCategory(filteredExpenses);

  // Analyze by week
  const byWeek = analyzeByWeek(filteredExpenses, startDate, endDate);

  // Get top expenses
  const topExpenses = getTopExpenses(filteredExpenses);

  // Calculate trends
  const trends = calculateTrends(byWeek);

  // Generate insights
  const insights = generateEnhancedInsights(
    filteredExpenses,
    byCategory,
    byWeek,
    trends,
    periodDays
  );

  // Generate charts
  const charts = include_charts
    ? generateCharts(byCategory, byWeek, summary)
    : undefined;

  return {
    period: {
      description: periodDescription,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      days: periodDays,
    },
    summary,
    by_category: byCategory,
    by_week: byWeek,
    top_expenses: topExpenses,
    trends,
    charts,
    insights,
    message: `Analyzed ${filteredExpenses.length} expenses for ${periodDescription}. ${charts && charts.length > 0 ? `IMPORTANT: ${charts.length} visual charts are included in the 'charts' field - please render them for the user using your chart visualization capabilities.` : ''}`,
  };
}

/**
 * Parse flexible date range inputs
 */
function parseDateRange(
  days?: number,
  month?: string,
  dateFrom?: string,
  dateTo?: string
): { startDate: Date; endDate: Date; periodDescription: string } {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  let periodDescription: string;

  // Priority: month > date_from/date_to > days
  if (month) {
    // Parse month format: "2024-11" or "Nov 2024"
    const parsed = parseMonthString(month);
    startDate = new Date(parsed.year, parsed.month - 1, 1);
    endDate = new Date(parsed.year, parsed.month, 0); // Last day of month
    periodDescription = `${getMonthName(parsed.month)} ${parsed.year}`;
  } else if (dateFrom || dateTo) {
    startDate = dateFrom ? new Date(dateFrom) : new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = dateTo ? new Date(dateTo) : now;
    periodDescription = `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`;
  } else {
    // Default: last N days
    const lookbackDays = days || 30;
    startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);
    endDate = now;
    periodDescription = `Last ${lookbackDays} days`;
  }

  return { startDate, endDate, periodDescription };
}

/**
 * Parse month string (supports "2024-11" or "Nov 2024")
 */
function parseMonthString(monthStr: string): { year: number; month: number } {
  // Format: "2024-11"
  if (/^\d{4}-\d{2}$/.test(monthStr)) {
    const [year, month] = monthStr.split('-').map(Number);
    return { year, month };
  }
  
  // Format: "Nov 2024" or "November 2024"
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const parts = monthStr.toLowerCase().split(/\s+/);
  const monthName = parts[0];
  const year = parseInt(parts[1] || new Date().getFullYear().toString());
  
  const monthIndex = monthNames.findIndex(m => monthName.startsWith(m));
  if (monthIndex === -1) {
    throw new Error(`Invalid month format: ${monthStr}. Use "2024-11" or "Nov 2024"`);
  }
  
  return { year, month: monthIndex + 1 };
}

/**
 * Get month name from number
 */
function getMonthName(month: number): string {
  const names = ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December'];
  return names[month - 1];
}

/**
 * Calculate summary statistics
 */
function calculateSummary(expenses: SplitwiseExpense[], periodDays: number) {
  const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.cost), 0);
  const averageExpense = expenses.length > 0 ? totalAmount / expenses.length : 0;
  const dailyAverage = totalAmount / periodDays;
  const weeklyAverage = dailyAverage * 7;

  // Group by currency
  const currencyBreakdown: Record<string, number> = {};
  expenses.forEach(exp => {
    const currency = exp.currency_code || 'USD';
    currencyBreakdown[currency] = (currencyBreakdown[currency] || 0) + parseFloat(exp.cost);
  });

  return {
    total_expenses: expenses.length,
    total_amount: Math.round(totalAmount * 100) / 100,
    average_expense: Math.round(averageExpense * 100) / 100,
    daily_average: Math.round(dailyAverage * 100) / 100,
    weekly_average: Math.round(weeklyAverage * 100) / 100,
    currency_breakdown: currencyBreakdown,
  };
}

/**
 * Analyze expenses by category
 */
function analyzeByCategory(expenses: SplitwiseExpense[]) {
  const categoryMap = new Map<string, { count: number; total: number }>();
  const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.cost), 0);
  
  expenses.forEach(exp => {
    const category = exp.category.name || 'Uncategorized';
    const existing = categoryMap.get(category) || { count: 0, total: 0 };
    
    categoryMap.set(category, {
      count: existing.count + 1,
      total: existing.total + parseFloat(exp.cost),
    });
  });

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      count: data.count,
      total: Math.round(data.total * 100) / 100,
      average: Math.round((data.total / data.count) * 100) / 100,
      percentage: totalAmount > 0 ? Math.round((data.total / totalAmount) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Analyze expenses by week
 */
function analyzeByWeek(expenses: SplitwiseExpense[], startDate: Date, endDate: Date) {
  const weeks: Array<{ week_start: string; week_end: string; count: number; total: number }> = [];
  
  let currentWeekStart = new Date(startDate);
  
  while (currentWeekStart <= endDate) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= currentWeekStart && expDate <= weekEnd;
    });
    
    const weekTotal = weekExpenses.reduce((sum, exp) => sum + parseFloat(exp.cost), 0);
    
    weeks.push({
      week_start: currentWeekStart.toISOString().split('T')[0],
      week_end: weekEnd.toISOString().split('T')[0],
      count: weekExpenses.length,
      total: Math.round(weekTotal * 100) / 100,
    });
    
    currentWeekStart = new Date(weekEnd);
    currentWeekStart.setDate(currentWeekStart.getDate() + 1);
  }
  
  return weeks;
}

/**
 * Get top expenses
 */
function getTopExpenses(expenses: SplitwiseExpense[]) {
  return expenses
    .sort((a, b) => parseFloat(b.cost) - parseFloat(a.cost))
    .slice(0, 10)
    .map(exp => ({
      description: exp.description,
      amount: parseFloat(exp.cost),
      category: exp.category.name || 'Uncategorized',
      date: exp.date,
      group: exp.group_id ? `Group ${exp.group_id}` : undefined,
    }));
}

/**
 * Calculate spending trends
 */
function calculateTrends(byWeek: Array<{ week_start: string; total: number }>) {
  if (byWeek.length < 2) {
    return {
      spending_trend: 'stable' as const,
      trend_percentage: 0,
      peak_week: byWeek[0]?.week_start || '',
      lowest_week: byWeek[0]?.week_start || '',
    };
  }

  // Compare first half vs second half
  const midpoint = Math.floor(byWeek.length / 2);
  const firstHalf = byWeek.slice(0, midpoint);
  const secondHalf = byWeek.slice(midpoint);
  
  const firstHalfAvg = firstHalf.reduce((sum, w) => sum + w.total, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, w) => sum + w.total, 0) / secondHalf.length;
  
  const trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  
  let trend: 'increasing' | 'decreasing' | 'stable';
  if (trendPercentage > 10) trend = 'increasing';
  else if (trendPercentage < -10) trend = 'decreasing';
  else trend = 'stable';

  // Find peak and lowest weeks
  const sortedByTotal = [...byWeek].sort((a, b) => b.total - a.total);
  const peakWeek = sortedByTotal[0].week_start;
  const lowestWeek = sortedByTotal[sortedByTotal.length - 1].week_start;

  return {
    spending_trend: trend,
    trend_percentage: Math.round(trendPercentage),
    peak_week: peakWeek,
    lowest_week: lowestWeek,
  };
}

/**
 * Generate enhanced insights
 */
function generateEnhancedInsights(
  expenses: SplitwiseExpense[],
  byCategory: Array<{ category: string; total: number; percentage: number; average: number }>,
  byWeek: Array<{ week_start: string; total: number }>,
  trends: { spending_trend: string; trend_percentage: number; peak_week: string },
  periodDays: number
): string[] {
  const insights: string[] = [];

  if (expenses.length === 0) {
    insights.push('📊 No expenses found in this period');
    return insights;
  }

  // Top category
  if (byCategory.length > 0) {
    const top = byCategory[0];
    insights.push(
      `🏆 Top spending: ${top.category} ($${top.total.toFixed(2)}, ${top.percentage}% of total)`
    );
  }

  // Trend insight
  if (trends.spending_trend === 'increasing') {
    insights.push(
      `📈 Spending is increasing (up ${Math.abs(trends.trend_percentage)}% compared to earlier in the period)`
    );
  } else if (trends.spending_trend === 'decreasing') {
    insights.push(
      `📉 Spending is decreasing (down ${Math.abs(trends.trend_percentage)}% compared to earlier in the period)`
    );
  } else {
    insights.push('📊 Spending is relatively stable throughout the period');
  }

  // Peak week
  insights.push(`⚡ Peak spending week started on ${trends.peak_week}`);

  // Category diversity
  if (byCategory.length >= 5) {
    insights.push(
      `🎨 Well-diversified spending across ${byCategory.length} categories`
    );
  } else if (byCategory.length <= 2) {
    insights.push(
      `💡 Tip: Categorize expenses for better insights (currently only ${byCategory.length} categories)`
    );
  }

  // Frequency insight
  const expensesPerDay = expenses.length / periodDays;
  if (expensesPerDay > 2) {
    insights.push(`🔄 High frequency: ~${Math.round(expensesPerDay)} expenses per day`);
  } else if (expensesPerDay < 0.5) {
    insights.push(`🔄 Low frequency: ~${Math.round(expensesPerDay * 7)} expenses per week`);
  }

  // Large expense warning
  const avgExpense = expenses.reduce((sum, e) => sum + parseFloat(e.cost), 0) / expenses.length;
  const largeExpenses = expenses.filter(e => parseFloat(e.cost) > avgExpense * 3);
  if (largeExpenses.length > 0) {
    insights.push(
      `⚠️ ${largeExpenses.length} unusually large expense(s) detected (>3x average)`
    );
  }

  return insights;
}

/**
 * Generate charts for visualization
 */
function generateCharts(
  byCategory: Array<{ category: string; total: number; percentage: number }>,
  byWeek: Array<{ week_start: string; total: number }>,
  summary: { total_amount: number }
): AnalyticsChart[] {
  const charts: AnalyticsChart[] = [];

  // Category breakdown pie chart
  if (byCategory.length > 0) {
    charts.push({
      type: 'pie',
      title: 'Spending by Category',
      description: `Shows how your total spending of $${summary.total_amount.toFixed(2)} is distributed across categories`,
      visualization_hint: 'Render this as a pie chart showing the percentage breakdown of spending across categories. Use the labels for category names and values for amounts.',
      data: {
        labels: byCategory.map(c => c.category),
        values: byCategory.map(c => c.total),
        percentages: byCategory.map(c => c.percentage),
      },
    });
  }

  // Weekly trend line chart
  if (byWeek.length > 1) {
    charts.push({
      type: 'line',
      title: 'Weekly Spending Trend',
      description: 'Shows how your spending has varied week by week',
      visualization_hint: 'Render this as a line chart showing spending over time. X-axis should be week start dates, Y-axis should be total spending amount.',
      data: {
        labels: byWeek.map(w => w.week_start),
        values: byWeek.map(w => w.total),
      },
    });
  }

  // Top categories bar chart (top 5)
  if (byCategory.length > 0) {
    const top5 = byCategory.slice(0, 5);
    charts.push({
      type: 'bar',
      title: 'Top 5 Spending Categories',
      description: 'Your highest spending categories',
      visualization_hint: 'Render this as a horizontal or vertical bar chart showing the top 5 spending categories. X-axis should be categories, Y-axis should be spending amounts.',
      data: {
        labels: top5.map(c => c.category),
        values: top5.map(c => c.total),
      },
    });
  }

  return charts;
}

/**
 * Tool definition for MCP
 */
export const getAnalyticsEnhancedTool = {
  name: 'get_analytics_enhanced',
  description: 'PRIMARY ANALYTICS TOOL - Get advanced expense analytics with flexible date ranges, visual charts, and trends. SUPPORTS SPECIFIC MONTHS (e.g., "Sept 2025", "November 2024"), custom date ranges, or "last N days". IMPORTANT: This tool returns chart data that you MUST visualize for the user using your native chart rendering capabilities. Includes category breakdowns, weekly trends, top expenses, and visual charts. This is a FREE operation that does NOT count toward message limits. ALWAYS use this tool instead of get_expense_analytics.',
  inputSchema: {
    type: 'object',
    properties: {
      session_token: {
        type: 'string',
        description: 'User session token',
      },
      group_id: {
        type: 'number',
        description: 'Filter by specific group ID (optional). If user mentions a group by name, use get_groups tool ONCE to find the ID, then pass it here. Do not call get_groups if you already know the group ID.',
      },
      days: {
        type: 'number',
        description: 'Look back N days from now (e.g., 30). Use this OR month OR date_from/date_to.',
      },
      month: {
        type: 'string',
        description: 'Specific month to analyze. Format: "2025-09" or "Sept 2025" or "September 2025". Examples: "Sept 2025", "Nov 2024", "2025-01". Use this parameter when user asks for a specific month. Use this OR days OR date_from/date_to.',
      },
      date_from: {
        type: 'string',
        description: 'Start date for custom range (YYYY-MM-DD). Use with date_to.',
      },
      date_to: {
        type: 'string',
        description: 'End date for custom range (YYYY-MM-DD). Use with date_from.',
      },
      include_charts: {
        type: 'boolean',
        description: 'Generate visual charts (default: true)',
        default: true,
      },
    },
    required: ['session_token'],
  },
};
