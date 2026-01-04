/**
 * Redis Database Helper
 * 
 * Provides functions to interact with Upstash Redis for user management,
 * payment tracking, and usage logs.
 */

import { Redis } from '@upstash/redis';

// Lazy Redis client initialization
let redisClient: Redis | null = null;

function getRedis(): Redis {
  if (!redisClient) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Missing Upstash Redis environment variables');
    }
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redisClient;
}

// Export getter instead of direct client
export const redis = new Proxy({} as Redis, {
  get: (target, prop) => {
    const client = getRedis();
    const value = client[prop as keyof Redis];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

// Types
export interface User {
  id: string;
  email: string;
  session_token: string;
  created_at: string;
  splitwise_user_id?: string;
  splitwise_access_token?: string;
  splitwise_refresh_token?: string;
  splitwise_token_expires?: string;
  default_group_id?: string;
  default_split_type?: string;
  payment_status: 'free' | 'paid';
  message_count: number;
  paid_at?: string;
}

export interface Payment {
  payment_intent_id: string;
  user_session_token: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface UsageLog {
  tool_name: string;
  timestamp: string;
}

/**
 * Get user by session token
 */
export async function getUser(sessionToken: string): Promise<User | null> {
  const userData = await redis.hgetall(`user:${sessionToken}`);
  
  if (!userData || Object.keys(userData).length === 0) {
    return null;
  }
  
  return userData as unknown as User;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const sessionToken = await redis.get<string>(`email:${email.toLowerCase()}`);
  
  if (!sessionToken) {
    return null;
  }
  
  return getUser(sessionToken);
}

/**
 * Create new user
 */
export async function createUser(
  email: string,
  sessionToken: string
): Promise<User> {
  const now = new Date().toISOString();
  
  const user: User = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    session_token: sessionToken,
    created_at: now,
    payment_status: 'free',
    message_count: 0,
  };
  
  // Store user data
  await redis.hset(`user:${sessionToken}`, user as unknown as Record<string, unknown>);
  
  // Create email -> session_token mapping for lookup
  await redis.set(`email:${email.toLowerCase()}`, sessionToken);
  
  return user;
}

/**
 * Update user data
 */
export async function updateUser(
  sessionToken: string,
  data: Partial<Omit<User, 'id' | 'email' | 'session_token' | 'created_at'>>
): Promise<void> {
  // Filter out undefined and null values (Redis doesn't accept them)
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined && value !== null)
  );
  
  // Only update if there's data to update
  if (Object.keys(cleanData).length > 0) {
    await redis.hset(`user:${sessionToken}`, cleanData as Record<string, unknown>);
  }
}

/**
 * Increment message count
 */
export async function incrementMessageCount(sessionToken: string): Promise<number> {
  const count = await redis.hincrby(`user:${sessionToken}`, 'message_count', 1);
  return count;
}

/**
 * Track tool usage
 */
export async function trackUsage(
  sessionToken: string,
  toolName: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const usageLog: UsageLog = {
    tool_name: toolName,
    timestamp: new Date().toISOString(),
  };
  
  await redis.rpush(`usage:${sessionToken}:${today}`, JSON.stringify(usageLog));
  
  // Set expiry for 30 days
  await redis.expire(`usage:${sessionToken}:${today}`, 60 * 60 * 24 * 30);
}

/**
 * Get usage count for today
 */
export async function getUsageCount(sessionToken: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const logs = await redis.lrange(`usage:${sessionToken}:${today}`, 0, -1);
  return logs.length;
}

/**
 * Create payment record
 */
export async function createPayment(payment: Payment): Promise<void> {
  await redis.hset(`payment:${payment.payment_intent_id}`, payment as unknown as Record<string, unknown>);
}

/**
 * Get payment by intent ID
 */
export async function getPayment(paymentIntentId: string): Promise<Payment | null> {
  const paymentData = await redis.hgetall(`payment:${paymentIntentId}`);
  
  if (!paymentData || Object.keys(paymentData).length === 0) {
    return null;
  }
  
  return paymentData as unknown as Payment;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentIntentId: string,
  status: Payment['status']
): Promise<void> {
  await redis.hset(`payment:${paymentIntentId}`, { status });
}

/**
 * Cache Splitwise categories
 */
export async function cacheSplitwiseCategories(categories: any): Promise<void> {
  await redis.set('splitwise_categories', JSON.stringify(categories), {
    ex: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Get cached Splitwise categories
 */
export async function getCachedSplitwiseCategories(): Promise<any | null> {
  const cached = await redis.get('splitwise_categories');
  return cached ? JSON.parse(cached as string) : null;
}

/**
 * Check if user has exceeded free message limit
 */
export async function hasExceededFreeLimit(sessionToken: string): Promise<boolean> {
  const user = await getUser(sessionToken);
  
  if (!user) {
    return false;
  }
  
  if (user.payment_status === 'paid') {
    return false;
  }
  
  const freeLimit = parseInt(process.env.NEXT_PUBLIC_FREE_MESSAGE_LIMIT || '3');
  return user.message_count >= freeLimit;
}

/**
 * Mark user as paid
 */
export async function markUserAsPaid(sessionToken: string): Promise<void> {
  await updateUser(sessionToken, {
    payment_status: 'paid',
    paid_at: new Date().toISOString(),
  });
}
