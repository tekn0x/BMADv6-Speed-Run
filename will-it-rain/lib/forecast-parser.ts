/**
 * Forecast Data Parser Module
 *
 * Parses and normalizes raw OpenWeather forecast data into a consistent format
 * for the rain prediction logic to consume.
 *
 * Transformations performed:
 * - Probability: 0.0-1.0 → 0-100 (percentage)
 * - Rainfall: millimeters → inches (÷ 25.4)
 * - Intensity: classified based on rainfall thresholds
 * - Timestamps: Unix timestamps → Date objects
 */

import type { ForecastData, ParsedForecast } from '@/types/weather';

/**
 * Converts millimeters to inches
 * @param mm - Rainfall amount in millimeters
 * @returns Rainfall amount in inches
 */
function mmToInches(mm: number): number {
  return mm / 25.4;
}

/**
 * Classifies rainfall intensity based on amount in millimeters per 3-hour period
 *
 * Thresholds based on OpenWeather data and meteorological standards:
 * - None: 0 mm (no rain)
 * - Light: 0.1-2.5 mm
 * - Moderate: 2.5-7.6 mm
 * - Heavy: >7.6 mm
 *
 * @param amountMm - Rainfall amount in millimeters for 3-hour period
 * @returns Intensity classification
 */
function classifyIntensity(
  amountMm: number
): 'none' | 'light' | 'moderate' | 'heavy' {
  if (amountMm === 0) return 'none';
  if (amountMm < 2.5) return 'light';
  if (amountMm < 7.6) return 'moderate';
  return 'heavy';
}

/**
 * Parses and normalizes a list of forecast data points
 *
 * Takes raw OpenWeather forecast data and converts it to a normalized format:
 * - Converts probability from 0.0-1.0 to 0-100 percentage
 * - Converts rainfall amounts from mm to inches
 * - Classifies intensity based on rainfall thresholds
 * - Converts Unix timestamps to Date objects
 * - Extracts temperature and weather description
 *
 * @param forecastList - Array of ForecastData from OpenWeather API
 * @returns Array of normalized ParsedForecast objects
 * @throws {Error} If forecast data is malformed or missing required fields
 */
export function parseForecastData(
  forecastList: ForecastData[]
): ParsedForecast[] {
  if (!Array.isArray(forecastList)) {
    throw new Error('Forecast data must be an array');
  }

  if (forecastList.length === 0) {
    throw new Error('Forecast data array is empty');
  }

  return forecastList.map((forecast, index) => {
    // Validate required fields
    if (!forecast.dt || typeof forecast.dt !== 'number') {
      throw new Error(
        `Invalid or missing timestamp (dt) at index ${index}`
      );
    }

    if (!forecast.main || typeof forecast.main.temp !== 'number') {
      throw new Error(
        `Invalid or missing temperature (main.temp) at index ${index}`
      );
    }

    if (typeof forecast.pop !== 'number') {
      throw new Error(
        `Invalid or missing probability (pop) at index ${index}`
      );
    }

    if (!forecast.weather || !Array.isArray(forecast.weather) || forecast.weather.length === 0) {
      throw new Error(
        `Invalid or missing weather description at index ${index}`
      );
    }

    // Extract rainfall amount in mm (defaults to 0 if no rain expected)
    const rainfallMm = forecast.rain?.['3h'] ?? 0;

    // Convert probability from 0.0-1.0 to 0-100
    const probability = Math.round(forecast.pop * 100);

    // Convert rainfall from mm to inches
    const amountInches = mmToInches(rainfallMm);

    // Classify intensity based on mm amount
    const intensity = classifyIntensity(rainfallMm);

    // Convert Unix timestamp to Date object
    const time = new Date(forecast.dt * 1000);

    // Extract weather description
    const description = forecast.weather[0].description;

    return {
      time,
      timestamp: forecast.dt,
      probability,
      intensity,
      amount: amountInches,
      temperature: forecast.main.temp,
      description,
    };
  });
}
