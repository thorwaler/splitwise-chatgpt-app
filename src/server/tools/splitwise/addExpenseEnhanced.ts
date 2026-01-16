/**
 * Enhanced Add Expense Tool
 * 
 * Supports custom splits (percentages, amounts, per-user), and group preferences.
 */

import { createSplitwiseClient } from '../../lib/splitwise';
import { getUser, redis } from '../../lib/database';
import { checkAndRecordToolAccess } from '../../lib/middleware';
import { classifyExpense, getCategoryName } from '../../lib/categoryClassifier';

export interface SplitPreference {
  type: 'equal' | 'percentage' | 'amount' | 'custom';
  // For percentage splits: [60, 40] means 60-40 split
  percentages?: number[];
  // For amount splits: [30, 20] means $30 / $20
  amounts?: number[];
  // For custom per-user splits
  user_splits?: Array<{
    user_id: number;
    owed_share: number;  // Can be percentage or amount depending on type
  }>;
}

export interface AddExpenseEnhancedInput {
  session_token: string;
  description: string;
  amount: number;
  category_id?: number;
  group_id?: number;
  currency?: string;
  date?: string;
  
  // Custom split options (use ONE of these):
  split_equally?: boolean;           // true = equal split (default)
  split_percentage?: string;          // e.g., "90-10" or "70-30"
  split_amounts?: string;             // e.g., "45-5" (in currency units)
  user_splits?: Array<{               // Custom per-user
    user_id: number;
    owed_amount: number;
  }>;
  
  // Save this split as default for this group
  save_as_default?: boolean;
}

export interface AddExpenseEnhancedResult {
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
    split_details?: string;
  };
  message: string;
  usage: {
    messages_remaining: number;
  };
}

/**
 * Add an expense with custom split support
 */
