/**
 * Upstash Redis Client Configuration
 *
 * Configures serverless-native Redis client for analytics logging.
 * Uses HTTP-based REST API (works in serverless environments like Vercel).
 *
 * Environment variables (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)
 * are validated by lib/env.ts and auto-populated by Vercel Marketplace integration.
 *
 * @module lib/redis
 */

import { Redis } from '@upstash/redis';
import { env } from '@/lib/env';

/**
 * Upstash Redis client instance
 *
 * Configured with environment variables for serverless-native HTTP-based access.
 * Used for privacy-first analytics logging (append-only operations).
 *
 * Features:
 * - HTTP-based REST API (no connection pooling needed)
 * - Serverless-optimized for Vercel/Next.js
 * - Free tier: 256MB storage, 500K commands/month
 *
 * @example
 * import { redis } from '@/lib/redis';
 *
 * // Append analytics entry to list
 * await redis.rpush('analytics:searches', JSON.stringify({
 *   location: 'San Francisco',
 *   timestamp: new Date().toISOString()
 * }));
 */
export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});
