/**
 * Analytics Type Definitions
 *
 * Defines TypeScript interfaces for privacy-first analytics logging.
 * Only location and timestamp are logged - no personally identifiable information (PII).
 */

/**
 * Analytics log entry structure (privacy-first)
 *
 * @property location - Location string as entered by user (city name or ZIP code)
 * @property timestamp - ISO 8601 timestamp when the search occurred
 *
 * @example
 * {
 *   location: "San Francisco",
 *   timestamp: "2025-11-07T14:30:00.000Z"
 * }
 */
export interface AnalyticsEntry {
  /** Location as entered by user (e.g., "San Francisco" or "94102") */
  location: string;

  /** ISO 8601 timestamp (e.g., "2025-11-07T14:30:00.000Z") */
  timestamp: string;
}

/**
 * Redis client configuration
 *
 * Configuration object for Upstash Redis HTTP-based REST API client.
 * Environment variables are auto-populated by Vercel Marketplace integration.
 *
 * @property url - Upstash Redis REST URL (UPSTASH_REDIS_REST_URL env var)
 * @property token - Upstash Redis REST token (UPSTASH_REDIS_REST_TOKEN env var)
 */
export interface RedisConfig {
  /** Upstash Redis REST API URL */
  url: string;

  /** Upstash Redis REST API authentication token */
  token: string;
}
