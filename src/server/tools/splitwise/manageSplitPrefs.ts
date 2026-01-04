/**
 * Manage Group Split Preferences Tool
 * 
 * View, set, and clear split preferences for specific groups.
 */

import { validateSession } from '../../lib/middleware';
import { getUser, redis } from '../../lib/database';
import { createSplitwiseClient } from '../../lib/splitwise';

export interface ManageSplitPrefsInput {
  session_token: string;
  group_id: number;
  action: 'get' | 'set' | 'clear';
  
  // For 'set' action:
  split_type?: 'percentage' | 'amount';
  split_values?: string;  // e.g., "90-10" or "45-5"
}

export interface ManageSplitPrefsResult {
  success: boolean;
  group_name: string;
  current_preference?: {
    type: 'equal' | 'percentage' | 'amount';
    description: string;
    values?: string;
  };
  message: string;
}

/**
 * Manage split preferences for a group
 */
export async function manageSplitPrefsHandler(
  input: ManageSplitPrefsInput
): Promise<ManageSplitPrefsResult> {
  const {
    session_token,
    group_id,
    action,
    split_type,
    split_values,
  } = input;

  // Validate session (free operation)
  await validateSession(session_token);
  const user = await getUser(session_token);
  
  if (!user) {
    throw new Error('User not found');
  }

  // Get group info
  const client = await createSplitwiseClient(session_token);
  const group = await client.getGroup(group_id);
  const memberCount = group.members.length;

  const prefKey = `group_split:${session_token}:${group_id}`;

  if (action === 'get') {
    // Get current preference
    const pref = await redis.get(prefKey);
    
    if (!pref) {
      return {
        success: true,
        group_name: group.name,
        current_preference: {
          type: 'equal',
          description: 'Equal split (default)',
        },
        message: `No custom split preference set for ${group.name}. Using equal split.`,
      };
    }

    const prefData = typeof pref === 'string' ? JSON.parse(pref) : pref as any;
    
    let description = '';
    let values = '';
    
    if (prefData.type === 'percentage' && prefData.percentages) {
      values = prefData.percentages.join('-');
      description = `${values} percentage split`;
    } else if (prefData.type === 'amount' && prefData.amounts) {
      values = prefData.amounts.join('-');
      description = `${values} amount ratio split`;
    }

    return {
      success: true,
      group_name: group.name,
      current_preference: {
        type: prefData.type,
        description,
        values,
      },
      message: `Current split for ${group.name}: ${description}`,
    };
  } else if (action === 'set') {
    // Set new preference
    if (!split_type || !split_values) {
      throw new Error('split_type and split_values required for set action');
    }

    const values = split_values.split('-').map(v => parseFloat(v.trim()));
    
    if (values.length !== memberCount) {
      throw new Error(
        `Split must have ${memberCount} values for ${memberCount} group members. Got ${values.length}.`
      );
    }

    if (split_type === 'percentage') {
      const total = values.reduce((a, b) => a + b, 0);
      if (Math.abs(total - 100) > 0.01) {
        throw new Error(`Percentages must add up to 100. Got ${total}.`);
      }

      await redis.set(prefKey, JSON.stringify({
        type: 'percentage',
        percentages: values,
      }));

      return {
        success: true,
        group_name: group.name,
        current_preference: {
          type: 'percentage',
          description: `${split_values} percentage split`,
          values: split_values,
        },
        message: `Set ${group.name} to always use ${split_values} split`,
      };
    } else if (split_type === 'amount') {
      await redis.set(prefKey, JSON.stringify({
        type: 'amount',
        amounts: values,
      }));

      return {
        success: true,
        group_name: group.name,
        current_preference: {
          type: 'amount',
          description: `${split_values} amount ratio`,
          values: split_values,
        },
        message: `Set ${group.name} to use ${split_values} amount ratio (will scale with total expense)`,
      };
    } else {
      throw new Error('Invalid split_type. Must be "percentage" or "amount"');
    }
  } else if (action === 'clear') {
    // Clear preference
    await redis.del(prefKey);

    return {
      success: true,
      group_name: group.name,
      current_preference: {
        type: 'equal',
        description: 'Equal split (default)',
      },
      message: `Cleared custom split for ${group.name}. Will use equal split.`,
    };
  } else {
    throw new Error('Invalid action. Must be "get", "set", or "clear"');
  }
}

/**
 * Tool definition for MCP
 */
export const manageSplitPrefsTool = {
  name: 'manage_split_preferences',
  description: 'View, set, or clear custom split preferences for a group. Once set, these preferences will be automatically applied to future expenses in that group unless overridden. This is a FREE operation.',
  inputSchema: {
    type: 'object',
    properties: {
      session_token: {
        type: 'string',
        description: 'User session token',
      },
      group_id: {
        type: 'number',
        description: 'Group ID to manage preferences for',
      },
      action: {
        type: 'string',
        enum: ['get', 'set', 'clear'],
        description: 'Action: "get" (view current), "set" (save new), or "clear" (remove)',
      },
      split_type: {
        type: 'string',
        enum: ['percentage', 'amount'],
        description: 'For "set" action: "percentage" (e.g., 90-10) or "amount" (e.g., 45-5)',
      },
      split_values: {
        type: 'string',
        description: 'For "set" action: Split values separated by dashes (e.g., "90-10" or "45-5"). Must match number of group members.',
      },
    },
    required: ['session_token', 'group_id', 'action'],
  },
};
