# Epic Technical Specification: Simple Answer Experience

Date: 2025-11-07
Author: BMad
Epic ID: 3
Status: Draft

---

## Overview

Epic 3 delivers the complete user-facing experience for Will It Rain, transforming backend intelligence into radical simplicity. This epic implements the landing page, location search, YES/NO answer displays, error handling, and seamless frontend-backend integration. The goal is zero learning curve: users arrive, type a location, and receive an immediate, trustworthy answer to "Will it rain in the next 24 hours?"

This epic represents the product vision made tangible—where complex weather data becomes a single, confident decision point.

## Objectives and Scope

**In Scope:**
- Landing page with clear value proposition (H1, subheading, prominent search input)
- Location input field with validation (zipcode or city name)
- Loading state with user feedback and screen reader announcements
- YES answer display with rain windows, peak details, and safe periods
- NO answer display with probability and close call messaging
- Close call messaging for 40-49% probability scenarios
- Comprehensive error handling with user-friendly messages and recovery paths
- Search again functionality (stateless, no page reload)
- Complete frontend-backend API integration (`/api/check-rain`)
- Responsive design across mobile, tablet, desktop
- Accessibility foundations (semantic HTML, keyboard navigation, ARIA labels)

**Out of Scope (deferred to Epic 4 & 5):**
- PWA manifest completion and service worker (Epic 4)
- Advanced responsive optimizations and touch interactions (Epic 4)
- Performance tuning and bundle optimization (Epic 5)
- WCAG 2.1 AA full compliance testing (Epic 5)
- Screen reader testing and refinement (Epic 5)

**Success Criteria:**
- User can enter location and receive YES/NO answer in under 2 seconds
- Interface requires zero explanation—first-time users understand immediately
- All error states provide clear guidance and retry capability
- Search again works seamlessly without page reload
- Works correctly across Chrome, Safari, Firefox, Edge

## System Architecture Alignment

**Frontend Architecture (Next.js App Router):**
- **Primary File:** `app/page.tsx` - Implements landing page, search input, answer display, state management
- **Component Architecture:** Modular React components in `/components/` directory
- **State Management:** React `useState` hooks for location input, loading states, answer data, error states
- **Styling:** Tailwind CSS v4 with Shadcn UI components (Button, Input, Card)
- **Client Components:** All interactive elements (`"use client"` directive)

**Backend Integration:**
- **API Endpoint:** POST `/api/check-rain` (implemented in Epic 2)
- **Request:** `{ location: string }`
- **Response:** `{ willRain: boolean, probability: number, rainWindows?: [...], peakTime?: string, intensity?: string, amount?: string, safeWindows?: [...], closeCall: boolean }`
- **Error Handling:** Structured error responses (`{ error: string, message: string, suggestions?: string[] }`)

**Component Dependencies:**
- **Shadcn UI:** Button (search submit), Input (location field), Card (answer display containers)
- **Custom Components:**
  - `LocationInput.tsx` - Location search with validation
  - `AnswerDisplay.tsx` - YES/NO answer rendering
  - `DetailCard.tsx` - Rain windows, peak details, safe periods
  - `ErrorDisplay.tsx` - Friendly error messages
  - `LoadingState.tsx` - Loading indicator with ARIA support
  - `CloseCallBadge.tsx` - 40-49% probability warning
  - `GlassCard.tsx` - Glassmorphic container (if UX design includes this pattern)

**Alignment with Architecture Decisions:**
- Uses Next.js App Router (ADR-001)
- Stateless architecture - no localStorage or session storage (ADR-002)
- Native Fetch API for backend calls (ADR-005)
- Shadcn UI for accessible, customizable components (ADR-006)
- Native Date API for time formatting (ADR-004)

## Detailed Design

### Services and Modules

| Module/Component | Responsibility | Inputs | Outputs | Location |
|------------------|---------------|--------|---------|----------|
| **Landing Page (`page.tsx`)** | Orchestrate complete user experience, manage application state | User interactions, API responses | Rendered UI, state updates | `app/page.tsx` |
| **LocationInput** | Capture and validate location input, trigger search | User keyboard input, search submission | Location string, validation errors | `components/LocationInput.tsx` |
| **LoadingState** | Display loading feedback with accessibility support | Loading boolean flag | Loading indicator, ARIA announcements | `components/LoadingState.tsx` |
| **AnswerDisplay** | Render YES/NO answers with contextual details | API response (`RainCheckResponse`) | Complete answer UI (answer, probability, details) | `components/AnswerDisplay.tsx` |
| **DetailCard** | Display rain windows, peak details, safe periods | Rain windows array, peak data, safe windows | Formatted detail cards | `components/DetailCard.tsx` |
| **CloseCallBadge** | Show close call warning for 40-49% scenarios | Close call boolean flag | Warning message badge | `components/CloseCallBadge.tsx` |
| **ErrorDisplay** | Show user-friendly error messages with recovery | Error response object | Error message, suggestions, retry capability | `components/ErrorDisplay.tsx` |
| **API Client Utility** | Handle fetch requests to backend with error handling | Location string | Promise\<RainCheckResponse \| ErrorResponse\> | `lib/api-client.ts` (or inline in page.tsx) |

