/**
 * Rain Window Detection Module
 *
 * Identifies continuous rain periods and gaps from forecast data.
 *
 * Core responsibilities:
 * - Detect continuous rain periods where probability ≥40%
 * - Group consecutive forecast periods into rain windows
 * - Calculate accurate start and end times for each rain window
 * - Format time ranges in user-friendly 12-hour AM/PM format
 * - Handle edge cases (single periods, midnight crossing, boundaries)
 *
 * This module contains pure functions with no side effects or external dependencies.
 * All calculations are stateless and deterministic.
 */

import type { ParsedForecast } from '@/types/weather';

/**
 * Represents a continuous period of rain (probability ≥40%)
 *
 * A rain window is created by grouping consecutive forecast periods
 * where the rain probability meets or exceeds the 40% threshold.
 *
 * Gaps (periods <40%) separate distinct rain windows.
 */
export interface RainWindow {
  /** Start time of the rain window (first period in the window) */
  start: Date;
  /** End time of the rain window (last period + 3 hours) */
  end: Date;
}

/**
 * Represents a safe period between rain windows or after the last rain
 *
 * Safe windows identify clear timeframes where users can plan outdoor activities.
 * Only gaps ≥1 hour duration are considered meaningful safe windows.
 *
 * Safe windows are calculated from:
 * 1. Gaps between consecutive rain windows (end of rain N → start of rain N+1)
 * 2. Clear period after last rain window until forecast end (if ≥1 hour)
 */
export interface SafeWindow {
  /** Start time of the safe window (end of previous rain or start of forecast) */
  start: Date;
  /** End time of the safe window (start of next rain or forecast end) */
  end: Date;
}

/**
 * Detects continuous rain windows from forecast data
 *
 * Applies a 40% probability threshold to identify rain periods.
 * Consecutive forecast periods with probability ≥40% are grouped
 * into a single rain window. Gaps (periods <40%) separate distinct windows.
 *
 * Algorithm:
 * 1. Iterate through forecast periods in chronological order
 * 2. When probability ≥40%, start or continue current rain window
 * 3. When probability <40%, close current window (if any) and start gap
 * 4. Calculate end time as: last period's start time + 3 hours (OpenWeather interval)
 * 5. Return all detected windows in chronological order
 *
 * Edge cases handled:
 * - Empty forecast array → returns empty array
 * - Single period ≥40% → creates window spanning 3 hours
 * - Rain at hour 0 or hour 24 → handled correctly
 * - Multiple separate rain periods → creates distinct windows
 * - No rain (all <40%) → returns empty array
 *
 * @param forecast - Array of parsed forecast data (typically 8 periods for 24 hours)
 * @returns Array of rain windows in chronological order
 */
export function detectRainWindows(forecast: ParsedForecast[]): RainWindow[] {
  // Handle empty forecast
  if (!Array.isArray(forecast) || forecast.length === 0) {
    return [];
  }

  const windows: RainWindow[] = [];
  let currentWindowStart: Date | null = null;
  let currentWindowLastPeriod: ParsedForecast | null = null;

  // Iterate through forecast periods in chronological order
  for (const period of forecast) {
    const isRainPeriod = period.probability >= 40;

    if (isRainPeriod) {
      // Start new window or continue existing window
      if (currentWindowStart === null) {
        // Start new rain window
        currentWindowStart = period.time;
        currentWindowLastPeriod = period;
      } else {
        // Continue existing window - update last period
        currentWindowLastPeriod = period;
      }
    } else {
      // Gap detected (probability <40%)
      if (currentWindowStart !== null && currentWindowLastPeriod !== null) {
        // Close current window and add to results
        const endTime = new Date(
          currentWindowLastPeriod.time.getTime() + 3 * 60 * 60 * 1000
        );
        windows.push({
          start: currentWindowStart,
          end: endTime,
        });

        // Reset for next window
        currentWindowStart = null;
        currentWindowLastPeriod = null;
      }
    }
  }

  // Close final window if forecast ends during rain period
  if (currentWindowStart !== null && currentWindowLastPeriod !== null) {
    const endTime = new Date(
      currentWindowLastPeriod.time.getTime() + 3 * 60 * 60 * 1000
    );
    windows.push({
      start: currentWindowStart,
      end: endTime,
    });
  }

  return windows;
}

