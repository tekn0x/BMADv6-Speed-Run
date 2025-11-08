"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'

/**
 * Home Page Component - Landing Page for "Will It Rain?" Application
 *
 * Displays the main landing page with value proposition, location input field,
 * and footer with privacy statement and attribution.
 *
 * Features:
 * - Clear H1 heading and subheading explaining the app's purpose
 * - Prominently positioned location input field (placeholder only in this story)
 * - Privacy statement and OpenWeather attribution in footer
 * - Mobile-first responsive design using Tailwind CSS breakpoints
 * - Semantic HTML structure for accessibility (header, main, footer)
 * - Keyboard accessible with proper focus management
 *
 * State Management:
 * - location: User's input for city or zipcode (currently placeholder only)
 *
 * @returns JSX.Element - The landing page component
 */
export default function HomePage() {
  // State hook for location input (prepared for Story 3.2)
  const [location, setLocation] = useState<string>('')

  // Note: Additional state hooks (isLoading, answerData, errorData) will be added in:
  // - Story 3.3: Loading state
  // - Story 3.4/3.5: Answer data display
  // - Story 3.7: Error handling display

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

      {/* Main Content - Location Input */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 sm:py-12">
        <div className="space-y-6">
          <Input
            type="text"
            placeholder="Enter zipcode or city"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="text-center text-lg h-12 sm:h-14"
            aria-label="Location input - Enter your zipcode or city name"
            autoComplete="off"
          />
          {/* Note: Search button and submission logic will be added in Story 3.2 */}
        </div>
      </main>

      {/* Footer - Privacy and Attribution */}
      <footer className="text-center py-8 px-4 text-sm text-muted-foreground space-y-2">
        <p>We don&apos;t store your location or search history</p>
        <p>Weather data provided by OpenWeather</p>
      </footer>
    </div>
  )
}