**Component Ownership:**
- Frontend Developer: All React components, state management, UI integration
- No backend changes required (Epic 2 API already complete)

### Data Models and Contracts

```typescript
// Request/Response Types (shared between frontend and backend)

// API Request
interface RainCheckRequest {
  location: string; // Zipcode or city name
}

// API Success Response
interface RainCheckResponse {
  willRain: boolean;
  probability: number; // 0-100
  rainWindows?: RainWindow[]; // Only present for YES answers
  peakTime?: string; // e.g., "3:00 PM" - Only for YES
  intensity?: string; // "light" | "moderate" | "heavy" - Only for YES
  amount?: string; // e.g., "0.2 inches" - Only for YES
  safeWindows?: SafeWindow[]; // Only present for YES with multiple rain periods
  closeCall: boolean; // true if probability 40-49%
}

interface RainWindow {
  start: string; // e.g., "2:00 PM"
  end: string;   // e.g., "5:00 PM"
}

interface SafeWindow {
  start: string;
  end: string;
}

// API Error Response
interface ErrorResponse {
  error: 'invalid_location' | 'service_unavailable' | 'timeout' | 'network_error';
  message: string; // User-friendly error message
  suggestions?: string[]; // Only for invalid_location errors
}

// Component Props

interface LocationInputProps {
  onSearch: (location: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

interface AnswerDisplayProps {
  response: RainCheckResponse;
  searchedLocation: string;
}

interface ErrorDisplayProps {
  error: ErrorResponse;
  onRetry: () => void;
}

interface LoadingStateProps {
  message?: string; // Default: "Checking forecast..."
}

interface DetailCardProps {
  title: string;
  data: RainWindow[] | SafeWindow[] | { peakTime: string; intensity: string; amount: string };
  type: 'rain-windows' | 'safe-windows' | 'peak-details';
}

interface CloseCallBadgeProps {
  show: boolean;
}
```

**Data Flow:**
1. User enters location → `LocationInput` validates → emits location string
2. `page.tsx` receives location → sets loading state → calls API
3. API client sends POST to `/api/check-rain` → receives response
4. Response parsed into `RainCheckResponse` or `ErrorResponse`
5. `page.tsx` updates state → renders appropriate component
6. `AnswerDisplay` or `ErrorDisplay` renders based on response type

### APIs and Interfaces

**Backend API (Epic 2 - Already Implemented):**

**Endpoint:** `POST /api/check-rain`

**Request:**
```json
{
  "location": "San Francisco"
}
```

**Success Response (YES - ≥50%):**
```json
{
  "willRain": true,
  "probability": 65,
  "rainWindows": [
    { "start": "2:00 PM", "end": "5:00 PM" },
    { "start": "9:00 PM", "end": "11:00 PM" }
  ],
  "peakTime": "3:00 PM",
  "intensity": "moderate",
  "amount": "0.2 inches",
  "safeWindows": [
    { "start": "5:00 PM", "end": "9:00 PM" },
    { "start": "11:00 PM", "end": "next day" }
  ],
  "closeCall": false
}
```

**Success Response (NO - <50%):**
```json
{
  "willRain": false,
  "probability": 35,
  "closeCall": false
}
```

**Success Response (Close Call - 40-49%):**
```json
{
  "willRain": false,
  "probability": 45,
  "closeCall": true
}
```

**Error Response (Invalid Location):**
```json
{
  "error": "invalid_location",
  "message": "Location not found. Did you mean one of these?",
  "suggestions": ["San Francisco, CA", "San Francisco, TX"]
}
```

**Error Response (API Failure):**
```json
{
  "error": "service_unavailable",
  "message": "Unable to get forecast right now. Please try again in a few moments."
}
```

**Frontend API Client Pattern:**

