/**
 * Environment Variable Validation and Type-Safe Access
 *
 * This module provides centralized validation and type-safe access to environment variables.
 * It validates required variables on startup and provides helpful error messages.
 *
 * Security: All environment variables are server-side only. Never use NEXT_PUBLIC_ prefix for API keys.
 */

export interface EnvironmentVariables {
  // API keys (used in Epic 2)
  OPENWEATHER_API_KEY: string;

  // Upstash Redis (Epic 2 analytics)
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;

  // Next.js built-in
  NODE_ENV: 'development' | 'production' | 'test';
}

/**
 * Validates that all required environment variables are present and returns a typed object.
 *
 * For Epic 1 (Foundation), API keys are optional placeholders.
 * Epic 2 will require actual values for OpenWeather API integration.
 *
 * @throws {Error} If required environment variables are missing with helpful error message
 * @returns {EnvironmentVariables} Typed environment object
 */
export function validateEnv(): EnvironmentVariables {
  const errors: string[] = [];

  // Check NODE_ENV (required by Next.js)
  const nodeEnv = process.env.NODE_ENV;
  if (!nodeEnv || !['development', 'production', 'test'].includes(nodeEnv)) {
    errors.push('NODE_ENV must be set to development, production, or test');
  }

  // For Epic 1, we allow placeholder values (e.g., "your_api_key_here")
  // Epic 2 will add stricter validation requiring actual API keys
  const openweatherApiKey = process.env.OPENWEATHER_API_KEY;
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Check that variables are defined (even if placeholders)
  if (!openweatherApiKey) {
    errors.push('OPENWEATHER_API_KEY is not defined');
  }
  if (!upstashUrl) {
    errors.push('UPSTASH_REDIS_REST_URL is not defined');
  }
  if (!upstashToken) {
    errors.push('UPSTASH_REDIS_REST_TOKEN is not defined');
  }

  // If there are errors, provide helpful guidance
  if (errors.length > 0) {
    const errorMessage = [
      '❌ Environment Variable Validation Failed',
      '',
      'Missing or invalid environment variables:',
      ...errors.map(err => `  • ${err}`),
      '',
      'To fix this:',
      '  1. Copy .env.example to .env.local:',
      '     cp .env.example .env.local',
      '',
      '  2. Update .env.local with your actual values:',
      '     • OpenWeather API key: https://openweathermap.org/api',
      '     • Upstash Redis: https://upstash.com/',
      '',
      '  3. Restart your development server',
      '',
      'For Epic 1, placeholder values are acceptable.',
      'Epic 2 will require actual API keys for weather data integration.',
    ].join('\n');

    throw new Error(errorMessage);
  }

  // Return typed environment object
  // TypeScript needs explicit assertions since we've validated above
  return {
    OPENWEATHER_API_KEY: openweatherApiKey!,
    UPSTASH_REDIS_REST_URL: upstashUrl!,
    UPSTASH_REDIS_REST_TOKEN: upstashToken!,
    NODE_ENV: nodeEnv as 'development' | 'production' | 'test',
  };
}

/**
 * Validated environment variables - single source of truth
 *
 * Import this throughout the application for type-safe environment access:
 *
 * @example
 * import { env } from '@/lib/env';
 *
 * // In API routes or server components:
 * const apiKey = env.OPENWEATHER_API_KEY;
 */
export const env = validateEnv();