/**
 * Formats a time range in user-friendly 12-hour AM/PM format
 *
 * Uses native Intl.DateTimeFormat for zero bundle size impact.
 * No external date libraries (Day.js, date-fns, etc.) required.
 *
 * Format: "2:00 PM - 5:00 PM"
 *
 * Examples:
 * - Morning: "9:00 AM - 12:00 PM"
 * - Afternoon: "2:00 PM - 5:00 PM"
 * - Evening: "8:00 PM - 11:00 PM"
 * - Midnight crossing: "11:00 PM - 2:00 AM"
 *
 * @param start - Start time of the rain window
 * @param end - End time of the rain window
 * @returns Formatted time range string
 */
export function formatTimeRange(start: Date, end: Date): string {
  // Native Intl.DateTimeFormat with 12-hour format and AM/PM
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const startFormatted = formatter.format(start);
  const endFormatted = formatter.format(end);

  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Calculates safe windows (clear periods) between rain windows
 *
 * Identifies gaps between rain periods where users can safely plan outdoor activities.
 * Only includes safe windows with duration ≥1 hour (60 minutes) to ensure meaningful
 * timeframes for activity planning.
 *
 * Algorithm:
 * 1. Iterate through consecutive rain windows
 * 2. Calculate gap duration: end of rain N → start of rain N+1
 * 3. If gap ≥1 hour, create safe window
 * 4. Calculate "after rain" safe window: end of last rain → forecast end
 * 5. Apply 1-hour minimum filter to "after rain" window
 * 6. Return all safe windows in chronological order
 *
 * Edge cases handled:
 * - Empty rain windows array → returns empty array
 * - Single rain window → only checks "after rain" safe window
 * - Gaps <1 hour → filtered out (not included in results)
 * - Last rain window ends <1 hour before forecast end → no "after rain" safe window
 * - Rain windows spanning most of 24 hours → minimal or no safe windows
 *
 * Minimum duration rationale:
 * Very short gaps (e.g., 15-30 minutes) aren't meaningful for planning outdoor activities.
 * Users need sufficient time to prepare, travel, and complete activities.
 *
 * @param rainWindows - Array of rain windows from detectRainWindows()
 * @param forecastEndTime - End time of the forecast period (typically current time + 24 hours)
 * @returns Array of safe windows in chronological order (≥1 hour duration only)
 */
export function calculateSafeWindows(
  rainWindows: RainWindow[],
  forecastEndTime: Date
): SafeWindow[] {
  // Handle empty rain windows array (no rain detected)
  if (!Array.isArray(rainWindows) || rainWindows.length === 0) {
    return [];
  }

  const safeWindows: SafeWindow[] = [];
  const MINIMUM_DURATION_MS = 60 * 60 * 1000; // 1 hour in milliseconds

  // Calculate gaps between consecutive rain windows
  for (let i = 0; i < rainWindows.length - 1; i++) {
    const currentRain = rainWindows[i];
    const nextRain = rainWindows[i + 1];

    // Gap starts when current rain ends, ends when next rain starts
    const gapStart = currentRain.end;
    const gapEnd = nextRain.start;
    const gapDuration = gapEnd.getTime() - gapStart.getTime();

    // Only include gaps ≥1 hour
    if (gapDuration >= MINIMUM_DURATION_MS) {
      safeWindows.push({
        start: gapStart,
        end: gapEnd,
      });
    }
  }

  // Calculate "after rain" safe window (clear period after last rain)
  const lastRain = rainWindows[rainWindows.length - 1];
  const afterRainDuration = forecastEndTime.getTime() - lastRain.end.getTime();

  // Only include "after rain" safe window if ≥1 hour
  if (afterRainDuration >= MINIMUM_DURATION_MS) {
    safeWindows.push({
      start: lastRain.end,
      end: forecastEndTime,
    });
  }

  return safeWindows;
}