```typescript
// lib/api-client.ts or inline in page.tsx

async function checkRain(location: string): Promise<RainCheckResponse | ErrorResponse> {
  try {
    const response = await fetch('/api/check-rain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location }),
    });

    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as RainCheckResponse;
  } catch (error) {
    return {
      error: 'network_error',
      message: 'Network connection failed. Please check your internet and try again.',
    };
  }
}
```

**HTTP Status Codes:**
- `200` - Success (YES or NO answer)
- `400` - Invalid request (empty location)
- `404` - Location not found
- `500` - Server error / OpenWeather API failure
- `504` - Timeout (> 5 seconds)

### Workflows and Sequencing

**Primary User Flow (Happy Path - YES Answer):**

```
1. User arrives at landing page
   └─> Page loads with H1, subheading, search input visible

2. User types location in input field
   └─> Client-side validation: non-empty check

3. User presses Enter or clicks Search button
   └─> LocationInput.onSearch() called with location string
   └─> page.tsx sets isLoading = true
   └─> Input disabled, LoadingState shown

4. API call initiated
   └─> POST /api/check-rain with { location }
   └─> Backend processes (Epic 2 logic)

5. API responds with YES answer (probability ≥50%)
   └─> Response: { willRain: true, probability: 65, rainWindows: [...], ... }
   └─> page.tsx sets isLoading = false
   └─> page.tsx sets answerData = response

6. AnswerDisplay renders YES answer
   └─> Large text: "YES, it will rain"
   └─> Location tag: "📍 San Francisco, CA"
   └─> Probability: "65% chance"
   └─> DetailCard (rain-windows): Rain periods with start/end times
   └─> DetailCard (peak-details): Peak time, intensity, amount
   └─> DetailCard (safe-windows): Clear periods between rain (if multiple periods)
   └─> CloseCallBadge: Hidden (not 40-49%)

7. User can search again
   └─> Input remains visible and enabled
   └─> User enters new location → flow repeats from step 2
```

**Alternative Flow (NO Answer):**

```
Steps 1-4: Same as above

5. API responds with NO answer (probability <50%)
   └─> Response: { willRain: false, probability: 35, closeCall: false }
   └─> page.tsx sets isLoading = false
   └─> page.tsx sets answerData = response

6. AnswerDisplay renders NO answer
   └─> Large text: "NO, it won't rain"
   └─> Location tag: "📍 San Francisco, CA"
   └─> Probability: "35% chance"
   └─> No additional details (maintains simplicity)
   └─> CloseCallBadge: Hidden (not 40-49%)
```

**Alternative Flow (Close Call - 40-49%):**

```
Steps 1-4: Same as above

5. API responds with close call answer (40-49%)
   └─> Response: { willRain: false, probability: 45, closeCall: true }

6. AnswerDisplay renders NO answer with close call warning
   └─> Large text: "NO, it won't rain"
   └─> Location tag: "📍 San Francisco, CA"
   └─> Probability: "45% chance"
   └─> CloseCallBadge: "It's a close call - consider bringing an umbrella just in case"
```

**Error Flow (Invalid Location):**

```
Steps 1-4: Same as above

5. API responds with error (404)
   └─> Response: { error: "invalid_location", message: "...", suggestions: [...] }
   └─> page.tsx sets isLoading = false
   └─> page.tsx sets errorData = response

6. ErrorDisplay renders error message
   └─> Error icon/indicator
   └─> Message: "Location not found. Did you mean one of these?"
   └─> Suggestions: List of nearby locations (if provided)
   └─> Input remains enabled for retry

7. User corrects location and tries again
   └─> Flow repeats from step 2
```

**Error Flow (API Failure):**

```
Steps 1-4: Same as above

5. API fails (500, timeout, network error)
   └─> Response: { error: "service_unavailable", message: "..." }
   └─> page.tsx sets errorData = response

6. ErrorDisplay renders friendly error
   └─> Message: "Unable to get forecast right now. Please try again in a few moments."
   └─> Input remains enabled for retry
```

**State Transition Diagram:**

```
[Landing] → [Loading] → [YES Answer] ─┐
    ↑          ↓          ↓            │
    │       [Error]   [NO Answer]      │
    │          ↓          ↓            │
    └──────────┴──────────┴────────────┘
           (Search Again)
```

## Non-Functional Requirements

### Performance

**Epic 3 Performance Targets (subset of overall PRD NFRs):**

