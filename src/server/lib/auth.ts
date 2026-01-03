/**
 * Authentication & Session Management
 * 
 * Handles JWT token generation and validation for user sessions.
 */

import jwt from 'jsonwebtoken';
import { createUser, getUser, getUserByEmail } from './database';

function getJWTSecret(): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
  }
  return process.env.JWT_SECRET;
}

interface TokenPayload {
  email: string;
  iat: number;
  exp: number;
}

/**
 * Generate a session token for a user
 */
export function generateSessionToken(email: string): string {
  const payload = {
    email: email.toLowerCase(),
  };
  
  // Token expires in 1 year
  const token = jwt.sign(payload, getJWTSecret(), {
    expiresIn: '365d',
  });
  
  return token;
}

/**
 * Verify and decode a session token
 */
export function verifySessionToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJWTSecret()) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Register a new user or get existing user
 */
export async function registerOrGetUser(email: string): Promise<{
  user: any;
  sessionToken: string;
  isNewUser: boolean;
}> {
  const normalizedEmail = email.toLowerCase().trim();
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error('Invalid email format');
  }
  
  // Check if user exists
  let existingUser = await getUserByEmail(normalizedEmail);
  
  if (existingUser) {
    return {
      user: existingUser,
      sessionToken: existingUser.session_token,
      isNewUser: false,
    };
  }
  
  // Create new user
  const sessionToken = generateSessionToken(normalizedEmail);
  const newUser = await createUser(normalizedEmail, sessionToken);
  
  return {
    user: newUser,
    sessionToken,
    isNewUser: true,
  };
}

/**
 * Get user from session token
 */
export async function getUserFromToken(sessionToken: string): Promise<any | null> {
  // Verify token is valid
  const payload = verifySessionToken(sessionToken);
  if (!payload) {
    return null;
  }
  
  // Get user from database
  const user = await getUser(sessionToken);
  return user;
}

/**
 * Validate session token format
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // JWT tokens have 3 parts separated by dots
  const parts = token.split('.');
  return parts.length === 3;
}
