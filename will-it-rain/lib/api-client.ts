/**
 * API Client Utility for Frontend-Backend Communication
 *
 * Provides a centralized function for making requests to the backend API.
 * Handles request formatting, response parsing, and error mapping.
 *
 * Architecture:
 * - Uses native Fetch API (ADR-005: No axios or HTTP libraries)
 * - Stateless design (ADR-002: No caching or persistence)
 * - Type-safe with strict TypeScript mode
 * - All errors wrapped in standardized ErrorResponse format
 *
 * @module lib/api-client
 */

import type { RainCheckResponse, ErrorResponse } from '@/types/api';

/**
 * Check rain forecast for a given location
 *
 * Makes a POST request to /api/check-rain with the location data.
 * Handles both successful responses and all error scenarios.
 *
 * Request:
 * - Method: POST
 * - Headers: Content-Type: application/json
 * - Body: { location: string }
 *
 * Response:
 * - Success: RainCheckResponse (willRain, probability, details if YES)
 * - Error: ErrorResponse (error code, message, optional suggestions)
 *
 * Error Handling:
 * - Network errors: Caught in try-catch, mapped to network_error
 * - HTTP errors (4xx/5xx): Parsed from response body as ErrorResponse
 * - Timeout: Backend handles 5-second timeout, returns 504 status
 *
 * @param location - City name or ZIP code to check
 * @returns Promise resolving to RainCheckResponse or ErrorResponse
 *
 * @example
 * ```typescript
 * const result = await checkRain('San Francisco');
 * if ('willRain' in result) {
 *   // Success response
 *   console.log(`Will rain: ${result.willRain}`);
 * } else {
 *   // Error response
 *   console.error(`Error: ${result.message}`);
 * }
 * ```
 */
export async function checkRain(
  location: string
): Promise<RainCheckResponse | ErrorResponse> {
  try {
    // Make POST request to backend API
    const response = await fetch('/api/check-rain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ location }),
    });

    // Parse JSON response
    const data = await response.json();

    // Check HTTP status
    if (!response.ok) {
      // HTTP error (4xx/5xx) - response body contains ErrorResponse
      return data as ErrorResponse;
    }

    // Success - response body contains RainCheckResponse
    return data as RainCheckResponse;
  } catch {
    // Network error (fetch failed, no connection, etc.)
    // Map to standardized ErrorResponse format
    return {
      error: 'network_error',
      message:
        'Network connection failed. Please check your internet and try again.',
    };
  }
}
