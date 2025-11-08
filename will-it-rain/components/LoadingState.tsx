/**
 * LoadingState Component
 *
 * Displays a loading indicator with accessibility support for screen readers.
 * Used to provide user feedback while API requests are in progress.
 *
 * Features:
 * - Animated spinner using Tailwind CSS
 * - Customizable loading message
 * - ARIA live region for screen reader announcements
 * - Responsive design (mobile, tablet, desktop)
 * - Centered layout with appropriate spacing
 * - Non-interruptive announcements (aria-live="polite")
 *
 * Accessibility:
 * - role="status" identifies this as a status message
 * - aria-live="polite" announces loading state without interrupting user
 * - aria-label provides context for screen readers
 * - Screen reader announces message when component appears
 *
 * Usage:
 * ```tsx
 * {isLoading && <LoadingState />}
 * {isLoading && <LoadingState message="Fetching data..." />}
 * ```
 *
 * @param message - Optional custom loading message (default: "Checking forecast...")
 * @returns JSX.Element - Loading indicator with spinner and text
 */

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Checking forecast...' }: LoadingStateProps) {
  return (
    <div
      className="flex items-center justify-center gap-2 mt-4"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {/* Animated spinner using Tailwind CSS */}
      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
