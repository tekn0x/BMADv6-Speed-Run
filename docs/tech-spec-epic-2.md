# Epic Technical Specification: Weather Intelligence Engine

Date: 2025-11-06
Author: BMad
Epic ID: 2
Status: Draft

---

## Overview

Epic 2 builds the core rain prediction intelligence for Will It Rain by integrating with OpenWeather API, processing 24-hour forecast data, and implementing sophisticated decision logic that determines if it will rain. This epic delivers the "brain" of the application - transforming raw weather data into clear, actionable YES/NO answers with contextual rainfall timing details.

The epic implements the complete backend intelligence layer that:
- Fetches forecast data for the next 24 hours from OpenWeather 5-day/3-hour Forecast API (free tier)
- Processes 3-hour interval forecasts (8 data points covering 24 hours)
- Identifies maximum rain probability across all forecast periods
- Detects continuous rain windows (periods where probability ≥40%)
- Calculates safe windows (clear periods between rain events)
- Applies the 50% probability threshold for YES/NO decisions
- Flags "close call" scenarios (40-49% probability) for user context
- Handles comprehensive error scenarios with retry logic
- Logs privacy-first analytics (location + timestamp only)

This foundation enables Epic 3's user experience by providing a reliable `/api/check-rain` endpoint that returns structured rain forecast data. The implementation follows architecture decisions for stateless operation, native Fetch API usage, Upstash Redis for analytics, and comprehensive error handling patterns.

## Objectives and Scope

**In Scope:**

- OpenWeather 5-day/3-hour Forecast API integration with authentication and error handling (Story 2.1)
- 24-hour forecast data retrieval and parsing in 3-hour intervals (Story 2.2)
- Rain probability calculation logic with max probability identification (Story 2.3)
- Rain window detection for continuous rain periods ≥40% (Story 2.4)
- Safe window calculation for clear periods between rain events (Story 2.5)
- Complete decision logic orchestration (YES/NO with contextual details) (Story 2.6)
- Privacy-first analytics logging using Upstash Redis (Story 2.7)
- Comprehensive error handling with retry logic and timeout management (Story 2.8)
- API route `/api/check-rain` implementation following Next.js patterns
- TypeScript interfaces for all data structures and API contracts
- Date/time formatting using native Intl.DateTimeFormat (12-hour AM/PM)
- Close call flagging for 40-49% probability scenarios

**Out of Scope:**

- Frontend UI components (Epic 3)
- User interaction and visual design (Epic 3)
- PWA service worker and advanced caching (Epic 4)
- Performance optimization and comprehensive testing (Epic 5)
- Extended forecast windows beyond 24 hours (Post-MVP)
- Multiple location comparison or saved searches (Explicitly excluded)
- Historical weather data or trends (Not needed for single forecast)
- Real-time weather updates or push notifications (Stateless by design)
- User authentication or personalization (Privacy-first, stateless)

**Success Criteria:**

- `/api/check-rain` endpoint returns YES/NO decision with <2 second response time
- OpenWeather API integration handles 1000 requests/day within free tier limits
- Rain windows accurately identify continuous rain periods with start/end times
- Safe windows correctly calculate clear periods between rain events
- Error handling gracefully manages API failures, timeouts, invalid locations
- Analytics logging never blocks main request flow (fire-and-forget)
- All TypeScript types enforce API contract correctness
- Upstash Redis integration succeeds for analytics without breaking forecasts
- 50% probability threshold correctly determines YES/NO answers
- Close call scenarios (40-49%) properly flagged for user context

## System Architecture Alignment

**Architecture Components Referenced:**

- **API Route:** `/app/api/check-rain/route.ts` (Next.js App Router serverless function)
- **Business Logic Layer:** `/lib/openweather.ts`, `/lib/rain-logic.ts`, `/lib/rain-windows.ts`
- **Data Access:** Native Fetch API for HTTP requests (ADR-005: No axios or SDK)
- **Analytics:** `/lib/analytics.ts` + `/lib/redis.ts` using Upstash Redis SDK
- **Error Handling:** `/lib/error-handler.ts` implementing retry pattern
- **Type Definitions:** `/types/api.ts`, `/types/weather.ts`, `/types/analytics.ts`

**Adherence to Architecture Decisions:**

**ADR-002: Stateless Architecture**
- No database for weather data (fresh API calls every request)
- No caching of forecasts (ensures real-time accuracy)
- Upstash Redis used only for append-only analytics logs

**ADR-003: Upstash Redis for Analytics**
- Serverless-native Redis via Vercel Marketplace integration
- Fire-and-forget logging pattern (fails silently if Redis unavailable)
- Privacy-first: location + timestamp only, no PII

**ADR-004: Native Date API**
- Uses `Intl.DateTimeFormat` for 12-hour AM/PM formatting
- Zero bundle size impact (built-in browser/Node API)
- Sufficient for rain window time display needs

**ADR-005: Direct Fetch (No SDK)**
- Native `fetch()` for OpenWeather API calls
- Manual retry logic and timeout handling
- No external HTTP library dependencies

**Constraints from Architecture:**

- API timeout: 5 seconds maximum (per NFR-P2 from PRD)
- Single retry on 5xx errors (retry pattern from architecture)
- Error responses must use standardized codes: `invalid_location`, `service_unavailable`, `timeout`, `network_error`
- Must use TypeScript strict mode (no `any` types)
- Analytics must be fire-and-forget (never block main flow)
- All API responses must follow contract defined in architecture.md

**Integration Points:**

- **Next.js API Routes** ← POST `/api/check-rain` ← Frontend (Epic 3)
- **OpenWeather API** ← HTTP GET ← `/lib/openweather.ts`
- **Upstash Redis** ← RPUSH analytics ← `/lib/analytics.ts`
- **TypeScript Compiler** validates types across all modules

## Detailed Design

### Services and Modules

| Module | Responsibility | Inputs | Outputs | Owner |
|--------|---------------|--------|---------|-------|
| **`/app/api/check-rain/route.ts`** | Main API endpoint orchestration | `{ location: string }` (POST body) | `RainCheckResponse` or `ErrorResponse` | API Route handler |
| **`/lib/openweather.ts`** | OpenWeather API client with retry/timeout | Location string, API key | 24-hour forecast data (3-hour intervals) | OpenWeather integration module |
| **`/lib/rain-logic.ts`** | Rain probability calculation | Forecast array (3-hour intervals) | Max probability, peak time, intensity, amount | Business logic module |
| **`/lib/rain-windows.ts`** | Rain window & safe period detection | Forecast array (3-hour intervals) | Rain windows array, safe windows array | Business logic module |
| **`/lib/analytics.ts`** | Privacy-first analytics logging | Location string, timestamp | Redis append operation | Analytics module |
| **`/lib/redis.ts`** | Upstash Redis client | Environment variables | Redis client instance | Data access module |
| **`/lib/error-handler.ts`** | Unified error handling & mapping | Error objects, HTTP responses | Standardized `ErrorResponse` | Error handling module |
| **`/lib/utils.ts`** | Date/time formatting utilities | Unix timestamp | Formatted time string (12-hour AM/PM) | Utility module |
| **`/types/api.ts`** | API contract type definitions | N/A | TypeScript interfaces | Type definitions |
| **`/types/weather.ts`** | OpenWeather data type definitions | N/A | TypeScript interfaces | Type definitions |
| **`/types/analytics.ts`** | Analytics log type definitions | N/A | TypeScript interfaces | Type definitions |

**Module Interaction Flow:**

```
Frontend (Epic 3)
    ↓ POST /api/check-rain
[/app/api/check-rain/route.ts]
    ↓ Parse & validate input
    ├─→ [/lib/openweather.ts] ← Fetch 24h forecast
    │       ↓ Call OpenWeather API with retry
    │       ↓ Handle errors/timeout
    │       ← Return forecast data
    ↓ Process forecast data
    ├─→ [/lib/rain-logic.ts] ← Calculate max probability, peak
    │       ← Return probability details
    ├─→ [/lib/rain-windows.ts] ← Detect rain/safe windows
    │       ← Return window arrays
    ├─→ [/lib/analytics.ts] ← Log search (fire-and-forget)
    │       ├─→ [/lib/redis.ts] ← Append to Redis
    │       │       ← Success/failure (ignored)
    ↓ Generate decision response
    ├─→ [/lib/error-handler.ts] ← Map any errors
    │       ← Return standardized error
    ↓ Return JSON response
Frontend ← RainCheckResponse or ErrorResponse
```

### Data Models and Contracts

**API Contract Types (`/types/api.ts`):**

```typescript
// Request body for POST /api/check-rain
export interface RainCheckRequest {
  location: string; // Zipcode (e.g., "94102") or city name (e.g., "San Francisco")
}

// Success response for rain forecast
export interface RainCheckResponse {
  willRain: boolean; // true if max probability ≥ 50%
  probability: number; // 0-100 (max probability across 24 hours)

  // Included only if willRain === true
  rainWindows?: RainWindow[];
  peakTime?: string; // Formatted time: "3:00 PM"
  intensity?: string; // "light" | "moderate" | "heavy"
  amount?: string; // e.g., "0.2 inches"
  safeWindows?: SafeWindow[];

  closeCall: boolean; // true if probability is 40-49%
}

// Rain period with start/end times
export interface RainWindow {
  start: string; // Formatted time: "2:00 PM"
  end: string;   // Formatted time: "5:00 PM"
}

// Clear period between rain events
export interface SafeWindow {
  start: string; // Formatted time: "5:00 PM"
  end: string;   // Formatted time: "9:00 PM" or "next day"
}

// Error response for all failure scenarios
export interface ErrorResponse {
  error: ErrorCode;
  message: string;
  suggestions?: string[]; // Only for invalid_location errors
}

// Standardized error codes
export type ErrorCode =
  | 'invalid_location'    // Location not found or invalid format
  | 'service_unavailable' // OpenWeather API failure or 5xx error
  | 'timeout'             // Request exceeded 5 seconds
  | 'network_error';      // Network connectivity issue
```

**OpenWeather API Types (`/types/weather.ts`):**

```typescript
// OpenWeather 5-day/3-hour Forecast API response
export interface OpenWeatherResponse {
  cod: string; // Response code (e.g., "200")
  cnt: number; // Number of data points
  list: ForecastData[]; // Forecast data in 3-hour intervals
  city: {
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    timezone: number;
  };
}

// Single forecast data point (3-hour interval)
export interface ForecastData {
  dt: number; // Unix timestamp (UTC)
  main: {
    temp: number; // Temperature in Fahrenheit
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: WeatherCondition[];
  clouds: {
    all: number; // Cloud coverage percentage
  };
  wind: {
    speed: number; // Wind speed in mph
    deg: number;
  };
  visibility: number;
  pop: number; // Precipitation probability (0.0 - 1.0)
  rain?: {
    '3h': number; // Rainfall in mm for the 3-hour period
  };
  dt_txt: string; // Forecast time in ISO 8601 format
}

// Weather condition descriptor
export interface WeatherCondition {
  id: number; // OpenWeather condition code
  main: string; // Group: "Rain", "Drizzle", etc.
  description: string; // Detail: "light rain", "moderate rain", "heavy intensity rain"
  icon: string; // Icon code (not used)
}

// Parsed forecast for internal processing
export interface ParsedForecast {
  time: Date;
  timestamp: number;
  probability: number; // 0-100 (converted from pop)
  intensity: string; // "light" | "moderate" | "heavy"
  amount: number; // Rainfall in inches (converted from mm)
}
```

