/**
 * Expense Form Component
 * 
 * Form for adding expenses to Splitwise.
 */

import React, { useState, useEffect } from 'react';

interface ExpenseFormProps {
  sessionToken: string;
  defaultGroupId?: number;
  isConnected: boolean;
  onExpenseAdded: () => void;
}

interface Group {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  subcategories?: Array<{ id: number; name: string }>;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  sessionToken,
  defaultGroupId,
  isConnected,
  onExpenseAdded,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [groupId, setGroupId] = useState<number | undefined>(defaultGroupId);
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load groups and categories
  useEffect(() => {
    if (isConnected) {
      loadGroups();
      loadCategories();
    }
  }, [isConnected]);

  const loadGroups = async () => {
    try {
      // Call MCP tool or API to get groups
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'get_groups',
            arguments: { session_token: sessionToken },
          },
        }),
      });

      const data = await response.json();
      if (data.result?.content) {
        const result = JSON.parse(data.result.content[0].text);
        setGroups(result.groups);
      }
    } catch (err) {
      console.error('Failed to load groups:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: {
            name: 'get_categories',
            arguments: { session_token: sessionToken },
          },
        }),
      });

      const data = await response.json();
      if (data.result?.content) {
        const result = JSON.parse(data.result.content[0].text);
        setCategories(result.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'add_expense',
            arguments: {
              session_token: sessionToken,
              description,
              amount: parseFloat(amount),
              group_id: groupId,
              category_id: categoryId,
              date,
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
        
        if (result.isError) {
          throw new Error(result.message);
        }

        setSuccess(result.message);
        
        // Reset form
        setDescription('');
        setAmount('');
        setCategoryId(undefined);
        setDate(new Date().toISOString().split('T')[0]);
        
        // Notify parent
        onExpenseAdded();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="expense-form not-connected">
        <p>Please connect your Splitwise account to add expenses.</p>
        <button onClick={onExpenseAdded}>Connect Now</button>
      </div>
    );
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h3>Add Expense</h3>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <input
          id="description"
          type="text"
          placeholder="e.g., Groceries at Whole Foods"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="amount">Amount ($) *</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="group">Group {defaultGroupId && '(using default)'}</label>
        <select
          id="group"
          value={groupId || ''}
          onChange={(e) => setGroupId(Number(e.target.value) || undefined)}
        >
          <option value="">Select a group...</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="category">Category (optional)</label>
        <select
          id="category"
          value={categoryId || ''}
          onChange={(e) => setCategoryId(Number(e.target.value) || undefined)}
        >
          <option value="">Auto-detect...</option>
          {categories.map(category => (
            <optgroup key={category.id} label={category.name}>
              <option value={category.id}>{category.name}</option>
              {category.subcategories?.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {category.name} - {sub.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !description || !amount}
        className="btn-primary"
      >
        {isLoading ? 'Adding...' : 'Add Expense'}
      </button>

      <p className="form-note">
        * Required fields. Category will be auto-detected if not specified.
      </p>
    </form>
  );
};

export default ExpenseForm;
