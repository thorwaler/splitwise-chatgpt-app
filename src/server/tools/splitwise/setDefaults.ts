/**
 * Set Defaults Tool
 * 
 * MCP tool to set user's default group and split type for expenses.
 */

import { updateUser, getUser } from '../../lib/database';
import { checkAndRecordToolAccess } from '../../lib/middleware';
import { createSplitwiseClient } from '../../lib/splitwise';

export interface SetDefaultsInput {
  session_token: string;
  default_group_id?: number;
  default_split_type?: 'equal' | 'unequal' | 'percentages';
}

export interface SetDefaultsResult {
  success: boolean;
  defaults: {
    group_id?: number;
    group_name?: string;
    split_type?: string;
  };
  message: string;
  usage: {
    messages_remaining: number;
  };
}

/**
 * Set user's default preferences
 */
export async function setDefaultsHandler(
  input: SetDefaultsInput
): Promise<SetDefaultsResult> {
  const { session_token, default_group_id, default_split_type } = input;

  // Check access and record usage (this is a counted tool)
  const { user, usage } = await checkAndRecordToolAccess(
    session_token,
    'set_defaults'
  );

  // Validate inputs
  if (!default_group_id && !default_split_type) {
    throw new Error('Please specify at least one default to set (group_id or split_type)');
  }

  // Validate split type
  if (default_split_type && !['equal', 'unequal', 'percentages'].includes(default_split_type)) {
    throw new Error('Invalid split_type. Must be: equal, unequal, or percentages');
  }

  // If group ID provided, verify it exists
  let groupName: string | undefined;
  if (default_group_id) {
    const client = await createSplitwiseClient(session_token);
    try {
      const group = await client.getGroup(default_group_id);
      groupName = group.name;
    } catch (error) {
      throw new Error(`Group ${default_group_id} not found. Use get_groups to see available groups.`);
    }
  }

  // Update user defaults
  const updates: any = {};
  if (default_group_id) {
    updates.default_group_id = String(default_group_id);
  }
  if (default_split_type) {
    updates.default_split_type = default_split_type;
  }

  await updateUser(session_token, updates);

  // Get updated user data
  const updatedUser = await getUser(session_token);

  return {
    success: true,
    defaults: {
      group_id: updatedUser?.default_group_id 
        ? parseInt(updatedUser.default_group_id) 
        : undefined,
      group_name: groupName,
      split_type: updatedUser?.default_split_type,
    },
    message: `Defaults updated successfully! ${
      groupName ? `Default group: ${groupName}. ` : ''
    }${
      default_split_type ? `Default split type: ${default_split_type}.` : ''
    }`,
    usage: {
      messages_remaining: usage.messagesRemaining,
    },
  };
}

/**
 * Tool definition for MCP
 */
export const setDefaultsTool = {
  name: 'set_defaults',
  description: 'Set default group and/or split type for expenses. This makes adding expenses faster by not having to specify group every time. Counts toward message limit.',
  inputSchema: {
    type: 'object',
    properties: {
      session_token: {
        type: 'string',
        description: 'User session token',
      },
      default_group_id: {
        type: 'number',
        description: 'Default group ID for expenses (get from get_groups)',
      },
      default_split_type: {
        type: 'string',
        enum: ['equal', 'unequal', 'percentages'],
        description: 'Default split type: equal, unequal, or percentages',
      },
    },
    required: ['session_token'],
  },
};