export async function addExpenseEnhancedHandler(
  input: AddExpenseEnhancedInput
): Promise<AddExpenseEnhancedResult> {
  const {
    session_token,
    description,
    amount,
    category_id,
    group_id,
    split_equally,
    split_percentage,
    split_amounts,
    user_splits,
    currency = 'USD',
    date,
    save_as_default = false,
  } = input;

  // Check access and record usage
  const { user, usage } = await checkAndRecordToolAccess(
    session_token,
    'add_expense_enhanced'
  );

  // Get group ID (from input or user defaults)
  const targetGroupId = group_id || user.default_group_id;
  
  if (!targetGroupId) {
    throw new Error(
      'Please specify a group_id or set a default group using set_defaults.'
    );
  }
  
  // Auto-classify category if not provided
  let finalCategoryId = category_id;
  if (!finalCategoryId) {
    finalCategoryId = classifyExpense(description);
    console.log(`Auto-classified "${description}" as category ${finalCategoryId} (${getCategoryName(finalCategoryId)})`);
  }

  // Create Splitwise client
  const client = await createSplitwiseClient(session_token);

  // Get group to find user IDs
  const group = await client.getGroup(parseInt(targetGroupId));
  
  if (!group) {
    throw new Error(`Group with ID ${targetGroupId} not found. Please check the group ID.`);
  }
  
  if (!group.members || !Array.isArray(group.members) || group.members.length === 0) {
    throw new Error(`Group ${targetGroupId} has no members. Cannot create expense.`);
  }
  
  const groupMembers = group.members.map(m => m.id);

  // Determine split configuration
  let splitConfig: { split_equally?: boolean; users?: any[] };
  let splitDescription = '';

  if (split_percentage) {
    // Parse percentage split (e.g., "90-10")
    const percentages = split_percentage.split('-').map(p => parseInt(p.trim()));
    
    if (percentages.length !== groupMembers.length) {
      throw new Error(
        `Split percentages must match number of group members (${groupMembers.length}). ` +
        `Got ${percentages.length} percentages.`
      );
    }
    
    if (percentages.reduce((a, b) => a + b, 0) !== 100) {
      throw new Error('Split percentages must add up to 100');
    }

    splitConfig = {
      split_equally: false,
      users: groupMembers.map((userId, index) => ({
        user_id: userId,
        paid_share: userId === user.splitwise_user_id ? amount : 0,
        owed_share: (amount * percentages[index]) / 100,
      })),
    };
    
    splitDescription = `${split_percentage} split`;

    // Save preference if requested
    if (save_as_default) {
      await saveGroupSplitPreference(session_token, targetGroupId, {
        type: 'percentage',
        percentages,
      });
    }
  } else if (split_amounts) {
    // Parse amount split (e.g., "45-5")
    const amounts = split_amounts.split('-').map(a => parseFloat(a.trim()));
    
    if (amounts.length !== groupMembers.length) {
      throw new Error(
        `Split amounts must match number of group members (${groupMembers.length}). ` +
        `Got ${amounts.length} amounts.`
      );
    }
    
    const total = amounts.reduce((a, b) => a + b, 0);
    if (Math.abs(total - amount) > 0.01) {
      throw new Error(
        `Split amounts must add up to total (${amount}). Got ${total}.`
      );
    }

    splitConfig = {
      split_equally: false,
      users: groupMembers.map((userId, index) => ({
        user_id: userId,
        paid_share: userId === user.splitwise_user_id ? amount : 0,
        owed_share: amounts[index],
      })),
    };
    
    splitDescription = `${split_amounts} ${currency} split`;

    // Save preference if requested
    if (save_as_default) {
      await saveGroupSplitPreference(session_token, targetGroupId, {
        type: 'amount',
        amounts,
      });
    }
  } else if (user_splits) {
    // Custom per-user splits
    splitConfig = {
      split_equally: false,
      users: user_splits.map(us => ({
        user_id: us.user_id,
        paid_share: us.user_id === parseInt(user.splitwise_user_id || '0') ? amount : 0,
        owed_share: us.owed_amount,
      })),
    };
    
    splitDescription = 'custom split';
  } else {
    // Check for saved group preference
    const savedPref = await getGroupSplitPreference(session_token, targetGroupId);
    
    if (savedPref && !split_equally) {
      // Use saved preference
      if (savedPref.type === 'percentage' && savedPref.percentages) {
        splitConfig = {
          split_equally: false,
          users: groupMembers.map((userId, index) => ({
            user_id: userId,
            paid_share: userId === user.splitwise_user_id ? amount : 0,
            owed_share: (amount * savedPref.percentages![index]) / 100,
          })),
        };
        splitDescription = `saved ${savedPref.percentages.join('-')} split`;
      } else if (savedPref.type === 'amount' && savedPref.amounts) {
        const ratio = amount / savedPref.amounts.reduce((a, b) => a + b, 0);
        splitConfig = {
          split_equally: false,
          users: groupMembers.map((userId, index) => ({
            user_id: userId,
            paid_share: userId === user.splitwise_user_id ? amount : 0,
            owed_share: savedPref.amounts![index] * ratio,
          })),
        };
        splitDescription = 'saved split';
      } else {
        // Default to equal
        splitConfig = { split_equally: true };
        splitDescription = 'equal split';
      }
    } else {
      // Default to equal split
      splitConfig = { split_equally: true };
      splitDescription = 'equal split';
    }
  }

  // Deduplication: Check if same expense was created very recently (within 5 seconds)
  // This prevents duplicate expenses from rapid tool calls
  const dedupeKey = `expense:dedupe:${session_token}:${description}:${amount}:${targetGroupId}`;
  const recentExpenseId = await redis.get(dedupeKey);
  
  if (recentExpenseId) {
    console.log(`[Deduplication] Found recent expense ${recentExpenseId} for "${description}" - returning cached result`);
    
    // Return the cached expense info (note: split_details not available from cache)
    return {
      success: true,
      expense: {
        id: parseInt(recentExpenseId as string),
        description,
        cost: amount.toString(),
        currency: currency,
        date: date || new Date().toISOString(),
        category: { id: finalCategoryId, name: getCategoryName(finalCategoryId) },
        group_id: parseInt(targetGroupId),
        split_details: 'custom split',
      },
      message: `Expense already created (prevented duplicate) - ${currency}${amount} "${description}"`,
      usage: {
        messages_remaining: usage.messagesRemaining,
      },
    };
  }

  // Create expense
  const expense = await client.createExpense({
    description,
    cost: amount,
    currency_code: currency,
    group_id: parseInt(targetGroupId),
    category_id: finalCategoryId,
    date,
    ...splitConfig,
  });
  
  if (!expense) {
    throw new Error('Failed to create expense. The Splitwise API did not return an expense object.');
  }
  
  if (!expense.id) {
    throw new Error('Failed to create expense. The returned expense has no ID.');
  }
  
  // Cache expense ID for deduplication (5 second TTL)
  await redis.setex(dedupeKey, 5, expense.id.toString());
  console.log(`[Deduplication] Cached expense ${expense.id} for 5 seconds`);

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
      split_details: splitDescription,
    },
    message: `Added ${currency}${amount} expense "${description}" with ${splitDescription}`,
    usage: {
      messages_remaining: usage.messagesRemaining,
    },
  };
}

