/**
 * POST /api/check-rain
 *
 * Main API endpoint for rain forecast checks with complete decision logic.
 *
 * Request body:
 *   { location: string } - City name or ZIP code
 *
 * Response:
 *   Success (200): RainCheckResponse with YES/NO decision and contextual details
 *   Error (4xx/5xx): ErrorResponse with error code and message
 *
 * Implementation:
 * - Fetches 24-hour forecast from OpenWeather API
 * - Calculates rain probability and applies 50% threshold for YES/NO decision
 * - Detects continuous rain windows (≥40% probability)
 * - Calculates safe windows (clear periods between rain)
 * - Returns conditional response: YES includes details, NO includes probability only
 * - Flags close call scenarios (40-49% probability)
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchWeatherData, OpenWeatherError } from '@/lib/openweather';
import { parseForecastData } from '@/lib/forecast-parser';
import { calculateRainProbability } from '@/lib/rain-logic';
import { detectRainWindows, calculateSafeWindows, formatTimeRange } from '@/lib/rain-windows';
import { logSearch } from '@/lib/analytics';
import type { RainCheckRequest, ErrorResponse } from '@/types/api';

/**
 * Updated RainCheckResponse interface for Story 2.6
 *
 * This interface now includes complete decision logic fields.
 * Previous interface (Story 2.2) returned location, lat, lon, and forecast array.
 *
 * New fields:
 * - willRain: YES/NO decision based on ≥50% threshold
 * - probability: Maximum rain probability (0-100)
 * - rainWindows: Continuous rain periods (only if willRain === true)
 * - peakTime: When maximum probability occurs (only if willRain === true)
 * - intensity: Rainfall intensity classification (only if willRain === true)
 * - amount: Precipitation amount at peak (only if willRain === true)
 * - safeWindows: Clear periods between rain (only if willRain === true)
 * - closeCall: Flag for 40-49% probability scenarios
 */
export interface RainCheckResponse {
  /** YES/NO decision: true if max probability ≥50%, false otherwise */
  willRain: boolean;
  /** Maximum rain probability across 24 hours (0-100) */
  probability: number;
  /** Continuous rain periods (only included if willRain === true) */
  rainWindows?: Array<{ start: string; end: string }>;
  /** Time when maximum probability occurs (only if willRain === true) */
  peakTime?: string;
  /** Rainfall intensity: "light" | "moderate" | "heavy" (only if willRain === true) */
  intensity?: string;
  /** Precipitation amount at peak (e.g., "0.2 inches") (only if willRain === true) */
  amount?: string;
  /** Clear periods between rain windows (only if willRain === true) */
  safeWindows?: Array<{ start: string; end: string }>;
  /** Close call flag: true if probability is 40-49% */
  closeCall: boolean;
}

/**
 * POST handler for rain forecast requests
 *
 * Orchestrates all analysis modules to provide complete YES/NO decision with context.
 *
 * Process:
 * 1. Validate request body (location field required)
 * 2. Fetch weather forecast from OpenWeather API (via lib/openweather)
 * 3. Parse and normalize forecast data (via lib/forecast-parser)
 * 4. Calculate rain probability and decision (via lib/rain-logic)
 * 5. Detect rain windows (via lib/rain-windows)
 * 6. Calculate safe windows (via lib/rain-windows)
 * 7. Build conditional response: YES includes details, NO includes probability only
 * 8. Map errors to appropriate HTTP status codes
 */
export async function POST(request: NextRequest) {
  try {
    // ========================================
    // STEP 1: Parse and validate request body
    // ========================================
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'invalid_request',
          message: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    // Validate location field exists
    if (!body || typeof body !== 'object' || !('location' in body)) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'invalid_request',
          message: 'Request body must include "location" field',
        },
        { status: 400 }
      );
    }

    const { location } = body as RainCheckRequest;

    // Validate location is a non-empty string
    if (typeof location !== 'string' || location.trim().length === 0) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'invalid_request',
          message: 'Location must be a non-empty string',
        },
        { status: 400 }
      );
    }

    // ============================================
    // STEP 2: Log analytics (Story 2.7 - fire-and-forget)
    // ============================================
    // Fire-and-forget: Don't await, let it run asynchronously
    // Analytics failures never block the main request flow
    logSearch(location.trim());

    // ============================================
    // STEP 3: Fetch weather forecast (Story 2.1/2.2)
    // ============================================
    const weatherData = await fetchWeatherData(location.trim());

    // Extract first 8 data points (24 hours / 3-hour intervals)
    const next24Hours = weatherData.forecast.list.slice(0, 8);

    // Parse and normalize forecast data (Story 2.2)
    // Converts probability to 0-100, rainfall to inches, classifies intensity
    const parsedForecast = parseForecastData(next24Hours);

    // ============================================
    // STEP 4: Calculate rain probability (Story 2.3)
    // ============================================
    const probabilityResult = calculateRainProbability(parsedForecast);

    // Extract decision data
    const { maxProbability, willRain, closeCall, peakHourData, peakTime } = probabilityResult;

    // ============================================
    // STEP 5: Detect rain windows (Story 2.4)
    // ============================================
    const rainWindows = detectRainWindows(parsedForecast);

    // ============================================
    // STEP 6: Calculate safe windows (Story 2.5)
    // ============================================
    // Calculate forecast end time (current time + 24 hours)
    const forecastEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const safeWindows = calculateSafeWindows(rainWindows, forecastEndTime);

    // ============================================
    // STEP 7: Build conditional response (Story 2.6)
    // ============================================

    // Base response (always included)
    const response: RainCheckResponse = {
      willRain,
      probability: maxProbability,
      closeCall,
    };

    // Conditional details: Only include for YES answers (willRain === true)
    if (willRain) {
      // Format rain windows: Convert Date objects to "HH:MM AM/PM" strings
      response.rainWindows = rainWindows.map((window) => ({
        start: formatTimeRange(window.start, window.start).split(' - ')[0],
        end: formatTimeRange(window.end, window.end).split(' - ')[0],
      }));

      // Format peak time: Convert Date to "HH:MM AM/PM" string
      response.peakTime = formatTimeRange(peakTime, peakTime).split(' - ')[0];

      // Rainfall intensity from peak hour data
      response.intensity = peakHourData.intensity;

      // Rainfall amount from peak hour data
      // Format with 1-2 decimal places
      const amountInches = peakHourData.amount;
      if (amountInches === 0) {
        response.amount = '0.0 inches';
      } else if (amountInches < 0.01) {
        response.amount = 'trace';
      } else {
        response.amount = `${amountInches.toFixed(2)} inches`;
      }

      // Format safe windows: Convert Date objects to "HH:MM AM/PM" strings
      response.safeWindows = safeWindows.map((window) => ({
        start: formatTimeRange(window.start, window.start).split(' - ')[0],
        end: formatTimeRange(window.end, window.end).split(' - ')[0],
      }));
    }

    // Return JSON response with 200 OK
    return NextResponse.json<RainCheckResponse>(response, { status: 200 });

  } catch (error) {
    // ========================================
    // STEP 8: Error handling and HTTP status mapping
    // ========================================

    // Handle OpenWeatherError with standardized error codes
    if (error instanceof OpenWeatherError) {
      const statusCode = error.statusCode || 500;
      return NextResponse.json<ErrorResponse>(
        {
          error: error.code,
          message: error.message,
        },
        { status: statusCode }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in /api/check-rain:', error);
    return NextResponse.json<ErrorResponse>(
      {
        error: 'service_unavailable',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
