/**
 * OpenWeather API Client Module
 *
 * Provides integration with OpenWeather 5-day/3-hour Forecast API for weather forecasts.
 * Uses native fetch() API per ADR-005 (no external HTTP libraries).
 *
 * Architecture:
 * - Two-step process: Geocoding API (location → lat/lon) → 5-day Forecast API (weather data)
 * - Free tier API providing 3-hour interval forecasts
 * - 5-second timeout using AbortController per NFR-P2
 * - Single retry on 5xx errors with 1-second delay
 * - Standardized error codes for consistent error handling
 */

import { env } from '@/lib/env';
import type {
  OpenWeatherResponse,
  GeocodingResponse,
  ZipCodeGeocodingResponse,
} from '@/types/weather';
import type { ErrorCode } from '@/types/api';

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org';
const TIMEOUT_MS = 5000; // 5 seconds per NFR-P2
const RETRY_DELAY_MS = 1000; // 1 second delay before retry

/**
 * Custom error class for OpenWeather API errors
 */
export class OpenWeatherError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'OpenWeatherError';
  }
}

/**
 * Fetches data with timeout and retry logic
 *
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param isRetry - Whether this is a retry attempt (internal)
 * @returns Response object
 * @throws {OpenWeatherError} With appropriate error code
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  isRetry = false
): Promise<Response> {
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 5xx errors with retry logic
    if (response.status >= 500 && response.status < 600 && !isRetry) {
      // Wait 1 second before retrying
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      // Retry once
      return fetchWithTimeout(url, options, true);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new OpenWeatherError(
        'timeout',
        'Request timed out after 5 seconds',
        504
      );
    }

    // Handle network errors
    throw new OpenWeatherError(
      'network_error',
      'Network request failed',
      500
    );
  }
}

/**
 * Detects if a location string is a US ZIP code
 *
 * Matches patterns:
 * - 5-digit ZIP codes: "94102"
 * - ZIP+4 format: "94102-1234"
 *
 * Edge cases:
 * - Leading zeros preserved: "01234" is valid
 * - Numeric city names like "90210" treated as ZIP codes (intentional)
 *
 * @param location - Input string to test
 * @returns true if location matches US ZIP code pattern
 */
function isZipCode(location: string): boolean {
  // Regex pattern: 5 digits, optionally followed by hyphen and 4 digits
  const zipCodePattern = /^\d{5}(-\d{4})?$/;
  return zipCodePattern.test(location);
}

/**
 * Converts US ZIP code to geographic coordinates using ZIP Code Geocoding API
 *
 * Uses OpenWeather ZIP Code API endpoint: /geo/1.0/zip
 * Supports both 5-digit and ZIP+4 formats (ZIP+4 truncated to 5 digits).
 *
 * @param zip - US ZIP code (5-digit or ZIP+4 format)
 * @returns Geographic coordinates and location name
 * @throws {OpenWeatherError} If ZIP code is invalid or not found
 */
async function geocodeZipCode(
  zip: string
): Promise<{ lat: number; lon: number; name: string }> {
  // Truncate ZIP+4 format to 5 digits
  const zipCode = zip.split('-')[0];

  // Build ZIP Code API URL
  // Format: /geo/1.0/zip?zip={zip},{country}&appid={key}
  const url = `${OPENWEATHER_BASE_URL}/geo/1.0/zip?zip=${encodeURIComponent(
    zipCode
  )},US&appid=${env.OPENWEATHER_API_KEY}`;

  const response = await fetchWithTimeout(url);

  // Handle 404 - ZIP code not found
  if (response.status === 404) {
    throw new OpenWeatherError(
      'invalid_location',
      `ZIP code "${zip}" not found`,
      404
    );
  }

  // Handle 400 - invalid request format
  if (response.status === 400) {
    throw new OpenWeatherError(
      'invalid_location',
      `Invalid ZIP code format: "${zip}"`,
      400
    );
  }

  // Handle 5xx errors that weren't resolved by retry
  if (response.status >= 500) {
    throw new OpenWeatherError(
      'service_unavailable',
      'OpenWeather API is temporarily unavailable',
      503
    );
  }

  // Handle successful response
  if (!response.ok) {
    throw new OpenWeatherError(
      'service_unavailable',
      `OpenWeather API returned status ${response.status}`,
      response.status
    );
  }

  const data = (await response.json()) as ZipCodeGeocodingResponse;

  return {
    lat: data.lat,
    lon: data.lon,
    name: data.name,
  };
}

