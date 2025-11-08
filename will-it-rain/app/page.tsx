"use client"

import { useState, useRef, type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/LoadingState'
import { AnswerDisplay } from '@/components/AnswerDisplay'
import type { RainCheckResponse } from '@/types/api'

/**
 * Home Page Component - Landing Page for "Will It Rain?" Application
 *
 * Displays the main landing page with value proposition, location input field,
 * form submission, and footer with privacy statement and attribution.
 *
 * Features:
 * - Clear H1 heading and subheading explaining the app's purpose
 * - Location input field with validation and form submission
 * - Search button for triggering forecast check
 * - Loading state management during API calls
 * - Client-side validation for empty input
 * - Focus management for accessibility (returns focus after API response)
 * - Privacy statement and OpenWeather attribution in footer
 * - Mobile-first responsive design using Tailwind CSS breakpoints
 * - Semantic HTML structure for accessibility (header, main, footer)
 * - Full keyboard accessibility (Tab navigation, Enter to submit)
 *
 * State Management:
 * - location: User's input for city or zipcode
 * - isLoading: Tracks API call in progress (disables input/button)
 * - validationError: Stores validation error message for empty input
 * - answerData: Will store API success response (display in Stories 3.4/3.5)
 * - errorData: Will store API error response (display in Story 3.7)
 *
 * Form Flow:
 * 1. User enters location and submits form (button click or Enter key)
 * 2. Validate input is not empty (show error if empty)
 * 3. Set loading state (disable input and button)
 * 4. Call API with location
 * 5. Handle response (success or error)
 * 6. Clear loading state
 * 7. Return focus to input for easy re-search
 *
 * @returns JSX.Element - The landing page component
 */
export default function HomePage() {
  // State hooks for form management
  const [location, setLocation] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [validationError, setValidationError] = useState<string>('')

  // State hooks for API response
  const [answerData, setAnswerData] = useState<RainCheckResponse | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errorData, setErrorData] = useState<unknown>(null)

  // Ref for programmatic focus management
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * Handle form submission
   *
   * Validates input, calls API, and manages loading state.
   * Returns focus to input after response for easy re-search.
   *
   * @param e - Form event
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Client-side validation: Check for empty input
    if (!location.trim()) {
      setValidationError('Please enter a location')
      return
    }

    // Clear validation error, previous results, and set loading state
    setValidationError('')
    setAnswerData(null)
    setErrorData(null)
    setIsLoading(true)

    try {
      // Call backend API
      const response = await fetch('/api/check-rain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: location.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success response
        setAnswerData(data)
        setErrorData(null)
      } else {
        // Error response from API
        setErrorData(data)
        setAnswerData(null)
      }
    } catch {
      // Network error - catch block required but error details not used
      setErrorData({
        error: 'network_error',
        message: 'Network connection failed. Please check your internet and try again.',
      })
      setAnswerData(null)
    } finally {
      // Always clear loading state and return focus
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header Section - Value Proposition */}
      <header className="text-center pt-12 px-4 sm:pt-16 md:pt-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
          Will It Rain?
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mt-4 max-w-2xl mx-auto">
          Get a simple yes or no answer for the next 24 hours
        </p>
      </header>

      {/* Main Content - Location Input and Form */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 sm:py-12">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter zipcode or city"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value)
              // Clear validation error when user starts typing
              if (validationError) {
                setValidationError('')
              }
            }}
            disabled={isLoading}
            className="text-center text-lg h-12 sm:h-14"
            aria-label="Location input - Enter your zipcode or city name"
            autoComplete="off"
          />

          {/* Validation Error Display */}
          {validationError && (
            <p className="text-sm text-destructive text-center" role="alert">
              {validationError}
            </p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 sm:h-14 text-base sm:text-lg"
          >
            {isLoading ? 'Checking...' : 'Check Forecast'}
          </Button>
        </form>

        {/* Loading State - Shows while API request is in progress */}
        {isLoading && <LoadingState />}

        {/* Answer Display - Shows API response with rain details */}
        {answerData && (
          <AnswerDisplay response={answerData} searchedLocation={location} />
        )}

        {/* Note: Error display will be added in Story 3.7 */}
      </main>

      {/* Footer - Privacy and Attribution */}
      <footer className="text-center py-8 px-4 text-sm text-muted-foreground space-y-2">
        <p>We don&apos;t store your location or search history</p>
        <p>Weather data provided by OpenWeather</p>
      </footer>
    </div>
  )
}
