/**
 * Splitwise API Client
 * 
 * Wrapper for Splitwise API v3.0 with automatic token refresh
 * and comprehensive error handling.
 */

import { getUser, updateUser } from './database';
import { encrypt, decrypt } from './encryption';

const SPLITWISE_API_BASE = 'https://secure.splitwise.com/api/v3.0';
const SPLITWISE_OAUTH_BASE = 'https://secure.splitwise.com/oauth';

export interface SplitwiseTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface SplitwiseUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  picture?: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface SplitwiseGroup {
  id: number;
  name: string;
  members: Array<{
    id: number;
    first_name: string;
    last_name: string;
  }>;
  simplify_by_default: boolean;
}

export interface SplitwiseCategory {
  id: number;
  name: string;
  subcategories?: Array<{
    id: number;
    name: string;
  }>;
}

export interface SplitwiseExpense {
  id: number;
  description: string;
  cost: string;
  currency_code: string;
  date: string;
  category: {
    id: number;
    name: string;
  };
  group_id: number;
  users: Array<{
    user_id: number;
    owed_share: string;
    paid_share: string;
  }>;
}

/**
 * Splitwise API Client Class
 */
export class SplitwiseClient {
  private sessionToken: string;
  private accessToken?: string;
  private refreshToken?: string;
  private expiresAt?: string;

  constructor(sessionToken: string) {
    this.sessionToken = sessionToken;
  }

  /**
   * Initialize client with user's tokens from database
   */
  async initialize(): Promise<void> {
    const user = await getUser(this.sessionToken);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.splitwise_access_token) {
      throw new Error('User not connected to Splitwise. Please connect first.');
    }

    // Decrypt tokens
    this.accessToken = decrypt(user.splitwise_access_token);
    this.refreshToken = user.splitwise_refresh_token 
      ? decrypt(user.splitwise_refresh_token)
      : undefined;
    this.expiresAt = user.splitwise_token_expires;

    // Check if token needs refresh
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }
  }

  /**
   * Check if access token is expired
   */
  private isTokenExpired(): boolean {
    if (!this.expiresAt) return false;
    
    const expiryTime = new Date(this.expiresAt).getTime();
    const now = Date.now();
    
    // Refresh if within 5 minutes of expiry
    return now >= (expiryTime - 5 * 60 * 1000);
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${SPLITWISE_OAUTH_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: process.env.SPLITWISE_CLIENT_ID!,
        client_secret: process.env.SPLITWISE_CLIENT_SECRET!,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    
    this.accessToken = data.access_token;
    if (data.refresh_token) {
      this.refreshToken = data.refresh_token;
    }
    
    // Calculate expiry (typically 2 hours)
    const expiresIn = data.expires_in || 7200;
    this.expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Update database with new tokens
    await updateUser(this.sessionToken, {
      splitwise_access_token: this.accessToken ? encrypt(this.accessToken) : undefined,
      splitwise_refresh_token: this.refreshToken ? encrypt(this.refreshToken) : undefined,
      splitwise_token_expires: this.expiresAt,
    });
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.accessToken) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    const url = `${SPLITWISE_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Splitwise API error (${response.status}):`, errorText);
      console.error('Request endpoint:', endpoint);
      console.error('Request body:', options.body);
      throw new Error(`Splitwise API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Log response for debugging (remove in production)
    if (endpoint === '/create_expense') {
      console.log('Splitwise createExpense response:', JSON.stringify(data));
    }
    
    return data;
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<SplitwiseUser> {
    const response = await this.apiRequest<{ user: SplitwiseUser }>('/get_current_user');
    return response.user;
  }

  /**
   * Get user's groups
   */
  async getGroups(): Promise<SplitwiseGroup[]> {
    const response = await this.apiRequest<{ groups: SplitwiseGroup[] }>('/get_groups');
    return response.groups;
  }

  /**
   * Get expense categories
   */
  async getCategories(): Promise<SplitwiseCategory[]> {
    const response = await this.apiRequest<{ categories: SplitwiseCategory[] }>('/get_categories');
    return response.categories;
  }

  /**
   * Create an expense
   */
  async createExpense(params: {
    description: string;
    cost: number;
    currency_code?: string;
    date?: string;
    category_id?: number;
    group_id?: number;
    split_equally?: boolean;
    users?: Array<{
      user_id: number;
      paid_share?: number;
      owed_share?: number;
    }>;
  }): Promise<SplitwiseExpense> {
    try {
      const response = await this.apiRequest<{ expenses: SplitwiseExpense[] }>(
        '/create_expense',
        {
          method: 'POST',
          body: JSON.stringify(params),
        }
      );
      
      if (!response || !response.expenses || !Array.isArray(response.expenses)) {
        console.error('Splitwise API returned invalid response:', JSON.stringify(response));
        throw new Error(`Splitwise API returned invalid format. Expected { expenses: [...] }, got: ${JSON.stringify(response)}`);
      }
      
      if (response.expenses.length === 0) {
        console.error('Splitwise API returned empty expenses array');
        throw new Error('Splitwise API returned no expense. The expense may have been rejected by Splitwise.');
      }
      
      return response.expenses[0];
    } catch (error) {
      console.error('createExpense error:', error);
      console.error('createExpense params:', JSON.stringify(params));
      throw error;
    }
  }

  /**
   * Get expenses with filters
   */
  async getExpenses(params?: {
    group_id?: number;
    dated_after?: string;
    dated_before?: string;
    limit?: number;
    offset?: number;
  }): Promise<SplitwiseExpense[]> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/get_expenses${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await this.apiRequest<{ expenses: SplitwiseExpense[] }>(endpoint);
    
    return response.expenses;
  }

  /**
   * Get a specific group
   */
  async getGroup(groupId: number): Promise<SplitwiseGroup> {
    const response = await this.apiRequest<{ group: SplitwiseGroup }>(`/get_group/${groupId}`);
    return response.group;
  }
}

/**
 * Helper: Create and initialize Splitwise client
 */
export async function createSplitwiseClient(sessionToken: string): Promise<SplitwiseClient> {
  const client = new SplitwiseClient(sessionToken);
  await client.initialize();
  return client;
}

/**
 * Helper: Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in?: number; // Optional - Splitwise might not return this
}> {
  const response = await fetch(`${SPLITWISE_OAUTH_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.SPLITWISE_CLIENT_ID!,
      client_secret: process.env.SPLITWISE_CLIENT_SECRET!,
      redirect_uri: process.env.SPLITWISE_OAUTH_REDIRECT_URL!,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  return response.json();
}

/**
 * Helper: Get OAuth authorization URL
 */
export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.SPLITWISE_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.SPLITWISE_OAUTH_REDIRECT_URL!,
    state,
  });

  return `${SPLITWISE_OAUTH_BASE}/authorize?${params}`;
}