| Metric | Target | Measurement Point | Notes |
|--------|--------|-------------------|-------|
| **Initial Page Load** | < 1 second | Landing page FCP | Lighthouse Performance > 90 |
| **Time to Interactive** | < 1.5 seconds | TTI metric | Page ready for user input |
| **Answer Delivery** | < 2 seconds | Search submit → answer display | Backend + frontend rendering |
| **Loading State Display** | < 100ms | Search submit → loading indicator | Immediate user feedback |
| **JavaScript Bundle** | < 100KB gzipped | Initial payload | Tree-shaking enabled |
| **CSS Bundle** | < 20KB gzipped | Tailwind + Shadcn UI | Utility-first, minimal custom CSS |

**Implementation Approach:**
- Use Next.js automatic code splitting by route
- Import only necessary Shadcn UI components (Button, Input, Card)
- Minimize client-side JavaScript (leverage Server Components where possible)
- Lazy load non-critical components if needed
- Optimize image assets (use SVG for icons)
- Defer Epic 5 for advanced performance tuning

**Testing:**
- Lighthouse audit on production build (target: Performance > 90)
- Network throttling test (Fast 3G) for realistic conditions
- Measure Core Web Vitals (LCP, FID, CLS)

### Security

**Frontend Security Considerations:**

| Requirement | Implementation | Rationale |
|-------------|----------------|-----------|
| **Input Sanitization** | React escapes by default | Prevents XSS attacks |
| **No Sensitive Data Exposure** | API key only on backend | Never expose OpenWeather API key to client |
| **HTTPS Only** | Enforced by Vercel deployment | Secure data transmission |
| **CORS Configuration** | Same-origin API calls | `/api/check-rain` on same domain |
| **No Client-Side Storage** | Stateless - no localStorage/sessionStorage | Privacy commitment, no data persistence |

**Implementation Notes:**
- All user input rendered via React components (auto-escaped)
- API calls use relative paths (`/api/check-rain`, not absolute URLs)
- No cookies or session storage used in Epic 3
- Backend security (API key protection) already handled in Epic 2

**Testing:**
- Verify API key never appears in browser DevTools Network tab
- Test XSS prevention with special characters in location input
- Ensure HTTPS redirect works in production

### Reliability/Availability

**Error Resilience:**

| Failure Scenario | Frontend Handling | User Experience |
|------------------|-------------------|-----------------|
| **Backend API Failure** | Display user-friendly error message | "Unable to get forecast right now. Please try again in a few moments." |
| **Network Timeout** | Catch fetch timeout error | "Request timed out. Please check your connection and try again." |
| **Invalid Location** | Show suggestions if provided | "Location not found. Did you mean: [suggestions]?" |
| **Network Offline** | Catch network error | "Network connection failed. Please check your internet and try again." |
| **Malformed Response** | Graceful degradation | Display error, allow retry |

**Implementation Approach:**
- Wrap all API calls in try-catch blocks
- Use ErrorDisplay component for all error states
- Always keep input enabled for retry (no dead ends)
- Test all error scenarios in development

**Availability Expectations:**
- Frontend availability depends on Vercel uptime (99.9%+ SLA)
- Backend API availability covered in Epic 2 NFRs
- Epic 3 focuses on graceful degradation when backend unavailable

### Observability

**Frontend Logging and Debugging:**

| Area | Implementation | Purpose |
|------|----------------|---------|
| **Console Logging** | Development mode only | Debug state changes, API calls |
| **Error Logging** | Log errors to console in dev | Identify issues during testing |
| **React DevTools** | Use in development | Inspect component state, props |
| **Network Tab** | Monitor API calls in browser | Verify request/response format |

**Production Considerations:**
- Remove console.log statements in production build
- Consider adding error boundary for React errors (future enhancement)
- Backend analytics logging handled in Epic 2
- Frontend error tracking (e.g., Sentry) deferred to post-launch

**Testing:**
- Verify API calls in Network tab
- Use React DevTools to inspect state transitions
- Test error scenarios and log outputs

## Dependencies and Integrations

**External Dependencies (from Epic 1):**

