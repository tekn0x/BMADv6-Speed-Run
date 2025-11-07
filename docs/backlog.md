# Engineering Backlog

This backlog collects cross-cutting or future action items that emerge from reviews and planning.

Routing guidance:

- Use this file for non-urgent optimizations, refactors, or follow-ups that span multiple stories/epics.
- Must-fix items to ship a story belong in that story’s `Tasks / Subtasks`.
- Same-epic improvements may also be captured under the epic Tech Spec `Post-Review Follow-ups` section.

| Date | Story | Epic | Type | Severity | Owner | Status | Notes |
| ---- | ----- | ---- | ---- | -------- | ----- | ------ | ----- |
| 2025-11-07 | 2.2A | 2 | TechDebt | Medium | Epic 5 | Deferred | Create unit tests for ZIP code detection logic - Per Epic 2 scope, deferred to Epic 5 (will-it-rain/lib/__tests__/openweather.test.ts) |
| 2025-11-07 | 2.2A | 2 | TechDebt | Medium | Epic 5 | Deferred | Add test suite for `isZipCode()` covering 5-digit, ZIP+4, invalid formats, edge cases (AC 1,2,5) |
| 2025-11-07 | 2.2A | 2 | TechDebt | Medium | Epic 5 | Deferred | Add integration tests for `geocodeZipCode()` with mocked API responses (AC 1,4) - will-it-rain/lib/__tests__/openweather.test.ts |
| 2025-11-07 | 2.2A | 2 | TechDebt | Medium | Epic 5 | Deferred | Add integration tests for routing logic in `geocodeLocation()` (AC 3,5) - will-it-rain/lib/__tests__/openweather.test.ts |
| 2025-11-07 | 2.2A | 2 | TechDebt | Medium | Epic 5 | Deferred | Set up Jest or Vitest testing framework if not already configured (package.json, jest.config.js or vitest.config.ts) |
