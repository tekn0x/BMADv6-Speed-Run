"use client"

/**
 * AnswerDisplay Component
 *
 * Displays the YES or NO answer to "Will it rain?" with relevant details.
 * Story 3.4 implements YES answer display with rain details.
 * Story 3.5 will extend this component for NO answer display.
 *
 * Features:
 * - Displays location tag with glassmorphic styling
 * - Shows "YES, it will rain" or "NO, it won't rain" prominently
 * - Displays probability percentage
 * - For YES answers: rain windows, peak details, safe windows
 * - Close call badge for 40-49% probability
 * - Responsive design across all device sizes
 * - Glassmorphic styling consistent with UX design spec
 *
 * YES Answer Display:
 * - Location tag: "📍 San Francisco, CA" with glassmorphic styling
 * - Main answer: "YES, it will rain" in large text
 * - Probability: "65% chance"
 * - Rain windows: DetailCard showing all rain periods
 * - Peak details: DetailCard showing time, intensity, amount
 * - Safe windows: DetailCard (only if multiple rain periods exist)
 * - Close call badge: Appears if probability is 40-49%
 *
 * Accessibility:
 * - Semantic HTML structure with clear hierarchy
 * - High contrast text for readability
 * - Responsive spacing for mobile/tablet/desktop
 * - Screen reader friendly component structure
 *
 * Usage:
 * ```tsx
 * {answerData && (
 *   <AnswerDisplay
 *     response={answerData}
 *     searchedLocation={location}
 *   />
 * )}
 * ```
 *
 * @param response - API response with willRain, probability, rain details
 * @param searchedLocation - User-entered location string for display
 * @returns JSX.Element - Formatted answer display with rain details
 */

import { DetailCard } from '@/components/DetailCard'
import { CloseCallBadge } from '@/components/CloseCallBadge'
import type { RainCheckResponse } from '@/types/api'

interface AnswerDisplayProps {
  response: RainCheckResponse
  searchedLocation: string
}

export function AnswerDisplay({ response, searchedLocation }: AnswerDisplayProps) {
  const {
    willRain,
    probability,
    rainWindows,
    peakTime,
    intensity,
    amount,
    safeWindows,
    closeCall,
  } = response

  // YES answer rendering
  if (willRain) {
    return (
      <div className="space-y-4 sm:space-y-5 md:space-y-6 mt-8">
        {/* Location tag with glassmorphic styling */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-4 py-2 sm:py-2.5 text-center max-w-full">
          <p className="text-base sm:text-sm md:text-base truncate">📍 {searchedLocation}</p>
        </div>

        {/* Main answer */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-foreground px-2">
          YES, it will rain
        </h2>
        <p className="text-center text-xl sm:text-2xl md:text-3xl text-muted-foreground">
          {probability}% chance
        </p>

        {/* Rain windows */}
        {rainWindows && rainWindows.length > 0 && (
          <DetailCard title="Rain Windows" data={rainWindows} type="rain-windows" />
        )}

        {/* Peak details */}
        {peakTime && intensity && amount && (
          <DetailCard
            title="Peak Rain"
            data={{ peakTime, intensity, amount }}
            type="peak-details"
          />
        )}

        {/* Safe windows (only if present) */}
        {safeWindows && safeWindows.length > 0 && (
          <DetailCard title="Safe Windows" data={safeWindows} type="safe-windows" />
        )}

        {/* Close call badge */}
        {closeCall && <CloseCallBadge show={true} />}
      </div>
    )
  }

  // NO answer rendering (Story 3.5)
  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 mt-8">
      {/* Location tag with glassmorphic styling */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-4 py-2 sm:py-2.5 text-center max-w-full">
        <p className="text-base sm:text-sm md:text-base truncate">📍 {searchedLocation}</p>
      </div>

      {/* Main answer */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-foreground px-2">
        NO, it won&apos;t rain
      </h2>
      <p className="text-center text-xl sm:text-2xl md:text-3xl text-muted-foreground">
        {probability}% chance
      </p>

      {/* Close call badge (only if 40-49% probability) */}
      {closeCall && <CloseCallBadge show={true} />}
    </div>
  )
}
