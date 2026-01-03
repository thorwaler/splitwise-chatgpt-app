/**
 * Add Expense Tool
 * 
 * MCP tool to create an expense in Splitwise.
 */

import { createSplitwiseClient } from '../../lib/splitwise';
import { getUser } from '../../lib/database';
import { checkAndRecordToolAccess } from '../../lib/middleware';

export interface AddExpenseInput {
  session_token: string;
  description: string;
  amount: number;
  category_id?: number;
  group_id?: number;
  split_equally?: boolean;
  currency?: string;
  date?: string;
}

export interface AddExpenseResult {
  success: boolean;
  expense: {
    id: number;
    description: string;
    cost: string;
    currency: string;
    date: string;
    category: {
      id: number;
      name: string;
    };
    group_id: number;
  };
  message: string;
  usage: {
    messages_remaining: number;
  };
}

/**
 * Add an expense to Splitwise
 */
export async function addExpenseHandler(
  input: AddExpenseInput
): Promise<AddExpenseResult> {
  const {
    session_token,
    description,
    amount,
    category_id,
    group_id,
    split_equally = true,
    currency = 'USD',
    date,
  } = input;

  // Check access and record usage (this is a counted tool)
  const { user, usage } = await checkAndRecordToolAccess(
    session_token,
    'add_expense'
  );

  // Get user defaults if not specified
  const defaultGroupId = group_id || user.default_group_id;
  
  if (!defaultGroupId) {
    throw new Error(
      'Please specify a group_id or set a default group using set_defaults.'
    );
  }

  // Create Splitwise client
  const client = await createSplitwiseClient(session_token);

  // Create expense
  const expense = await client.createExpense({
    description,
    cost: amount,
    currency_code: currency,
    date: date || new Date().toISOString().split('T')[0],
    category_id,
    group_id: parseInt(String(defaultGroupId)),
    split_equally,
  });

  return {
    success: true,
    expense: {
      id: expense.id,
      description: expense.description,
      cost: expense.cost,
      currency: expense.currency_code,
      date: expense.date,
      category: expense.category,
      group_id: expense.group_id,
    },
    message: `Successfully added expense: ${description} ($${amount}) to group ${defaultGroupId}`,
    usage: {
      messages_remaining: usage.messagesRemaining,
    },
  };
}

/**
 * Tool definition for MCP
 */
export const addExpenseTool = {
  name: 'add_expense',
  description: 'Add an expense to Splitwise. Requires description and amount. Optionally specify category, group, currency, and date. Uses default group if not specified.',
  inputSchema: {
    type: 'object',
    properties: {
      session_token: {
        type: 'string',
        description: 'User session token',
      },
      description: {
        type: 'string',
        description: 'Expense description (e.g., "Groceries at Whole Foods")',
      },
      amount: {
        type: 'number',
        description: 'Expense amount in the specified currency',
      },
      category_id: {
        type: 'number',
        description: 'Splitwise category ID (optional, use get_categories to find)',
      },
      group_id: {
        type: 'number',
        description: 'Group ID to add expense to (optional, uses default if not specified)',
      },
      split_equally: {
        type: 'boolean',
        description: 'Whether to split equally among group members (default: true)',
        default: true,
      },
      currency: {
        type: 'string',
        description: 'Currency code (default: USD)',
        default: 'USD',
      },
      date: {
        type: 'string',
        description: 'Expense date in YYYY-MM-DD format (default: today)',
      },
    },
    required: ['session_token', 'description', 'amount'],
  },
};