/**
 * Save group-specific split preference
 */
async function saveGroupSplitPreference(
  sessionToken: string,
  groupId: string,
  preference: SplitPreference
): Promise<void> {
  const key = `group_split:${sessionToken}:${groupId}`;
  await redis.set(key, JSON.stringify(preference));
}

/**
 * Get group-specific split preference
 */
async function getGroupSplitPreference(
  sessionToken: string,
  groupId: string
): Promise<SplitPreference | null> {
  const key = `group_split:${sessionToken}:${groupId}`;
  const data = await redis.get(key);
  
  if (!data) return null;
  
  return typeof data === 'string' ? JSON.parse(data) : (data as SplitPreference);
}

/**
 * Tool definition for MCP
 */
export const addExpenseEnhancedTool = {
  name: 'add_expense_enhanced',
  description: 'PRIMARY EXPENSE TOOL - Add an expense to Splitwise. CRITICAL: Call this tool ONLY ONCE per expense request. Do NOT call it multiple times for the same expense - this will create duplicates. MINIMIZE BACK-AND-FORTH: When user requests to add an expense, if you\'re missing details (description, amount, group), ask for ALL missing details in ONE response before calling any tools. SUPPORTS CUSTOM SPLITS IN ONE STEP: For splits (e.g., "90-10"), use split_percentage parameter directly - DO NOT call manage_split_preferences first. If group_id is not provided and no default is set, call get_groups to find the group ID. This operation counts toward message limit.',
  inputSchema: {
    type: 'object',
    properties: {
      session_token: {
        type: 'string',
        description: 'User session token',
      },
      description: {
        type: 'string',
        description: 'Expense description (e.g., "Groceries")',
      },
      amount: {
        type: 'number',
        description: 'Total expense amount',
      },
      category_id: {
        type: 'number',
        description: 'Category ID (optional, use get_categories to find)',
      },
      group_id: {
        type: 'number',
        description: 'Group ID (optional if default group is set)',
      },
      currency: {
        type: 'string',
        description: 'Currency code (default: USD)',
        default: 'USD',
      },
      date: {
        type: 'string',
        description: 'Expense date in YYYY-MM-DD format (optional, defaults to today)',
      },
      split_equally: {
        type: 'boolean',
        description: 'Split equally among group members (default if no other split specified)',
      },
      split_percentage: {
        type: 'string',
        description: 'FOR ONE-TIME CUSTOM SPLITS: Use this parameter when user requests a specific split ratio for THIS expense (e.g., "add €33 with 90-10 split"). Examples: "90-10" (90% first person, 10% second person), "70-30", "60-40". Number of values must match group member count. DO NOT call manage_split_preferences before using this - just set this parameter directly.',
      },
      split_amounts: {
        type: 'string',
        description: 'Amount split (e.g., "45-5" for €45 / €5). Must add up to total amount.',
      },
      save_as_default: {
        type: 'boolean',
        description: 'Save this split configuration as default for this group (default: false)',
        default: false,
      },
    },
    required: ['session_token', 'description', 'amount'],
  },
  annotations: {
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
  },
};
