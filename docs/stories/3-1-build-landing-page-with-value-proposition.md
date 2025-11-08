# Story 3.1: Build Landing Page with Value Proposition

Status: drafted

## Story

As a user,
I want to immediately understand what this tool does when I arrive,
So that I can start using it without confusion.

## Acceptance Criteria

1. **Given** a user visits the app for the first time
   **When** the landing page loads
   **Then** the H1 heading displays "Will It Rain?"
   **And** a clear subheading explains: "Get a simple yes or no answer for the next 24 hours"
   **And** the location input field is prominently visible and accessible
   **And** the page uses clean, minimal design with Shadcn UI components
   **And** a footer includes privacy statement and OpenWeather attribution
   **And** the page is fully responsive (mobile, tablet, desktop)

## Tasks / Subtasks

- [ ] Task 1: Create main page component structure (AC: 1)
  - [ ] Create `/app/page.tsx` as client component with `"use client"` directive
  - [ ] Add semantic HTML structure: `<header>`, `<main>`, `<footer>` elements
  - [ ] Import necessary Shadcn UI components (Button, Input, Card)
  - [ ] Set up React state hooks for location input, loading, answer data, error states

- [ ] Task 2: Implement landing page header and value proposition (AC: 1)
  - [ ] Add H1 heading with text "Will It Rain?"
  - [ ] Style H1 with large, prominent typography using Tailwind CSS
  - [ ] Add subheading with text "Get a simple yes or no answer for the next 24 hours"
  - [ ] Use Shadcn UI typography patterns for consistent styling
  - [ ] Center content with generous white space (mobile-first approach)

- [ ] Task 3: Add location input field placeholder (AC: 1)
  - [ ] Import Shadcn UI Input component
  - [ ] Create controlled input with placeholder "Enter zipcode or city"
  - [ ] Position input prominently below value proposition
  - [ ] Add proper ARIA labels for accessibility
  - [ ] Add focus management for keyboard users
  - [ ] Note: Full validation and submission logic deferred to Story 3.2

- [ ] Task 4: Create footer with privacy statement and attribution (AC: 1)
  - [ ] Add footer element at bottom of page
  - [ ] Include privacy statement: "We don't store your location or search history"
  - [ ] Add OpenWeather attribution: "Weather data provided by OpenWeather"
  - [ ] Use subtle typography (smaller font size, muted color)
  - [ ] Ensure footer is visible but doesn't distract from main content

- [ ] Task 5: Implement responsive design (AC: 1)
  - [ ] Use Tailwind CSS mobile-first breakpoints (sm:, md:, lg:)
  - [ ] Test layout on mobile (320px-767px): single-column, centered
  - [ ] Test layout on tablet (768px-1024px): centered with comfortable spacing
  - [ ] Test layout on desktop (1025px+): centered content with max-width constraint
  - [ ] Ensure text is readable without zooming (minimum 16px base font)
  - [ ] Verify no horizontal scrolling at any breakpoint

- [ ] Task 6: Add SEO meta tags and basic PWA metadata (AC: 1)
  - [ ] Update `app/page.tsx` with metadata export (Next.js 15 pattern)
  - [ ] Set page title: "Will It Rain? | Simple 24-Hour Rain Forecast"
  - [ ] Add meta description: "Get a simple yes or no answer about rain in your area for the next 24 hours"
  - [ ] Verify PWA manifest metadata from Story 1.4 is still active
  - [ ] Add Open Graph tags for social sharing (optional enhancement)

- [ ] Task 7: Manual testing and validation (AC: 1)
  - [ ] Test landing page loads without errors (`npm run dev`)
  - [ ] Verify H1 and subheading display correctly
  - [ ] Verify input field is visible and accessible (placeholder text visible)
  - [ ] Verify footer displays privacy statement and attribution
  - [ ] Test responsive design on Chrome DevTools (mobile, tablet, desktop)
  - [ ] Test keyboard accessibility: Tab to input, focus indicators visible
  - [ ] TypeScript compilation passes (`npm run type-check`)
  - [ ] ESLint validation passes (`npm run lint`)
  - [ ] Lighthouse audit: Accessibility > 95

## Dev Notes

### Architecture Patterns and Constraints

