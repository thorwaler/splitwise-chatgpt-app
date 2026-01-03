/**
 * Analytics Dashboard Component
 * 
 * Displays spending analytics and insights.
 */

import React, { useState, useEffect } from 'react';

interface AnalyticsDashboardProps {
  sessionToken: string;
  isConnected: boolean;
}

interface Analytics {
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
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  sessionToken,
  isConnected,
}) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [days, setDays] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      loadAnalytics();
    }
  }, [isConnected, days]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 4,
          method: 'tools/call',
          params: {
            name: 'get_expense_analytics',
            arguments: {
              session_token: sessionToken,
              days,
            },
          },
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.result?.content) {
        const result = JSON.parse(data.result.content[0].text);
        setAnalytics(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="analytics-dashboard not-connected">
        <p>Connect your Splitwise account to view analytics.</p>
      </div>
    );
  }

  if (isLoading && !analytics) {
    return (
      <div className="analytics-dashboard loading">
        <div className="spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard error">
        <p>Error: {error}</p>
        <button onClick={loadAnalytics}>Retry</button>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h3>Spending Analytics</h3>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="period-selector"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-value">{analytics.summary.total_expenses}</div>
          <div className="card-label">Expenses</div>
        </div>
        <div className="summary-card">
          <div className="card-value">${analytics.summary.total_amount.toFixed(2)}</div>
          <div className="card-label">Total Spent</div>
        </div>
        <div className="summary-card">
          <div className="card-value">${analytics.summary.average_expense.toFixed(2)}</div>
          <div className="card-label">Avg per Expense</div>
        </div>
        <div className="summary-card">
          <div className="card-value">
            ${(analytics.summary.total_amount / analytics.summary.period_days).toFixed(2)}
          </div>
          <div className="card-label">Daily Average</div>
        </div>
      </div>

      {/* Insights */}
      {analytics.insights.length > 0 && (
        <div className="insights-section">
          <h4>💡 Insights</h4>
          <ul className="insights-list">
            {analytics.insights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Spending by Category */}
      <div className="category-breakdown">
        <h4>Spending by Category</h4>
        <div className="category-list">
          {analytics.by_category.map((cat) => (
            <div key={cat.category} className="category-item">
              <div className="category-header">
                <span className="category-name">{cat.category}</span>
                <span className="category-total">${cat.total.toFixed(2)}</span>
              </div>
              <div className="category-bar-container">
                <div
                  className="category-bar"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
              <div className="category-stats">
                <span>{cat.count} expense{cat.count !== 1 ? 's' : ''}</span>
                <span>{cat.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Expenses */}
      {analytics.recent_expenses.length > 0 && (
        <div className="recent-expenses">
          <h4>Recent Expenses</h4>
          <div className="expenses-list">
            {analytics.recent_expenses.map((expense, idx) => (
              <div key={idx} className="expense-item">
                <div className="expense-description">
                  <strong>{expense.description}</strong>
                  <span className="expense-category">{expense.category}</span>
                </div>
                <div className="expense-details">
                  <span className="expense-amount">${expense.amount.toFixed(2)}</span>
                  <span className="expense-date">
                    {new Date(expense.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={loadAnalytics} className="btn-secondary" disabled={isLoading}>
        {isLoading ? 'Refreshing...' : 'Refresh Analytics'}
      </button>
    </div>
  );
};

export default AnalyticsDashboard;