**Analytics Types (`/types/analytics.ts`):**

```typescript
// Analytics log entry (privacy-first)
export interface AnalyticsEntry {
  location: string; // As entered by user (e.g., "San Francisco" or "94102")
  timestamp: string; // ISO 8601 format: "2025-11-06T14:30:00.000Z"
}

// Redis client configuration
export interface RedisConfig {
  url: string; // UPSTASH_REDIS_REST_URL from env
  token: string; // UPSTASH_REDIS_REST_TOKEN from env
}
```

**Internal Business Logic Types (`/lib/rain-logic.ts`):**

```typescript
// Result of rain probability calculation
export interface RainProbabilityResult {
  maxProbability: number; // 0-100
  peakTime: Date; // When max probability occurs
  peakHourData: ParsedForecast; // Full data for peak hour
  willRain: boolean; // true if maxProbability ≥ 50
  closeCall: boolean; // true if 40 ≤ maxProbability < 50
}

// Rain window detection result
export interface RainWindowResult {
  rainWindows: Array<{ start: Date; end: Date }>;
  safeWindows: Array<{ start: Date; end: Date }>;
}
```

**Data Normalization Rules:**

- **Probability:** OpenWeather returns 0.0-1.0, convert to 0-100 for user display
- **Rainfall amount:** OpenWeather returns mm, convert to inches (divide by 25.4)
- **Timestamps:** OpenWeather returns Unix timestamps (UTC), convert to user's local time for display
- **Intensity mapping:**
  - Light: 0.1-2.5 mm/hour (0.004-0.1 inches/hour)
  - Moderate: 2.5-7.6 mm/hour (0.1-0.3 inches/hour)
  - Heavy: >7.6 mm/hour (>0.3 inches/hour)
- **Time formatting:** Use `Intl.DateTimeFormat` with 12-hour AM/PM format

### APIs and Interfaces

**Primary API Endpoint: POST /api/check-rain**

**Request Specification:**
```http
POST /api/check-rain HTTP/1.1
Content-Type: application/json

{
  "location": "San Francisco"
}
```

**Success Response (YES - Rain Expected):**
```http
HTTP/1.1 200 OK
Content-Type: application/json

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

**Success Response (NO - No Rain Expected):**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "willRain": false,
  "probability": 35,
  "closeCall": false
}
```

**Success Response (Close Call - 40-49%):**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "willRain": false,
  "probability": 45,
  "closeCall": true
}
```

**Error Response (Invalid Location):**
```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "invalid_location",
  "message": "Location not found",
  "suggestions": ["Springfield, IL", "Springfield, MA", "Springfield, OH"]
}
```

**Error Response (API Failure):**
```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": "service_unavailable",
  "message": "Unable to get forecast right now. Please try again in a few moments."
}
```

**Error Response (Timeout):**
```http
HTTP/1.1 504 Gateway Timeout
Content-Type: application/json

{
  "error": "timeout",
  "message": "Request took too long. Please try again."
}
```

---

**OpenWeather 5-day/3-hour Forecast API Integration (Free Tier)**

**Endpoint:**
```
GET https://api.openweathermap.org/data/2.5/forecast
```

**Request Parameters:**
```
lat={latitude}     // From geocoding location input
lon={longitude}    // From geocoding location input
appid={OPENWEATHER_API_KEY}    // From environment variable
units=imperial     // Fahrenheit, mph
```

**Response Format:**
- Returns up to 40 forecast data points (5 days × 8 intervals per day)
- Each data point represents a 3-hour period
- For 24-hour forecast: Use first 8 data points from the `list` array

**Authentication:**
- API key passed as query parameter `appid`
- Stored in `OPENWEATHER_API_KEY` environment variable
- Never exposed to client-side code

**Rate Limits:**
- Free tier: 1,000 calls/day
- 60 calls/minute
- Sufficient for personal project

**Response Parsing:**
- Extract first 24 hours from `hourly` array
- Parse `dt` (Unix timestamp) to Date objects
- Extract `pop` (precipitation probability 0.0-1.0)
- Extract `rain['1h']` (rainfall in mm, if present)
- Extract `weather[0].description` for intensity

**Error Handling:**
- 401: Invalid API key → `service_unavailable`
- 404: Location not found → `invalid_location`
- 5xx: Server error → Retry once, then `service_unavailable`
- Timeout (>5s): → `timeout`
- Network error: → `network_error`

**Retry Strategy:**
```typescript
// Retry once on 5xx errors
async function fetchWithRetry(url: string, options: RequestInit) {
  const response = await fetch(url, options);

  if (response.status >= 500 && response.status < 600) {
    // Single retry attempt after 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    return await fetch(url, options);
  }

  return response;
}
```

**Timeout Implementation:**
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(url, {
    signal: controller.signal,
    ...options
  });
  clearTimeout(timeoutId);
  return response;
} catch (error) {
  if (error.name === 'AbortError') {
    throw new Error('timeout');
  }
  throw error;
}
```

---

**Upstash Redis Integration**

**Client Setup:**
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

**Analytics Logging Operation:**
```typescript
// Append analytics entry to Redis list
await redis.rpush('analytics:searches', JSON.stringify({
  location: 'San Francisco',
  timestamp: new Date().toISOString()
}));
```

**Fire-and-Forget Pattern:**
```typescript
export async function logSearch(location: string): Promise<void> {
  try {
    await redis.rpush('analytics:searches', JSON.stringify({
      location,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    // Never break the app for analytics
    console.error('Analytics logging failed:', error);
    // Fail silently - do not throw
  }
}
```

**Redis Configuration:**
- Environment variables auto-populated by Vercel Marketplace
- Free tier: 256MB storage, 500K commands/month
- Append-only logging (RPUSH command)
- No reads needed in MVP (analytics viewing is future enhancement)

---

**Internal Module Interfaces**

**`/lib/openweather.ts` Interface:**
```typescript
export async function fetchWeatherData(
  location: string
): Promise<OpenWeatherResponse> {
  // Returns parsed OpenWeather API response
  // Throws on errors (handled by error-handler.ts)
}
```

**`/lib/rain-logic.ts` Interface:**
```typescript
export function calculateRainProbability(
  hourlyData: HourlyForecast[]
): RainProbabilityResult {
  // Returns max probability, peak time, intensity, amount
}
```

**`/lib/rain-windows.ts` Interface:**
```typescript
export function detectRainWindows(
  hourlyData: HourlyForecast[]
): RainWindowResult {
  // Returns rain windows and safe windows
}
```

**`/lib/analytics.ts` Interface:**
```typescript
export async function logSearch(location: string): Promise<void> {
  // Fire-and-forget logging (never throws)
}
```

**`/lib/error-handler.ts` Interface:**
```typescript
export function mapErrorToResponse(error: Error): ErrorResponse {
  // Maps internal errors to standardized ErrorResponse
}

export function handleApiError(error: Error): NextResponse {
  // Returns Next.js response with proper status code
}
```

**`/lib/utils.ts` Interface:**
```typescript
export function formatTime(timestamp: number): string {
  // Converts Unix timestamp to "3:00 PM" format
  // Uses Intl.DateTimeFormat with 12-hour AM/PM
}
```

### Workflows and Sequencing

**Epic 2 Implementation Sequence:**

```
Story 2.1: Create OpenWeather API Integration Layer
    ↓ Creates: /lib/openweather.ts, /types/weather.ts
    ↓ Implements: API authentication, basic error handling
    ↓ Validation: Can fetch weather data for valid location

Story 2.2: Fetch and Parse 24-Hour Forecast Data
    ↓ Enhances: /lib/openweather.ts
    ↓ Creates: Data parsing logic, TypeScript interfaces
    ↓ Validation: 24 hours of forecast data correctly parsed

Story 2.3: Implement Rain Probability Calculation Logic
    ↓ Creates: /lib/rain-logic.ts
    ↓ Implements: Max probability finding, peak identification
    ↓ Validation: Correct YES/NO decision based on 50% threshold

Story 2.4: Implement Rain Window Detection
    ↓ Creates: /lib/rain-windows.ts (rain window logic)
    ↓ Implements: Continuous rain period detection (≥40%)
    ↓ Validation: Rain windows with accurate start/end times

Story 2.5: Implement Safe Window Calculation
    ↓ Enhances: /lib/rain-windows.ts (safe window logic)
    ↓ Implements: Clear period detection between rain events
    ↓ Validation: Safe windows correctly calculated

Story 2.6: Integrate Complete Decision Logic
    ↓ Creates: /app/api/check-rain/route.ts
    ↓ Implements: Orchestration of all modules
    ↓ Validation: Complete YES/NO response with details

Story 2.7: Add Privacy-First Analytics Logging
    ↓ Creates: /lib/analytics.ts, /lib/redis.ts, /types/analytics.ts
    ↓ Implements: Upstash Redis integration, fire-and-forget logging
    ↓ Validation: Analytics logged without blocking main flow

Story 2.8: Implement Comprehensive Error Handling
    ↓ Creates: /lib/error-handler.ts
    ↓ Implements: Retry logic, timeout handling, error mapping
    ↓ Validation: All error scenarios handled gracefully
    ↓
Epic 2 Complete ✅
```

**Story Dependencies:**

- Story 2.2 depends on Story 2.1 (needs OpenWeather client)
- Story 2.3 depends on Story 2.2 (needs parsed forecast data)
- Story 2.4 depends on Story 2.2 (needs forecast data structure)
- Story 2.5 depends on Story 2.4 (builds on rain window detection)
- Story 2.6 depends on Stories 2.3, 2.4, 2.5 (orchestrates all logic)
- Story 2.7 can be parallel to 2.6 (independent analytics system)
- Story 2.8 enhances Stories 2.1, 2.2, 2.6 (cross-cutting concern)

---

**Request Processing Workflow (Happy Path):**

