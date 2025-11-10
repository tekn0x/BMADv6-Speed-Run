/**
 * CloseCallBadge Component
 *
 * Displays a message when rain probability is in the 40-49% range,
 * indicating uncertainty and suggesting the user bring an umbrella just in case.
 *
 * Features:
 * - Conditional visibility based on show prop
 * - Glassmorphic styling consistent with DetailCard components
 * - Clear messaging for "close call" scenarios
 * - Responsive design across all device sizes
 * - Accessible semantic HTML structure
 *
 * Accessibility:
 * - Uses semantic paragraph tag for screen readers
 * - Clear, user-friendly message text
 * - High contrast for readability
 *
 * Usage:
 * ```tsx
 * {closeCall && <CloseCallBadge show={true} />}
 * <CloseCallBadge show={response.closeCall} />
 * ```
 *
 * @param show - Whether to display the badge (typically based on closeCall flag)
 * @returns JSX.Element | null - Close call badge or null if show is false
 */

interface CloseCallBadgeProps {
  show: boolean
}

export function CloseCallBadge({ show }: CloseCallBadgeProps) {
  if (!show) {
    return null
  }

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-center">
      <p className="text-sm text-foreground">
        It&apos;s a close call - consider bringing an umbrella just in case
      </p>
    </div>
  )
}
