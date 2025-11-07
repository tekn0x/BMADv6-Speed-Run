/**
 * Rain Probability Calculation Logic
 *
 * Analyzes 24-hour forecast data to determine rain probability and make YES/NO decisions.
 *
 * Core responsibilities:
 * - Identify maximum rain probability across all forecast periods
 * - Determine peak rain time (earliest occurrence if tied)
 * - Categorize intensity based on hourly rainfall rate
 * - Apply 50% threshold for YES/NO decision
 * - Detect close call scenarios (40-49% probability)
 *
 * This module contains pure functions with no side effects or external dependencies.
 * All calculations are stateless and deterministic.
 */

import type { ParsedForecast } from '@/types/weather';

/**
 * Result of rain probability calculation
 *
 * Contains all data needed to make the YES/NO decision and provide
 * context to the user about rain timing, intensity, and amount.
 */
export interface RainProbabilityResult {
  /** Maximum rain probability across all 24 hours (0-100) */
  maxProbability: number;
  /** Timestamp when maximum probability occurs */
  peakTime: Date;
  /** Full forecast data for the peak hour period */
  peakHourData: ParsedForecast;
  /** YES/NO decision: true if maxProbability >= 50%, false otherwise */
  willRain: boolean;
  /** Close call flag: true if probability is 40-49% (consider bringing umbrella) */
  closeCall: boolean;
}

/**
 * Finds the maximum rain probability across all forecast periods
 *
 * If multiple periods have the same maximum probability, the earliest
 * occurrence is selected (tie-breaking rule).
 *
 * @param forecast - Array of parsed forecast data (typically 8 periods for 24 hours)
 * @returns Object with max probability, peak time, and full forecast data for peak hour
 * @throws {Error} If forecast array is empty
 */
function findMaxProbability(forecast: ParsedForecast[]): {
  maxProbability: number;
  peakTime: Date;
  peakHourData: ParsedForecast;
} {
  if (forecast.length === 0) {
    throw new Error('Forecast array cannot be empty');
  }

  // Find the forecast period with maximum probability
  // If tied, this naturally selects the first occurrence (earliest time)
  let maxForecast = forecast[0];
  let maxProb = forecast[0].probability;

  for (let i = 1; i < forecast.length; i++) {
    if (forecast[i].probability > maxProb) {
      maxProb = forecast[i].probability;
      maxForecast = forecast[i];
    }
  }

  return {
    maxProbability: maxProb,
    peakTime: maxForecast.time,
    peakHourData: maxForecast,
  };
}

/**
 * Categorizes rainfall intensity based on hourly rate
 *
 * Thresholds (per hour):
 * - Light: 0.004 - 0.1 inches/hour (0.1 - 2.5 mm/hour)
 * - Moderate: 0.1 - 0.3 inches/hour (2.5 - 7.6 mm/hour)
 * - Heavy: > 0.3 inches/hour (> 7.6 mm/hour)
 *
 * Note: ParsedForecast.amount is for a 3-hour period, so we divide by 3
 * to get the hourly rate before applying thresholds.
 *
 * Currently prepared for Story 2.6 integration (API response formatting).
 * ParsedForecast already includes intensity from forecast-parser.
 *
 * @param amountInches - Total rainfall amount for 3-hour period (inches)
 * @returns Intensity classification
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function categorizeIntensity(
  amountInches: number
): 'light' | 'moderate' | 'heavy' {
  // Convert 3-hour total to hourly rate
  const hourlyRate = amountInches / 3;

  // Apply thresholds based on hourly rate
  if (hourlyRate < 0.004) {
    // Trace amounts or zero
    return 'light';
  }
  if (hourlyRate < 0.1) {
    return 'light';
  }
  if (hourlyRate < 0.3) {
    return 'moderate';
  }
  return 'heavy';
}

/**
 * Formats precipitation amount as user-friendly string
 *
 * Takes the rainfall amount from ParsedForecast (already in inches for 3-hour period)
 * and formats it as a readable string with appropriate precision.
 *
 * Currently prepared for Story 2.6 integration (API response formatting).
 * Amount can be extracted directly from peakHourData.amount.
 *
 * @param amountInches - Rainfall amount in inches (3-hour period)
 * @returns Formatted string like "0.2 inches" or "trace"
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatPrecipitationAmount(amountInches: number): string {
  if (amountInches === 0) {
    return '0.0 inches';
  }
  if (amountInches < 0.01) {
    return 'trace';
  }
  // Format with 1-2 decimal places
  return `${amountInches.toFixed(2)} inches`;
}

/**
 * Applies decision threshold logic
 *
 * Rules:
 * - YES (willRain = true): probability >= 50%
 * - NO (willRain = false): probability < 50%
 * - Close call flag: 40 <= probability < 50
 *
 * @param probability - Rain probability (0-100)
 * @returns Object with willRain and closeCall boolean flags
 */
function applyDecisionThreshold(probability: number): {
  willRain: boolean;
  closeCall: boolean;
} {
  const willRain = probability >= 50;
  const closeCall = probability >= 40 && probability < 50;

  return { willRain, closeCall };
}

/**
 * Calculates rain probability and decision data from forecast
 *
 * Main entry point for rain probability calculation. Orchestrates all
 * helper functions to produce a complete RainProbabilityResult.
 *
 * Process:
 * 1. Find maximum probability and peak time across all forecast periods
 * 2. Categorize intensity based on rainfall amount at peak hour
 * 3. Apply 50% threshold for YES/NO decision
 * 4. Detect close call scenarios (40-49% range)
 * 5. Return structured result with all decision data
 *
 * @param forecast - Array of parsed forecast data (typically 8 periods for 24 hours)
 * @returns Complete rain probability result with decision flags
 * @throws {Error} If forecast array is empty or invalid
 */
export function calculateRainProbability(
  forecast: ParsedForecast[]
): RainProbabilityResult {
  // Validate input
  if (!Array.isArray(forecast)) {
    throw new Error('Forecast must be an array');
  }

  // Find maximum probability and peak time
  const { maxProbability, peakTime, peakHourData } =
    findMaxProbability(forecast);

  // Apply decision threshold logic
  const { willRain, closeCall } = applyDecisionThreshold(maxProbability);

  // Build and return complete result
  return {
    maxProbability,
    peakTime,
    peakHourData,
    willRain,
    closeCall,
  };
}
