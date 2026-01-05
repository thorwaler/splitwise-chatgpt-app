'use client';

/**
 * Analytics Visualization Page
 * 
 * Displays interactive Recharts for expense analytics
 */

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface AnalyticsData {
  period: {
    description: string;
    start_date: string;
    end_date: string;
  };
  summary: {
    total_expenses: number;
    total_amount: number;
    average_expense: number;
    currency_breakdown: Record<string, number>;
  };
  by_category: Array<{
    category: string;
    count: number;
    total: number;
    percentage: number;
  }>;
  by_week: Array<{
    week_start: string;
    week_end: string;
    count: number;
    total: number;
  }>;
  top_expenses: Array<{
    date: string;
    description: string;
    cost: number;
    currency_code: string;
    category: string;
  }>;
}

const COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
];

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const sessionToken = searchParams.get('session_token');
  const groupId = searchParams.get('group_id');
  const month = searchParams.get('month');
  const days = searchParams.get('days');
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!sessionToken) {
        setError('Missing session token');
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams({
          session_token: sessionToken,
          ...(groupId && { group_id: groupId }),
          ...(month && { month }),
          ...(days && { days }),
        });

        const response = await fetch(`/api/analytics?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sessionToken, groupId, month, days]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{error || 'Failed to load analytics'}</p>
          </div>
        </div>
      </div>
    );
  }

  const primaryCurrency = Object.keys(data.summary.currency_breakdown)[0] || 'USD';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">Expense Analytics</h1>
            <p className="text-emerald-50">{data.period.description}</p>
            <p className="text-emerald-100 text-sm mt-1">
              {data.period.start_date} to {data.period.end_date}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
              <p className="text-3xl font-bold text-emerald-600">{data.summary.total_expenses}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-blue-600">
                {primaryCurrency} {data.summary.total_amount.toFixed(2)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Average</p>
              <p className="text-3xl font-bold text-purple-600">
                {primaryCurrency} {data.summary.average_expense.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Pie Chart */}
          <div className="bg-white rounded-3xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Spending by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.by_category}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ category, percentage }) => `${category} ${percentage}%`}
                >
                  {data.by_category.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${primaryCurrency} ${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Bar Chart */}
          <div className="bg-white rounded-3xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Categories</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.by_category.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `${primaryCurrency} ${value.toFixed(2)}`}
                />
                <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Trend Line Chart */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Spending Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.by_week}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="week_start" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `${primaryCurrency} ${value.toFixed(2)}`}
                  labelFormatter={(label) => `Week of ${new Date(label).toLocaleDateString()}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 6 }}
                  activeDot={{ r: 8 }}
                  name="Weekly Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Expenses */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Largest Expenses</h2>
            <div className="space-y-3">
              {data.top_expenses.slice(0, 10).map((expense, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-600">
                      {expense.category} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-emerald-600">
                      {expense.currency_code} {expense.cost}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}
