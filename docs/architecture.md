# Architecture

## Executive Summary

**Will It Rain** uses a modern, serverless Next.js architecture optimized for radical simplicity and fast deployment. The application leverages Next.js 15 App Router with TypeScript, Tailwind CSS v4, and Shadcn UI for a glassmorphic dark mode interface. All components are stateless except for React state management, with no database needed—only lightweight analytics via Upstash Redis. The architecture prioritizes sub-2-second response times, WCAG 2.1 AA accessibility, and PWA capabilities through native Next.js features.

## Project Initialization

**First Implementation Story: Initialize Project**

```bash
# Create Next.js project with all dependencies
npx create-next-app@latest will-it-rain --typescript --tailwind --eslint --app

cd will-it-rain

# Install Shadcn UI
npx shadcn@latest init

# Install Shadcn components (only what we need)
npx shadcn@latest add button input card

# Install Upstash Redis SDK
npm install @upstash/redis
```

This establishes the base architecture with these decisions:
- ✅ Next.js 15 with App Router
- ✅ TypeScript for type safety
- ✅ Tailwind CSS v4 for styling
- ✅ ESLint for code quality
- ✅ Shadcn UI component library
- ✅ Upstash Redis for analytics

## Decision Summary

| Category | Decision | Version | Affects Epics | Rationale |
| -------- | -------- | ------- | ------------- | --------- |
| **Framework** | Next.js App Router | 15 | All | SSR/SSG support, API routes, native PWA, Vercel optimization |
| **Language** | TypeScript | Latest | All | Type safety for API contracts, component props, OpenWeather responses |
| **Styling** | Tailwind CSS | v4 | Epic 1, 3, 4 | Glassmorphic effects, dark mode, utility-first, zero runtime |
| **Component Library** | Shadcn UI | Latest | Epic 1, 3 | Accessible (Radix UI), customizable, dark mode ready, copy-paste architecture |
| **Font** | Inter (Variable) | Latest | Epic 3, 4 | UX spec requirement (Linear.app inspiration), modern web font |
| **Build Tool** | Turbopack (dev) / Webpack (prod) | Next.js 15 | Epic 1 | Fast HMR (< 1s), optimized production builds |
| **Linting** | ESLint | Next.js config | Epic 1, 5 | Code quality, React/Next.js best practices enforcement |
| **Deployment** | Vercel | Platform | All | Native Next.js optimization, serverless functions, PWA support, zero config |
| **Analytics Storage** | Upstash Redis | Free tier: 256MB, 500K cmds/month | Epic 2 | Serverless-native, privacy-first logging, generous free tier |
| **External API** | OpenWeather One Call API 3.0 | v3 | Epic 2 | 24-hour hourly forecast, precipitation probability, free tier: 1K calls/day |
| **API Client** | Native Fetch | Built-in | Epic 2 | Standard approach, no dependencies, sufficient for REST calls |
| **Date/Time** | Native Date API + Intl | Built-in | Epic 2, 3 | Zero bundle size, Intl.DateTimeFormat for 12-hour AM/PM formatting |
| **Error Handling** | Structured Retry Pattern | Custom | All epics | Retry once on 5xx, timeout at 5s, user-friendly error codes |
| **PWA Support** | Native Next.js manifest.ts | Next.js 15 | Epic 4 | No external dependencies (native support added fall 2024) |
| **State Management** | React useState | Built-in | Epic 3 | Stateless app, no complex state, hooks sufficient for form/loading/answer |

## Project Structure

