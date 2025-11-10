# Story 2.4: Implement Rain Window Detection

Status: done

## Story

As a developer,
I want to identify continuous rain periods and gaps,
So that users can plan around specific rain timeframes.

## Acceptance Criteria

1. **Given** 24 hours of forecast data with rain probabilities
   **When** I detect rain windows
   **Then** continuous periods where probability ≥40% are identified
   **And** these periods are grouped into rain windows with accurate timeframes

2. **Given** multiple rain periods exist within the 24-hour forecast
   **When** I analyze rain windows
   **Then** separate rain periods are correctly distinguished from each other
   **And** gaps between rain periods are not included in rain windows
   **And** each distinct rain period is returned as a separate window

3. **Given** rain windows have been identified
   **When** I format the output
   **Then** each rain window includes accurate start time and end time
   **And** times are derived from the forecast period timestamps
   **And** rain windows are returned in chronological order

4. **Given** rain window times need to be user-friendly
   **When** I format time strings
   **Then** times use 12-hour format with AM/PM (e.g., "2:00 PM - 5:00 PM")
   **And** time formatting uses native Intl.DateTimeFormat (zero bundle size)
   **And** times are displayed in a readable, consistent format

5. **Given** a single forecast period has probability ≥40%
   **When** I detect rain windows
   **Then** single-hour rain events are handled correctly
   **And** the rain window spans the duration of that single forecast period (3 hours from OpenWeather)
   **And** start and end times reflect the single period accurately

6. **Given** rain occurs at the start or end of the 24-hour forecast window
   **When** I detect rain windows
   **Then** edge cases are handled correctly (rain at hour 0 or hour 24)
   **And** rain windows spanning midnight are formatted properly
   **And** boundary conditions do not cause errors or incorrect window detection

## Tasks / Subtasks

- [x] Task 1: Create rain window detection module (AC: 1, 2, 3)
  - [x] Create `/will-it-rain/lib/rain-windows.ts` module
  - [x] Define `RainWindow` interface: `{ start: Date, end: Date }`
  - [x] Implement module structure following separation of concerns pattern
  - [x] Export main detection function for use by API route

- [x] Task 2: Implement rain window detection logic (AC: 1, 2, 3)
  - [x] Create `detectRainWindows()` function accepting `ParsedForecast[]` array
  - [x] Apply 40% threshold to identify rain periods (probability ≥40%)
  - [x] Group consecutive forecast periods with probability ≥40% into rain windows
  - [x] Handle multiple separate rain periods correctly
  - [x] Identify start time (first period in window) and end time (last period + 3 hours)
  - [x] Return array of rain windows in chronological order

- [x] Task 3: Implement time formatting for user-friendly display (AC: 4)
  - [x] Create `formatTimeRange()` helper function for rain window formatting
  - [x] Use native Intl.DateTimeFormat with 12-hour format and AM/PM
  - [x] Format: `new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })`
  - [x] Return formatted strings like "2:00 PM - 5:00 PM"
  - [x] Ensure zero external dependencies (no Day.js, date-fns, etc.)

- [x] Task 4: Handle edge cases and boundary conditions (AC: 5, 6)
  - [x] Test single-period rain events (only one 3-hour period ≥40%)
  - [x] Test rain at start of forecast (hour 0)
  - [x] Test rain at end of forecast (hour 24)
  - [x] Test rain spanning midnight (if forecast crosses day boundary)
  - [x] Ensure no off-by-one errors in window boundaries
  - [x] Handle empty forecast array (return empty rain windows)

- [x] Task 5: Return structured rain windows for API consumption (AC: 3)
  - [x] Return `RainWindow[]` array with start/end Date objects
  - [x] Ensure TypeScript strict mode compliance (no `any` types)
  - [x] Prepare for integration with Story 2.5 (safe window calculation)
  - [x] Structure output for Story 2.6 API response formatting

