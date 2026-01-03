/**
 * Get Categories Tool
 * 
 * MCP tool to fetch Splitwise expense categories.
 */

import { createSplitwiseClient } from '../../lib/splitwise';
import { validateSession } from '../../lib/middleware';
import {
  getCachedSplitwiseCategories,
  cacheSplitwiseCategories,
} from '../../lib/database';

export interface GetCategoriesInput {
  session_token: string;
  use_cache?: boolean;
}

export interface GetCategoriesResult {
  categories: Array<{
    id: number;
    name: string;
    subcategories?: Array<{
      id: number;
      name: string;
    }>;
  }>;
  total_count: number;
  from_cache: boolean;
  message: string;
}

/**
 * Get Splitwise expense categories
 */
export async function getCategoriesHandler(
  input: GetCategoriesInput
): Promise<GetCategoriesResult> {
  const { session_token, use_cache = true } = input;

  // Validate session (read-only, doesn't count toward limit)
  await validateSession(session_token);

  // Try cache first if enabled
  if (use_cache) {
    const cached = await getCachedSplitwiseCategories();
    if (cached) {
      return {
        categories: cached.categories,
        total_count: cached.categories.length,
        from_cache: true,
        message: `Retrieved ${cached.categories.length} categories from cache`,
      };
    }
  }

  // Fetch from Splitwise API
  const client = await createSplitwiseClient(session_token);
  const categories = await client.getCategories();

  // Cache for future use
  await cacheSplitwiseCategories({ categories });

  return {
    categories,
    total_count: categories.length,
    from_cache: false,
    message: `Retrieved ${categories.length} categories from Splitwise`,
  };
}

/**
 * Helper: Match category by name or keywords
 */
export function matchCategoryByKeywords(
  categories: Array<{ id: number; name: string; subcategories?: Array<{ id: number; name: string }> }>,
  description: string
): number | null {
  const lowerDesc = description.toLowerCase();
  
  // Define keyword mappings
  const keywordMap: Record<string, string[]> = {
    'Groceries': ['grocery', 'groceries', 'food shopping', 'supermarket', 'whole foods', 'trader joe'],
    'Dining out': ['restaurant', 'dinner', 'lunch', 'breakfast', 'food', 'cafe', 'coffee', 'eat out'],
    'Entertainment': ['movie', 'concert', 'show', 'theater', 'entertainment', 'tickets'],
    'Utilities': ['electric', 'gas', 'water', 'internet', 'wifi', 'utilities', 'bill'],
    'Rent/Mortgage': ['rent', 'mortgage', 'housing'],
    'Transportation': ['uber', 'lyft', 'taxi', 'gas', 'parking', 'transit', 'train', 'bus'],
    'Shopping': ['shopping', 'clothes', 'amazon', 'target'],
    'Healthcare': ['doctor', 'pharmacy', 'medical', 'health', 'dentist'],
  };

  // Try to match main categories
  for (const category of categories) {
    const keywords = keywordMap[category.name] || [];
    
    if (keywords.some(kw => lowerDesc.includes(kw))) {
      return category.id;
    }

    // Check subcategories too
    if (category.subcategories) {
      for (const subcat of category.subcategories) {
        const subcatKeywords = keywordMap[subcat.name] || [];
        if (subcatKeywords.some(kw => lowerDesc.includes(kw))) {
          return subcat.id;
        }
      }
    }
  }

  return null;
}

/**
 * Tool definition for MCP
 */
export const getCategoryMatchTool = {
  name: 'get_category_match',
  description: 'Match an expense description to a Splitwise category ID using keywords. Useful for auto-categorizing expenses.',
  inputSchema: {
    type: 'object',
    properties: {
      session_token: {
        type: 'string',
        description: 'User session token',
      },
      description: {
        type: 'string',
        description: 'Expense description to match',
      },
    },
    required: ['session_token', 'description'],
  },
};

export const getCategoriesTool = {
  name: 'get_categories',
  description: 'Get all Splitwise expense categories. Returns a list of categories with their IDs for use in add_expense. This is a free operation (doesn\'t count toward message limit).',
  inputSchema: {
    type: 'object',
    properties: {
      session_token: {
        type: 'string',
        description: 'User session token',
      },
      use_cache: {
        type: 'boolean',
        description: 'Whether to use cached categories (default: true)',
        default: true,
      },
    },
    required: ['session_token'],
  },
};