```
will-it-rain/
├── app/
│   ├── layout.tsx                    # Root layout (PWA manifest, fonts, metadata)
│   ├── page.tsx                      # Landing page + answer display (Epic 3)
│   ├── manifest.ts                   # PWA manifest (Epic 4)
│   ├── globals.css                   # Tailwind directives, glassmorphic utilities
│   │
│   └── api/
│       └── check-rain/
│           └── route.ts              # Main weather API endpoint (Epic 2)
│
├── components/
│   ├── ui/                           # Shadcn UI base components (Epic 1)
│   │   ├── button.tsx                # Primary/secondary buttons
│   │   ├── input.tsx                 # Location search input
│   │   └── card.tsx                  # Base card component
│   │
│   ├── GlassCard.tsx                 # Custom glassmorphic container (Epic 3)
│   ├── LocationInput.tsx             # Location search with validation (Epic 3)
│   ├── AnswerDisplay.tsx             # YES/NO answer display (Epic 3)
│   ├── DetailCard.tsx                # Rain windows, peak, safe periods (Epic 3)
│   ├── ErrorDisplay.tsx              # Friendly error messages (Epic 3)
│   ├── LoadingState.tsx              # Loading indicator with ARIA (Epic 3)
│   └── CloseCallBadge.tsx            # 40-49% probability warning (Epic 3)
│
├── lib/
│   ├── openweather.ts                # OpenWeather API client with retry (Epic 2)
│   ├── rain-logic.ts                 # Rain probability calculation (Epic 2)
│   ├── rain-windows.ts               # Window detection + safe periods (Epic 2)
│   ├── analytics.ts                  # Upstash Redis logger (Epic 2)
│   ├── error-handler.ts              # Unified error handling (Epic 2)
│   ├── redis.ts                      # Upstash Redis client (Epic 2)
│   └── utils.ts                      # Date formatting, cn() helper
│
├── types/
│   ├── api.ts                        # API request/response interfaces
│   ├── weather.ts                    # OpenWeather data types
│   └── analytics.ts                  # Analytics log entry type
│
├── public/
│   ├── icons/                        # PWA icons (Epic 4)
│   │   ├── icon-192.png              # Android home screen
│   │   ├── icon-512.png              # Android splash
│   │   └── maskable-icon.png         # Adaptive icon (Android)
│   └── favicon.ico                   # Browser favicon
│
├── .env.local                        # Environment variables (not committed)
├── .env.example                      # Environment variable template
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind + Shadcn theme (dark mode)
├── components.json                   # Shadcn UI configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies + scripts
└── README.md                         # Setup instructions
```

## Epic to Architecture Mapping

| Epic | Primary Files/Directories | Integration Points |
| ---- | ------------------------ | ------------------ |
| **Epic 1: Foundation & Infrastructure** | Root configs, `/components/ui/` | Establishes all tooling, Shadcn UI library |
| **Epic 2: Weather Intelligence Engine** | `/app/api/check-rain/route.ts`, `/lib/` | OpenWeather API, Upstash Redis, error handling |
| **Epic 3: Simple Answer Experience** | `/app/page.tsx`, `/components/` | Frontend ↔ Backend API, state management |
| **Epic 4: Universal Access (PWA)** | `/app/manifest.ts`, `/public/icons/` | Native Next.js PWA, responsive CSS |
| **Epic 5: Polish & Launch Readiness** | All components (optimization) | Performance, accessibility, testing |

## Technology Stack Details

### Core Technologies

**Framework: Next.js 15**
- App Router architecture (file-based routing)
- Server Components by default
- API Routes in `/app/api/`
- Native PWA support via `manifest.ts`
- Turbopack for development (fast HMR)
- Webpack for production builds
- Vercel deployment optimization

**Language: TypeScript**
- Strict mode enabled
- Type safety across frontend/backend boundary
- Interface definitions for API contracts
- No `any` types allowed (enforced via ESLint)

**Styling: Tailwind CSS v4 + Shadcn UI**
- Utility-first CSS framework
- Custom glassmorphic utilities
- Dark mode (monochrome storm theme)
- Inter font (variable weight)
- Shadcn UI: Radix UI primitives + Tailwind styling
- Components: Button, Input, Card (expand as needed)

**Deployment: Vercel**
- Serverless Functions for API routes
- Edge caching for static assets
- Automatic HTTPS
- Zero-config deployment from GitHub
- Environment variable management

**Analytics: Upstash Redis**
- Serverless Redis (Redis API compatible)
- Free tier: 256MB storage, 500K commands/month
- Integration via Vercel Marketplace
- Auto environment variables (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)
- Privacy-first logging (location + timestamp only)