| Dependency | Version | Purpose | Installation Status |
|------------|---------|---------|---------------------|
| **React** | 18.x | UI framework | Installed (Epic 1.1) |
| **Next.js** | 15.x | App framework, routing, API routes | Installed (Epic 1.1) |
| **TypeScript** | Latest | Type safety | Installed (Epic 1.1) |
| **Tailwind CSS** | v4 | Utility-first styling | Installed (Epic 1.2) |
| **Shadcn UI** | Latest | Accessible component library | Installed (Epic 1.2) |
| **@radix-ui/*** | Latest | Shadcn UI primitives | Auto-installed with Shadcn components |

**No New Dependencies Required for Epic 3** - All frontend dependencies installed in Epic 1.

**Internal Dependencies:**

| Dependency | Location | Created In | Used For |
|------------|----------|------------|----------|
| **`/api/check-rain` API Route** | `app/api/check-rain/route.ts` | Epic 2 | Backend rain forecast intelligence |
| **TypeScript Types** | `types/api.ts`, `types/weather.ts` | Epic 2 | Shared type definitions |
| **Shadcn UI Components** | `components/ui/button.tsx`, `input.tsx`, `card.tsx` | Epic 1 | Base UI components |
| **Environment Variables** | `.env.local` | Epic 1 | API configuration (not used directly in Epic 3 frontend) |

**Integration Points:**

**1. Backend API Integration (`/api/check-rain`):**
- **Protocol:** HTTP POST
- **Request Format:** JSON `{ location: string }`
- **Response Format:** JSON `RainCheckResponse | ErrorResponse`
- **Integration Owner:** `page.tsx` and optional `lib/api-client.ts`
- **Error Handling:** Frontend catches all error types, maps to user-friendly messages

**2. Shadcn UI Component Integration:**
- **Button:** Search submission trigger
- **Input:** Location text field
- **Card:** Container for answer display and details
- **Import Pattern:** `import { Button } from '@/components/ui/button'`

**3. Tailwind CSS Integration:**
- **Utility Classes:** Responsive design, spacing, typography
- **Custom Config:** Dark mode support (if configured in Epic 1)
- **Usage:** All custom components use Tailwind utilities

**No External API Calls from Frontend** - All OpenWeather API integration handled by backend (Epic 2).

## Acceptance Criteria (Authoritative)

These acceptance criteria define the complete Definition of Done for Epic 3. All criteria must be met before Epic is considered complete.

### AC-1: Landing Page Displays Correctly
**Given** a user visits the application for the first time
**When** the landing page loads
**Then** the H1 heading "Will It Rain?" is prominently displayed
**And** the subheading "Get a simple yes or no answer for the next 24 hours" is visible
**And** the location input field is centered and immediately accessible
**And** placeholder text "Enter zipcode or city" is visible in the input
**And** the footer includes privacy statement and OpenWeather attribution
**And** the page is responsive on mobile (320px+), tablet (768px+), and desktop (1025px+)

### AC-2: Location Input Accepts and Validates Input
**Given** the landing page is displayed
**When** a user types a location (zipcode or city name)
**Then** the input field accepts keyboard input
**And** Enter key or Search button triggers submission
**And** empty input shows client-side validation error
**And** input is disabled during API processing
**And** focus returns to input after result display for easy re-search

### AC-3: Loading State Provides Immediate Feedback
**Given** a user submits a location search
**When** the API request is in progress
**Then** a loading indicator appears within 100ms
**And** the input field is disabled
**And** loading state is announced to screen readers (aria-live)
**And** loading indicator disappears when response received (success or error)

### AC-4: YES Answer Displays with Complete Details
**Given** the backend API returns a YES answer (probability ≥50%)
**When** the answer is rendered
**Then** "YES, it will rain" is displayed in large, prominent text
**And** a location tag displays the searched location (e.g., "📍 San Francisco, CA")
**And** the probability percentage is shown (e.g., "65% chance")
**And** all rain windows are displayed with start and end times
**And** peak rain details show time, intensity, and amount
**And** safe windows are displayed if multiple rain periods exist
**And** close call message appears if probability is 40-49%
**And** all details are organized in clear, readable cards
**And** the display is responsive across all device sizes

### AC-5: NO Answer Displays with Appropriate Simplicity
**Given** the backend API returns a NO answer (probability <50%)
**When** the answer is rendered
**Then** "NO, it won't rain" is displayed in large, prominent text
**And** a location tag displays the searched location (e.g., "📍 San Francisco, CA")
**And** the probability percentage is shown
**And** close call message appears if probability is 40-49%
**And** no additional details are shown (maintains simplicity)
**And** the display is responsive across all device sizes

### AC-6: Close Call Messaging Appears for 40-49% Probability
**Given** the rain probability is between 40-49%
**When** the answer is displayed (YES or NO)
**Then** the message "It's a close call - consider bringing an umbrella just in case" is shown
**And** the message is visually distinct but not alarming
**And** the message is accessible to screen readers
**And** the message does NOT appear outside the 40-49% range

### AC-7: Error States Display User-Friendly Messages
**Given** an error occurs (invalid location, API failure, network error)
**When** the error is rendered
**Then** a user-friendly error message is displayed (not technical details)
**And** invalid location errors show suggestions if provided by backend
**And** API failures show "Unable to get forecast right now. Please try again in a few moments."
**And** network errors show connectivity messaging
**And** the input field remains enabled for retry
**And** error messages are announced to screen readers (aria-live="assertive")

### AC-8: Search Again Works Seamlessly
**Given** an answer (YES/NO) or error is displayed
**When** the user wants to search another location
**Then** the input field remains visible and enabled
**And** entering a new location and submitting clears the previous result
**And** the new search follows the same flow (loading, answer/error)
**And** no page reload is required
**And** state is correctly reset between searches

### AC-9: Frontend-Backend Integration Functions Correctly
**Given** the frontend and backend are deployed
**When** a user searches for a location
**Then** a POST request is sent to `/api/check-rain` with `{ location: string }`
**And** the request includes correct headers (`Content-Type: application/json`)
**And** successful responses (YES/NO) are parsed and displayed correctly
**And** error responses are parsed and mapped to user-friendly messages
**And** network errors are caught and handled
**And** the complete end-to-end flow works without errors

### AC-10: Accessibility Foundations Are Implemented
**Given** the application must be accessible
**When** tested with keyboard and screen readers
**Then** all interactive elements are keyboard accessible (Tab, Enter)
**And** semantic HTML is used (h1, main, form, button, label)
**And** form inputs have associated labels (visible or aria-label)
**And** loading states use aria-live="polite"
**And** error messages use aria-live="assertive"
**And** focus indicators are visible
**And** the page has logical tab order

### AC-11: Responsive Design Works Across All Devices
**Given** the application must work on all devices
**When** tested on mobile, tablet, and desktop
**Then** mobile (320px-767px): single-column layout, touch-optimized
**And** tablet (768px-1024px): centered layout, comfortable spacing
**And** desktop (1025px+): centered content, maximum width constraint
**And** text is readable without zooming (minimum 16px base)
**And** touch targets meet minimum 44x44px size
**And** no horizontal scrolling at any breakpoint

## Traceability Mapping

This table maps Epic 3 acceptance criteria back to PRD functional requirements and architectural components.

| Acceptance Criteria | PRD Functional Requirement | Architecture Component | Test Strategy |
|---------------------|----------------------------|------------------------|---------------|
| **AC-1: Landing Page** | FR7.1 - Landing Page Content | `app/page.tsx`, Shadcn UI components | Visual regression, cross-browser testing |
| **AC-2: Location Input** | FR1.1 - Location Input Field, FR1.2 - Location Validation | `LocationInput.tsx`, client-side validation | Unit tests, integration tests |
| **AC-3: Loading State** | FR4.1 - Loading State | `LoadingState.tsx`, ARIA live regions | Accessibility audit, screen reader testing |
| **AC-4: YES Answer** | FR3.1 - YES Answer Display | `AnswerDisplay.tsx`, `DetailCard.tsx` | E2E tests with mock API responses |
| **AC-5: NO Answer** | FR3.2 - NO Answer Display | `AnswerDisplay.tsx` | E2E tests with mock API responses |
| **AC-6: Close Call** | FR3.3 - Close Call Messaging | `CloseCallBadge.tsx` | E2E tests with 40-49% probability |
| **AC-7: Error States** | FR4.2 - API Failure Handling, FR4.3 - Network Error Handling | `ErrorDisplay.tsx` | E2E tests simulating all error types |
| **AC-8: Search Again** | FR3.4 - Search Again Functionality | `page.tsx` state management | E2E tests with multiple searches |
| **AC-9: API Integration** | FR2 - Rain Probability Processing (backend), FR1 - Location Input | `page.tsx` or `lib/api-client.ts` | Integration tests with real API, mock tests |
| **AC-10: Accessibility** | NFR-A1 - WCAG 2.1 Level AA Compliance | All components | Lighthouse accessibility audit, axe DevTools |
| **AC-11: Responsive Design** | FR6.3 - Responsive Experience | Tailwind CSS utilities, all components | Manual testing on real devices, browser DevTools |

## Risks, Assumptions, Open Questions

### Risks

**RISK-1: Backend API Dependency**
- **Type:** Dependency Risk
- **Description:** Epic 3 frontend is completely dependent on Epic 2 backend API being functional
- **Probability:** Low (Epic 2 completed first)
- **Impact:** High (frontend cannot function without backend)
- **Mitigation:**
  - Verify Epic 2 completion before starting Epic 3 stories
  - Test with real `/api/check-rain` endpoint early
  - Use mock API responses for frontend development if needed
  - Implement comprehensive error handling for API failures

**RISK-2: State Management Complexity**
- **Type:** Technical Risk
- **Description:** Managing loading, answer, error states may become complex
- **Probability:** Medium
- **Impact:** Medium (could lead to bugs or state pollution)
- **Mitigation:**
  - Keep state management simple (use useState, avoid unnecessary complexity)
  - Implement clear state reset between searches
  - Add TypeScript strict mode for type safety
  - Test state transitions thoroughly

**RISK-3: Cross-Browser Compatibility Issues**
- **Type:** Technical Risk
- **Description:** UI may render differently across browsers (Safari, Firefox, Chrome)
- **Probability:** Low-Medium
- **Impact:** Medium (affects user experience)
- **Mitigation:**
  - Use Shadcn UI components (tested across browsers)
  - Test early on Safari, Firefox, Edge (not just Chrome)
  - Defer full cross-browser testing to Epic 4.7
  - Use standard CSS features (avoid experimental APIs)

**RISK-4: Accessibility Gaps**
- **Type:** Quality Risk
- **Description:** Accessibility features may not be fully implemented in Epic 3
- **Probability:** Medium
- **Impact:** Medium (affects usability for some users)
- **Mitigation:**
  - Implement accessibility foundations (AC-10)
  - Use semantic HTML and ARIA labels from the start
  - Defer full WCAG 2.1 AA compliance testing to Epic 5
  - Ensure keyboard navigation works for all interactive elements

### Assumptions

**ASSUMPTION-1: Epic 2 API Contract Stability**
- Epic 2 backend API `/api/check-rain` contract (request/response format) is final and stable
- If API contract changes, frontend must be updated to match
- **Validation:** Review Epic 2 tech spec before implementation

**ASSUMPTION-2: Shadcn UI Components Sufficient**
- Button, Input, and Card components from Shadcn UI are sufficient for Epic 3
- No additional Shadcn components need to be installed
- **Validation:** Review UX design (if available) to confirm component needs

**ASSUMPTION-3: No Custom Icon Library Needed**
- Emoji or Tailwind/Shadcn built-in icons are sufficient
- No need for react-icons, heroicons, or other icon libraries
- **Validation:** Confirm with designer or use emoji fallback (e.g., 📍 for location)

**ASSUMPTION-4: TypeScript Types Defined in Epic 2**
- `RainCheckResponse` and `ErrorResponse` types are already defined in Epic 2 codebase
- Frontend can import and reuse these types
- **Validation:** Check `types/api.ts` exists before implementation

**ASSUMPTION-5: No Advanced UX Design Required**
- Epic 3 can proceed with clean, minimal design using Shadcn UI defaults
- Glassmorphic design or custom styling deferred to later refinement
- **Validation:** Confirm minimal design approach with stakeholder

**ASSUMPTION-6: Performance Optimization Deferred**
- Basic Next.js defaults are sufficient for Epic 3
- Advanced bundle optimization, code splitting, and performance tuning deferred to Epic 5
- **Validation:** Lighthouse audit should still score > 90 with defaults

### Open Questions

**QUESTION-1: UX Design Specifics**
- **Question:** Is there a detailed UX design document specifying layout, colors, typography?
- **Impact:** Affects visual implementation in `AnswerDisplay`, `DetailCard`, etc.
- **Resolution Path:** Check if UX design document exists; if not, proceed with minimal Shadcn UI defaults
- **Owner:** Bob (Scrum Master) to confirm with team

**QUESTION-2: Error Message Wording**
- **Question:** Should error messages be more conversational or more technical?
- **Impact:** Affects copy in `ErrorDisplay` component
- **Resolution Path:** Use PRD guidance ("plain language, not technical jargon") - go with conversational tone
- **Owner:** Developer implementing Story 3.7

**QUESTION-3: Loading State Duration**
- **Question:** Should loading state show a message like "Checking forecast..." or just a spinner?
- **Impact:** Affects `LoadingState` component implementation
- **Resolution Path:** Default to spinner + optional message for screen readers; message can be added later if needed
- **Owner:** Developer implementing Story 3.3

**QUESTION-4: Dark Mode Support**
- **Question:** Should Epic 3 implement dark mode toggle or just use system preference?
- **Impact:** Affects Tailwind configuration and component styling
- **Resolution Path:** Defer dark mode implementation to Epic 4 or 5; use light mode default for Epic 3
- **Owner:** Bob (Scrum Master) to clarify scope

**QUESTION-5: Analytics Tracking for Frontend Events**
- **Question:** Should frontend log user interactions (clicks, searches) beyond what backend logs?
- **Impact:** May require additional analytics code in components
- **Resolution Path:** Backend logs searches (Epic 2.7); frontend logging not needed for Epic 3
- **Owner:** Confirmed - Epic 2 backend logging is sufficient

## Test Strategy Summary

### Testing Levels

**1. Unit Tests (Optional for Epic 3 - Defer to Epic 5)**
- **Scope:** Individual component logic (LocationInput validation, AnswerDisplay rendering)
- **Framework:** Jest + React Testing Library
- **Coverage:** Defer comprehensive unit tests to Epic 5.7
- **Epic 3 Focus:** Manual testing sufficient for MVP

**2. Integration Tests**
- **Scope:** Frontend-backend API integration
- **Test Cases:**
  - POST `/api/check-rain` with valid location → YES answer renders
  - POST `/api/check-rain` with valid location → NO answer renders
  - POST `/api/check-rain` with invalid location → error displays
  - POST `/api/check-rain` with API failure → error displays
  - Multiple sequential searches reset state correctly
- **Approach:** Use real backend API (Epic 2) or mock responses
- **Tooling:** Manual testing in browser, optional Playwright/Cypress for automation

**3. End-to-End (E2E) Tests**
- **Scope:** Complete user flows from landing to answer
- **Critical Flows:**
  - Happy path (YES answer): Enter location → see rain details
  - Happy path (NO answer): Enter location → see probability only
  - Close call (40-49%): Verify close call message appears
  - Error flow (invalid location): Verify error + suggestions display
  - Error flow (API failure): Verify friendly error message
  - Search again: Multiple searches work without state pollution
- **Tooling:** Manual testing, optional Playwright for automation (Epic 5.7)

**4. Accessibility Testing**
- **Scope:** Keyboard navigation, screen reader support, ARIA compliance
- **Test Cases:**
  - Tab through all interactive elements (logical order)
  - Enter key submits search
  - Screen reader announces loading, answer, errors
  - Focus indicators visible on all elements
  - Form inputs have associated labels
- **Tooling:** Lighthouse accessibility audit, axe DevTools, manual keyboard testing
- **Deferred:** Full WCAG 2.1 AA testing to Epic 5.2, 5.3, 5.4

**5. Responsive Design Testing**
- **Scope:** Verify UI works on mobile, tablet, desktop
- **Breakpoints:**
  - Mobile: 320px, 375px, 414px (iPhone SE, iPhone 12, iPhone 14 Pro)
  - Tablet: 768px, 1024px (iPad, iPad Pro)
  - Desktop: 1280px, 1440px, 1920px
- **Test Cases:**
  - Text readable without zooming
  - Touch targets meet 44x44px minimum
  - No horizontal scrolling
  - Layout adapts gracefully
- **Tooling:** Browser DevTools responsive mode, real devices (iOS, Android)

**6. Cross-Browser Testing (Deferred to Epic 4.7)**
- **Browsers:** Chrome, Safari, Firefox, Edge (latest 2 versions)
- **Epic 3 Focus:** Develop and test primarily in Chrome; defer comprehensive cross-browser testing

### Test Execution Plan

**Phase 1: Story-Level Testing (During Development)**
- Each story (3.1-3.9) includes test cases in acceptance criteria
- Developer tests on local development server
- Verify story acceptance criteria before marking complete

**Phase 2: Epic-Level Integration Testing (After All Stories Complete)**
- Test complete user flows end-to-end
- Verify all AC-1 through AC-11 acceptance criteria
- Run Lighthouse audit (Performance > 90, Accessibility > 95)
- Test on real devices (iPhone, Android, desktop)

**Phase 3: Regression Testing (Before Epic Completion)**
- Re-test all critical flows after bug fixes
- Verify no regressions introduced by changes
- Confirm Epic 2 backend integration still works

### Test Data

**Valid Locations:**
- Zipcode: 94102 (San Francisco), 10001 (New York), 60601 (Chicago)
- City: "San Francisco", "New York", "Chicago", "Seattle"

**Invalid Locations:**
- Empty string, "XYZ123", "Nonexistent City", special characters

**API Response Scenarios:**
- YES answer (65% probability) with multiple rain windows
- NO answer (35% probability)
- Close call (45% probability)
- Invalid location error with suggestions
- API failure (500 error)
- Network timeout

### Success Metrics

**Epic 3 is complete when:**
- All 11 acceptance criteria (AC-1 through AC-11) are met
- Lighthouse Performance score > 90
- Lighthouse Accessibility score > 95
- Manual testing passes on Chrome (primary), Safari, Firefox (basic check)
- All error scenarios handled gracefully
- Search again functionality works without state pollution
- Responsive design verified on mobile and desktop
