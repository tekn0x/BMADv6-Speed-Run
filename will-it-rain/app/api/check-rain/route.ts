/**
 * POST /api/check-rain
 *
 * Main API endpoint for rain forecast checks.
 *
 * Request body:
 *   { location: string } - City name or ZIP code
 *
 * Response:
 *   Success (200): RainCheckResponse with weather data
 *   Error (4xx/5xx): ErrorResponse with error code and message
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchWeatherData, OpenWeatherError } from '@/lib/openweather';
import type { RainCheckRequest, RainCheckResponse, ErrorResponse } from '@/types/api';

/**
 * POST handler for rain forecast requests
 *
 * Validates request, fetches weather data, and returns forecast information.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
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

    // Fetch weather data from OpenWeather API
    const weatherData = await fetchWeatherData(location.trim());

    // Build response with forecast data
    // Note: For Story 2.1, we return raw forecast data (3-hour intervals)
    // Future stories (2.3-2.6) will add rain prediction logic
    // 5-day forecast API provides 3-hour intervals, so we take first 8 data points (24 hours)
    const response: RainCheckResponse = {
      location: weatherData.location,
      lat: weatherData.lat,
      lon: weatherData.lon,
      hourlyData: weatherData.forecast.list.slice(0, 8).map((forecast) => ({
        dt: forecast.dt,
        temp: forecast.main.temp,
        pop: forecast.pop,
      })),
    };

    return NextResponse.json<RainCheckResponse>(response, { status: 200 });
  } catch (error) {
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