```
1. Frontend sends POST /api/check-rain
   ↓
2. [route.ts] Parse request body → extract location
   ↓
3. [route.ts] Validate input (non-empty location)
   ↓
4. [openweather.ts] Fetch weather data
   ├─→ Call OpenWeather API with location + API key
   ├─→ Implement 5-second timeout
   ├─→ Retry once on 5xx errors
   ├─→ Parse JSON response
   └─→ Return hourly forecast array (24 hours)
   ↓
5. [rain-logic.ts] Calculate rain probability
   ├─→ Find max probability across 24 hours
   ├─→ Identify peak hour (when max occurs)
   ├─→ Extract intensity (light/moderate/heavy)
   ├─→ Extract rainfall amount (mm → inches)
   ├─→ Apply 50% threshold (YES/NO decision)
   └─→ Flag close call (40-49%)
   ↓
6. [rain-windows.ts] Detect rain & safe windows
   ├─→ Identify continuous rain periods (≥40%)
   ├─→ Group consecutive rainy hours
   ├─→ Format start/end times (12-hour AM/PM)
   ├─→ Calculate safe windows (gaps between rain)
   └─→ Return window arrays
   ↓
7. [analytics.ts] Log search (fire-and-forget)
   ├─→ Create analytics entry { location, timestamp }
   ├─→ [redis.ts] RPUSH to 'analytics:searches'
   ├─→ If fails: Log error, continue (don't throw)
   └─→ Never block main request flow
   ↓
8. [route.ts] Build response
   ├─→ If willRain === true: Include rain windows, peak, safe windows
   ├─→ If willRain === false: Include probability only
   ├─→ Add closeCall flag if 40-49%
   └─→ Return JSON with 200 OK
   ↓
9. Frontend receives RainCheckResponse
```

**Timing Breakdown (Target <2 seconds):**

- API call to OpenWeather: **~800ms** (network + API processing)
- Data parsing: **~50ms** (JSON parsing + type conversion)
- Rain logic calculations: **~20ms** (loop through 24 hours)
- Rain window detection: **~30ms** (window grouping logic)
- Response formatting: **~10ms** (JSON serialization)
- Analytics logging: **~100ms** (non-blocking, fire-and-forget)
- **Total:** **~910ms** typical case

---

**Error Handling Workflow:**

**Scenario 1: Invalid Location**
```
1. User enters "Sprangfield" (typo)
   ↓
2. [openweather.ts] Call OpenWeather API
   ↓
3. OpenWeather returns 404 (location not found)
   ↓
4. [error-handler.ts] Map to 'invalid_location' error
   ↓
5. [route.ts] Return 404 with suggestions (if available)
   ↓
6. Frontend displays error with correction suggestions
```

**Scenario 2: API Failure (5xx Error)**
```
1. [openweather.ts] Call OpenWeather API
   ↓
2. OpenWeather returns 500 (server error)
   ↓
3. [openweather.ts] Retry logic kicks in
   ├─→ Wait 1 second
   └─→ Retry same request
   ↓
4. If retry succeeds: Continue normal flow
   ↓
5. If retry fails:
   ├─→ [error-handler.ts] Map to 'service_unavailable'
   └─→ [route.ts] Return 500 with friendly message
   ↓
6. Frontend displays "Unable to get forecast right now"
```

**Scenario 3: Timeout (>5 seconds)**
```
1. [openweather.ts] Call OpenWeather API with AbortController
   ↓
2. Request exceeds 5 seconds
   ↓
3. AbortController triggers abort
   ↓
4. [openweather.ts] Catch AbortError
   ↓
5. [error-handler.ts] Map to 'timeout' error
   ↓
6. [route.ts] Return 504 Gateway Timeout
   ↓
7. Frontend displays "Request took too long"
```

**Scenario 4: Redis Analytics Failure**
```
1. [analytics.ts] Attempt to log search
   ↓
2. [redis.ts] RPUSH fails (Redis unavailable)
   ↓
3. [analytics.ts] Catch error
   ├─→ Log error to console
   ├─→ DO NOT throw (fire-and-forget pattern)
   └─→ Continue main request flow normally
   ↓
4. User receives forecast (analytics failure transparent)
```

---

**Data Flow Diagram:**

```
┌─────────────────┐
│   Frontend      │
│   (Epic 3)      │
└────────┬────────┘
         │ POST /api/check-rain
         │ { location: "San Francisco" }
         ↓
┌─────────────────────────────────────────┐
│  /app/api/check-rain/route.ts           │
│  1. Validate input                       │
│  2. Orchestrate business logic          │
│  3. Handle errors                        │
│  4. Format response                      │
└────┬──────────┬────────────┬─────────┬──┘
     │          │            │         │
     ↓          ↓            ↓         ↓
┌────────┐ ┌────────┐  ┌──────────┐ ┌──────────┐
│openw.ts│ │rain-   │  │rain-     │ │analytics │
│        │ │logic.ts│  │windows.ts│ │.ts       │
│Fetch   │ │Calc    │  │Detect    │ │Log       │
│weather │ │prob    │  │windows   │ │search    │
└───┬────┘ └────────┘  └──────────┘ └────┬─────┘
    │                                      │
    ↓                                      ↓
┌───────────────┐                    ┌─────────┐
│ OpenWeather   │                    │ Upstash │
│ API           │                    │ Redis   │
│ (External)    │                    │ (Cloud) │
└───────────────┘                    └─────────┘
```

---

**Concurrency Considerations:**

- OpenWeather API calls are synchronous (await)
- Rain logic and window detection are synchronous (pure functions)
- Analytics logging is asynchronous (fire-and-forget)
- No parallel processing within single request (sequential flow is fast enough)
- Multiple concurrent requests handled by Next.js serverless functions

## Non-Functional Requirements

### Performance

**NFR-P1: API Response Time**
- **Target:** < 2 seconds (95th percentile) from request to response
- **Breakdown:**
  - OpenWeather API call: < 1 second
  - Data processing: < 0.5 seconds
  - Response formatting: < 0.5 seconds
- **Measured:** End-to-end from POST /api/check-rain to JSON response
- **Acceptance Criteria:**
  - 95% of requests complete in < 2 seconds
  - No request exceeds 5 seconds (enforced timeout)
  - Logging confirms timing breakdown

**NFR-P2: OpenWeather API Timeout**
- **Target:** 5 seconds maximum
- **Implementation:** AbortController with 5-second timeout
- **Acceptance Criteria:**
  - Requests abort after 5 seconds
  - Timeout errors mapped to 'timeout' error code
  - User receives clear timeout message

**NFR-P3: Data Processing Efficiency**
- **Target:** Process 24 hours of forecast data in < 100ms
- **Includes:** Probability calculation, window detection, formatting
- **Acceptance Criteria:**
  - Rain logic completes in < 50ms
  - Window detection completes in < 50ms
  - No performance degradation with multiple rain periods

**NFR-P4: Analytics Logging Performance**
- **Target:** Never block main request flow
- **Pattern:** Fire-and-forget (asynchronous)
- **Acceptance Criteria:**
  - Redis append operation runs async
  - Failures logged but don't throw errors
  - Main response time unaffected by analytics

**NFR-P5: Memory Efficiency**
- **Target:** Minimal memory footprint for serverless functions
- **Constraint:** Vercel serverless functions have 1GB memory limit
- **Acceptance Criteria:**
  - No memory leaks in request processing
  - Forecast data garbage collected after response
  - No persistent in-memory state

**NFR-P6: Rate Limit Compliance**
- **OpenWeather Free Tier:** 1,000 calls/day, 60 calls/minute
- **Target:** Stay within limits for personal project usage
- **Acceptance Criteria:**
  - One API call per user request (no redundant calls)
  - No client-side caching that would waste API quota
  - Usage monitoring logged for future optimization

### Security

**NFR-S1: API Key Protection**
- **Requirement:** OpenWeather API key never exposed to client
- **Implementation:**
  - Stored in `OPENWEATHER_API_KEY` environment variable
  - Accessed only in server-side API route
  - Never included in client bundle
  - `.env.local` in `.gitignore`
- **Acceptance Criteria:**
  - API key not visible in browser DevTools
  - API key not in version control
  - Vercel environment variables configured for production

**NFR-S2: Input Sanitization**
- **Requirement:** Validate and sanitize user location input
- **Implementation:**
  - Check for non-empty location string
  - Limit input length (max 100 characters)
  - Pass location directly to OpenWeather (they handle validation)
- **Acceptance Criteria:**
  - Empty input rejected before API call
  - Excessively long inputs rejected
  - No SQL injection risk (no database)
  - No XSS risk (API responses are JSON, not rendered HTML)

**NFR-S3: HTTPS Only (Production)**
- **Requirement:** All API traffic over HTTPS
- **Implementation:** Vercel enforces HTTPS automatically
- **Acceptance Criteria:**
  - Production endpoint uses HTTPS
  - HTTP requests redirect to HTTPS
  - Not applicable for local development (localhost)

**NFR-S4: Error Information Leakage Prevention**
- **Requirement:** Never expose sensitive error details to users
- **Implementation:**
  - Catch all errors in error-handler.ts
  - Map to standardized error codes
  - Log full error details server-side only
  - Return user-friendly messages
- **Acceptance Criteria:**
  - No stack traces in API responses
  - No internal paths or environment details exposed
  - Technical errors logged server-side for debugging
  - User sees friendly error messages only

