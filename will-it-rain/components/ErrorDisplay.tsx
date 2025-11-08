/**
 * ErrorDisplay Component
 *
 * Displays user-friendly error messages when something goes wrong during the forecast check.
 * Handles all error types from the API and provides helpful guidance to users.
 *
 * Features:
 * - User-friendly error messages (no technical jargon)
 * - Location suggestions for invalid_location errors
 * - Glassmorphic styling consistent with other components
 * - Accessibility features (aria-live, role="alert")
 * - Responsive design across all device sizes
 * - Input field remains accessible for retry
 *
 * Error Types Handled:
 * - invalid_location: Location not found (shows suggestions if available)
 * - service_unavailable: Backend API failure
 * - timeout: Request took too long
 * - network_error: Network connectivity issue
 * - Unknown errors: Fallback message
 *
 * Accessibility:
 * - role="alert" for semantic error indication
 * - aria-live="assertive" for immediate screen reader announcement
 * - Semantic HTML structure
 * - High contrast error styling
 *
 * Usage:
 * ```tsx
 * {errorData && <ErrorDisplay error={errorData} />}
 * ```
 *
 * @param error - Error response from API containing error code, message, and optional suggestions
 * @returns JSX.Element - Error display component with user guidance
 */

import type { ErrorResponse } from '@/types/api'

interface ErrorDisplayProps {
  error: ErrorResponse
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    invalid_location: "Location not found.",
    service_unavailable: "Unable to get forecast right now. Please try again in a few moments.",
    timeout: "Request timed out. Please check your connection and try again.",
    network_error: "Network connection failed. Please check your internet and try again.",
  }

  // Get user-friendly message (fallback for unknown errors)
  const message = errorMessages[error.error] || "Something went wrong. Please try again."

  // Check if suggestions are available for invalid_location errors
  const hasSuggestions = error.error === 'invalid_location' &&
                        error.suggestions &&
                        error.suggestions.length > 0

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="mt-6 backdrop-blur-md bg-red-50/90 border border-red-200 rounded-lg p-6"
    >
      <div className="flex items-start gap-3">
        {/* Error Icon */}
        <span className="text-2xl flex-shrink-0" aria-hidden="true">⚠️</span>

        {/* Error Content */}
        <div className="flex-1">
          {/* Error Message */}
          <p className="font-medium text-red-900">
            {message}
          </p>

          {/* Location Suggestions (only for invalid_location errors) */}
          {hasSuggestions && (
            <div className="mt-3">
              <p className="text-sm text-red-800 font-medium mb-2">
                Did you mean one of these?
              </p>
              <ul className="space-y-1">
                {error.suggestions!.map((suggestion, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-red-700"
                  >
                    • {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Helper Text */}
          <p className="text-sm text-red-700 mt-3">
            You can try searching again with a different location.
          </p>
        </div>
      </div>
    </div>
  )
}
