# Story 1.3: Set Up Environment Variables and API Key Management

Status: done

## Story

As a developer,
I want to securely manage environment variables and API keys,
So that sensitive information is protected and configuration is environment-aware.

## Acceptance Criteria

1. **Given** the project needs external API integration
   **When** I configure environment management
   **Then** a .env.local file is created for local development
   **And** .env.example file documents required environment variables
   **And** OpenWeather API key placeholder is defined
   **And** .env.local is added to .gitignore
   **And** environment variables are accessible in API routes
   **And** the app validates required env vars on startup

## Tasks / Subtasks

- [x] Task 1: Create environment variable files (AC: 1)
  - [x] Create .env.local with OPENWEATHER_API_KEY placeholder
  - [x] Create UPSTASH_REDIS_REST_URL placeholder
  - [x] Create UPSTASH_REDIS_REST_TOKEN placeholder
  - [x] Create .env.example with documented placeholders (no actual values)
  - [x] Verify .env.local is already in .gitignore (from Story 1.1)

- [x] Task 2: Create environment variable validation utility (AC: 1)
  - [x] Create lib/env.ts for environment variable validation
  - [x] Define EnvironmentVariables TypeScript interface
  - [x] Implement validateEnv() function to check required vars on startup
  - [x] Export typed env object for use across the app
  - [x] Add clear error messages for missing variables

- [x] Task 3: Test environment variable access (AC: 1)
  - [x] Create test API route to verify env var loading
  - [x] Test accessing OPENWEATHER_API_KEY from API route
  - [x] Verify environment variables are NOT accessible client-side
  - [x] Test with missing env vars to validate error handling
  - [x] Document environment variable setup in README

- [x] Task 4: Document API key acquisition (AC: 1)
  - [x] Add section to README explaining how to obtain OpenWeather API key
  - [x] Document Upstash Redis account setup
  - [x] Provide clear instructions for copying .env.example to .env.local
  - [x] Add troubleshooting section for common env var issues

## Dev Notes

### Architecture Patterns and Constraints

**Environment Variable Management:**
- **Server-side only** - Environment variables must never be exposed to the client
- Variables prefixed with `NEXT_PUBLIC_` are client-accessible (avoid for API keys)
- .env.local takes precedence over .env (for local overrides)
- Next.js automatically loads .env.local at startup
- Environment variables are read at build time for static pages

**Security Requirements (from Tech Spec):**
- **NFR-S1:** API keys stored in .env.local (not committed to git)
- .env.local must be in .gitignore (verify from Story 1.1)
- .env.example documents structure but contains no real values
- Use TypeScript for type-safe environment access

**Required Environment Variables (from Tech Spec):**
```typescript
interface EnvironmentVariables {
  // API keys
  OPENWEATHER_API_KEY: string;        // Required for Epic 2

  // Upstash Redis (Epic 2 analytics)
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;

  // Next.js built-in
  NODE_ENV: 'development' | 'production' | 'test';
}
```

**Validation Strategy:**
- Create centralized validation in lib/env.ts
- Fail fast on startup if required variables are missing
- Provide helpful error messages directing to .env.example
- Allow optional variables for Epic 2 onwards (graceful degradation)

### Project Structure Notes

**Files to Create:**
```
will-it-rain/
├── .env.local              # Local environment variables (NOT committed)
├── .env.example            # Template documenting required variables
├── lib/
│   └── env.ts              # Environment validation utility
└── app/api/test-env/       # Optional: Test route to verify env loading
    └── route.ts
```

**Files to Modify:**
- `README.md` - Add environment setup instructions
- `.gitignore` - Verify .env.local is ignored (should exist from Story 1.1)

**Alignment with Architecture:**
- Environment manager module established (from architecture.md)
- Follows Next.js conventions for environment variables
- TypeScript interface enforces type safety
- Server-side only access prevents client exposure

### Learnings from Previous Story

**From Story 1.2 (Status: review)**

**Key Observations:**
- Project structure established with app/, components/, lib/ directories
- TypeScript strict mode active - all new code must be strictly typed
- Build process verified working (npm run build completes successfully)
- Development server runs on localhost:3000
- ESLint configured and passing

**Files Created in Story 1.2:**
- `will-it-rain/components/ui/button.tsx` - Shadcn Button component
- `will-it-rain/components/ui/input.tsx` - Shadcn Input component
- `will-it-rain/components/ui/card.tsx` - Shadcn Card components
- `will-it-rain/lib/utils.ts` - cn() utility exists (DO NOT recreate)
- `will-it-rain/tailwind.config.ts` - Theme configured
- `will-it-rain/components.json` - Shadcn config

