# Story 1.6: Cleanup Development Test Artifacts

Status: backlog

## Story

As a developer,
I want to remove temporary test files and artifacts from Epic 1,
So that the codebase is clean and production-ready before Epic 2 development begins.

## Acceptance Criteria

1. **Given** Epic 1 stories are complete and validated
   **When** I clean up test artifacts
   **Then** all temporary test files created during Epic 1 validation are removed
   **And** the app/page.tsx landing page is restored to a clean state without test components
   **And** no test-related imports remain in production code
   **And** the development server runs successfully without the test files
   **And** the production build completes successfully

## Tasks / Subtasks

- [ ] Task 1: Remove environment variable test files (from Story 1.3)
  - [ ] Delete app/api/test-env/route.ts and directory
  - [ ] Delete app/test-client-env.tsx
  - [ ] Remove TestClientEnv import from app/page.tsx (line 4)
  - [ ] Remove <TestClientEnv /> component usage from app/page.tsx (line 20)
  - [ ] Verify /api/test-env endpoint returns 404 after removal

- [ ] Task 2: Clean up app/page.tsx to production-ready state
  - [ ] Remove or comment out Story 1.2 Tailwind/Shadcn test content
  - [ ] Replace with simple placeholder for Epic 3 frontend work
  - [ ] Keep it minimal - just enough to verify the app runs
  - [ ] Add comment indicating "Epic 3 will implement the actual UI"

- [ ] Task 3: Verify production readiness
  - [ ] Run TypeScript compilation: npx tsc --noEmit (should pass)
  - [ ] Run ESLint: npm run lint (should pass)
  - [ ] Run development server: npm run dev (should start successfully)
  - [ ] Run production build: npm run build (should complete successfully)
  - [ ] Verify no console errors or warnings in browser

- [ ] Task 4: Update documentation
  - [ ] Remove references to test files from README if any
  - [ ] Add note in CHANGELOG or README about Epic 1 completion
  - [ ] Document that foundation is ready for Epic 2

## Dev Notes

### Purpose

This cleanup story ensures the codebase transitions cleanly from Epic 1 (Foundation) to Epic 2 (Weather Intelligence Engine). Test files served their purpose in validating Epic 1 stories but should not persist into production.

### Test Files to Remove

**From Story 1.3 (Environment Variables):**
- `app/api/test-env/route.ts` - Test endpoint for env var validation
- `app/test-client-env.tsx` - Client-side security test component
- Imports and usage in `app/page.tsx`

**Rationale for Removal:**
- Test files were created specifically for Story 1.3 validation
- Epic 2 will create actual API routes (e.g., `/api/weather`) that naturally verify environment variables work
- No other stories or epics depend on these test artifacts
- Keeping them would clutter the codebase and potentially confuse future developers

### Landing Page Strategy

**Current State:** app/page.tsx contains test content from Stories 1.2 and 1.3
- Shadcn UI component tests (buttons, inputs, cards)
- Tailwind CSS theme tests (colors, borders, glassmorphism)
- Environment variable security test component

**Target State for End of Epic 1:**
- Minimal placeholder landing page
- Just enough to verify the app runs and builds successfully
- Comment indicating Epic 3 will implement the actual UI
- Keep it simple - no test content

**Example Clean Landing Page:**
```typescript
export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Will It Rain
        </h1>
        <p className="text-muted">
          Foundation ready. UI implementation coming in Epic 3.
        </p>
      </div>
    </div>
  );
}
```

### What to Keep

**Essential Files (DO NOT REMOVE):**
- ✅ `lib/env.ts` - Environment validation utility (used by Epic 2+)
- ✅ `.env.local` - Runtime configuration
- ✅ `.env.example` - Developer onboarding template
- ✅ `lib/utils.ts` - Tailwind utility functions
- ✅ `components/ui/*` - Shadcn UI components (used by Epic 3)
- ✅ All configuration files (tailwind.config.ts, tsconfig.json, etc.)

### Verification Checklist

After cleanup, verify:
- [ ] No 404 errors in browser console
- [ ] TypeScript compilation passes
- [ ] ESLint passes with no warnings
- [ ] Production build completes
- [ ] Development server runs successfully
- [ ] Landing page displays clean placeholder (no test content)
- [ ] No references to removed files in remaining code

### Dependencies

**Depends on:**
- Story 1.5 (Development and Build Scripts) - ensures build process is stable

**Blocks:**
- Epic 2 development - clean codebase ready for weather intelligence features

## References

**Related Stories:**
- Story 1.3: Set Up Environment Variables - created the test files
- Story 1.2: Configure Tailwind CSS - created test content in page.tsx
- Story 1.5: Development and Build Scripts - provides verification commands

**Tech Spec:**
- Epic 1 Tech Spec: Foundation should be production-ready before Epic 2

## Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2025-11-06 | Senior Developer Review (AI) | Story created based on code review advisory notes from Story 1.3 |