**External API: OpenWeather One Call API 3.0**
- 24-hour hourly forecast
- Precipitation probability per hour
- Weather descriptions, intensity
- Free tier: 1,000 calls/day
- 5-second timeout enforced
- Single retry on 5xx errors

### Integration Points

**Frontend → Backend API:**
```typescript
// POST /api/check-rain
Request: { location: string }

Success Response: {
  willRain: boolean,
  probability: number,
  rainWindows?: Array<{ start: string, end: string }>,
  peakTime?: string,
  intensity?: string,
  amount?: string,
  safeWindows?: Array<{ start: string, end: string }>,
  closeCall: boolean
}

Error Response: {
  error: 'invalid_location' | 'service_unavailable' | 'timeout' | 'network_error',
  message: string,
  suggestions?: string[]
}
```

**Backend → OpenWeather API:**
```typescript
// GET https://api.openweathermap.org/data/3.0/onecall
Query params:
  - lat, lon (from geocoding location input)
  - exclude: minutely,daily,alerts (only need hourly)
  - appid: OPENWEATHER_API_KEY
  - units: imperial (for Fahrenheit, inches)

Returns: 48 hours of hourly forecast (we use first 24)
```

**Backend → Upstash Redis:**
```typescript
// Analytics logging (fire-and-forget)
await redis.rpush('analytics:searches', JSON.stringify({
  location: string,
  timestamp: string (ISO 8601)
}));

// Fails silently if Redis unavailable
```

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

### Naming Conventions

**Components:** PascalCase
- ✅ `GlassCard.tsx`, `LocationInput.tsx`, `AnswerDisplay.tsx`
- ❌ `glassCard.tsx`, `location-input.tsx`

**Files (non-components):** kebab-case
- ✅ `rain-logic.ts`, `error-handler.ts`, `api.ts`
- ❌ `rainLogic.ts`, `error_handler.ts`

**Functions:** camelCase (verb-noun pattern)
- ✅ `calculateRainProbability()`, `formatTimeDisplay()`, `fetchWeatherData()`
- ❌ `CalculateRainProbability()`, `format_time()`

**Types/Interfaces:** PascalCase
- ✅ `RainCheckResponse`, `WeatherData`, `ErrorResponse`
- ❌ `rainCheckResponse`, `weather_data`

**Constants:** SCREAMING_SNAKE_CASE
- ✅ `OPENWEATHER_API_KEY`, `MAX_RETRY_ATTEMPTS`, `API_TIMEOUT_MS`
- ❌ `OpenweatherApiKey`, `max_retry`

**Environment Variables:** SCREAMING_SNAKE_CASE
- ✅ `OPENWEATHER_API_KEY`, `UPSTASH_REDIS_REST_URL`
- ❌ `openweather_api_key`, `OpenWeatherApiKey`

### Code Organization

**Component Structure:**
```typescript
// 1. Imports (external → internal → types)
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/utils';
import type { RainCheckResponse } from '@/types/api';

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export function ComponentName({ props }: ComponentProps) {
  // 3a. Hooks at top
  const [state, setState] = useState();

  // 3b. Helper functions
  const handleAction = () => { ... };

  // 3c. Early returns for edge cases
  if (loading) return <LoadingState />;

  // 3d. Main render
  return <div>{/* JSX */}</div>;
}
```

**API Route Structure:**
```typescript
// app/api/*/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse input
    const body = await request.json();

    // 2. Business logic (call lib functions)
    const result = await performLogic(body);

    // 3. Return response
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    // 4. Handle errors
    return handleApiError(error);
  }
}
```

**Import Organization:**
```typescript
// ✅ Correct order:
// 1. External packages
import { useState } from 'react';
import { Card } from '@/components/ui/card';

// 2. Internal lib/utils
import { formatTime } from '@/lib/utils';

// 3. Types
import type { RainCheckResponse } from '@/types/api';

// 4. Styles (if any)
import './styles.css';
```

### Error Handling