**Technical Environment:**
- Next.js 16.0.1 installed
- React 19.2.0 installed
- TypeScript 5.9.3 configured with strict mode
- Tailwind CSS v4 architecture (PostCSS plugin)
- Path aliases configured: @/components, @/lib/utils

**Reuse Opportunities:**
- lib/ directory exists - add env.ts alongside utils.ts
- Build and dev scripts already functional - use for testing
- README exists - extend with environment setup instructions
- TypeScript strict mode enforced - maintain type safety

**Testing Approach from Previous Stories:**
- Manual validation through build/dev commands
- TypeScript compilation checks (tsc --noEmit)
- No automated tests required for Epic 1 (per tech spec)

[Source: stories/1-2-configure-tailwind-css-v4-and-shadcn-ui.md#Dev-Agent-Record]

### Testing Standards

**For Story 1.3 (Foundation):**
- No automated tests required (per Epic 1 tech spec)
- Manual verification:
  - .env.local created and not tracked in git
  - .env.example documents all required variables
  - Environment variables accessible in API routes (test route or console.log)
  - Validation utility provides clear error messages
  - README instructions are clear and complete
  - TypeScript compilation passes with strict mode

**Testing Checklist:**
```
□ .env.local exists and contains placeholders
□ .env.example exists with documented variables
□ git status confirms .env.local not tracked
□ lib/env.ts exports typed environment object
□ Validation function catches missing variables
□ Environment variables load correctly in API routes
□ Client-side code CANNOT access API keys
□ README documents API key acquisition
□ TypeScript compiles with no errors (tsc --noEmit)
□ Dev server runs with valid env vars
□ Dev server shows clear error with missing env vars
```

### Source Tree Components

**Implementation Order:**
1. Create .env.local and .env.example files (root directory)
2. Verify .gitignore contains .env.local
3. Create lib/env.ts validation utility
4. Test environment variable access (API route or startup validation)
5. Update README with setup instructions

**Environment Variable Template (.env.example):**
```env
# OpenWeather API Key
# Obtain from: https://openweathermap.org/api
# Free tier: 1,000 calls/day
OPENWEATHER_API_KEY=your_api_key_here

# Upstash Redis (for analytics)
# Obtain from: https://upstash.com/
# Free tier: 256MB storage, 500K commands/month
UPSTASH_REDIS_REST_URL=your_upstash_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_token_here
```

**lib/env.ts Structure:**
```typescript
// Example structure (actual implementation in dev agent phase)
interface EnvironmentVariables {
  OPENWEATHER_API_KEY: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

export function validateEnv(): EnvironmentVariables {
  // Validate and return typed environment object
  // Throw clear error if required variables missing
}

export const env = validateEnv();
```

### References

**Tech Spec:**
- [Source: docs/tech-spec-epic-1.md#Data-Models-and-Contracts] - Environment variables schema
- [Source: docs/tech-spec-epic-1.md#Non-Functional-Requirements] - NFR-S1: Environment variable protection
- [Source: docs/tech-spec-epic-1.md#Dependencies-and-Integrations] - External API requirements

**Epics:**
- [Source: docs/epics.md#Story-1.3] - Acceptance criteria and technical notes
- [Source: docs/epics.md#Epic-1] - Foundation epic context

**Architecture:**
- [Source: docs/architecture.md#Project-Structure] - .env.local and .env.example placement
- [Source: docs/architecture.md#Technology-Stack] - Environment manager module
- [Source: docs/architecture.md#Decision-Summary] - OpenWeather API and Upstash Redis configuration

**PRD:**
- [Source: docs/PRD.md#Non-Functional-Requirements] - NFR-S2: API key protection requirement

**Previous Story:**
- [Source: docs/stories/1-2-configure-tailwind-css-v4-and-shadcn-ui.md] - Project structure and lib/ directory setup

## Dev Agent Record

### Context Reference

- `docs/stories/1-3-set-up-environment-variables-and-api-key-management.context.xml` (Generated: 2025-11-06)

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

**Implementation Plan:**
1. Created environment variable files (.env.local and .env.example) with all required placeholders
2. Verified .gitignore already contains .env* pattern (from Story 1.1)
3. Implemented lib/env.ts validation utility with TypeScript strict typing
4. Created test API route to verify server-side environment access
5. Updated README with comprehensive environment setup documentation
6. Added troubleshooting section for common environment variable issues

**Technical Approach:**
- Used TypeScript non-null assertions (!) in validateEnv() after validation checks to satisfy strict mode
- Implemented fail-fast validation with helpful error messages directing users to .env.example
- Created test endpoint at /api/test-env with masked value display for security
- Environment variables are server-side only (no NEXT_PUBLIC_ prefix)
- Placeholder values acceptable for Epic 1 (actual keys required in Epic 2)

### Completion Notes List

- ✅ All environment variable files created and properly configured
- ✅ .env.local confirmed not tracked by git (.env* wildcard in .gitignore)
- ✅ Type-safe environment validation utility implemented with clear error messages
- ✅ Test API endpoint verifies environment variables load correctly on server-side
- ✅ README updated with detailed setup instructions and troubleshooting guide
- ✅ TypeScript compilation passes (npx tsc --noEmit)
- ✅ ESLint passes (npm run lint)
- ✅ Development server runs successfully with environment variables loaded
- ✅ All acceptance criteria satisfied

**Notes for Epic 2:**
- Current validation allows placeholder values for foundation setup
- Epic 2 will need stricter validation to ensure actual API keys are provided
- Test files (app/test-client-env.tsx, app/api/test-env/) should be removed before production

---

### Final Completion

**Completed:** 2025-11-06
**Definition of Done:** ✅ All acceptance criteria met, code reviewed and approved, TypeScript/ESLint passing, development and production builds successful
**Code Review Status:** APPROVED by Senior Developer Review (AI)
**Sprint Status:** done

### File List

**Created:**
- `will-it-rain/.env.local` - Local environment variables (not committed to git)
- `will-it-rain/.env.example` - Environment variable template with documentation
- `will-it-rain/lib/env.ts` - Environment variable validation utility with TypeScript interface
- `will-it-rain/app/api/test-env/route.ts` - Test API route to verify environment variable loading (development only)
- `will-it-rain/app/test-client-env.tsx` - Client component to test client-side security (development only)

**Modified:**
- `will-it-rain/README.md` - Added environment setup instructions, API key acquisition guide, and troubleshooting section
- `will-it-rain/app/page.tsx` - Temporarily added TestClientEnv component for validation (should be removed after testing)

**Verified:**
- `will-it-rain/.gitignore` - Confirmed .env* wildcard pattern exists (no changes needed)

## Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2025-11-06 | Story Creation Workflow | Initial draft created from tech spec and epics |
| 2025-11-06 | Dev Agent (Claude Sonnet 4.5) | Implemented environment variable management system - Created .env files, validation utility, test endpoint, and comprehensive documentation |
| 2025-11-06 | Senior Developer Review (AI) | Code review completed - Story APPROVED with advisory notes |

---

## Senior Developer Review (AI)

**Reviewer:** BMad
**Date:** 2025-11-06
**Model:** Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Outcome: ✅ APPROVE

All acceptance criteria fully implemented and verified with evidence. All tasks marked complete have been validated. Code quality is excellent with strong TypeScript typing, comprehensive error handling, and proper security measures. No blocking or high-severity issues found.

### Summary

Story 1.3 successfully establishes a robust environment variable management system for the Will It Rain application. The implementation demonstrates excellent attention to security, developer experience, and code quality. All acceptance criteria are met with comprehensive evidence, and all completed tasks have been thoroughly verified.

**Highlights:**
- Type-safe environment validation with clear error messages
- Proper security measures (server-side only access, .gitignore protection)
- Comprehensive documentation in README with troubleshooting guide
- Well-structured test utilities for development validation
- TypeScript strict mode compliance with no errors
- ESLint passes with zero warnings

**Tech Stack Detected:**
- Next.js 16.0.1 (App Router)
- React 19.2.0
- TypeScript 5+ (strict mode enabled)
- Tailwind CSS v4
- Node.js environment with ESLint 9

### Acceptance Criteria Coverage

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC#1.1 | .env.local file created for local development | ✅ IMPLEMENTED | `.env.local:1-11` - File exists with all required variables |
| AC#1.2 | .env.example documents required environment variables | ✅ IMPLEMENTED | `.env.example:1-11` - Complete documentation with acquisition links |
| AC#1.3 | OpenWeather API key placeholder defined | ✅ IMPLEMENTED | `.env.local:4`, `.env.example:4` - OPENWEATHER_API_KEY defined |
| AC#1.4 | .env.local added to .gitignore | ✅ IMPLEMENTED | `.gitignore:34` - `.env*` wildcard pattern covers all env files |
| AC#1.5 | Environment variables accessible in API routes | ✅ IMPLEMENTED | `app/api/test-env/route.ts:13-19` - Successfully imports and uses env object |
| AC#1.6 | App validates required env vars on startup | ✅ IMPLEMENTED | `lib/env.ts:31-103` - validateEnv() with comprehensive validation |

**Summary:** 6 of 6 acceptance criteria fully implemented ✅

### Task Completion Validation

| Task | Marked As | Verified As | Evidence |
|------|-----------|-------------|----------|
| Task 1: Create environment variable files | [x] Complete | ✅ VERIFIED | `.env.local` and `.env.example` files exist with all required variables |
| Task 1.1: Create .env.local with OPENWEATHER_API_KEY | [x] Complete | ✅ VERIFIED | `.env.local:4` |
| Task 1.2: Create UPSTASH_REDIS_REST_URL placeholder | [x] Complete | ✅ VERIFIED | `.env.local:9` |
| Task 1.3: Create UPSTASH_REDIS_REST_TOKEN placeholder | [x] Complete | ✅ VERIFIED | `.env.local:10` |
| Task 1.4: Create .env.example with documented placeholders | [x] Complete | ✅ VERIFIED | `.env.example:1-11` with comments |
| Task 1.5: Verify .env.local in .gitignore | [x] Complete | ✅ VERIFIED | `.gitignore:34` contains `.env*` |
| Task 2: Create environment variable validation utility | [x] Complete | ✅ VERIFIED | `lib/env.ts` fully implemented with TypeScript interface |
| Task 2.1: Create lib/env.ts | [x] Complete | ✅ VERIFIED | File exists at `lib/env.ts:1-104` |
| Task 2.2: Define EnvironmentVariables TypeScript interface | [x] Complete | ✅ VERIFIED | `lib/env.ts:10-20` - Complete interface with proper types |
| Task 2.3: Implement validateEnv() function | [x] Complete | ✅ VERIFIED | `lib/env.ts:31-90` - Comprehensive validation with error handling |
| Task 2.4: Export typed env object | [x] Complete | ✅ VERIFIED | `lib/env.ts:103` - `export const env = validateEnv()` |
| Task 2.5: Add clear error messages | [x] Complete | ✅ VERIFIED | `lib/env.ts:59-79` - Helpful multi-line error with instructions |
| Task 3: Test environment variable access | [x] Complete | ✅ VERIFIED | Test API route and client test component implemented |
| Task 3.1: Create test API route | [x] Complete | ✅ VERIFIED | `app/api/test-env/route.ts:16-61` |
| Task 3.2: Test accessing OPENWEATHER_API_KEY | [x] Complete | ✅ VERIFIED | `app/api/test-env/route.ts:19` - Successfully accessed, API responds |
| Task 3.3: Verify NOT accessible client-side | [x] Complete | ✅ VERIFIED | `app/test-client-env.tsx:15-17` - Tests all vars are undefined |
| Task 3.4: Test with missing env vars | [x] Complete | ✅ VERIFIED | `lib/env.ts:47-79` - Validation throws helpful errors |
| Task 3.5: Document setup in README | [x] Complete | ✅ VERIFIED | `README.md:25-156` - Comprehensive documentation |
| Task 4: Document API key acquisition | [x] Complete | ✅ VERIFIED | README includes detailed instructions |
| Task 4.1: OpenWeather API key acquisition | [x] Complete | ✅ VERIFIED | `README.md:33-37` - Step-by-step instructions with link |
| Task 4.2: Document Upstash Redis setup | [x] Complete | ✅ VERIFIED | `README.md:39-43` - Complete setup guide |
| Task 4.3: Instructions for .env.example → .env.local | [x] Complete | ✅ VERIFIED | `README.md:27-30` - Copy command provided |
| Task 4.4: Add troubleshooting section | [x] Complete | ✅ VERIFIED | `README.md:108-149` - Comprehensive troubleshooting |

**Summary:** 22 of 22 completed tasks verified ✅
**False Completions:** 0 ❌
**Questionable:** 0 ⚠️

### Test Coverage and Gaps

**Manual Validation Implemented:**
- ✅ TypeScript compilation check: `npx tsc --noEmit` passes with 0 errors
- ✅ ESLint validation: `npm run lint` passes with 0 warnings
- ✅ API endpoint test: `/api/test-env` returns success with masked values
- ✅ Client-side security test: `app/test-client-env.tsx` validates undefined access
- ✅ Development server: Runs successfully with environment variables loaded

**Test Files Created:**
- `app/api/test-env/route.ts` - Server-side environment access validation
- `app/test-client-env.tsx` - Client-side security verification component

**Test Quality:** Excellent
- Comprehensive security testing (client/server separation)
- Proper value masking in API responses (security best practice)
- Clear pass/fail indicators in test component
- Error handling tested through validation function

**Gaps:** None identified for Epic 1 scope
- Note: Automated testing infrastructure deferred to Epic 5 (per tech spec)
- Manual testing approach is appropriate for foundation epic

### Architectural Alignment

**Tech Spec Compliance:** ✅ Full Compliance
- ✅ Environment variables schema matches spec (`lib/env.ts:10-20`)
- ✅ NFR-S1 satisfied: .env.local not committed, .env.example present
- ✅ Server-side only access enforced (no NEXT_PUBLIC_ prefix used)
- ✅ TypeScript strict mode with proper typing (no `any` types)
- ✅ Centralized validation in lib/env.ts as specified

**Architecture Violations:** None ❌

**Best Practices Followed:**
- ✅ Fail-fast validation on startup
- ✅ Type-safe environment access through single export
- ✅ Graceful error messages with actionable guidance
- ✅ Security-first approach (masking, client-side protection)
- ✅ Proper use of TypeScript non-null assertions after validation

### Security Notes

**Security Strengths:**
1. ✅ **Server-side only access:** No NEXT_PUBLIC_ prefix, variables never exposed to client
2. ✅ **Git protection:** `.gitignore:34` prevents .env.local from being committed
3. ✅ **Value masking:** Test endpoint masks sensitive values (`app/api/test-env/route.ts:24-29`)
4. ✅ **Client-side verification:** Test component confirms undefined access from browser
5. ✅ **Template separation:** .env.example contains no real values (placeholder text only)
6. ✅ **Clear documentation:** README warns about API key security

**Security Findings:** None ✅

**Recommendations:**
- Note: Test files (`app/api/test-env/`, `app/test-client-env.tsx`) should be removed before production deployment (already noted in story completion notes)

### Best-Practices and References

**Next.js Environment Variables:**
- ✅ Following Next.js 15 conventions: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- ✅ Proper use of .env.local for local overrides
- ✅ Server-side access pattern correctly implemented

**TypeScript Best Practices:**
- ✅ Strict mode enabled and satisfied
- ✅ Proper interface definitions with explicit types
- ✅ Non-null assertions used appropriately after validation
- ✅ Comprehensive JSDoc comments for public APIs

**Security Best Practices:**
- ✅ Follows OWASP guidelines for secret management
- ✅ No secrets in version control
- ✅ Template files for onboarding
- ✅ Environment-specific configuration

**Code Quality:**
- ✅ ESLint configuration passing
- ✅ Consistent formatting and structure
- ✅ Clear error messages and helpful guidance
- ✅ Well-documented code with comments

### Action Items

**Code Changes Required:** None ✅

**Advisory Notes:**
- Note: Test file cleanup tracked in **Story 1.6: Cleanup Development Test Artifacts** (to be completed after Story 1.5)
  - Files to remove: `app/api/test-env/route.ts`, `app/test-client-env.tsx`, and imports from `app/page.tsx:4,20`
  - Story 1.6 will ensure codebase is production-ready before Epic 2
- Note: Epic 2 will require stricter validation to ensure actual API keys are provided (not just placeholders) - see `lib/env.ts:40-44` for implementation location
- Note: Consider adding rate limiting to API routes in Epic 2 for production security
- Note: The validation utility currently accepts placeholder values ("your_api_key_here") which is appropriate for Epic 1 but will need enhancement in Epic 2

### Validation Checklist

- [x] Story file loaded from story path
- [x] Story Status verified as "review"
- [x] Epic and Story IDs resolved (Epic 1, Story 3)
- [x] Story Context located and loaded
- [x] Epic Tech Spec located and loaded
- [x] Architecture/standards docs loaded
- [x] Tech stack detected and documented (Next.js 16, React 19, TypeScript 5, Tailwind v4)
- [x] Best practices verified (Next.js docs, TypeScript strict mode, security patterns)
- [x] Acceptance Criteria cross-checked against implementation (6/6 implemented)
- [x] File List reviewed and validated for completeness (all files exist)
- [x] Tests identified and mapped to ACs (manual validation approach)
- [x] Code quality review performed on changed files (TypeScript + ESLint passing)
- [x] Security review performed (server-side only, .gitignore, masking implemented)
- [x] Outcome decided: APPROVE
- [x] Review notes prepared and ready to append
- [x] Change Log entry prepared

**Reviewer: BMad on 2025-11-06**
