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
 * Note: For Story 2.1, this is a minimal structure.
 * Future stories will add calculated fields like willRain, probability, etc.
 */
export interface RainCheckResponse {
  /** Location that was queried */
  location: string;
  /** Latitude of the location */
  lat: number;
  /** Longitude of the location */
  lon: number;
  /** Raw hourly forecast data (will be processed in later stories) */
  hourlyData: Array<{
    /** Unix timestamp of the forecast hour */
    dt: number;
    /** Temperature in Fahrenheit */
    temp: number;
    /** Precipitation probability (0-1) */
    pop: number;
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
  | 'invalid_request';     // Malformed request (missing location, etc.)

/**
 * Error response from /api/check-rain endpoint
 */
export interface ErrorResponse {
  /** Error code for programmatic handling */
  error: ErrorCode;
  /** Human-readable error message */
  message: string;
}