/**
 * Converts location string to geographic coordinates using Geocoding API
 *
 * Routes to appropriate geocoding endpoint based on input type:
 * - ZIP code pattern (5-digit or ZIP+4) → ZIP Code API
 * - All other inputs → Direct Geocoding API (city names)
 *
 * @param location - City name or ZIP code (e.g., "San Francisco" or "94102")
 * @returns Geographic coordinates and location name
 * @throws {OpenWeatherError} If location is invalid or not found
 */
async function geocodeLocation(
  location: string
): Promise<{ lat: number; lon: number; name: string }> {
  // Detect ZIP code and route to appropriate API
  if (isZipCode(location)) {
    return geocodeZipCode(location);
  }

  // Use Direct Geocoding API for city names
  const url = `${OPENWEATHER_BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(
    location
  )}&limit=1&appid=${env.OPENWEATHER_API_KEY}`;

  const response = await fetchWithTimeout(url);

  // Handle 404 - location not found
  if (response.status === 404 || response.status === 400) {
    throw new OpenWeatherError(
      'invalid_location',
      `Location "${location}" not found`,
      404
    );
  }

  // Handle 5xx errors that weren't resolved by retry
  if (response.status >= 500) {
    throw new OpenWeatherError(
      'service_unavailable',
      'OpenWeather API is temporarily unavailable',
      503
    );
  }

  // Handle successful response
  if (!response.ok) {
    throw new OpenWeatherError(
      'service_unavailable',
      `OpenWeather API returned status ${response.status}`,
      response.status
    );
  }

  const data = (await response.json()) as GeocodingResponse[];

  // Handle empty results (location not found)
  if (!data || data.length === 0) {
    throw new OpenWeatherError(
      'invalid_location',
      `Location "${location}" not found`,
      404
    );
  }

  const result = data[0];
  return {
    lat: result.lat,
    lon: result.lon,
    name: result.name,
  };
}

/**
 * Fetches weather forecast data from OpenWeather 5-day/3-hour Forecast API
 *
 * Uses the free tier forecast API which provides data in 3-hour intervals.
 * Returns up to 40 data points (5 days × 8 intervals per day).
 *
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Weather forecast data with 3-hour interval forecasts
 * @throws {OpenWeatherError} If API request fails
 */
async function fetchForecastData(
  lat: number,
  lon: number
): Promise<OpenWeatherResponse> {
  // Build 5-day/3-hour Forecast API URL (free tier)
  const url = new URL(`${OPENWEATHER_BASE_URL}/data/2.5/forecast`);
  url.searchParams.set('lat', lat.toString());
  url.searchParams.set('lon', lon.toString());
  url.searchParams.set('appid', env.OPENWEATHER_API_KEY);
  url.searchParams.set('units', 'imperial'); // Fahrenheit, mph

  const response = await fetchWithTimeout(url.toString());

  // Handle 404 - should not happen with valid coordinates, but handle defensively
  if (response.status === 404) {
    throw new OpenWeatherError(
      'invalid_location',
      'Invalid coordinates for weather data',
      404
    );
  }

  // Handle 5xx errors that weren't resolved by retry
  if (response.status >= 500) {
    throw new OpenWeatherError(
      'service_unavailable',
      'OpenWeather API is temporarily unavailable',
      503
    );
  }

  // Handle successful response
  if (!response.ok) {
    throw new OpenWeatherError(
      'service_unavailable',
      `OpenWeather API returned status ${response.status}`,
      response.status
    );
  }

  const data = (await response.json()) as OpenWeatherResponse;
  return data;
}

/**
 * Main entry point: Fetches weather forecast data for a given location
 *
 * Process:
 * 1. Convert location string to lat/lon using Geocoding API
 * 2. Fetch 5-day forecast using 5-day/3-hour Forecast API (free tier)
 * 3. Return standardized response with forecast data in 3-hour intervals
 *
 * @param location - City name or ZIP code (e.g., "San Francisco" or "94102")
 * @returns Weather forecast data with 3-hour intervals
 * @throws {OpenWeatherError} With standardized error codes
 *
 * Error codes:
 * - invalid_location: Location not found or invalid format
 * - service_unavailable: OpenWeather API returned 5xx error (after retry)
 * - timeout: Request took longer than 5 seconds
 * - network_error: Network connectivity issue
 */
export async function fetchWeatherData(location: string): Promise<{
  location: string;
  lat: number;
  lon: number;
  forecast: OpenWeatherResponse;
}> {
  // Step 1: Geocode location to get coordinates
  const { lat, lon, name } = await geocodeLocation(location);

  // Step 2: Fetch weather forecast data (3-hour intervals, free tier)
  const forecast = await fetchForecastData(lat, lon);

  return {
    location: name,
    lat,
    lon,
    forecast,
  };
}