- [x] Task 6: Manual testing and verification (AC: 1-6)
  - [x] Test with forecast data containing single rain period
  - [x] Test with forecast data containing multiple separate rain periods (e.g., morning and evening rain)
  - [x] Test with forecast data containing no rain (all probabilities <40%)
  - [x] Test with boundary cases: rain at hour 0, hour 24, single-period event
  - [x] Verify time formatting displays correctly in 12-hour AM/PM format
  - [x] Test with consecutive periods vs. gaps between periods
  - [x] TypeScript compilation passes (`npm run type-check`)
  - [x] ESLint validation passes (`npm run lint`)

## Dev Notes

### Architecture Patterns and Constraints

**Stateless Calculation:**
- Pure function approach - no side effects or external dependencies
- Accepts parsed forecast data as input, returns array of rain windows
- No database queries, no API calls - computation only
- Aligns with ADR-002: Stateless Architecture
[Source: docs/tech-spec-epic-2.md#System-Architecture-Alignment]

**Module Structure:**
- `/will-it-rain/lib/rain-windows.ts` - Contains all rain window detection logic
- Separation of concerns: window detection isolated from probability calculation and API integration
- Reusable, testable functions for detection and formatting
- Follows Next.js library organization pattern
[Source: docs/tech-spec-epic-2.md#Services-and-Modules]

**Type Safety:**
- All functions use TypeScript strict mode
- Input: `ParsedForecast[]` type from Story 2.2
- Output: `RainWindow[]` interface defined in this module
- No `any` types permitted - full type coverage required
[Source: docs/tech-spec-epic-2.md#Data-Models-and-Contracts]

**Rain Window Threshold:**
- 40% probability threshold for rain window detection
- Rationale: 40-49% is "close call" range from PRD - users need context about potential rain
- Consecutive forecast periods ≥40% are grouped into single rain window
- Gaps (periods <40%) separate distinct rain windows
[Source: docs/PRD.md#Core-Decision-Logic, docs/tech-spec-epic-2.md#Objectives-and-Scope]

**Time Formatting:**
- Use native Intl.DateTimeFormat for 12-hour AM/PM formatting
- Zero bundle size impact (no external date libraries)
- Format: `{ hour: 'numeric', minute: '2-digit', hour12: true }`
- Consistent with architectural decision to minimize dependencies
[Source: docs/architecture.md#Technology-Stack-Details, docs/epics.md#Story-2.4-Technical-Notes]

### Project Structure Notes

**Existing Files (from Stories 2.2 and 2.3):**
```
will-it-rain/
├── lib/
│   ├── openweather.ts           [EXISTS] Forecast fetching and parsing
│   └── rain-logic.ts            [EXISTS] Rain probability calculation
├── types/
│   ├── api.ts                   [EXISTS] API contract types
│   └── weather.ts               [EXISTS] OpenWeather types, ParsedForecast interface
└── app/
    └── api/
        └── check-rain/
            └── route.ts         [EXISTS] API route handler (will consume this module)
```

**New Files to Create:**
```
will-it-rain/
└── lib/
    └── rain-windows.ts          [NEW] Rain window detection and formatting
```

**Data Flow:**
1. Story 2.2 provides: `ParsedForecast[]` array with 8 data points (24 hours in 3-hour intervals)
2. Story 2.3 provides: `RainProbabilityResult` with peak time and decision data
3. This story consumes: `ParsedForecast[]` → `detectRainWindows()` → `RainWindow[]`
4. Story 2.5 will use: `RainWindow[]` to calculate safe windows (gaps between rain periods)
5. Story 2.6 will use: `RainWindow[]` and formatted time strings for API response

### Learnings from Previous Story (2-3-implement-rain-probability-calculation-logic)

**From Story 2.3 (Status: done)**

**New Files Created:**
- `will-it-rain/lib/rain-logic.ts` - Rain probability calculation module with pure functions

**Modified Files:**
- None (new module only)

**New Services/Patterns Established:**
- `findMaxProbability()` function - Identifies max probability and peak time with tie-breaking
- `calculateRainProbability()` main orchestration function - Returns complete `RainProbabilityResult`
- `RainProbabilityResult` interface - Structured result object with all decision data
- Pure stateless calculation pattern - no side effects, deterministic results

**Architectural Decisions:**
- ADR-002: Stateless Architecture - All functions are pure with no external dependencies
- Helper functions prepared for future use (`categorizeIntensity`, `formatPrecipitationAmount`) but currently unused
- Current implementation leverages data already normalized in `forecast-parser.ts` (intensity and amount)
- Clean dependency flow established: `forecast-parser.ts` → `rain-logic.ts` → `route.ts` (future)

**Technical Debt Noted:**
- Unit tests deferred to Epic 5 per Epic 2 Tech Spec (manual testing only for now)
- No automated test files exist yet - Jest/Vitest setup pending
- Unused helper functions marked with eslint-disable comments (intentional preparation for Story 2.6)

**Warnings for This Story:**
- DO NOT recreate `findMaxProbability()` or `calculateRainProbability()` - they exist in `lib/rain-logic.ts`
- Reuse existing `ParsedForecast` interface from `types/weather.ts` (defined in Story 2.2)
- Follow manual testing approach (sample data, TypeScript, ESLint) - automated tests deferred to Epic 5
- Do not mark testing tasks complete unless actually performed (lesson from Story 2.2A review)
- Use native Intl.DateTimeFormat for time formatting (no external date libraries)

**Files to Reference:**
- `will-it-rain/lib/openweather.ts` - Review forecast parsing to understand `ParsedForecast` structure and timestamps
- `will-it-rain/types/weather.ts` - Use `ParsedForecast` interface as input type
- `will-it-rain/lib/rain-logic.ts` - Understand probability calculation for context (this story runs after probability is calculated)

**Review Findings from Story 2.3:**
- Code quality: Excellent JSDoc documentation, comprehensive manual testing, proper TypeScript strict mode
- Testing approach validated: Manual test file with comprehensive coverage is acceptable for Epic 2
- Unused code acceptable when intentionally prepared for future stories and properly marked
- No false completion claims - all tasks verified as complete or explicitly noted as prepared for future use

[Source: docs/stories/2-3-implement-rain-probability-calculation-logic.md#Dev-Agent-Record, #Senior-Developer-Review, #Learnings-from-Previous-Story]

### Testing Standards Summary

**Verification Approach (Epic 2 Standard):**
- Manual testing with sample forecast data (hardcoded test arrays)
- No automated unit tests (deferred to Epic 5 per tech spec)
- TypeScript compilation validation (`npm run type-check`)
- ESLint validation (`npm run lint`)
- Integration testing via curl to `/api/check-rain` endpoint (once integrated in Story 2.6)
[Source: docs/tech-spec-epic-2.md#Testing-Strategy]

**Test Coverage Requirements:**
1. Single rain window detection (all consecutive periods ≥40%)
2. Multiple separate rain windows (periods ≥40% with gaps <40% between)
3. No rain windows (all probabilities <40% - should return empty array)
4. Single-period rain event (only one 3-hour period ≥40%)
5. Boundary conditions: rain at hour 0, rain at hour 24
6. Time formatting correctness (12-hour AM/PM format validation)
7. Edge case: rain spanning midnight (if forecast crosses day boundary)

**Manual Testing Approach:**
- Create sample `ParsedForecast[]` arrays representing various scenarios
- Call `detectRainWindows()` with test data scenarios
- Log results to console and verify correctness manually
- Validate time formatting output matches expected format
- Document test cases and results in Dev Agent Record

**TypeScript/ESLint Validation:**
```bash
# TypeScript type checking
npm run type-check

# ESLint validation
npm run lint
```

### References

**Epic 2 Technical Specification:**
- Rain Window Detection Logic: [docs/tech-spec-epic-2.md#Detailed-Design]
- 40% threshold rationale: [docs/tech-spec-epic-2.md#Objectives-and-Scope]
- Type definitions: [docs/tech-spec-epic-2.md#Data-Models-and-Contracts]
- Time formatting approach: [docs/tech-spec-epic-2.md#Data-Normalization-Rules]

**PRD Requirements:**
- Close Call Scenarios (40-49%): [docs/PRD.md#User-Experience-Requirements]
- Rain window display requirements: [docs/PRD.md#Clear-Answer-Display]

**Architecture Document:**
- Date/Time Handling: [docs/architecture.md#Technology-Stack-Details]
- Native Intl.DateTimeFormat approach: [docs/architecture.md#Core-Technologies]

**Related Stories:**
- Story 2.2: Fetch and Parse 24-Hour Forecast Data - Provides `ParsedForecast[]` input
- Story 2.3: Implement Rain Probability Calculation Logic - Runs before window detection
- Story 2.5: Implement Safe Window Calculation - Will consume `RainWindow[]` output
- Story 2.6: Integrate Complete Decision Logic - Will orchestrate all modules and format final API response

## Dev Agent Record

### Context Reference

- docs/stories/2-4-implement-rain-window-detection.context.xml

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

**Implementation Plan (2025-11-07):**
1. Created rain-windows.ts module following same architectural patterns as rain-logic.ts
2. Implemented RainWindow interface with start/end Date properties
3. Implemented detectRainWindows() function with 40% threshold logic
4. Implemented formatTimeRange() using native Intl.DateTimeFormat
5. Created comprehensive manual test suite covering all acceptance criteria
6. Validated TypeScript strict mode compliance and ESLint rules

### Completion Notes List

**Story 2.4 Complete - Rain Window Detection Module (2025-11-07)**

Successfully implemented rain window detection and time formatting functionality:

**Core Implementation:**
- Created `will-it-rain/lib/rain-windows.ts` module with pure stateless functions
- Defined `RainWindow` interface: `{ start: Date, end: Date }`
- Implemented `detectRainWindows()`: Applies 40% threshold, groups consecutive periods ≥40% into windows, handles gaps <40% as separators
- Implemented `formatTimeRange()`: Uses native Intl.DateTimeFormat for 12-hour AM/PM format with zero bundle size

**Algorithm Details:**
- Iterates through ParsedForecast array in chronological order
- Creates new window when probability ≥40% encountered
- Continues window while consecutive periods remain ≥40%
- Closes window when gap detected (probability <40%)
- Calculates end time as last period's start + 3 hours (OpenWeather interval)
- Returns array of windows in chronological order

**Edge Cases Handled:**
- Empty forecast array → returns empty array
- Single-period rain (one 3-hour period ≥40%) → creates 3-hour window
- Rain at hour 0 (start boundary) → handled correctly
- Rain at hour 24 (end boundary) → end time crosses midnight properly
- Rain spanning midnight → time formatting handles day boundary correctly
- Threshold boundary (exactly 40%) → inclusive (≥40% included in windows)
- Multiple separate rain periods with gaps → creates distinct windows

**Testing Approach:**
- Created comprehensive manual test suite: `will-it-rain/lib/rain-windows.test-manual.ts`
- 10 test scenarios covering all acceptance criteria
- All tests pass: Single window, multiple windows, no rain, single period, boundaries, midnight crossing, empty array, threshold boundary
- TypeScript compilation validated: `npm run type-check` ✓
- ESLint validation validated: `npm run lint` ✓

**Architectural Alignment:**
- Pure stateless functions (ADR-002)
- No external dependencies (native Intl.DateTimeFormat only)
- TypeScript strict mode compliance (no `any` types)
- Follows separation of concerns pattern established in Story 2.3
- Reuses ParsedForecast interface from Story 2.2
- Prepares for Story 2.5 (safe window calculation) and Story 2.6 (API integration)

**No issues encountered. Ready for Story 2.5 integration.**

### File List

**New Files:**
- `will-it-rain/lib/rain-windows.ts` - Rain window detection and time formatting module
- `will-it-rain/lib/rain-windows.test-manual.ts` - Manual test suite (10 test scenarios)

**Modified Files:**
- None (new module only)

### Change Log

- **2025-11-07**: Created rain window detection module with detectRainWindows() and formatTimeRange() functions. Comprehensive manual testing validates all acceptance criteria.
- **2025-11-07**: Senior Developer Review notes appended - Story APPROVED for completion.

---

## Senior Developer Review (AI)

**Reviewer:** BMad
**Date:** 2025-11-07
**Outcome:** ✅ **APPROVE**

### Summary

Story 2.4 implementation is **production-ready** and demonstrates exceptional quality. All 6 acceptance criteria fully implemented with evidence, all 6 tasks verified complete, zero false completion claims, and comprehensive test coverage. The code exhibits excellent architectural alignment (ADR-002 stateless), clean algorithm design, thorough documentation, and proper edge case handling.

### Key Findings

**NONE** - No issues detected. This is a textbook implementation.

### Acceptance Criteria Coverage

| AC# | Requirement | Status | Evidence |
|-----|------------|--------|----------|
| **AC1** | Continuous periods where probability ≥40% are identified and grouped into rain windows with accurate timeframes | ✅ IMPLEMENTED | `rain-windows.ts:58-113` - `detectRainWindows()` function correctly applies 40% threshold (line 70), groups consecutive periods (lines 74-81), and calculates accurate start/end times (lines 86-92) |
| **AC2** | Separate rain periods are correctly distinguished, gaps not included, each distinct period is separate window | ✅ IMPLEMENTED | `rain-windows.ts:83-98` - Gap detection logic (line 83 checks `<40%`), closes current window when gap found (lines 84-97), correctly handles multiple windows |
| **AC3** | Each rain window includes accurate start/end time from forecast timestamps, returned in chronological order | ✅ IMPLEMENTED | `rain-windows.ts:86-92, 103-109` - Start time from first period (line 76), end time calculated as last period + 3 hours (line 87), windows returned in chronological order (array maintains iteration order) |
| **AC4** | Times use 12-hour format with AM/PM, native Intl.DateTimeFormat, readable consistent format | ✅ IMPLEMENTED | `rain-windows.ts:133-145` - `formatTimeRange()` uses `Intl.DateTimeFormat` with 12-hour format and AM/PM (lines 135-139), zero external dependencies |
| **AC5** | Single-period rain events handled correctly, window spans 3-hour OpenWeather period | ✅ IMPLEMENTED | `rain-windows.ts:74-81, 101-110` - Single period creates window (lines 74-77), end time calculation adds 3 hours (line 87), verified in test case 4 (test-manual.ts:112-140) |
| **AC6** | Edge cases handled: rain at hour 0/24, midnight crossing, no errors or incorrect detection | ✅ IMPLEMENTED | `rain-windows.ts:59-62, 101-110` - Empty array handling (lines 59-62), final window closing (lines 101-110), verified in test cases 5, 6, 7, 8 (test-manual.ts:142-220) |

**Summary:** 6 of 6 acceptance criteria fully implemented ✅

### Task Completion Validation

| Task | Marked As | Verified As | Evidence |
|------|-----------|-------------|----------|
| **Task 1:** Create rain window detection module | ✅ COMPLETE | ✅ VERIFIED | Module exists at `will-it-rain/lib/rain-windows.ts`, RainWindow interface defined (lines 27-32), proper structure with exports |
| **Task 2:** Implement rain window detection logic | ✅ COMPLETE | ✅ VERIFIED | `detectRainWindows()` function implemented (lines 58-113), 40% threshold applied (line 70), consecutive grouping (lines 74-81), multiple periods handled (lines 83-98), chronological order maintained |
| **Task 3:** Implement time formatting | ✅ COMPLETE | ✅ VERIFIED | `formatTimeRange()` function (lines 133-145), uses `Intl.DateTimeFormat` with correct options (lines 135-139), no external dependencies |
| **Task 4:** Handle edge cases and boundary conditions | ✅ COMPLETE | ✅ VERIFIED | Empty array check (lines 59-62), final window closing (lines 101-110), comprehensive test coverage in test-manual.ts (tests 5-8) covering all edge cases |
| **Task 5:** Return structured rain windows | ✅ COMPLETE | ✅ VERIFIED | Returns `RainWindow[]` (line 64), TypeScript strict mode compliance (no `any` types), proper interface structure |
| **Task 6:** Manual testing and verification | ✅ COMPLETE | ✅ VERIFIED | Comprehensive test suite exists (`rain-windows.test-manual.ts`), 10 test scenarios covering all ACs, TypeScript passes (`npm run type-check` ✓), ESLint passes (`npm run lint` ✓) |

**Summary:** 6 of 6 completed tasks verified ✅
**False Completions:** 0
**Questionable:** 0

### Test Coverage and Gaps

**Test Coverage: EXCELLENT**

The manual test suite (`rain-windows.test-manual.ts`) demonstrates comprehensive coverage:
- ✅ Single continuous window (Test 1)
- ✅ Multiple separate windows (Test 2)
- ✅ No rain scenario (Test 3)
- ✅ Single-period rain (Test 4)
- ✅ Boundary: hour 0 (Test 5)
- ✅ Boundary: hour 24 (Test 6)
- ✅ Midnight crossing (Test 7)
- ✅ Empty array (Test 8)
- ✅ Threshold boundary (exactly 40%) (Test 9)
- ✅ Time formatting validation (Test 10)

All test assertions are meaningful and deterministic. Tests use proper fixtures with realistic data. No gaps identified in test coverage.

### Architectural Alignment

✅ **Stateless Architecture (ADR-002):** Pure functions with no side effects, no external dependencies (lines 1-146)
✅ **40% Threshold:** Correctly applied using `≥40%` (line 70)
✅ **Module Structure:** Located at `/will-it-rain/lib/rain-windows.ts` as specified
✅ **Type Safety:** TypeScript strict mode, no `any` types, proper interface definitions
✅ **Native Date API:** Uses `Intl.DateTimeFormat` (line 135), no external date libraries
✅ **Testing Strategy:** Manual testing with comprehensive test suite, TypeScript/ESLint validation passes

**No architecture violations detected.**

### Security Notes

✅ **No security concerns:**
- Pure stateless functions with no external I/O
- No user input processing (accepts typed data structures)
- No SQL, no XSS risk, no injection vulnerabilities
- No secret management or authentication

### Best-Practices and References

**Next.js 16 Documentation:**
- [App Router](https://nextjs.org/docs/app) - File-based routing and Server Components
- [TypeScript Support](https://nextjs.org/docs/app/building-your-application/configuring/typescript) - Type safety best practices

**TypeScript Best Practices:**
- [Strict Mode](https://www.typescriptlang.org/tsconfig#strict) - Type safety without `any` types
- [Interface Design](https://www.typescriptlang.org/docs/handbook/interfaces.html) - Clean contract definitions

**Intl.DateTimeFormat Reference:**
- [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) - Native date formatting with zero bundle size

**Architectural Patterns:**
- Pure functions with no side effects (Functional Programming)
- Stateless computation (ADR-002)
- Zero external dependencies for date handling

### Action Items

**No code changes required.** ✅

**Advisory Notes:**
- Note: Consider adding automated unit tests in Epic 5 (as planned in tech spec) for regression protection
- Note: The manual test suite provides excellent documentation - consider preserving it as integration test examples

### Code Quality Highlights

**Strengths:**
1. **Excellent documentation:** Comprehensive JSDoc comments explaining algorithm, edge cases, and rationale (lines 1-57, 115-132)
2. **Clean algorithm:** Clear, readable logic with well-named variables (`currentWindowStart`, `currentWindowLastPeriod`)
3. **Proper edge case handling:** Empty array check, final window closing, threshold boundary handling
4. **Type safety:** Full TypeScript strict mode compliance, well-defined interfaces
5. **Zero dependencies:** Uses native APIs only (Intl.DateTimeFormat), minimal bundle size
6. **Comprehensive testing:** 10 test scenarios covering all acceptance criteria and edge cases

This implementation represents best-practice TypeScript development and serves as an excellent reference for future stories.
