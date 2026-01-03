/**
 * Get Groups Tool
 * 
 * MCP tool to fetch user's Splitwise groups.
 */

import { createSplitwiseClient } from '../../lib/splitwise';
import { validateSession } from '../../lib/middleware';

export interface GetGroupsInput {
  session_token: string;
}

export interface GetGroupsResult {
  groups: Array<{
    id: number;
    name: string;
    member_count: number;
    members: Array<{
      id: number;
      name: string;
    }>;
    simplify_by_default: boolean;
  }>;
  total_count: number;
  message: string;
}

/**
 * Get user's Splitwise groups
 */
export async function getGroupsHandler(
  input: GetGroupsInput
): Promise<GetGroupsResult> {
  const { session_token } = input;

  // Validate session (read-only, doesn't count toward limit)
  await validateSession(session_token);

  // Create Splitwise client
  const client = await createSplitwiseClient(session_token);

  // Fetch groups
  const groups = await client.getGroups();

  // Format response
  const formattedGroups = groups.map(group => ({
    id: group.id,
    name: group.name,
    member_count: group.members.length,
    members: group.members.map(member => ({
      id: member.id,
      name: `${member.first_name} ${member.last_name}`.trim(),
    })),
    simplify_by_default: group.simplify_by_default,
  }));

  return {
    groups: formattedGroups,
    total_count: formattedGroups.length,
    message: `Found ${formattedGroups.length} group(s)`,
  };
}

/**
 * Tool definition for MCP
 */
export const getGroupsTool = {
  name: 'get_groups',
  description: 'Get all Splitwise groups the user is a member of. Returns group details including members. This is a free operation (doesn\'t count toward message limit).',
  inputSchema: {
    type: 'object',
    properties: {
      session_token: {
        type: 'string',
        description: 'User session token',
      },
    },
    required: ['session_token'],
  },
};
