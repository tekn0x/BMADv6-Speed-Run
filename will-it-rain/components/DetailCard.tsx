/**
 * DetailCard Component
 *
 * Reusable presentational component for displaying structured rain data.
 * Uses glassmorphic styling consistent with the UX design specification.
 *
 * Features:
 * - Supports three data types: rain-windows, safe-windows, peak-details
 * - Glassmorphic card styling with backdrop-blur effect
 * - Responsive layout using Tailwind CSS
 * - Based on Shadcn UI Card component
 * - Type-safe props with TypeScript union types
 *
 * Supported Types:
 * - rain-windows: Displays list of rain periods with start/end times
 * - safe-windows: Displays list of safe periods between rain
 * - peak-details: Displays peak rain time, intensity, and amount
 *
 * Accessibility:
 * - Semantic HTML structure (ul for lists, structured data for peak)
 * - Clear headings for each card section
 * - High contrast text for readability
 *
 * Usage:
 * ```tsx
 * <DetailCard title="Rain Windows" data={rainWindows} type="rain-windows" />
 * <DetailCard title="Peak Rain" data={{ peakTime, intensity, amount }} type="peak-details" />
 * <DetailCard title="Safe Windows" data={safeWindows} type="safe-windows" />
 * ```
 *
 * @param title - Card heading text
 * @param data - Union type: RainWindow[] | SafeWindow[] | PeakDetails object
 * @param type - Determines rendering logic: 'rain-windows' | 'safe-windows' | 'peak-details'
 * @returns JSX.Element - Glassmorphic card with structured data display
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { RainWindow, SafeWindow } from '@/types/api'

/**
 * Peak rain details structure
 */
type PeakDetails = {
  peakTime: string
  intensity: string
  amount: string
}

/**
 * DetailCard component props
 */
interface DetailCardProps {
  title: string
  data: RainWindow[] | SafeWindow[] | PeakDetails
  type: 'rain-windows' | 'safe-windows' | 'peak-details'
}

export function DetailCard({ title, data, type }: DetailCardProps) {
  return (
    <Card className="backdrop-blur-md bg-white/10 border border-white/20">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Rain windows display */}
        {type === 'rain-windows' && Array.isArray(data) && (
          <ul className="space-y-2">
            {data.map((window, index) => (
              <li key={index} className="text-sm">
                {window.start} - {window.end}
              </li>
            ))}
          </ul>
        )}

        {/* Safe windows display */}
        {type === 'safe-windows' && Array.isArray(data) && (
          <ul className="space-y-2">
            {data.map((window, index) => (
              <li key={index} className="text-sm">
                {window.start} - {window.end}
              </li>
            ))}
          </ul>
        )}

        {/* Peak details display */}
        {type === 'peak-details' && !Array.isArray(data) && (
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Time:</span> {data.peakTime}
            </p>
            <p>
              <span className="font-medium">Intensity:</span> {data.intensity}
            </p>
            <p>
              <span className="font-medium">Amount:</span> {data.amount}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
