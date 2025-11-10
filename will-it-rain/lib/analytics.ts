/**
 * Privacy-First Analytics Logging
 *
 * Implements fire-and-forget analytics logging using Upstash Redis.
 * Only logs location and timestamp - no personally identifiable information (PII).
 *
 * Key Design Principles:
 * - Fire-and-forget pattern: Never blocks main request flow
 * - Privacy-first: Only location + timestamp logged (no IP, user agent, session ID)
 * - Error resilience: Analytics failures never break the application
 * - Silent error handling: Errors logged to console, never thrown
 *
 * @module lib/analytics
 */

import { redis } from '@/lib/redis';
import type { AnalyticsEntry } from '@/types/analytics';

/**
 * Log a location search to analytics (fire-and-forget)
 *
 * Appends a privacy-first analytics entry to Redis list 'analytics:searches'.
 * Uses fire-and-forget pattern: runs asynchronously, catches errors silently.
 *
 * Analytics Entry Structure:
 * - location: As entered by user (e.g., "San Francisco" or "94102")
 * - timestamp: ISO 8601 format (e.g., "2025-11-07T14:30:00.000Z")
 *
 * Error Handling:
 * - All errors caught with try/catch
 * - Errors logged to console.error for debugging
 * - Never throws errors (fire-and-forget pattern)
 * - Application continues normally if Redis unavailable
 *
 * Performance:
 * - Typical RPUSH operation: ~50-100ms
 * - Runs asynchronously (non-blocking)
 * - Does not impact API response time
 *
 * @param location - Location string as entered by user
 * @returns Promise<void> - Resolves silently (fire-and-forget)
 *
 * @example
 * // In API route (fire-and-forget - no await)
 * logSearch(location);
 *
 * // Or with explicit error suppression
 * logSearch(location).catch(() => {});
 */
export async function logSearch(location: string): Promise<void> {
  try {
    // Create privacy-first analytics entry
    const entry: AnalyticsEntry = {
      location,
      timestamp: new Date().toISOString(),
    };

    // Append to Redis list (RPUSH for append-only logging)
    // Key: 'analytics:searches'
    // Value: JSON stringified entry
    await redis.rpush('analytics:searches', JSON.stringify(entry));

    // Success - entry logged (no console output to avoid noise)
  } catch (error) {
    // Fire-and-forget: Log error for debugging, but never throw
    // Analytics failures must never break the main application flow
    console.error('Analytics logging failed (non-critical):', error);

    // DO NOT throw - analytics is fire-and-forget
    // Application continues normally even if Redis is unavailable
  }
}