**NFR-S5: Redis Credentials Protection**
- **Requirement:** Upstash Redis credentials secure
- **Implementation:**
  - Stored in `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars
  - Auto-populated by Vercel Marketplace integration
  - Never committed to version control
- **Acceptance Criteria:**
  - Redis credentials not exposed to client
  - Environment variables configured in Vercel
  - Local development uses .env.local

**NFR-S6: No User Data Persistence (Privacy)**
- **Requirement:** No PII or user session data stored
- **Implementation:**
  - Stateless API (no cookies, no sessions)
  - Analytics logs location + timestamp only (no IP, user agent)
  - No user authentication or accounts
- **Acceptance Criteria:**
  - No cookies set by API
  - No session storage
  - Analytics data contains no PII
  - GDPR compliance through non-collection

### Reliability/Availability

**NFR-R1: Graceful Degradation on API Failure**
- **Requirement:** App handles OpenWeather API failures without crashing
- **Implementation:**
  - Retry once on 5xx errors (single retry after 1 second)
  - Timeout after 5 seconds if no response
  - Return structured error responses
  - Never throw unhandled exceptions
- **Acceptance Criteria:**
  - API route returns 500 with error message on failure
  - No server crashes from API errors
  - User receives friendly error message
  - Retry logic tested with simulated failures

**NFR-R2: Analytics Failure Isolation**
- **Requirement:** Analytics failures never break main functionality
- **Implementation:**
  - Fire-and-forget pattern (async, no await)
  - Try-catch around Redis operations
  - Log errors but don't throw
  - Main request continues regardless of analytics status
- **Acceptance Criteria:**
  - Redis down → user still gets forecast
  - Analytics errors logged to console
  - No error responses from analytics failures
  - Tested with Redis unavailable

**NFR-R3: Data Validation and Error Recovery**
- **Requirement:** Invalid or malformed API data handled gracefully
- **Implementation:**
  - Validate OpenWeather response structure
  - Handle missing or null fields
  - Default to safe values if data incomplete
  - Return error if data unusable
- **Acceptance Criteria:**
  - Missing `hourly` array → error response
  - Null probability values → treated as 0%
  - Malformed timestamps → error response
  - TypeScript types enforce structure

**NFR-R4: Serverless Function Stability**
- **Requirement:** API route operates reliably in Vercel serverless environment
- **Implementation:**
  - Stateless operation (no file system writes except /tmp)
  - No persistent connections (each request is isolated)
  - Environment variables loaded fresh each invocation
  - Cold start optimization (minimal dependencies)
- **Acceptance Criteria:**
  - Function executes successfully after cold start
  - No state pollution between requests
  - No memory leaks over multiple invocations
  - Cold start < 1 second

**NFR-R5: Error Rate Monitoring**
- **Target:** < 5% error rate under normal operation
- **Excludes:** User input errors (invalid locations)
- **Includes:** API failures, timeouts, unexpected errors
- **Acceptance Criteria:**
  - 95%+ of requests succeed (valid locations)
  - Error rates logged for monitoring
  - Spikes in errors trigger investigation

**NFR-R6: Retry Strategy Limits**
- **Requirement:** Prevent infinite retry loops
- **Implementation:**
  - Maximum 1 retry per request (single retry on 5xx)
  - No retry on 4xx errors (client errors)
  - No retry on timeout (already waited 5 seconds)
  - Exponential backoff not needed (single retry sufficient)
- **Acceptance Criteria:**
  - No request makes > 2 API calls (original + retry)
  - Retries only on 5xx status codes
  - Timeout errors do not retry

### Observability

**NFR-O1: Request Logging**
- **Requirement:** Log all API requests with key metadata
- **Implementation:**
  - Log location, timestamp, response status
  - Use console.log for Vercel function logs
  - Include request ID for tracing
  - Log timing data for performance monitoring
- **Acceptance Criteria:**
  - Every request logged to Vercel dashboard
  - Logs include location, status code, duration
  - Failed requests include error type
  - Logs searchable for debugging

**NFR-O2: Error Logging**
- **Requirement:** Detailed error logs for debugging without exposing to users
- **Implementation:**
  - Log full error stack traces server-side
  - Include OpenWeather API response codes
  - Log Redis connection errors
  - Separate user-facing errors from internal errors
- **Acceptance Criteria:**
  - All errors logged with stack traces
  - Error logs include request context
  - User receives sanitized error message
  - Logs accessible in Vercel dashboard

**NFR-O3: Performance Metrics Logging**
- **Requirement:** Track request timing for performance optimization
- **Implementation:**
  - Log OpenWeather API call duration
  - Log rain logic processing time
  - Log total request duration
  - Use console.time/console.timeEnd patterns
- **Acceptance Criteria:**
  - Timing data logged for each request
  - Breakdown shows API vs processing time
  - Performance regression detectable
  - Logs show 95th percentile timing

**NFR-O4: Analytics Event Logging**
- **Requirement:** Track analytics operations separately from main logs
- **Implementation:**
  - Log successful analytics writes
  - Log analytics failures (without throwing)
  - Include Redis operation status
  - Separate analytics logs from request logs
- **Acceptance Criteria:**
  - Analytics success/failure logged
  - Redis errors visible in logs
  - Analytics logs don't clutter request logs
  - Can identify analytics issues independently

**NFR-O5: Structured Logging Format**
- **Requirement:** Consistent, parseable log format
- **Implementation:**
```typescript
// Structured log example
console.log(JSON.stringify({
  event: 'rain_check_request',
  location: 'San Francisco',
  timestamp: new Date().toISOString(),
  duration_ms: 850,
  willRain: true,
  probability: 65,
  status: 'success'
}));
```
- **Acceptance Criteria:**
  - Logs are valid JSON
  - Consistent field names across logs
  - Timestamps in ISO 8601 format
  - Logs parseable by log aggregation tools

**NFR-O6: OpenWeather API Response Logging**
- **Requirement:** Log OpenWeather responses for debugging
- **Implementation:**
  - Log HTTP status codes
  - Log response time
  - Log error responses (sanitize sensitive data)
  - Never log full API responses (large payload)
- **Acceptance Criteria:**
  - API status codes logged
  - Rate limit headers logged (if present)
  - Error responses logged for debugging
  - Full payloads not logged (reduce noise)

**NFR-O7: Vercel Function Monitoring**
- **Requirement:** Leverage Vercel's built-in monitoring
- **Implementation:**
  - Vercel automatically tracks function invocations
  - Vercel logs show cold/warm starts
  - Vercel analytics track error rates
  - No custom APM needed for MVP
- **Acceptance Criteria:**
  - Function metrics visible in Vercel dashboard
  - Error rate tracking enabled
  - Response time tracking enabled
  - Cold start metrics visible

## Dependencies and Integrations

**Runtime Dependencies (package.json additions for Epic 2):**

```json
{
  "dependencies": {
    "@upstash/redis": "^1.25.0"
  }
}
```

**Note:** All other dependencies (Next.js, React, TypeScript) already installed in Epic 1.

---

**External Service Integrations:**

**1. OpenWeather 5-day/3-hour Forecast API**

- **Service:** OpenWeather 5-day/3-hour Forecast API (Free Tier)
- **Purpose:** Fetch 24-hour weather forecast data in 3-hour intervals
- **Endpoint:** `https://api.openweathermap.org/data/2.5/forecast`
- **Authentication:** API key via query parameter (`appid`)
- **Rate Limits:** 60 calls/minute, 1,000,000 calls/month (free tier)
- **Data Format:** JSON with 3-hour interval forecasts
- **Integration Point:** `/lib/openweather.ts`
- **Error Handling:** Retry once on 5xx, timeout after 5 seconds
- **Required Environment Variable:** `OPENWEATHER_API_KEY`
- **Setup Instructions:**
  1. Sign up at https://openweathermap.org/api
  2. Get free API key (automatically includes 5-day/3-hour Forecast API)
  3. Copy API key to `.env.local`
  4. Add to Vercel environment variables for production

**2. Upstash Redis**

