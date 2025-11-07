# Story 1.4: Configure Basic PWA Manifest and Metadata

Status: drafted

## Story

As a developer,
I want to set up the basic PWA manifest and app metadata,
So that the app can be installed and has proper identity across platforms.

## Acceptance Criteria

1. **Given** the app should work as a Progressive Web App
   **When** I configure PWA basics
   **Then** a web app manifest file is created with app metadata
   **And** manifest includes app name, short name, description
   **And** theme colors are defined
   **And** display mode is set to "standalone"
   **And** manifest is linked in the root layout
   **And** basic app icons are generated (at least 192x192 and 512x512)
   **And** favicon is configured

## Tasks / Subtasks

- [ ] Task 1: Create PWA manifest using Next.js 16 metadata API (AC: 1)
  - [ ] Create app/manifest.ts file
  - [ ] Define app name: "Will It Rain"
  - [ ] Define short_name: "Will It Rain"
  - [ ] Define description: "Get a simple yes or no answer for the next 24 hours"
  - [ ] Set start_url to "/"
  - [ ] Set display mode to "standalone"
  - [ ] Define background_color: "#0a0a0a" (from UX spec)
  - [ ] Define theme_color: "#0a0a0a" (from UX spec)

- [ ] Task 2: Generate and configure app icons (AC: 1)
  - [ ] Create public/icons/ directory
  - [ ] Generate 192x192 app icon (Android home screen)
  - [ ] Generate 512x512 app icon (Android splash)
  - [ ] Generate maskable icon for Android adaptive icons (512x512)
  - [ ] Define icons array in manifest with proper sizes and purpose
  - [ ] Ensure icon paths are correct (public/icons/*)

- [ ] Task 3: Configure favicon (AC: 1)
  - [ ] Generate favicon.ico file
  - [ ] Place in public/ directory
  - [ ] Verify favicon loads in browser tab
  - [ ] Test across Chrome, Safari, Firefox

- [ ] Task 4: Link manifest in root layout (AC: 1)
  - [ ] Verify Next.js 16 auto-links manifest.ts (no manual linking needed)
  - [ ] Add metadata configuration to app/layout.tsx if needed
  - [ ] Verify manifest is accessible at /manifest.webmanifest

- [ ] Task 5: Validate PWA configuration (AC: 1)
  - [ ] Run Lighthouse PWA audit
  - [ ] Verify manifest validates without errors
  - [ ] Check that all required manifest fields are present
  - [ ] Confirm icons load correctly
  - [ ] Test manifest on both development and production builds

## Dev Notes

### Architecture Patterns and Constraints

**PWA Manifest Strategy (Next.js 16):**
- **Native PWA Support:** Next.js 16 includes native PWA support via `manifest.ts`
- **No external dependencies:** No `next-pwa` or other plugins needed (Next.js 16 native support)
- **File-based approach:** `app/manifest.ts` exports MetadataRoute.Manifest
- **Auto-generated:** Next.js 16 generates `/manifest.webmanifest` at build time
- **Type-safe:** TypeScript interface for manifest ensures correctness

**Manifest Requirements (from Tech Spec):**
```typescript
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Will It Rain',
    short_name: 'Will It Rain',
    description: 'Get a simple yes or no answer for the next 24 hours',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/maskable-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  }
}
```

**Icon Requirements:**
- **192x192:** Android home screen icon (minimum required)
- **512x512:** Android splash screen, high-res displays
- **Maskable icon:** Android adaptive icon (safe zone for cropping)
- **Purpose tags:** "any" for standard icons, "maskable" for adaptive
- **Format:** PNG (universally supported)
- **Design:** Simple, recognizable umbrella/rain icon (placeholder for Epic 1)

**Display Modes (from Architecture):**
- **standalone:** Hides browser chrome, looks like native app
- **Alternative:** "minimal-ui" (shows minimal browser UI) - NOT used
- **Fallback:** "browser" (opens in normal browser) - NOT used
- **Decision:** "standalone" for native app feel

**Theme Colors (from UX Spec):**
- **Background:** `#0a0a0a` (pure black) - Matches app background
- **Theme:** `#0a0a0a` (pure black) - Status bar color on mobile
- **Alternative:** Could use `#1a1a1a` for subtle lift - NOT chosen for Epic 1

### Project Structure Notes

**Files to Create:**
```
will-it-rain/
├── app/
│   └── manifest.ts              # PWA manifest (native Next.js 16)
├── public/
│   ├── favicon.ico              # Browser favicon
│   └── icons/
│       ├── icon-192.png         # Android home screen
│       ├── icon-512.png         # Android splash
│       └── maskable-icon.png    # Android adaptive icon
```

**Files to Modify:**
- `app/layout.tsx` - May need metadata configuration (verify Next.js auto-links manifest)
- `README.md` - Document PWA manifest and icon generation process

**Alignment with Architecture:**
- [Source: docs/architecture.md#Project-Structure] - PWA manifest at app/manifest.ts
- [Source: docs/architecture.md#Technology-Stack] - Native Next.js PWA support
- [Source: docs/architecture.md#ADR-001] - Next.js 16 native PWA capability

### Learnings from Previous Story

**From Story 1.3 (Status: done)**

**Key Observations:**
- Project structure fully established: app/, lib/, components/, public/ directories
- TypeScript strict mode active - all new code must be strictly typed
- Development and production builds verified working
- ESLint passing with zero warnings
- Environment variable system working correctly

**Files Created in Story 1.3:**
- `will-it-rain/.env.local` - Environment variables (server-side only)
- `will-it-rain/.env.example` - Template documentation
- `will-it-rain/lib/env.ts` - Validation utility with TypeScript interface
- `will-it-rain/app/api/test-env/route.ts` - Test endpoint (to be removed in Story 1.6)
- `will-it-rain/app/test-client-env.tsx` - Security test component (to be removed in Story 1.6)

**Technical Environment:**
- Next.js 16.0.1 with App Router (verified actual version)
- React 19.2.0
- TypeScript 5.9.3 with strict mode
- Tailwind CSS v4
- Path aliases: @/components, @/lib/utils, @/app

**Reuse Opportunities:**
- public/ directory exists - add icons/ subdirectory
- app/ directory established - add manifest.ts
- README exists - extend with PWA setup documentation
- TypeScript strict mode - manifest.ts benefits from MetadataRoute types

**Testing Approach from Previous Stories:**
- Manual validation through Lighthouse PWA audit
- Browser testing across Chrome, Safari, Firefox
- Visual confirmation of icons and favicon
- No automated tests required for Epic 1 (per tech spec)

**Warnings for Next Story:**
- Test files created in Story 1.3 should be removed in Story 1.6
- app/page.tsx has test component imports to clean up
- Focus Epic 1 work on foundation only - full PWA features in Epic 4

[Source: stories/1-3-set-up-environment-variables-and-api-key-management.md#Dev-Agent-Record]

### Testing Standards

**For Story 1.4 (Foundation):**
- No automated tests required (per Epic 1 tech spec)
- Manual verification:
  - Lighthouse PWA audit (basic manifest check)
  - Manifest accessible at /manifest.webmanifest
  - Icons load correctly in browsers
  - Favicon displays in browser tabs
  - Theme colors apply on mobile browsers
  - Display mode "standalone" works when installed (basic test)

**Testing Checklist:**
```
□ app/manifest.ts created with all required fields
□ Next.js generates /manifest.webmanifest (accessible in browser)
□ public/icons/ directory contains all 3 icon files
□ Icons are proper PNG format with correct dimensions
□ Favicon.ico exists in public/ directory
□ Lighthouse PWA audit shows manifest without errors
□ Browser tabs show favicon correctly
□ Mobile browsers apply theme color (#0a0a0a)
□ TypeScript compilation passes (npx tsc --noEmit)
□ ESLint passes (npm run lint)
□ Development server runs with manifest loaded
□ Production build includes manifest
```

### Source Tree Components

**Implementation Order:**
1. Create app/manifest.ts with MetadataRoute.Manifest export
2. Create public/icons/ directory
3. Generate placeholder app icons (192x192, 512x512, maskable)
4. Generate favicon.ico
5. Verify Next.js auto-links manifest (check app/layout.tsx if needed)
6. Test with Lighthouse PWA audit
7. Update README with PWA setup documentation

**Icon Generation Notes:**
- **Epic 1 Focus:** Placeholder icons are sufficient (simple design)
- **Epic 4:** Professional icons with proper branding (Story 4.5)
- **Tools:** Can use online icon generators (e.g., favicon.io, realfavicongenerator.net)
- **Design:** Simple umbrella/rain drop icon (recognizable, on-brand)
- **Maskable icon safe zone:** 80% of icon centered (20% may be cropped on Android)

**Manifest Validation:**
- Lighthouse PWA audit checks for:
  - Manifest exists and is valid JSON
  - Has name or short_name
  - Has icons array with at least one icon
  - Icons are accessible (URLs resolve)
  - start_url is defined
  - display mode is set

### References

**Tech Spec:**
- [Source: docs/tech-spec-epic-1.md#Data-Models-and-Contracts] - PWA manifest schema
- [Source: docs/tech-spec-epic-1.md#Project-Structure] - File locations (app/manifest.ts, public/icons/)
- [Source: docs/tech-spec-epic-1.md#Acceptance-Criteria] - Epic-level AC#4: PWA basics configured

**Epics:**
- [Source: docs/epics.md#Story-1.4] - Acceptance criteria and technical notes
- [Source: docs/epics.md#Epic-1] - Foundation epic context

**Architecture:**
- [Source: docs/architecture.md#Project-Structure] - PWA manifest location
- [Source: docs/architecture.md#Technology-Stack] - Next.js 16 native PWA support
- [Source: docs/architecture.md#ADR-001] - Next.js 16 with native manifest.ts support

**UX Design:**
- [Source: docs/ux-design-specification.md#Visual-Foundation] - Theme colors (#0a0a0a)
- [Source: docs/ux-design-specification.md#Design-System-Foundation] - Dark mode, professional aesthetic
- [Source: docs/ux-design-specification.md#Component-Library] - Icon design guidance

**PRD:**
- [Source: docs/PRD.md#Non-Functional-Requirements] - NFR: PWA capabilities (FR6.1)

**Previous Story:**
- [Source: docs/stories/1-3-set-up-environment-variables-and-api-key-management.md] - Project structure, public/ directory

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2025-11-06 | Story Creation Workflow | Initial draft created from tech spec and epics |