**Frontend Architecture (Next.js 15 App Router):**
- **Primary File:** `app/page.tsx` - Implements landing page as React client component
- **State Management:** React `useState` hooks for location input, loading, answer data, error states
- **Styling:** Tailwind CSS v4 with Shadcn UI components (Button, Input, Card)
- **Client Components:** All interactive elements require `"use client"` directive
- **Responsive Design:** Mobile-first with Tailwind breakpoints (sm: 640px, md: 768px, lg: 1024px)
[Source: docs/tech-spec-epic-3.md#System-Architecture-Alignment, docs/tech-spec-epic-3.md#Detailed-Design]

**Shadcn UI Component Dependencies:**
- **Button:** Search submission trigger (used in Story 3.2, import now for future use)
- **Input:** Location text field
- **Card:** Container for answer display (prepared for Story 3.4/3.5)
- **Import Pattern:** `import { Button } from '@/components/ui/button'`
[Source: docs/tech-spec-epic-3.md#Dependencies-and-Integrations]

**Semantic HTML Structure:**
- Use `<header>` for H1 and subheading
- Use `<main>` for location input and answer display area
- Use `<footer>` for privacy statement and attribution
- Proper semantic structure improves accessibility and SEO
[Source: docs/tech-spec-epic-3.md#AC-10-Accessibility-Foundations]

**Mobile-First Responsive Design:**
- Default styles target mobile (320px+)
- Use Tailwind `sm:` (640px), `md:` (768px), `lg:` (1024px) breakpoints
- Center content with `max-w-2xl mx-auto px-4`
- Generous white space for readability
- Minimum 16px base font size (no zooming required)
[Source: docs/tech-spec-epic-3.md#AC-11-Responsive-Design, docs/tech-spec-epic-3.md#Non-Functional-Requirements-Performance]

**SEO and PWA Metadata:**
- Next.js 15 uses `export const metadata` pattern in page.tsx
- PWA manifest already configured in Story 1.4 (manifest.json)
- Add title, description meta tags for search engine optimization
- Open Graph tags optional enhancement for social sharing
[Source: docs/tech-spec-epic-3.md#AC-1-Landing-Page, docs/tech-spec-epic-3.md#System-Architecture-Alignment]

### Project Structure Notes

**Files to Create:**
```
will-it-rain/
└── app/
    └── page.tsx              [CREATE] Landing page component (replaces default Next.js page)
```

**Existing Files Referenced:**
```
will-it-rain/
├── components/
│   └── ui/
│       ├── button.tsx        [EXISTS] Shadcn UI Button component (Epic 1.2)
│       ├── input.tsx         [EXISTS] Shadcn UI Input component (Epic 1.2)
│       └── card.tsx          [EXISTS] Shadcn UI Card component (Epic 1.2)
├── app/
│   └── layout.tsx            [EXISTS] Root layout with Tailwind CSS (Epic 1.2)
├── tailwind.config.ts        [EXISTS] Tailwind CSS v4 configuration (Epic 1.2)
└── public/
    └── manifest.json         [EXISTS] PWA manifest (Epic 1.4)
```

**Expected Page Structure:**
```tsx
// app/page.tsx structure (reference only)

"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const [location, setLocation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [answerData, setAnswerData] = useState(null)
  const [errorData, setErrorData] = useState(null)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="text-center pt-12 px-4">
        <h1 className="text-4xl md:text-6xl font-bold">Will It Rain?</h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-4">
          Get a simple yes or no answer for the next 24 hours
        </p>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Location input placeholder (Story 3.2 will add submission logic) */}
        <Input
          type="text"
          placeholder="Enter zipcode or city"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="text-center text-lg"
        />
      </main>

      <footer className="text-center py-8 px-4 text-sm text-muted-foreground">
        <p>We don't store your location or search history</p>
        <p className="mt-2">Weather data provided by OpenWeather</p>
      </footer>
    </div>
  )
}
```

### Learnings from Previous Story (2-8-implement-comprehensive-error-handling)

**From Story 2.8 (Status: done)**

**Epic 2 Backend Complete:**
- All backend API routes and logic completed (Stories 2.1-2.8)
- `/api/check-rain` endpoint fully implemented and tested
- Error handling, retry logic, analytics logging all in place
- TypeScript types defined in `types/api.ts`, `types/weather.ts`, `types/analytics.ts`
- Epic 3 can integrate with backend without any backend changes required

**Code Quality Standards:**
- Comprehensive JSDoc comments explaining purpose and behavior of all functions
- TypeScript strict mode with no `any` types
- Clear error handling with try/catch blocks
- Senior-developer-ready code quality maintained
- Follow patterns established in Stories 2.1-2.7

**Testing Approach (Epic 2 Standard):**
- Manual testing via curl to API endpoints or browser interaction
- No automated unit tests (deferred to Epic 5 per tech spec)
- TypeScript compilation validation (`npm run type-check`)
- ESLint validation (`npm run lint`)
- Verify behavior by checking logs and UI

**TypeScript Type Definitions Available for Reuse:**
- `ErrorCode` type: 'timeout' | 'invalid_location' | 'service_unavailable' | 'network_error' | 'unknown_error'
- `ErrorResponse` interface: `{ error: { code: ErrorCode, message: string } }`
- `RainCheckResponse` interface: `{ willRain: boolean, probability: number, rainWindows?: [...], peakTime?: string, ... }`
- Located in: `types/api.ts`
- Epic 3 should import and reuse these types for API integration

**Critical Implementation Notes for Story 3.1:**
- DO use Shadcn UI components for consistent, accessible design
- DO implement mobile-first responsive design with Tailwind CSS
- DO add semantic HTML (header, main, footer) for accessibility
- DO use TypeScript strict mode (no `any` types)
- DO follow JSDoc documentation patterns from Epic 2
- DO test keyboard accessibility and focus management
- DO verify Lighthouse Accessibility score > 95
- DO NOT implement API integration yet (deferred to Story 3.2, 3.9)
- DO NOT add state management for answers yet (deferred to Story 3.4, 3.5)

**Architectural Patterns to Apply:**
- Module separation: Create client component in `app/page.tsx`
- Import organization: Import Shadcn UI components at top of file
- TypeScript strict mode: Enable strict type checking
- Responsive design: Use Tailwind mobile-first breakpoints
- Accessibility: Add ARIA labels, semantic HTML, keyboard navigation

[Source: docs/stories/2-8-implement-comprehensive-error-handling.md#Dev-Agent-Record, #Completion-Notes, #File-List]

### Testing Standards Summary

**Verification Approach (Epic 3 Standard):**
- Manual browser testing on `http://localhost:3000`
- No automated unit tests (deferred to Epic 5 per tech spec)
- TypeScript compilation validation (`npm run type-check`)
- ESLint validation (`npm run lint`)
- Lighthouse audit for accessibility and performance
- Cross-browser testing (Chrome primary, defer Safari/Firefox to Epic 4.7)
[Source: docs/tech-spec-epic-3.md#Test-Strategy-Summary]

**Test Coverage Requirements for Story 3.1:**
1. **Landing Page Load**: Browser to `http://localhost:3000` → Verify page loads without errors
2. **H1 and Subheading**: Verify "Will It Rain?" H1 and subheading text display correctly
3. **Input Field Visibility**: Verify input with placeholder "Enter zipcode or city" is visible
4. **Footer Content**: Verify privacy statement and OpenWeather attribution display
5. **Responsive Design**: Test on Chrome DevTools (320px, 768px, 1024px breakpoints)
6. **Keyboard Accessibility**: Tab to input field, verify focus indicator visible
7. **TypeScript/ESLint**: Both validations pass with zero errors
8. **Lighthouse Audit**: Accessibility score > 95, Performance score > 90

**Manual Testing Approach:**
```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
# Verify:
# - H1 "Will It Rain?" displays prominently
# - Subheading "Get a simple yes or no answer for the next 24 hours" visible
# - Input field with placeholder "Enter zipcode or city" visible
# - Footer displays privacy statement and OpenWeather attribution
# - Page loads without console errors

# Test responsive design (Chrome DevTools)
# Mobile (320px): Verify single-column layout, readable text
# Tablet (768px): Verify centered layout, comfortable spacing
# Desktop (1024px+): Verify max-width constraint, centered content

# Test keyboard accessibility
# Press Tab key → Focus moves to input field
# Verify focus indicator (ring) visible

# Run TypeScript type checking
npm run type-check

# Run ESLint validation
npm run lint

# Run Lighthouse audit (Chrome DevTools)
# Verify Accessibility score > 95
# Verify Performance score > 90
```

### References

**Epic 3 Technical Specification:**
- System Architecture Alignment: [docs/tech-spec-epic-3.md#System-Architecture-Alignment]
- Detailed Design: [docs/tech-spec-epic-3.md#Detailed-Design]
- AC-1 Landing Page: [docs/tech-spec-epic-3.md#AC-1-Landing-Page-Displays-Correctly]
- AC-10 Accessibility Foundations: [docs/tech-spec-epic-3.md#AC-10-Accessibility-Foundations]
- AC-11 Responsive Design: [docs/tech-spec-epic-3.md#AC-11-Responsive-Design]
- Dependencies and Integrations: [docs/tech-spec-epic-3.md#Dependencies-and-Integrations]
- Test Strategy Summary: [docs/tech-spec-epic-3.md#Test-Strategy-Summary]

**Epics Document:**
- Story 3.1 Acceptance Criteria: [docs/epics.md#Story-3.1-Build-Landing-Page-with-Value-Proposition]
- Epic 3 Overview: [docs/epics.md#Epic-3-Simple-Answer-Experience]

**Architecture Document:**
- ADR-001: Next.js App Router usage
- ADR-002: Stateless architecture (no localStorage)
- ADR-006: Shadcn UI for accessible components
- Responsive design principles
- Accessibility best practices

**Related Stories:**
- Story 1.2: Configure Tailwind CSS v4 and Shadcn UI - Provides styling foundation
- Story 1.4: Configure Basic PWA Manifest and Metadata - Provides PWA metadata
- Story 3.2: Create Location Input Field with Validation - Next story (adds submission logic)
- Story 3.4: Build YES Answer Display - Uses Card components prepared in this story
- Story 3.5: Build NO Answer Display - Uses Card components prepared in this story

**External References:**
- Next.js 15 App Router: https://nextjs.org/docs/app
- Next.js Metadata API: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
- Shadcn UI Components: https://ui.shadcn.com/docs/components
- Tailwind CSS v4: https://tailwindcss.com/docs
- React useState Hook: https://react.dev/reference/react/useState
- ARIA Labels Best Practices: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- **2025-11-07**: Story drafted - Created comprehensive story for landing page with value proposition. Defined H1, subheading, input field, footer, responsive design, and accessibility requirements. Story marked as drafted and ready for context generation.