- **Service:** Upstash Redis (serverless Redis)
- **Purpose:** Privacy-first analytics logging
- **Integration:** Vercel Marketplace (auto-configured)
- **Authentication:** REST URL + token from environment variables
- **Rate Limits:** 500K commands/month (free tier)
- **Data Format:** JSON strings in Redis LIST
- **Integration Point:** `/lib/redis.ts`, `/lib/analytics.ts`
- **Error Handling:** Fire-and-forget (failures don't break main flow)
- **Required Environment Variables:**
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- **Setup Instructions:**
  1. Install Upstash Redis from Vercel Marketplace
  2. Environment variables auto-populated by Vercel
  3. For local development: Copy values to `.env.local`

---

**Internal Module Dependencies:**

**Module Dependency Graph:**

```
/app/api/check-rain/route.ts
  ↓ depends on
  ├─→ /lib/openweather.ts
  │     ↓ depends on
  │     └─→ /types/weather.ts
  ├─→ /lib/rain-logic.ts
  │     ↓ depends on
  │     └─→ /types/weather.ts
  ├─→ /lib/rain-windows.ts
  │     ↓ depends on
  │     └─→ /types/weather.ts
  ├─→ /lib/analytics.ts
  │     ↓ depends on
  │     ├─→ /lib/redis.ts
  │     │     ↓ depends on
  │     │     └─→ /types/analytics.ts
  │     └─→ /types/analytics.ts
  ├─→ /lib/error-handler.ts
  │     ↓ depends on
  │     └─→ /types/api.ts
  ├─→ /lib/utils.ts (date formatting)
  └─→ /types/api.ts
```

**Key Dependencies:**

- **No circular dependencies** (enforced by TypeScript)
- **Business logic modules are pure functions** (rain-logic, rain-windows)
- **Data access isolated** (openweather.ts, redis.ts)
- **Error handling centralized** (error-handler.ts)

---

**Environment Variable Requirements:**

**Required for Epic 2:**

```bash
# .env.local (local development)
OPENWEATHER_API_KEY=your_api_key_here
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

**Required for Production (Vercel):**

- Configure in Vercel dashboard → Project Settings → Environment Variables
- `OPENWEATHER_API_KEY`: Manual entry
- `UPSTASH_REDIS_REST_URL`: Auto-populated by Vercel Marketplace
- `UPSTASH_REDIS_REST_TOKEN`: Auto-populated by Vercel Marketplace

**Validation:**

- Missing `OPENWEATHER_API_KEY` → API calls fail immediately
- Missing Redis credentials → Analytics logging fails silently (app continues)
- TypeScript enforces non-null environment variable access

---

**System Requirements:**

- **Node.js:** v18+ (required by Next.js 15+)
- **Internet Connection:** Required for OpenWeather API and Redis
- **Network Access:** Outbound HTTPS to:
  - `api.openweathermap.org` (OpenWeather)
  - `*.upstash.io` (Upstash Redis)
- **No Database:** Epic 2 is stateless (no PostgreSQL, MongoDB, etc.)

---

**Version Constraints:**

| Dependency | Version | Reason |
|------------|---------|--------|
| `@upstash/redis` | ^1.25.0 | Latest stable, serverless-optimized |
| Node.js | 18.0.0+ | Required by Next.js 15 |
| Next.js | 15.0.0+ | Already installed in Epic 1 |
| TypeScript | 5.3.0+ | Already installed in Epic 1 |

---

**Integration Testing Requirements:**

**1. OpenWeather API Integration Test**

```typescript
// Test: Verify API connection and data parsing
test('OpenWeather API returns 24-hour forecast', async () => {
  const data = await fetchWeatherData('San Francisco');
  expect(data.hourly).toHaveLength(24);
  expect(data.hourly[0].pop).toBeDefined();
});
```

**2. Upstash Redis Integration Test**

```typescript
// Test: Verify Redis connection and logging
test('Analytics logging succeeds', async () => {
  await logSearch('San Francisco');
  // Fire-and-forget, no assertion on success
  // Just verify no errors thrown
});
```

**3. End-to-End Integration Test**

```typescript
// Test: Complete flow from request to response
test('POST /api/check-rain returns forecast', async () => {
  const response = await POST('/api/check-rain', {
    body: JSON.stringify({ location: 'San Francisco' })
  });
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.willRain).toBeDefined();
  expect(data.probability).toBeGreaterThanOrEqual(0);
});
```

---

**Deployment Dependencies:**

**Vercel Platform:**

- Next.js 15 serverless functions (automatic)
- Environment variable management (manual configuration)
- HTTPS enforcement (automatic)
- Function logs and monitoring (automatic)

**No Additional Infrastructure:**

- No CDN configuration needed (Vercel handles)
- No load balancer needed (serverless scales automatically)
- No database servers (stateless architecture)
- No message queues (synchronous processing)

---

**Third-Party Service Agreements:**

**OpenWeather:**
- Terms of Service: https://openweathermap.org/terms
- Free tier limitations: 1,000 calls/day
- No credit card required for free tier
- Attribution required in UI (handled in Epic 3)

**Upstash:**
- Terms of Service: https://upstash.com/terms
- Free tier limitations: 256MB storage, 500K commands/month
- No credit card required for free tier
- Vercel Marketplace integration simplifies setup

---

**Dependency Risk Assessment:**

| Dependency | Risk | Impact | Mitigation |
|------------|------|--------|------------|
| **OpenWeather API downtime** | Medium | High (app unusable) | Retry logic, clear error messages, future: consider fallback API |
| **Upstash Redis downtime** | Low | Low (analytics only) | Fire-and-forget pattern, app continues without analytics |
| **Rate limit exceeded (OpenWeather)** | Low | Medium (temporary outage) | Monitor usage, future: implement client-side caching |
| **API key leak** | Medium | High (security breach) | Environment variables, .gitignore, Vercel secrets |
| **Breaking API changes (OpenWeather)** | Low | High (app breaks) | Use stable 2.5 API endpoint, monitor release notes |

---

**Integration Checklist:**

**Before Epic 2 Development:**
- [ ] OpenWeather account created
- [ ] Free API key obtained (includes 5-day/3-hour Forecast API access)
- [ ] API key stored in `.env.local`
- [ ] Upstash Redis installed from Vercel Marketplace
- [ ] Redis environment variables verified
- [ ] Test API call to OpenWeather successful
- [ ] Test Redis connection successful

**During Epic 2 Development:**
- [ ] All environment variables loaded correctly
- [ ] OpenWeather API returns expected data structure
- [ ] Redis logging works without blocking requests
- [ ] Error handling tested with simulated failures
- [ ] Retry logic validated
- [ ] Timeout handling validated

**Before Epic 2 Completion:**
- [ ] Production environment variables configured in Vercel
- [ ] API integration tested in staging environment
- [ ] Rate limits monitored and logged
- [ ] Error scenarios documented
- [ ] All integration tests passing

## Acceptance Criteria (Authoritative)

**Epic-Level Acceptance Criteria:**

**AC-1: API Endpoint Operational**
- ✅ POST `/api/check-rain` endpoint accepts `{ location: string }` requests
- ✅ Returns 200 status with `RainCheckResponse` for valid locations
- ✅ Returns appropriate error status codes (404, 500, 504) with `ErrorResponse`
- ✅ Response time < 2 seconds for 95% of requests
- ✅ No unhandled exceptions or server crashes

**AC-2: OpenWeather API Integration**
- ✅ Successfully fetches 24-hour forecast (3-hour intervals) from OpenWeather 5-day Forecast API
- ✅ Handles location geocoding via OpenWeather Geocoding API
- ✅ Implements 5-second timeout with AbortController
- ✅ Retries once on 5xx errors with 1-second delay
- ✅ Parses JSON response into typed TypeScript interfaces
- ✅ API key secured in environment variables, never exposed to client

**AC-3: Rain Probability Calculation**
- ✅ Identifies maximum rain probability across 24 hours (0-100%)
- ✅ Applies 50% threshold: ≥50% = YES (willRain: true), <50% = NO (willRain: false)
- ✅ Flags "close call" scenarios when probability is 40-49%
- ✅ Identifies peak rain hour with time, intensity, and rainfall amount
- ✅ Converts OpenWeather data: probability (0.0-1.0 → 0-100), rainfall (mm → inches)
- ✅ Handles edge cases: 0% probability, 100% probability, no rain data

**AC-4: Rain Window Detection**
- ✅ Detects continuous rain windows where probability ≥40% for consecutive hours
- ✅ Groups consecutive rainy hours into single windows
- ✅ Formats start/end times using 12-hour AM/PM format (e.g., "2:00 PM - 5:00 PM")
- ✅ Returns empty array when willRain = false (no rain windows)
- ✅ Handles multiple non-contiguous rain periods correctly

**AC-5: Safe Window Calculation**
- ✅ Identifies clear periods (probability <40%) between rain events
- ✅ Calculates gaps between rain windows as safe windows
- ✅ Handles "after last rain" safe windows (e.g., "11:00 PM - next day")
- ✅ Returns empty array when no rain events or single continuous rain
- ✅ Formats safe window times consistently with rain windows

**AC-6: Privacy-First Analytics**
- ✅ Logs each search to Upstash Redis with location + timestamp only
- ✅ Uses fire-and-forget pattern (async, never blocks main request)
- ✅ Analytics failures logged to console but don't throw errors
- ✅ Main forecast functionality works even if Redis unavailable
- ✅ No PII collected: no IP addresses, user agents, or cookies

**AC-7: Comprehensive Error Handling**
- ✅ Invalid location (404) → Returns `invalid_location` error with suggestions
- ✅ API failure (5xx) → Retries once, then returns `service_unavailable` error
- ✅ Timeout (>5s) → Returns `timeout` error with friendly message
- ✅ Network error → Returns `network_error` error
- ✅ All errors return standardized `ErrorResponse` format
- ✅ No technical details or stack traces exposed to users
- ✅ All errors logged server-side with full context

**AC-8: TypeScript Type Safety**
- ✅ All API contracts defined in `/types/api.ts`
- ✅ All OpenWeather data typed in `/types/weather.ts`
- ✅ All analytics data typed in `/types/analytics.ts`
- ✅ TypeScript strict mode enforced (no `any` types)
- ✅ All modules compile without type errors

---

**Story-Level Acceptance Criteria (Traceable to Stories 2.1-2.8):**

**Story 2.1: Create OpenWeather API Integration Layer**
- ✅ `/lib/openweather.ts` module created
- ✅ Function `fetchWeatherData(location: string)` implemented
- ✅ API key loaded from `OPENWEATHER_API_KEY` environment variable
- ✅ Geocoding + forecast fetch in two API calls (Geocoding API + 5-day Forecast API)
- ✅ Returns typed `OpenWeatherResponse` with 24-hour `hourly` array
- ✅ Basic error handling: throws on API failure (handled by error-handler later)

**Story 2.2: Fetch and Parse 24-Hour Forecast Data**
- ✅ Extracts first 24 hours from OpenWeather `hourly` array
- ✅ Parses Unix timestamps (`dt`) to Date objects
- ✅ Extracts precipitation probability (`pop`) and converts 0.0-1.0 → 0-100
- ✅ Extracts rainfall amount (`rain['1h']`) and converts mm → inches
- ✅ Extracts weather description for intensity mapping
- ✅ Returns array of `ParsedForecast` objects

**Story 2.3: Implement Rain Probability Calculation Logic**
- ✅ `/lib/rain-logic.ts` module created
- ✅ Function `calculateRainProbability(hourlyData)` implemented
- ✅ Finds maximum probability across 24 hours
- ✅ Identifies peak hour (when max probability occurs)
- ✅ Extracts peak intensity: "light", "moderate", or "heavy"
- ✅ Extracts peak rainfall amount in inches
- ✅ Returns `willRain` boolean (≥50% = true)
- ✅ Returns `closeCall` boolean (40-49% = true)

**Story 2.4: Implement Rain Window Detection**
- ✅ `/lib/rain-windows.ts` module created
- ✅ Function `detectRainWindows(hourlyData)` implemented
- ✅ Identifies hours where probability ≥40%
- ✅ Groups consecutive rainy hours into windows
- ✅ Returns array of `{ start: Date, end: Date }` rain windows
- ✅ Formats times using `/lib/utils.ts` helper (12-hour AM/PM)

**Story 2.5: Implement Safe Window Calculation**
- ✅ Function `calculateSafeWindows(hourlyData, rainWindows)` implemented
- ✅ Identifies gaps between rain windows
- ✅ Handles "before first rain" and "after last rain" periods
- ✅ Returns array of `{ start: Date, end: Date }` safe windows
- ✅ Formats times consistently with rain windows

**Story 2.6: Integrate Complete Decision Logic**
- ✅ `/app/api/check-rain/route.ts` API route created
- ✅ POST handler parses request body and validates location input
- ✅ Orchestrates calls to openweather.ts, rain-logic.ts, rain-windows.ts
- ✅ Builds complete `RainCheckResponse` with all fields
- ✅ Returns 200 with forecast data on success
- ✅ Includes rain windows, peak details, safe windows only if willRain = true
- ✅ Includes `closeCall` flag for 40-49% probabilities

**Story 2.7: Add Privacy-First Analytics Logging**
- ✅ `/lib/redis.ts` module created with Upstash Redis client
- ✅ `/lib/analytics.ts` module created with `logSearch()` function
- ✅ `/types/analytics.ts` created with `AnalyticsEntry` interface
- ✅ Redis client initialized with environment variables
- ✅ `logSearch()` appends JSON entry to `analytics:searches` list
- ✅ Fire-and-forget pattern: errors caught and logged, never thrown
- ✅ Analytics called from API route after forecast processing

**Story 2.8: Implement Comprehensive Error Handling**
- ✅ `/lib/error-handler.ts` module created
- ✅ Function `mapErrorToResponse(error)` maps errors to standardized codes
- ✅ Function `handleApiError(error)` returns Next.js response with status code
- ✅ Timeout errors (AbortError) mapped to `timeout` error code
- ✅ 404 errors mapped to `invalid_location` error code
- ✅ 5xx errors mapped to `service_unavailable` error code
- ✅ Network errors mapped to `network_error` error code
- ✅ All errors logged server-side with stack traces
- ✅ User-facing errors contain friendly messages only

---

**Functional Requirements Coverage:**

| Requirement | Acceptance Criteria | Status |
|-------------|---------------------|--------|
| **FR2.1:** Fetch 24-hour forecast | AC-2: OpenWeather integration, Story 2.1-2.2 | ✅ |
| **FR2.2:** Calculate max probability | AC-3: Rain probability calculation, Story 2.3 | ✅ |
| **FR2.3:** Detect rain windows | AC-4: Rain window detection, Story 2.4 | ✅ |
| **FR2.4:** Calculate safe windows | AC-5: Safe window calculation, Story 2.5 | ✅ |
| **FR2.5:** Apply 50% threshold | AC-3: YES/NO decision logic, Story 2.3 | ✅ |
| **FR2.6:** Flag close calls | AC-3: Close call detection, Story 2.3 | ✅ |
| **FR2.7:** Log analytics | AC-6: Privacy-first analytics, Story 2.7 | ✅ |
| **FR2.8:** Handle errors | AC-7: Comprehensive error handling, Story 2.8 | ✅ |

---

**Non-Functional Requirements Coverage:**

| Requirement | Acceptance Criteria | Status |
|-------------|---------------------|--------|
| **NFR-P1:** Response time <2s | AC-1: API operational, performance logged | ✅ |
| **NFR-P2:** Timeout at 5s | AC-2: AbortController implementation | ✅ |
| **NFR-S1:** API key protection | AC-2: Environment variable security | ✅ |
| **NFR-S2:** Input sanitization | AC-1: Input validation | ✅ |
| **NFR-S6:** Privacy (no PII) | AC-6: Analytics logs location only | ✅ |
| **NFR-R1:** Graceful degradation | AC-7: Error handling | ✅ |
| **NFR-R2:** Analytics isolation | AC-6: Fire-and-forget pattern | ✅ |
| **NFR-O1:** Request logging | AC-7: All requests logged | ✅ |

---

**Testing Validation Criteria:**

**Manual Testing:**
- [ ] POST valid location (e.g., "San Francisco") → Returns 200 with forecast
- [ ] POST invalid location (e.g., "Sprangfield") → Returns 404 with error
- [ ] Simulate OpenWeather downtime → Returns 500 with error
- [ ] Simulate timeout (>5s) → Returns 504 with error
- [ ] Check Redis logs → Analytics entries present
- [ ] Disable Redis → Forecast still works
- [ ] Check browser DevTools → API key not visible
- [ ] Verify 50% threshold → 49% = NO, 50% = YES
- [ ] Verify close call flag → 40-49% has closeCall: true

**Automated Testing (Epic 5):**
- Unit tests for rain-logic.ts (probability calculation)
- Unit tests for rain-windows.ts (window detection)
- Integration test for OpenWeather API
- Integration test for Redis analytics
- E2E test for /api/check-rain endpoint
- Error scenario tests (timeout, 404, 5xx)

---

**Definition of Done (DoD) for Epic 2:**

- [ ] All 8 stories (2.1-2.8) completed and merged
- [ ] All epic-level acceptance criteria met
- [ ] `/api/check-rain` endpoint operational and tested
- [ ] OpenWeather API integration working with retry/timeout
- [ ] Rain probability, windows, and safe windows calculated correctly
- [ ] Analytics logging to Redis without blocking requests
- [ ] Error handling covers all failure scenarios
- [ ] TypeScript compiles without errors
- [ ] Environment variables documented in README
- [ ] Manual testing checklist completed
- [ ] No known critical bugs
- [ ] Code reviewed by peer (if team project)
- [ ] Epic 2 marked as complete in sprint-status.yaml
- [ ] Ready for Epic 3 (frontend UI can call the API)

## Traceability Mapping

| Acceptance Criteria | Spec Section | Component/File | Test Idea |
|---------------------|--------------|----------------|-----------|
| **AC-1:** API endpoint operational | APIs & Interfaces | `/app/api/check-rain/route.ts` | POST request with valid location, verify 200 response |
| **AC-2:** OpenWeather integration | External Integrations | `/lib/openweather.ts`, `/types/weather.ts` | Mock OpenWeather API, verify retry/timeout logic |
| **AC-3:** Rain probability calculation | Business Logic | `/lib/rain-logic.ts` | Unit test with sample forecast data, verify 50% threshold |
| **AC-4:** Rain window detection | Business Logic | `/lib/rain-windows.ts` | Unit test with multi-rain periods, verify grouping |
| **AC-5:** Safe window calculation | Business Logic | `/lib/rain-windows.ts` | Unit test with rain gaps, verify safe period identification |
| **AC-6:** Privacy-first analytics | Analytics | `/lib/analytics.ts`, `/lib/redis.ts` | Disable Redis, verify forecast still works |
| **AC-7:** Comprehensive error handling | Error Handling | `/lib/error-handler.ts` | Simulate 404, 5xx, timeout; verify error responses |
| **AC-8:** TypeScript type safety | Type Definitions | `/types/*.ts` | Run `tsc --noEmit`, verify no type errors |
| **Story 2.1:** OpenWeather API layer | OpenWeather Integration | `/lib/openweather.ts` | Call with "San Francisco", verify hourly array length |
| **Story 2.2:** Parse forecast data | Data Parsing | `/lib/openweather.ts` | Check probability conversion (0.0-1.0 → 0-100) |
| **Story 2.3:** Probability calculation | Rain Logic | `/lib/rain-logic.ts` | Test max probability finding, peak identification |
| **Story 2.4:** Rain window detection | Window Logic | `/lib/rain-windows.ts` | Test consecutive hour grouping |
| **Story 2.5:** Safe window calculation | Window Logic | `/lib/rain-windows.ts` | Test gap detection between rain events |
| **Story 2.6:** Complete decision logic | API Orchestration | `/app/api/check-rain/route.ts` | E2E test POST → verify response structure |
| **Story 2.7:** Analytics logging | Analytics Integration | `/lib/analytics.ts` | Check Redis list for entries after requests |
| **Story 2.8:** Error handling | Error Management | `/lib/error-handler.ts` | Test error mapping for all error types |

---

**PRD Requirement Traceability:**

| PRD Requirement | Epic 2 Component | Acceptance Criteria | Verification Method |
|-----------------|------------------|---------------------|---------------------|
| **FR1:** Display YES/NO answer | Rain probability logic | AC-3 | POST valid location, check `willRain` boolean |
| **FR2:** Show probability percentage | Rain probability logic | AC-3 | Verify `probability` field (0-100) |
| **FR3:** Show rain timing (if YES) | Rain window detection | AC-4 | Verify `rainWindows` array with start/end times |
| **FR4:** Show peak details | Rain probability logic | AC-3 | Verify `peakTime`, `intensity`, `amount` fields |
| **FR5:** Show safe windows | Safe window calculation | AC-5 | Verify `safeWindows` array |
| **FR6:** 24-hour forecast window | OpenWeather integration | AC-2 | Verify `hourly` array has 24 entries |
| **FR7:** 50% probability threshold | Rain probability logic | AC-3 | Test 49% → NO, 50% → YES |
| **FR8:** Privacy-first analytics | Analytics logging | AC-6 | Verify Redis entries contain no PII |
| **FR9:** Error messages | Error handling | AC-7 | Test invalid location, verify friendly message |
| **NFR-P2:** <2 second response | API performance | AC-1 | Measure end-to-end time with performance.now() |
| **NFR-S2:** API key security | Environment variables | AC-2 | Check browser DevTools, verify key not exposed |
| **NFR-R1:** Graceful degradation | Error handling | AC-7 | Simulate API failure, verify error response |

---

**Architecture Decision Traceability:**

| ADR | Decision | Epic 2 Implementation | Validation |
|-----|----------|----------------------|------------|
| **ADR-002** | Stateless architecture | No database, fresh API calls | Verify no state persistence between requests |
| **ADR-003** | Upstash Redis for analytics | `/lib/redis.ts` using Upstash SDK | Check Redis integration, fire-and-forget pattern |
| **ADR-004** | Native Date API | `/lib/utils.ts` with `Intl.DateTimeFormat` | Verify time formatting (12-hour AM/PM) |
| **ADR-005** | Direct Fetch (no SDK) | `/lib/openweather.ts` using native `fetch()` | Check no axios or SDK dependencies |

---

**File-Level Traceability Matrix:**

| File Path | Purpose | Stories | Acceptance Criteria | Test Coverage |
|-----------|---------|---------|---------------------|---------------|
| `/app/api/check-rain/route.ts` | Main API endpoint | 2.6 | AC-1, AC-7 | E2E integration test |
| `/lib/openweather.ts` | OpenWeather API client | 2.1, 2.2, 2.8 | AC-2 | Mock API responses, retry/timeout tests |
| `/lib/rain-logic.ts` | Rain probability calculation | 2.3 | AC-3 | Unit tests for max prob, peak, threshold |
| `/lib/rain-windows.ts` | Rain/safe window detection | 2.4, 2.5 | AC-4, AC-5 | Unit tests for window grouping |
| `/lib/analytics.ts` | Analytics logging | 2.7 | AC-6 | Fire-and-forget validation |
| `/lib/redis.ts` | Upstash Redis client | 2.7 | AC-6 | Connection test, error handling |
| `/lib/error-handler.ts` | Error mapping | 2.8 | AC-7 | Error scenario tests |
| `/lib/utils.ts` | Date/time formatting | 2.4, 2.5 | AC-4, AC-5 | Format validation (12-hour AM/PM) |
| `/types/api.ts` | API contract types | All | AC-8 | TypeScript compilation |
| `/types/weather.ts` | OpenWeather data types | 2.1, 2.2 | AC-8 | TypeScript compilation |
| `/types/analytics.ts` | Analytics types | 2.7 | AC-8 | TypeScript compilation |

---

**Cross-Epic Traceability:**

| Epic 2 Output | Epic 3 Dependency | Integration Point |
|---------------|-------------------|-------------------|
| `/api/check-rain` endpoint | Frontend form submission | POST request from client |
| `RainCheckResponse` interface | Frontend display components | Type-safe API contract |
| `ErrorResponse` interface | Frontend error handling | Standardized error display |
| Rain window data | Frontend detail cards | YES answer details |
| Safe window data | Frontend detail cards | Clear period information |
| Close call flag | Frontend warning badge | 40-49% probability messaging |

---

**Requirement → Code → Test Traceability:**

**Example: FR1 - Display YES/NO answer**

1. **PRD Requirement:** "Display a clear YES or NO answer"
2. **Epic 2 Requirement:** Calculate rain probability and apply 50% threshold
3. **Acceptance Criteria:** AC-3 (Rain probability calculation)
4. **Story:** Story 2.3 (Implement Rain Probability Calculation Logic)
5. **Code File:** `/lib/rain-logic.ts` - `calculateRainProbability()` function
6. **Data Model:** `RainProbabilityResult` interface with `willRain` boolean
7. **API Contract:** `RainCheckResponse` interface with `willRain` field
8. **Test:** Unit test - "should return willRain: true when probability ≥ 50%"
9. **Validation:** E2E test - POST San Francisco, verify `response.willRain === true/false`

---

**Test Coverage Mapping:**

| Component | Unit Tests | Integration Tests | E2E Tests | Coverage Target |
|-----------|-----------|-------------------|-----------|-----------------|
| `/lib/rain-logic.ts` | ✅ Probability calculation, peak finding | N/A | N/A | 90%+ |
| `/lib/rain-windows.ts` | ✅ Window grouping, gap detection | N/A | N/A | 90%+ |
| `/lib/openweather.ts` | ⚠️ Partial (mock API) | ✅ Live API test | N/A | 70%+ |
| `/lib/analytics.ts` | ⚠️ Partial (mock Redis) | ✅ Live Redis test | N/A | 70%+ |
| `/lib/error-handler.ts` | ✅ Error mapping | N/A | N/A | 100% |
| `/lib/utils.ts` | ✅ Date formatting | N/A | N/A | 100% |
| `/app/api/check-rain/route.ts` | N/A | ✅ API route test | ✅ Full flow | 80%+ |

**Note:** Epic 5 will implement comprehensive automated testing. Epic 2 focuses on manual testing validation.

---

**Epic 2 → Epic 3 Handoff Checklist:**

- [ ] `/api/check-rain` endpoint documented and operational
- [ ] `RainCheckResponse` TypeScript interface exported
- [ ] `ErrorResponse` TypeScript interface exported
- [ ] API contract examples provided (YES, NO, close call, errors)
- [ ] Environment variable setup documented
- [ ] Error code meanings documented
- [ ] Example curl commands for testing provided
- [ ] Frontend team can call API from localhost
- [ ] No breaking changes to API contract without Epic 3 notification

## Risks, Assumptions, Open Questions

**Risks:**

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy | Owner |
|---------|------------------|-------------|--------|---------------------|-------|
| **RISK-2.1** | OpenWeather API changes breaking integration | Low | High | Version pin API 3.0, monitor release notes, add API version to URL | Dev Team |
| **RISK-2.2** | OpenWeather free tier rate limit exceeded during development | Medium | Medium | Track API usage, implement request logging, use test data for development | Dev Team |
| **RISK-2.3** | OpenWeather API downtime affecting app availability | Medium | High | Implement retry logic (✅), clear error messages (✅), future: consider fallback API | Dev Team |
| **RISK-2.4** | API key accidentally committed to version control | Medium | High | .gitignore .env.local (✅), pre-commit hook to scan for keys (future), use Vercel env vars | Dev Team |
| **RISK-2.5** | Upstash Redis downtime blocking analytics | Low | Low | Fire-and-forget pattern (✅), analytics failures don't break app | Dev Team |
| **RISK-2.6** | Time zone handling errors in rain window display | Medium | Medium | Use OpenWeather's timezone field, test across timezones, document TZ behavior | Dev Team |
| **RISK-2.7** | Rain probability calculation logic errors (false YES/NO) | Low | High | Unit tests for edge cases (✅), manual testing with real data, peer code review | Dev Team |
| **RISK-2.8** | Performance degradation under concurrent requests | Low | Medium | Leverage Vercel serverless auto-scaling, monitor function logs, optimize if needed | DevOps |
| **RISK-2.9** | TypeScript type errors in production build | Low | High | TypeScript strict mode (✅), CI/CD type checking (Epic 5), pre-deploy validation | Dev Team |
| **RISK-2.10** | Missing environment variables in production | Medium | High | Vercel env var validation, .env.example documentation (✅), deployment checklist | DevOps |

---

**Assumptions:**

| Assumption ID | Assumption | Validity Check | Risk if Wrong | Mitigation |
|---------------|------------|----------------|---------------|------------|
| **ASSUM-2.1** | OpenWeather 5-day/3-hour Forecast API free tier provides 60 calls/min, 1M calls/month | ✅ Verified on openweathermap.org | App unusable if limit lower | Monitor usage patterns, free tier is generous |
| **ASSUM-2.2** | 24 hours of forecast data is sufficient for user needs | ✅ Validated in PRD | Users want longer forecast | PRD explicitly scopes to 24 hours, future enhancement if requested |
| **ASSUM-2.3** | 50% probability threshold is appropriate for YES/NO decision | ⚠️ Needs user testing | Users disagree with threshold | Implement close call flag (✅), gather user feedback, adjust if needed |
| **ASSUM-2.4** | OpenWeather location geocoding handles all user inputs correctly | ⚠️ Needs testing | Invalid/ambiguous locations | Test with various inputs, provide suggestions on errors (✅) |
| **ASSUM-2.5** | Rain windows ≥40% probability threshold is reasonable | ⚠️ Needs validation | Users want different threshold | Derived from UX spec, gather feedback, make configurable if needed |
| **ASSUM-2.6** | Upstash Redis free tier (500K commands/month) is sufficient for analytics | ✅ Likely true for personal project | Usage exceeds limit | Monitor usage, Redis failures are non-blocking (✅) |
| **ASSUM-2.7** | Users understand 12-hour AM/PM time format | ✅ Standard US format | International users confused | PRD targets US users, future: add 24-hour format option |
| **ASSUM-2.8** | Next.js 15 serverless functions handle Epic 2 logic without timeout | ✅ Target <2 second response | Functions timeout (10s limit) | Performance testing (Epic 5), optimize if needed |
| **ASSUM-2.9** | OpenWeather API returns consistent data structure | ✅ API versioned (3.0) | API structure changes | Version pinning (✅), TypeScript validation (✅) |
| **ASSUM-2.10** | No need for request deduplication or caching in Epic 2 | ✅ Stateless architecture decision | Duplicate requests waste API quota | Architecture explicitly stateless, caching is future enhancement |

---

**Open Questions:**

| Question ID | Question | Impact | Owner | Resolution Needed By | Status |
|-------------|----------|--------|-------|---------------------|--------|
| **Q-2.1** | Should we implement client-side request debouncing to reduce API calls? | Medium | Product | Epic 3 planning | 🟡 Deferred to Epic 3 (frontend concern) |
| **Q-2.2** | How should we handle locations with multiple matches (e.g., "Springfield")? | Low | Product | Epic 2 development | 🟡 Let OpenWeather handle, return first match |
| **Q-2.3** | Should analytics track successful vs. failed requests separately? | Low | Product | Epic 2 Story 2.7 | ✅ Resolved: Track all requests, log errors separately |
| **Q-2.4** | Do we need to handle international locations (non-US)? | Low | Product | PRD clarification | ✅ Resolved: PRD scopes to US, but API supports international |
| **Q-2.5** | Should we log OpenWeather API response times for monitoring? | Low | DevOps | Epic 2 Story 2.8 | ✅ Resolved: Yes, log timing for all external calls |
| **Q-2.6** | What should happen if Redis is down during analytics logging? | High | Dev | Epic 2 Story 2.7 | ✅ Resolved: Fire-and-forget, log error, continue |
| **Q-2.7** | Should we cache OpenWeather API responses to reduce API calls? | Medium | Architect | Before Epic 2 starts | ✅ Resolved: No caching in Epic 2 (stateless architecture) |
| **Q-2.8** | How should we handle locations in different time zones? | High | Dev | Epic 2 Story 2.4 | 🟡 Use OpenWeather timezone field, test with multiple TZs |
| **Q-2.9** | Should we retry failed analytics logging to Redis? | Low | Dev | Epic 2 Story 2.7 | ✅ Resolved: No retry, fire-and-forget |
| **Q-2.10** | Do we need to validate location input format before calling API? | Low | Dev | Epic 2 Story 2.6 | ✅ Resolved: Basic validation (non-empty), let API handle rest |

---

**Decisions Made:**

| Decision ID | Decision | Rationale | Date | Decided By |
|-------------|----------|-----------|------|------------|
| **DEC-2.1** | Use OpenWeather 5-day/3-hour Forecast API (free tier) | Free tier access, 3-hour intervals sufficient for 24h forecast, no subscription needed | Implementation (Story 2.1) | Developer |
| **DEC-2.2** | Fire-and-forget pattern for analytics | Analytics failures must not block forecasts, user experience > analytics completeness | Architecture phase | Architect |
| **DEC-2.3** | Single retry on 5xx errors (not exponential backoff) | Balances reliability with response time, <2 second target requires single retry max | Architecture phase | Architect |
| **DEC-2.4** | 5-second timeout for OpenWeather API | Prevents long-hanging requests, aligns with <2 second user expectation + 3s buffer | Epic 2 planning | Dev Lead |
| **DEC-2.5** | 50% probability threshold for YES/NO | Industry standard for precipitation forecasts, validated in UX research | PRD phase | Product |
| **DEC-2.6** | 40% threshold for rain window detection | Allows "close call" scenarios, balances precision with user safety | Epic 2 planning | Dev Lead |
| **DEC-2.7** | No location suggestions on invalid input (future enhancement) | OpenWeather doesn't provide suggestions API, would require custom logic | Epic 2 planning | Dev Lead |
| **DEC-2.8** | Use Intl.DateTimeFormat (not moment.js or date-fns) | Zero bundle size, sufficient for time formatting needs | Architecture phase | Architect |
| **DEC-2.9** | Log all errors server-side, return sanitized messages to user | Security best practice, improves debugging without exposing internals | Architecture phase | Security |
| **DEC-2.10** | TypeScript strict mode required | Catch errors at compile time, enforce type safety across all modules | Epic 1 | Dev Lead |

---

**Dependencies on External Decisions:**

| Dependency | Status | Blocker for | Resolution |
|------------|--------|-------------|------------|
| OpenWeather API key obtained | ✅ Complete | Story 2.1 | Add to .env.local before development |
| Upstash Redis provisioned | ✅ Complete | Story 2.7 | Install from Vercel Marketplace |
| Vercel environment variables configured | 🟡 Pending | Production deployment | Configure before Epic 5 deployment |
| API contract finalized with Epic 3 team | ✅ Complete | Epic 3 development | Documented in this tech spec |

---

**Technical Debt Identified:**

| Debt Item | Severity | Impact | When to Address | Notes |
|-----------|----------|--------|-----------------|-------|
| No automated tests in Epic 2 | Medium | Manual testing only | Epic 5 | Epic 2 focuses on implementation, Epic 5 adds testing infrastructure |
| No client-side caching | Low | Wastes API quota | Post-MVP | Stateless architecture by design, future enhancement |
| No request deduplication | Low | Duplicate requests possible | Epic 3 or later | Frontend concern, handle with debouncing |
| Hardcoded 50% threshold | Low | Not configurable | Post-MVP | Works for MVP, make configurable if user feedback requests |
| No fallback weather API | Medium | Single point of failure | Post-MVP | Retry logic sufficient for MVP, fallback adds complexity |
| No location suggestion API | Low | User experience | Post-MVP | Would require custom geocoding service |
| Error messages not internationalized | Low | English-only | Post-MVP | PRD scopes to US, internationalization future |
| No performance monitoring beyond logs | Medium | Limited observability | Epic 5 | Vercel analytics sufficient for MVP, add APM later |

---

**Risk Mitigation Summary:**

**High-Priority Mitigations Implemented:**
- ✅ API key protection via environment variables
- ✅ Retry logic for OpenWeather API failures
- ✅ Timeout handling to prevent hanging requests
- ✅ Fire-and-forget analytics to prevent blocking
- ✅ Error mapping to sanitized user messages
- ✅ TypeScript strict mode for type safety

**Medium-Priority Mitigations Needed:**
- ⚠️ Timezone testing across multiple regions
- ⚠️ Rate limit monitoring and logging
- ⚠️ Manual testing with real-world data
- ⚠️ Pre-commit hook for secret scanning (future)

**Low-Priority Mitigations Deferred:**
- 📅 Fallback weather API (post-MVP)
- 📅 Client-side caching (post-MVP)
- 📅 Advanced performance monitoring (Epic 5)

## Test Strategy Summary

**Testing Philosophy for Epic 2:**

Epic 2 focuses on **manual testing validation** to verify core functionality works correctly. Comprehensive automated testing infrastructure will be added in **Epic 5** (Testing & Performance Optimization).

---

**Manual Testing Strategy:**

**Test Levels:**

1. **Unit Testing (Manual):** Test individual functions in isolation
2. **Integration Testing (Manual):** Test API integrations (OpenWeather, Redis)
3. **End-to-End Testing (Manual):** Test complete user flow via API endpoint
4. **Error Scenario Testing (Manual):** Simulate failures to verify error handling

---

**Test Cases by Story:**

**Story 2.1-2.2: OpenWeather API Integration & Parsing**

| Test Case | Input | Expected Output | Validation Method |
|-----------|-------|-----------------|-------------------|
| TC-2.1.1: Fetch forecast for valid location | "San Francisco" | 24-hour hourly forecast data | Check `hourly.length === 24` |
| TC-2.1.2: Handle invalid location | "InvalidCity123" | 404 error with `invalid_location` code | Verify error response structure |
| TC-2.1.3: Timeout handling | Simulate >5s delay | 504 error with `timeout` code | Mock slow API response |
| TC-2.1.4: Retry on 5xx error | Simulate 500 error | Retry once, then return error | Check logs for retry attempt |
| TC-2.2.1: Parse probability correctly | API returns `pop: 0.65` | Converted to `probability: 65` | Verify conversion logic |
| TC-2.2.2: Parse rainfall amount | API returns `rain['1h']: 5.08mm` | Converted to `0.2 inches` | Verify mm → inches conversion |

**Story 2.3: Rain Probability Calculation**

| Test Case | Input | Expected Output | Validation Method |
|-----------|-------|-----------------|-------------------|
| TC-2.3.1: YES decision (≥50%) | Max probability: 65% | `willRain: true, probability: 65` | Verify boolean + value |
| TC-2.3.2: NO decision (<50%) | Max probability: 35% | `willRain: false, probability: 35` | Verify boolean + value |
| TC-2.3.3: Threshold boundary (49%) | Max probability: 49% | `willRain: false, probability: 49` | Edge case test |
| TC-2.3.4: Threshold boundary (50%) | Max probability: 50% | `willRain: true, probability: 50` | Edge case test |
| TC-2.3.5: Close call flag | Max probability: 45% | `closeCall: true` | Verify 40-49% flagging |
| TC-2.3.6: No close call (high) | Max probability: 70% | `closeCall: false` | Verify >49% not flagged |
| TC-2.3.7: No close call (low) | Max probability: 30% | `closeCall: false` | Verify <40% not flagged |
| TC-2.3.8: Peak time identification | Hour 5 has max prob | `peakTime` matches hour 5 timestamp | Verify correct hour |
| TC-2.3.9: Intensity mapping (light) | rainfall: 0.05 inches | `intensity: "light"` | Verify mapping |
| TC-2.3.10: Intensity mapping (moderate) | rainfall: 0.15 inches | `intensity: "moderate"` | Verify mapping |
| TC-2.3.11: Intensity mapping (heavy) | rainfall: 0.35 inches | `intensity: "heavy"` | Verify mapping |

**Story 2.4-2.5: Rain Windows & Safe Windows**

| Test Case | Input | Expected Output | Validation Method |
|-----------|-------|-----------------|-------------------|
| TC-2.4.1: Single rain window | Hours 2-5 all ≥40% | 1 rain window: "2:00 PM - 5:00 PM" | Verify grouping |
| TC-2.4.2: Multiple rain windows | Hours 2-5, 9-11 ≥40% | 2 rain windows with correct times | Verify separation |
| TC-2.4.3: No rain windows (NO answer) | All hours <40% | Empty `rainWindows` array | Verify empty array |
| TC-2.4.4: Time formatting | 14:00 UTC timestamp | "2:00 PM" (12-hour format) | Verify Intl.DateTimeFormat |
| TC-2.5.1: Safe window between rain | Rain: 2-5, 9-11 | Safe window: "5:00 PM - 9:00 PM" | Verify gap calculation |
| TC-2.5.2: Safe window after rain | Last rain ends at 11 PM | Safe window: "11:00 PM - next day" | Verify open-ended period |
| TC-2.5.3: No safe windows (continuous rain) | All 24 hours ≥40% | Empty `safeWindows` array | Verify no gaps |

**Story 2.6: Complete Decision Logic**

| Test Case | Input | Expected Output | Validation Method |
|-----------|-------|-----------------|-------------------|
| TC-2.6.1: YES response with all fields | Location with rain expected | Full response with rainWindows, peak, safe windows | Verify JSON structure |
| TC-2.6.2: NO response (minimal fields) | Location with no rain | `willRain: false, probability: X, closeCall: false` | Verify minimal structure |
| TC-2.6.3: Close call response | Location with 45% probability | `willRain: false, probability: 45, closeCall: true` | Verify flag present |
| TC-2.6.4: Input validation (empty) | Empty location string | 400 error or invalid response | Verify validation |
| TC-2.6.5: Input validation (too long) | 200-character location | Rejected or truncated | Verify length limit |

**Story 2.7: Analytics Logging**

| Test Case | Input | Expected Output | Validation Method |
|-----------|-------|-----------------|-------------------|
| TC-2.7.1: Successful analytics logging | Valid forecast request | Entry in Redis `analytics:searches` list | Query Redis after request |
| TC-2.7.2: Analytics failure doesn't block | Redis unavailable | Forecast still returns successfully | Disable Redis, verify forecast works |
| TC-2.7.3: Privacy compliance | Search for "San Francisco" | Redis entry contains location + timestamp only | Verify no PII (IP, UA, cookies) |
| TC-2.7.4: Fire-and-forget pattern | Analytics throws error | Main request completes, error logged | Check logs, verify no throw |

**Story 2.8: Error Handling**

| Test Case | Input | Expected Output | Validation Method |
|-----------|-------|-----------------|-------------------|
| TC-2.8.1: Invalid location error | "Sprangfield" (typo) | 404 with `invalid_location` error | Verify error code + message |
| TC-2.8.2: API failure error | Simulate OpenWeather 500 | 500 with `service_unavailable` error | Mock 5xx response |
| TC-2.8.3: Timeout error | Simulate >5s delay | 504 with `timeout` error | Mock slow API |
| TC-2.8.4: Network error | Disconnect internet | Error with `network_error` code | Simulate offline |
| TC-2.8.5: Error message sanitization | Any error | No stack traces or internal paths | Verify user-facing message |
| TC-2.8.6: Server-side logging | Any error | Full error logged to console | Check Vercel logs |

---

**Integration Testing Focus:**

**OpenWeather API Integration:**
- Real API calls during development (use test locations)
- Verify response structure matches TypeScript interfaces
- Test retry logic by simulating 5xx errors
- Test timeout logic by delaying API responses
- Validate timezone handling across different locations

**Upstash Redis Integration:**
- Real Redis writes during development
- Verify entries appear in Redis dashboard
- Test fire-and-forget pattern by disabling Redis
- Validate analytics data structure

---

**End-to-End Testing Scenarios:**

**Happy Path:**
```bash
# Test: San Francisco with rain expected
curl -X POST http://localhost:3000/api/check-rain \
  -H "Content-Type: application/json" \
  -d '{"location": "San Francisco"}'

# Expected: 200 with willRain, probability, rain windows
```

**Error Path:**
```bash
# Test: Invalid location
curl -X POST http://localhost:3000/api/check-rain \
  -H "Content-Type: application/json" \
  -d '{"location": "InvalidCity123"}'

# Expected: 404 with error code
```

**Close Call:**
```bash
# Test: Location with borderline probability
# Find a location with 40-49% forecast (may vary by day)

# Expected: 200 with closeCall: true
```

---

**Performance Testing (Manual):**

**Response Time Validation:**
- Use browser DevTools Network tab to measure timing
- Target: 95% of requests < 2 seconds
- Breakdown: API call + processing + response
- Log timing for optimization insights

**Load Testing (Deferred to Epic 5):**
- Concurrent request handling tested in production
- Vercel serverless scales automatically
- No load testing needed for Epic 2

---

**Testing Tools:**

**Manual Testing Tools:**
- **Postman / cURL:** API endpoint testing
- **Browser DevTools:** Network timing, response inspection
- **Vercel Dashboard:** Function logs, error tracking
- **Upstash Console:** Redis data verification
- **TypeScript Compiler:** Type checking (`tsc --noEmit`)

**Future Automated Testing (Epic 5):**
- **Jest:** Unit testing framework
- **Supertest:** API route integration testing
- **MSW (Mock Service Worker):** API mocking
- **Testing Library:** Component testing (Epic 3)

---

**Test Data:**

**Valid Locations for Testing:**
- "San Francisco" (US city, commonly rainy)
- "94102" (US zipcode)
- "Phoenix" (US city, commonly dry)
- "Seattle" (US city, frequently rainy)
- "Miami" (US city, variable weather)

**Invalid Locations for Testing:**
- "InvalidCity123" (nonexistent location)
- "" (empty string)
- "Springfield" (ambiguous - multiple matches)
- Very long strings (>100 characters)

**Edge Cases to Test:**
- 0% rain probability
- 100% rain probability
- Exactly 50% rain probability
- Exactly 40% rain probability (close call threshold)
- Exactly 49% rain probability (close call threshold)
- 24 hours of continuous rain
- 24 hours of no rain
- Multiple short rain periods
- Rain at midnight (timezone edge case)

---

**Acceptance Testing Checklist:**

Before marking Epic 2 as complete:

**Functional Testing:**
- [ ] POST /api/check-rain returns 200 for valid location
- [ ] Response includes all required fields (willRain, probability)
- [ ] YES response includes rain windows, peak details, safe windows
- [ ] NO response includes only willRain, probability, closeCall
- [ ] 50% threshold correctly determines YES/NO
- [ ] 40-49% probabilities flagged as close call
- [ ] Time formatting uses 12-hour AM/PM format
- [ ] All error scenarios return appropriate error codes

**Integration Testing:**
- [ ] OpenWeather API integration works
- [ ] Retry logic executes on 5xx errors
- [ ] Timeout triggers at 5 seconds
- [ ] Upstash Redis logging works
- [ ] Analytics failures don't break forecasts

**Non-Functional Testing:**
- [ ] Response time < 2 seconds for typical requests
- [ ] API key not exposed in browser DevTools
- [ ] Environment variables loaded correctly
- [ ] TypeScript compiles without errors
- [ ] No unhandled exceptions in Vercel logs

**Error Handling Testing:**
- [ ] Invalid location returns 404
- [ ] API failure returns 500
- [ ] Timeout returns 504
- [ ] All errors return standardized ErrorResponse
- [ ] No stack traces in user-facing errors

---

**Epic 2 Test Summary:**

**Total Test Cases:** ~40 manual test cases across 8 stories

**Coverage:**
- Unit-level: Business logic (rain-logic, rain-windows)
- Integration-level: External APIs (OpenWeather, Redis)
- End-to-end: Complete API flow
- Error scenarios: All failure modes

**Testing Duration Estimate:** 4-6 hours of manual testing

**Epic 5 Automation:** All Epic 2 test cases will be automated in Epic 5

---

**Epic 2 Tech Spec Complete** ✅

This technical specification provides comprehensive guidance for implementing Epic 2: Weather Intelligence Engine. All sections document the design, architecture, acceptance criteria, and testing strategy needed for successful development.

**Ready for Implementation:** Story 2.1 can begin once OpenWeather API key is obtained.
