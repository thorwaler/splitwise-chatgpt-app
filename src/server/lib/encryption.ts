/**
 * Encryption Utilities
 * 
 * Provides functions to encrypt and decrypt sensitive data like
 * Splitwise access tokens and refresh tokens.
 */

import CryptoJS from 'crypto-js';

function getEncryptionKey(): string {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('Missing ENCRYPTION_KEY environment variable');
  }
  return process.env.ENCRYPTION_KEY;
}

/**
 * Encrypt a string value
 */
export function encrypt(text: string): string {
  const encrypted = CryptoJS.AES.encrypt(text, getEncryptionKey());
  return encrypted.toString();
}

/**
 * Decrypt an encrypted string
 */
export function decrypt(encryptedText: string): string {
  const decrypted = CryptoJS.AES.decrypt(encryptedText, getEncryptionKey());
  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * Hash a value (one-way, for verification)
 */
export function hash(text: string): string {
  return CryptoJS.SHA256(text).toString();
}
