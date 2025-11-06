/**
 * Test API Route for Environment Variable Validation
 *
 * This route verifies that:
 * 1. Environment variables are loaded correctly from .env.local
 * 2. The env validation utility works as expected
 * 3. Server-side environment access is functioning
 *
 * IMPORTANT: This is a test route for development only.
 * Remove or secure this endpoint before production deployment.
 */

import { env } from '@/lib/env';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test that env object is accessible
    const hasOpenWeatherKey = !!env.OPENWEATHER_API_KEY;
    const hasUpstashUrl = !!env.UPSTASH_REDIS_REST_URL;
    const hasUpstashToken = !!env.UPSTASH_REDIS_REST_TOKEN;

    // Create masked versions for logging (security: never expose full keys)
    const maskValue = (value: string): string => {
      if (!value || value === 'your_api_key_here' || value === 'your_upstash_url_here' || value === 'your_upstash_token_here') {
        return '[PLACEHOLDER]';
      }
      return value.substring(0, 8) + '...' + value.substring(value.length - 4);
    };

    return NextResponse.json({
      success: true,
      message: 'Environment variables loaded successfully',
      environment: env.NODE_ENV,
      variables: {
        OPENWEATHER_API_KEY: {
          defined: hasOpenWeatherKey,
          masked: maskValue(env.OPENWEATHER_API_KEY),
        },
        UPSTASH_REDIS_REST_URL: {
          defined: hasUpstashUrl,
          masked: maskValue(env.UPSTASH_REDIS_REST_URL),
        },
        UPSTASH_REDIS_REST_TOKEN: {
          defined: hasUpstashToken,
          masked: maskValue(env.UPSTASH_REDIS_REST_TOKEN),
        },
      },
      note: 'This is a test endpoint. Remove before production.',
    });
  } catch (error) {
    // If env validation fails, this will be caught here
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