**Retry Pattern (all API calls):**
```typescript
// Retry once on 5xx errors
async function fetchWithRetry(url: string, options: RequestInit) {
  const response = await fetch(url, options);

  if (response.status >= 500) {
    // Single retry attempt
    return await fetch(url, options);
  }

  return response;
}
```

**Timeout Pattern (5 seconds):**
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
  return response;
} catch (error) {
  if (error.name === 'AbortError') {
    throw new Error('timeout');
  }
  throw error;
}
```

**Error Codes (standardized):**
- `invalid_location` - Location not found or invalid format
- `service_unavailable` - OpenWeather API failure or 5xx error
- `timeout` - Request exceeded 5 seconds
- `network_error` - Network connectivity issue

### Logging Strategy

**Analytics Logging (Upstash Redis):**
```typescript
// Fire-and-forget, fail silently
async function logSearch(location: string) {
  try {
    await redis.rpush('analytics:searches', JSON.stringify({
      location,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    // Never break the app for analytics
    console.error('Analytics logging failed:', error);
  }
}
```

**Format:**
- Storage: JSON strings in Redis list
- Location: As entered by user (e.g., "San Francisco" or "94102")
- Timestamp: ISO 8601 format (e.g., "2025-11-06T14:30:00.000Z")

## Data Architecture

**No Database - Stateless Architecture**

The application intentionally has no persistent database. Every request is fresh, with no user sessions, saved searches, or caching.

**Data Types:**

```typescript
// API Contract
interface RainCheckRequest {
  location: string; // Zipcode or city name
}

interface RainCheckResponse {
  willRain: boolean;
  probability: number; // 0-100
  rainWindows?: Array<{ start: string; end: string }>; // Only if YES
  peakTime?: string; // Time of highest probability (only if YES)
  intensity?: string; // "light" | "moderate" | "heavy" (only if YES)
  amount?: string; // e.g., "0.2 inches" (only if YES)
  safeWindows?: Array<{ start: string; end: string }>; // Only if YES + multiple rain periods
  closeCall: boolean; // true if 40-49%
}

interface ErrorResponse {
  error: 'invalid_location' | 'service_unavailable' | 'timeout' | 'network_error';
  message: string;
  suggestions?: string[]; // Only for invalid_location
}

// OpenWeather Data
interface HourlyForecast {
  dt: number; // Unix timestamp
  temp: number;
  pop: number; // Precipitation probability (0-1)
  weather: Array<{
    id: number;
    main: string;
    description: string;
  }>;
  rain?: {
    '1h': number; // Rainfall in mm for last hour
  };
}

// Analytics
interface AnalyticsEntry {
  location: string;
  timestamp: string; // ISO 8601
}
```

## API Contracts

### POST /api/check-rain

**Purpose:** Determine if it will rain in the next 24 hours for a given location

**Request:**
```json
{
  "location": "San Francisco"
}
```

**Success Response (YES):**
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

**Success Response (NO):**
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
  "message": "Location not found",
  "suggestions": ["Springfield, IL", "Springfield, MA", "Springfield, OH"]
}
```

**Error Response (API Failure):**
```json
{
  "error": "service_unavailable",
  "message": "Unable to get forecast right now. Please try again in a few moments."
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request (empty location)
- `404` - Location not found
- `500` - Server error / OpenWeather API failure
- `504` - Timeout (> 5 seconds)

## Security Architecture

**API Key Protection:**
- OpenWeather API key stored in environment variable
- Never exposed to client-side code
- Only accessible in server-side API routes
- `.env.local` in `.gitignore`
- Vercel environment variables for production

**HTTPS Only:**
- All traffic over HTTPS (enforced by Vercel)
- Strict-Transport-Security header
- Automatic certificate management

**Input Sanitization:**
- Location input validated (non-empty, reasonable length)
- No SQL injection risk (no database)
- No XSS risk (React escapes by default)
- OpenWeather API parameterized calls

**Rate Limiting:**
- Client-side: Input disabled during processing (prevents duplicate requests)
- Future: Consider Vercel rate limiting if abuse observed

**Privacy:**
- No user authentication or accounts
- No cookies (stateless)
- No geolocation tracking (manual location entry only)
- Analytics: Location + timestamp only (no PII)
- No session storage or localStorage for user data

## Performance Considerations

**Target Metrics (from NFRs):**
- Initial page load: < 1 second
- Time to Interactive (TTI): < 1.5 seconds
- Answer delivery (search → result): < 2 seconds
- JavaScript bundle: < 100KB gzipped
- CSS bundle: < 20KB gzipped
- Lighthouse Performance score: > 90

**Optimization Strategies:**

**Bundle Size:**
- Tree-shaking enabled (Next.js default)
- Import only necessary Shadcn UI components
- Native Date API (no date library = 0KB)
- Native Fetch (no axios = 0KB)
- No heavy dependencies

**Caching:**
- Static assets cached via service worker
- API routes: No caching (fresh data every request)
- CDN: Edge caching for JavaScript/CSS/fonts

**Network Efficiency:**
- Single API call per search
- No polling or background requests
- OpenWeather API call from backend only
- 5-second timeout prevents hanging

**Rendering:**
- Server Components by default (less client JS)
- Client Components only where needed (interactive elements)
- No client-side data fetching on initial load

**Code Splitting:**
- Next.js automatic code splitting by route
- Dynamic imports for heavy components (if needed)

## Deployment Architecture

**Hosting: Vercel**
- Serverless Functions for API routes
- Edge Network for static assets
- Automatic scaling
- Zero-config deployment

**Deployment Flow:**
```
1. Push to GitHub main branch
2. Vercel auto-detects changes
3. Build Next.js app (Webpack)
4. Deploy serverless functions
5. Deploy static assets to CDN
6. Automatic HTTPS certificate
```

**Environment Variables (Vercel Dashboard):**
```
OPENWEATHER_API_KEY=<your_regenerated_key>
UPSTASH_REDIS_REST_URL=<auto_from_marketplace>
UPSTASH_REDIS_REST_TOKEN=<auto_from_marketplace>
```

**Regions:**
- Default: Automatic (nearest region to user)
- API Routes: Run in serverless function (< 10s timeout)
- Static assets: Global CDN

**Monitoring:**
- Vercel Analytics (optional - page views)
- Error tracking: Console logs visible in Vercel dashboard
- Future: Consider Sentry for error tracking

## Development Environment

### Prerequisites

- Node.js: v18+ (LTS recommended)
- npm, yarn, or pnpm
- Git
- Code editor (VS Code recommended)
- OpenWeather API key (https://openweathermap.org/api) - **regenerate your exposed key first**
- Vercel account (for deployment)
- Upstash account (via Vercel Marketplace)

### Setup Commands

```bash
# 1. Clone repository
git clone <repo_url>
cd will-it-rain

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Add OpenWeather API key to .env.local
echo "OPENWEATHER_API_KEY=your_regenerated_key_here" >> .env.local

# 5. Add Upstash Redis credentials (from Vercel Marketplace after deployment)
# UPSTASH_REDIS_REST_URL=...
# UPSTASH_REDIS_REST_TOKEN=...

# 6. Run development server
npm run dev

# 7. Open browser
# http://localhost:3000
```

### Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### Testing Strategy

**Unit Tests:**
- Test rain probability logic (`lib/rain-logic.test.ts`)
- Test rain window detection (`lib/rain-windows.test.ts`)
- Test date formatting utilities (`lib/utils.test.ts`)
- Framework: Jest + React Testing Library

**Integration Tests:**
- Test `/api/check-rain` endpoint
- Mock OpenWeather API responses
- Test error handling (timeout, 5xx, invalid location)

**E2E Tests:**
- Test complete user flow (enter location → get answer)
- Test error states (invalid location, API failure)
- Test close call scenarios (40-49% probability)
- Framework: Playwright or Cypress

**Accessibility Tests:**
- Lighthouse audit (target score > 95)
- axe DevTools scan
- Manual keyboard navigation testing
- Screen reader testing (VoiceOver, NVDA)

## Architecture Decision Records (ADRs)

### ADR-001: Use Next.js 15 App Router

**Context:** Need modern React framework with SSR, API routes, and PWA support

**Decision:** Use Next.js 15 with App Router architecture

**Rationale:**
- Native PWA support (manifest.ts added in fall 2024)
- Serverless API routes perfect for single `/api/check-rain` endpoint
- Vercel deployment optimization (zero config)
- App Router is the future (Pages Router in maintenance mode)

**Consequences:**
- Must learn App Router conventions (Server/Client Components)
- Cannot use Pages Router patterns
- Requires Next.js 15+ (latest stable)

---

### ADR-002: No Database - Stateless Architecture

**Context:** PRD specifies "stateless - no session management, no database"

**Decision:** No database, no caching, fresh data every request

**Rationale:**
- PRD requirement: "stateless simplicity"
- No user accounts = no user data to store
- Weather data must be fresh (no caching)
- Reduces complexity and cost

**Consequences:**
- Cannot store user preferences or history
- Every request calls OpenWeather API (within free tier limits)
- Analytics requires separate solution (Redis)

---

### ADR-003: Upstash Redis for Analytics

**Context:** PRD requires "privacy-first analytics" (location + timestamp)

**Decision:** Use Upstash Redis via Vercel Marketplace

**Rationale:**
- Serverless-native (built for Vercel Functions)
- Free tier: 256MB, 500K commands/month (generous)
- Simple append-only logging (`rpush`)
- Fails silently (never breaks the app)
- Vercel Marketplace integration (auto env vars)

**Consequences:**
- Must handle Redis connection failures gracefully
- Analytics not queryable without external tool (future enhancement)
- Data persists beyond request lifecycle

---

### ADR-004: Native Date API (No Library)

**Context:** Need date formatting for 12-hour AM/PM display

**Decision:** Use native `Date` and `Intl.DateTimeFormat` (no Day.js or date-fns)

**Rationale:**
- Zero bundle size (built-in browser API)
- Sufficient for simple formatting needs
- `Intl.DateTimeFormat` handles 12-hour AM/PM
- Can add Day.js later if timezone complexity arises

**Consequences:**
- Manual date manipulation (no convenience methods)
- Must carefully handle timezone considerations
- Limited to browser-native date capabilities

---

### ADR-005: Direct Fetch (No OpenWeather SDK)

**Context:** Need to call OpenWeather API for forecast data

**Decision:** Use native `fetch` API directly (no SDK wrapper)

**Rationale:**
- Standard approach for OpenWeather API
- No additional dependencies
- Simple REST calls (query params + API key)
- Community uses direct fetch commonly

**Consequences:**
- Must implement retry and timeout logic manually
- Must parse OpenWeather response format
- No convenience methods or type safety from SDK

---

### ADR-006: Shadcn UI Over Material-UI or Chakra

**Context:** UX spec requires dark mode, glassmorphic design, accessibility

**Decision:** Use Shadcn UI (Radix UI + Tailwind)

**Rationale:**
- Copy-paste architecture (components owned by project)
- Full customization (not locked to theme system)
- Dark mode built-in
- WCAG 2.1 AA accessible by default (Radix UI)
- Tailwind integration (UX spec uses Tailwind v4)

**Consequences:**
- Must copy components into project (not npm package)
- Must maintain copied components
- Learning curve for Radix UI primitives

---

### ADR-007: Vercel for Deployment

**Context:** Need deployment platform for Next.js app

**Decision:** Deploy on Vercel

**Rationale:**
- Created by Next.js team (native optimization)
- Serverless functions for API routes
- Zero-config deployment
- Generous free tier (hobby projects)
- Marketplace integrations (Upstash Redis)

**Consequences:**
- Vendor lock-in to Vercel platform
- Serverless constraints (10s timeout, read-only filesystem except /tmp)
- Must use Vercel environment variables

---

_Generated by BMAD Architecture Workflow v1.3.2_

_Date: 2025-11-06_

_For: BMad_
