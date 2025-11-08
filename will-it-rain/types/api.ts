/**
 * API Contract Type Definitions
 *
 * Defines the request/response interfaces for the /api/check-rain endpoint.
 * All types follow TypeScript strict mode with no 'any' types.
 */

/**
 * Request body for the /api/check-rain endpoint
 */
export interface RainCheckRequest {
  /** Location string - can be city name (e.g., "San Francisco") or ZIP code (e.g., "94102") */
  location: string;
}

/**
 * Successful response from /api/check-rain endpoint
 *
 * Updated in Story 2.2 to include parsed and normalized forecast data.
 * Future stories (2.3-2.6) will add calculated fields like willRain, safeWindow, etc.
 */
export interface RainCheckResponse {
  /** Location that was queried */
  location: string;
  /** Latitude of the location */
  lat: number;
  /** Longitude of the location */
  lon: number;
  /**
   * Parsed 24-hour forecast data in 3-hour intervals (8 data points)
   * Data is normalized: probability in 0-100 range, amounts in inches, intensity classified
   * Replaces hourlyData from Story 2.1
   */
  forecast: Array<{
    /** JavaScript Date object for this forecast period */
    time: Date;
    /** Unix timestamp (UTC) for this forecast period */
    timestamp: number;
    /** Precipitation probability as percentage (0-100) */
    probability: number;
    /** Rainfall intensity: "none" | "light" | "moderate" | "heavy" */
    intensity: 'none' | 'light' | 'moderate' | 'heavy';
    /** Total rainfall amount in inches for this 3-hour period */
    amount: number;
    /** Temperature in Fahrenheit */
    temperature: number;
    /** Weather description */
    description: string;
  }>;
}

/**
 * Error codes returned by the API
 */
export type ErrorCode =
  | 'invalid_location'     // Location not found or invalid format
  | 'service_unavailable'  // OpenWeather API returned 5xx error
  | 'timeout'              // Request took longer than 5 seconds
  | 'network_error'        // Network connectivity issue
  | 'missing_api_key'      // OPENWEATHER_API_KEY not configured
  | 'invalid_request'      // Malformed request (missing location, etc.)
  | 'unknown_error';       // Unexpected error not matching above cases

/**
 * Internal ApiError interface for centralized error handling
 *
 * Used by error handler module to represent errors before converting to API response.
 * Contains error code, user-friendly message, and HTTP status code.
 *
 * @see ErrorResponse - External API response format
 */
export interface ApiError {
  /** Standardized error code for programmatic handling */
  code: ErrorCode;
  /** User-friendly error message (no technical details) */
  message: string;
  /** HTTP status code (404, 500, 503, 504, etc.) */
  statusCode: number;
}

/**
 * Error response from /api/check-rain endpoint
 */
export interface ErrorResponse {
  /** Error code for programmatic handling */
  error: ErrorCode;
  /** Human-readable error message */
  message: string;
}
