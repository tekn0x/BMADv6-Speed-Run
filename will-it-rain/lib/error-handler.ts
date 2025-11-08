/**
 * Error Handler Module
 *
 * Provides centralized error handling for the weather intelligence layer.
 * Maps all error types to standardized ApiError format with appropriate error codes and status codes.
 *
 * Error Codes:
 * - timeout: Request exceeded 5 second threshold → 504 status
 * - invalid_location: OpenWeather returned 404 (location not found) → 404 status
 * - service_unavailable: OpenWeather returned 5xx (API server error) → 500 status
 * - network_error: Network connectivity issue (fetch failed) → 503 status
 * - unknown_error: Unexpected error not matching above cases → 500 status
 *
 * Usage:
 * ```typescript
 * try {
 *   // API logic
 * } catch (error) {
 *   const apiError = mapErrorToApiError(error);
 *   logError(error, 'API Route');
 *   return createErrorResponse(apiError);
 * }
 * ```
 */

import { NextResponse } from 'next/server';
import type { ErrorResponse, ApiError } from '@/types/api';
import { OpenWeatherError } from '@/lib/openweather';

/**
 * Maps any error to standardized ApiError format
 *
 * Handles all error types encountered in the weather intelligence layer:
 * - AbortError (timeout)
 * - OpenWeatherError (API errors)
 * - Network errors (fetch failures)
 * - Unknown errors (unexpected failures)
 *
 * @param error - Error object of unknown type
 * @returns Standardized ApiError with code, message, and status code
 *
 * @example
 * ```typescript
 * try {
 *   await fetchWeatherData(location);
 * } catch (error) {
 *   const apiError = mapErrorToApiError(error);
 *   // apiError: { code: 'timeout', message: '...', statusCode: 504 }
 * }
 * ```
 */
export function mapErrorToApiError(error: unknown): ApiError {
  // Handle AbortError (timeout from AbortController)
  if (error instanceof Error && error.name === 'AbortError') {
    return {
      code: 'timeout',
      message: 'Request timed out after 5 seconds. Please try again.',
      statusCode: 504,
    };
  }

  // Handle OpenWeatherError (already has code, message, statusCode)
  if (error instanceof OpenWeatherError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode || 500,
    };
  }

  // Handle TypeError: Failed to fetch (network errors)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      code: 'network_error',
      message: 'Network request failed. Please check your internet connection and try again.',
      statusCode: 503,
    };
  }

  // Handle generic Error objects
  if (error instanceof Error) {
    return {
      code: 'unknown_error',
      message: 'An unexpected error occurred. Please try again later.',
      statusCode: 500,
    };
  }

  // Handle non-Error objects (edge case)
  return {
    code: 'unknown_error',
    message: 'An unexpected error occurred. Please try again later.',
    statusCode: 500,
  };
}

/**
 * Logs error details to server-side console for debugging
 *
 * Logs full error details including stack trace to console.error.
 * Logs are visible in Vercel serverless function logs for production debugging.
 * Never exposes stack traces or internal paths to users.
 *
 * @param error - Error object to log
 * @param context - Context string for log message (e.g., "OpenWeather API", "API Route")
 *
 * @example
 * ```typescript
 * try {
 *   await fetchWeatherData(location);
 * } catch (error) {
 *   logError(error, 'OpenWeather API');
 *   // Logs: [2025-11-07T...] [OpenWeather API] Error: ...
 * }
 * ```
 */
export function logError(error: unknown, context: string): void {
  const timestamp = new Date().toISOString();

  // Log error type for debugging
  const errorType = error instanceof Error ? error.constructor.name : typeof error;

  // Log full error details with stack trace
  console.error(
    `[${timestamp}] [${context}] ${errorType}:`,
    error instanceof Error ? error.message : String(error)
  );

  // Log stack trace if available
  if (error instanceof Error && error.stack) {
    console.error('Stack trace:', error.stack);
  }

  // Log additional error properties if available
  if (error instanceof OpenWeatherError) {
    console.error('Error code:', error.code);
    console.error('Status code:', error.statusCode);
  }
}

/**
 * Creates standardized NextResponse for API errors
 *
 * Returns NextResponse.json with consistent error format:
 * { error: { code, message } }
 *
 * Sets appropriate HTTP status code from apiError.statusCode.
 * Ensures all error responses follow same format for frontend handling.
 *
 * @param apiError - ApiError object with code, message, statusCode
 * @returns NextResponse with error JSON and appropriate status code
 *
 * @example
 * ```typescript
 * const apiError = mapErrorToApiError(error);
 * return createErrorResponse(apiError);
 * // Returns: NextResponse with { error: 'timeout', message: '...' } and status 504
 * ```
 */
export function createErrorResponse(apiError: ApiError): NextResponse<ErrorResponse> {
  return NextResponse.json<ErrorResponse>(
    {
      error: apiError.code,
      message: apiError.message,
    },
    {
      status: apiError.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
