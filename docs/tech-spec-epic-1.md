# Epic Technical Specification: Foundation & Infrastructure

Date: 2025-11-06
Author: BMad
Epic ID: 1
Status: Draft

---

## Overview

Epic 1 establishes the technical foundation for Will It Rain by initializing the Next.js 15 project with TypeScript, configuring the styling system (Tailwind CSS v4 + Shadcn UI), setting up environment management for API keys, configuring basic PWA capabilities, and establishing development tooling. This epic is the prerequisite for all subsequent development work - no other epic can begin until the foundation is complete.

The epic delivers a working development environment where:
- The Next.js dev server runs successfully on localhost
- TypeScript strict mode enforces type safety
- Tailwind CSS and Shadcn UI components are available
- Environment variables are securely managed
- PWA manifest and metadata are configured
- Build and lint scripts are functional

This foundation adheres to the architecture decisions documented in `architecture.md`, including Next.js 15 App Router, TypeScript strict mode, Tailwind CSS v4, Shadcn UI component library, and native PWA support.

## Objectives and Scope

**In Scope:**

- Initialize Next.js 15 project with App Router and TypeScript (Story 1.1)
- Configure Tailwind CSS v4 and Shadcn UI with dark mode theme (Story 1.2)
- Set up environment variable management and API key protection (Story 1.3)
- Configure basic PWA manifest with app metadata and icons (Story 1.4)
- Establish development and build scripts with ESLint (Story 1.5)
- Create project structure following architecture conventions
- Ensure all dependencies are installed and compatible
- Verify dev server, production build, and linting work correctly

**Out of Scope:**

- OpenWeather API integration (Epic 2)
- Frontend components beyond Shadcn UI basics (Epic 3)
- Service worker implementation (Epic 4)
- Performance optimization and testing (Epic 5)
- Any business logic or feature implementation
- Production deployment configuration (deployment is out of scope for Epic 1)

**Success Criteria:**

- Development server runs without errors
- TypeScript compiles with strict mode enabled
- Tailwind CSS utilities available in components
- Shadcn UI components (Button, Input, Card) installed and themed
- Environment variables loadable from .env.local
- PWA manifest validates without errors
- Production build completes successfully
- ESLint runs without configuration errors

## System Architecture Alignment

**Architecture Components Involved:**

- **Framework:** Next.js 15 with App Router (ADR-001)
- **Language:** TypeScript with strict mode
- **Styling:** Tailwind CSS v4 + Shadcn UI (ADR-006)
- **Deployment Target:** Vercel (ADR-007)
- **Build Tool:** Turbopack (dev), Webpack (prod)

**Project Structure Established:**

```
will-it-rain/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page (placeholder)
│   ├── globals.css         # Tailwind directives
│   └── manifest.ts         # PWA manifest (basic)
├── components/
│   └── ui/                 # Shadcn UI components
│       ├── button.tsx
│       ├── input.tsx
│       └── card.tsx
├── lib/
│   └── utils.ts            # cn() helper for Tailwind
├── public/
│   ├── icons/              # PWA icons
│   └── favicon.ico
├── .env.local              # Environment variables (not committed)
├── .env.example            # Template for env vars
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind + Shadcn theme
├── components.json         # Shadcn configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies + scripts
└── README.md               # Setup instructions
```

**Constraints from Architecture:**

- Must use Next.js 15 (not 14 or older)
- TypeScript strict mode required (no `any` types)
- Tailwind CSS v4 (not v3)
- Shadcn UI components copied into project (not npm package)
- Environment variables must be server-side only
- PWA manifest uses native Next.js support (manifest.ts, not external file)
- HTTPS enforced in production (Vercel handles this)

**Integration Points:**

- Next.js → TypeScript compiler
- Next.js → Tailwind CSS (postcss integration)
- Shadcn UI → Radix UI primitives
- Shadcn UI → Tailwind CSS styling
- Environment variables → Next.js runtime
- PWA manifest → Next.js metadata API

## Detailed Design

### Services and Modules

| Module | Responsibility | Inputs | Outputs | Owner |
|--------|---------------|--------|---------|-------|
| **Next.js App Router** | Application framework, routing, rendering | Component files, configuration | HTML pages, API routes | Next.js framework |
| **TypeScript Compiler** | Type checking, transpilation | .ts/.tsx files, tsconfig.json | JavaScript, type errors | TypeScript |
| **Tailwind CSS** | Utility-first CSS generation | Component classes, config | Compiled CSS | Tailwind |
| **Shadcn UI** | Pre-built accessible components | Radix UI primitives, Tailwind theme | Themed React components | Project code (copied in) |
| **ESLint** | Code quality checks | Source files, .eslintrc | Lint errors/warnings | ESLint |
| **Environment Manager** | Secure config loading | .env.local, process.env | Runtime env vars | Next.js |

### Data Models and Contracts

**Environment Variables Schema:**

```typescript
// Environment variables required for Epic 1
interface EnvironmentVariables {
  // API keys (Epic 2 will use these)
  OPENWEATHER_API_KEY?: string; // Placeholder in .env.example

  // Upstash Redis (Epic 2 will use these)
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;

  // Next.js built-in
  NODE_ENV: 'development' | 'production' | 'test';
}
```

**PWA Manifest Schema (manifest.ts):**

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

**Tailwind Configuration Schema:**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Monochrome Storm theme from UX spec
        background: '#0a0a0a',
        foreground: '#ffffff',
        muted: '#666666',
        border: '#222222',
        primary: '#3b82f6',
        surface: '#1a1a1a',
        error: '#ef4444',
        success: '#10b981',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '6px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

**Shadcn UI Configuration (components.json):**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### APIs and Interfaces

**No external APIs in Epic 1.** All API integration occurs in Epic 2 (OpenWeather API).

**Internal Interfaces:**

**TypeScript Configuration Interface:**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Next.js Configuration:**

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for development
  reactStrictMode: true,

  // Turbopack for development (Next.js 15 default)
  // No configuration needed
}

module.exports = nextConfig
```

### Workflows and Sequencing

**Epic 1 Implementation Sequence:**

```
Story 1.1: Initialize Project
    ↓
    Creates: package.json, tsconfig.json, basic app structure
    ↓
Story 1.2: Configure Tailwind + Shadcn UI
    ↓
    Creates: tailwind.config.ts, components.json, UI components
    ↓
Story 1.3: Set Up Environment Variables
    ↓
    Creates: .env.local, .env.example
    ↓
Story 1.4: Configure PWA Manifest
    ↓
    Creates: app/manifest.ts, public/icons/
    ↓
Story 1.5: Set Up Build Scripts
    ↓
    Configures: ESLint, build/dev/start scripts
    ↓
Foundation Complete ✅
```

**Story Dependencies:**

- Story 1.2 depends on Story 1.1 (needs Next.js initialized)
- Story 1.3 depends on Story 1.1 (needs project structure)
- Story 1.4 depends on Story 1.1 (needs app/ directory)
- Story 1.5 depends on Stories 1.1, 1.2, 1.3 (needs all configs in place)

**Development Workflow:**

1. Developer clones repository (or starts fresh)
2. Runs `npx create-next-app@latest will-it-rain` (Story 1.1)
3. Configures Tailwind + Shadcn UI (Story 1.2)
4. Creates `.env.local` with placeholders (Story 1.3)
5. Adds PWA manifest and icons (Story 1.4)
6. Configures ESLint and scripts (Story 1.5)
7. Tests: `npm run dev` → Server runs on localhost:3000
8. Tests: `npm run build` → Production build succeeds
9. Tests: `npm run lint` → No errors
10. Foundation validated ✅

## Non-Functional Requirements

### Performance

**NFR-P1: Development Server Startup**
- Target: < 3 seconds (Turbopack optimization)
- Measured from `npm run dev` to "Ready" message
- Acceptance: Server starts without errors, port 3000 accessible

**NFR-P2: Production Build Time**
- Target: < 30 seconds for Epic 1 (minimal code)
- Measured from `npm run build` start to completion
- Acceptance: Build completes without errors, generates `.next/` directory

**NFR-P3: Hot Module Replacement (HMR)**
- Target: < 1 second for component changes
- Turbopack enables fast HMR in Next.js 15
- Acceptance: Changes to components reflect in browser < 1 second

**NFR-P4: Bundle Size (Initial)**
- JavaScript: < 50KB gzipped (minimal foundation)
- CSS: < 10KB gzipped (Tailwind base + minimal custom)
- Acceptance: Lighthouse report shows minimal bundle size

### Security

**NFR-S1: Environment Variable Protection**
- API keys stored in `.env.local` (not committed)
- `.env.local` added to `.gitignore`
- `.env.example` documents required variables (no actual values)
- Acceptance: `.env.local` not in version control, example file present

**NFR-S2: TypeScript Strict Mode**
- Enforces type safety, prevents runtime errors
- No `any` types allowed (ESLint rule)
- Acceptance: `tsconfig.json` has `"strict": true`

**NFR-S3: Dependency Security**
- Only install necessary dependencies
- Use latest stable versions (Next.js 15, React 18)
- Acceptance: `npm audit` shows no high/critical vulnerabilities

**NFR-S4: HTTPS (Production Only)**
- Not applicable for Epic 1 (local development)
- Vercel handles HTTPS in production (Epic 5)
- Acceptance: N/A for foundation epic

### Reliability/Availability

**NFR-R1: Development Server Stability**
- Dev server runs without crashes
- Recovers gracefully from syntax errors
- Acceptance: Server remains running during active development

**NFR-R2: Build Reproducibility**
- Same source code produces identical builds
- No race conditions or timing issues
- Acceptance: `npm run build` succeeds consistently

**NFR-R3: Configuration Validation**
- Missing env vars don't crash server (graceful warnings)
- Invalid TypeScript fails at build time, not runtime
- Acceptance: Clear error messages for config issues

### Observability

**NFR-O1: Development Logging**
- Next.js dev server logs requests and errors
- TypeScript compiler errors displayed clearly
- Build errors shown with file/line numbers
- Acceptance: Console output is readable and helpful

**NFR-O2: Build Output**
- Production build shows bundle sizes
- Lists generated pages and routes
- Shows optimization warnings
- Acceptance: `npm run build` output includes size/route info

**NFR-O3: Lint Error Reporting**
- ESLint shows file, line, and rule violation
- Errors distinguishable from warnings
- Acceptance: `npm run lint` provides actionable feedback

## Dependencies and Integrations

**Runtime Dependencies (package.json):**

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.344.0"
  }
}
```

**Development Dependencies:**

```json
{
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "tailwindcss": "^4.0.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^15.0.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

**External Integrations:**

- **Node.js:** v18+ LTS required
- **npm/yarn/pnpm:** Package manager (npm default)
- **Git:** Version control (initialize in Story 1.1)
- **VS Code:** Recommended editor (optional)

**System Requirements:**

- OS: macOS, Windows, Linux
- Memory: 4GB minimum (8GB recommended)
- Disk: 500MB for node_modules
- Network: Internet for package installation

**Version Constraints:**

- Next.js: 15.0.0 or higher (required for native PWA support)
- React: 18.3.0 or higher (required by Next.js 15)
- TypeScript: 5.3.0 or higher (strict mode features)
- Tailwind CSS: 4.0.0 or higher (UX spec requirement)
- Node.js: 18.0.0 or higher (Next.js requirement)

**Integration Testing:**

- Verify Next.js + TypeScript integration (tsc compiles .tsx files)
- Verify Next.js + Tailwind integration (CSS utilities available)
- Verify Shadcn UI + Tailwind integration (components styled correctly)
- Verify Environment variable loading (process.env.NEXT_PUBLIC_* accessible)

## Acceptance Criteria (Authoritative)

**Epic-Level Acceptance Criteria:**

1. **Project Initialized:**
   - Next.js 15 project created with App Router
   - TypeScript configured with strict mode
   - Git repository initialized
   - README documents setup instructions

2. **Styling System Configured:**
   - Tailwind CSS v4 installed and configured
   - Shadcn UI initialized with dark mode theme
   - Button, Input, Card components installed
   - Styles apply correctly in components

3. **Environment Management Working:**
   - `.env.local` file created (not committed)
   - `.env.example` documents required variables
   - OPENWEATHER_API_KEY placeholder present
   - Environment variables loadable in API routes

4. **PWA Basics Configured:**
   - `app/manifest.ts` created with app metadata
   - App icons generated (192x192, 512x512)
   - Favicon configured
   - Manifest validates with PWA tools

5. **Development Tooling Ready:**
   - `npm run dev` starts server on localhost:3000
   - `npm run build` completes production build
   - `npm run start` serves production build
   - `npm run lint` runs ESLint checks
   - TypeScript compiles without errors

6. **Project Structure Matches Architecture:**
   - `app/`, `components/`, `lib/`, `public/` directories exist
   - Component structure follows conventions
   - No extraneous files or directories

**Story-Level Acceptance Criteria (Traceable to Stories 1.1-1.5):**

See individual story files for detailed acceptance criteria. Epic tech spec provides high-level validation.

## Traceability Mapping

| Acceptance Criteria | Spec Section | Component/File | Test Idea |
|---------------------|--------------|----------------|-----------|
| Project Initialized | Data Models | package.json, tsconfig.json, next.config.js | Run `npm run dev`, verify no errors |
| TypeScript Configured | System Architecture | tsconfig.json with strict: true | Compile project, check for type errors |
| Tailwind CSS Working | Styling System | tailwind.config.ts, globals.css | Add Tailwind class to component, verify styling |
| Shadcn UI Installed | Component Library | components/ui/*.tsx | Import Button, verify it renders |
| Environment Variables | Environment Manager | .env.local, .env.example | Access process.env in API route |
| PWA Manifest | PWA Configuration | app/manifest.ts | Run Lighthouse PWA audit |
| Build Scripts | Development Tooling | package.json scripts | Run build, verify success |
| Lint Configuration | Code Quality | .eslintrc.json | Run lint, verify rules active |

**PRD Requirement Traceability:**

- **NFR-P1 (Performance):** Dev server starts < 3 seconds ✅
- **NFR-P3 (Bundle Size):** Initial bundle < 50KB JS ✅
- **NFR-S2 (API Key Protection):** Environment variables secure ✅
- **NFR-A1 (Accessibility - Foundation):** Shadcn UI provides accessible primitives ✅
- **FR6.1 (PWA Manifest):** Manifest configured ✅

**Architecture Decision Traceability:**

- **ADR-001 (Next.js 15):** Project uses Next.js 15 with App Router ✅
- **ADR-006 (Shadcn UI):** Shadcn UI + Tailwind CSS configured ✅
- **ADR-007 (Vercel):** Project structure compatible with Vercel deployment ✅

## Risks, Assumptions, Open Questions

**Risks:**

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **RISK-1:** Next.js 15 breaking changes from v14 | Low | Medium | Follow official migration guide, test thoroughly |
| **RISK-2:** Tailwind CSS v4 alpha instability | Medium | Medium | Use stable v3 if v4 causes issues, or wait for stable release |
| **RISK-3:** Shadcn UI component incompatibility | Low | Low | Components are copy-paste, can fix locally if needed |
| **RISK-4:** TypeScript strict mode too restrictive | Low | Low | Strict mode is project standard, benefits outweigh friction |
| **RISK-5:** Development environment inconsistencies (Windows/macOS/Linux) | Medium | Low | Document setup for each OS, use Node version manager |

**Assumptions:**

- Developer has Node.js 18+ installed
- Developer has basic knowledge of Next.js and React
- Internet connection available for package installation
- OpenWeather API key will be obtained before Epic 2 (placeholder in Epic 1)
- Vercel account available for deployment (Epic 5)
- Development machine meets minimum system requirements

**Open Questions:**

- **Q1:** Should we use npm, yarn, or pnpm? → **Decision: npm** (most universal, Next.js default)
- **Q2:** Do we need a monorepo structure? → **Decision: No** (single app, unnecessary complexity)
- **Q3:** Should we add Prettier for code formatting? → **Decision: Optional** (ESLint handles basics, add if team prefers)
- **Q4:** Do we need Storybook for component development? → **Decision: No** (simple app, not needed)
- **Q5:** Should we set up GitHub Actions CI/CD? → **Decision: Deferred to Epic 5** (deployment focus)

## Test Strategy Summary

**Unit Tests:**

- **Not applicable for Epic 1** (no business logic yet)
- Configuration files tested implicitly through build/dev commands

**Integration Tests:**

- **Test 1:** Next.js + TypeScript integration
  - Action: Create .tsx component with typed props
  - Expected: Component compiles, types enforced
  - Tool: TypeScript compiler (`tsc --noEmit`)

- **Test 2:** Next.js + Tailwind integration
  - Action: Add Tailwind classes to component
  - Expected: Styles apply correctly
  - Tool: Manual visual inspection + browser dev tools

- **Test 3:** Shadcn UI + Tailwind integration
  - Action: Import and render Button component
  - Expected: Button styled correctly, interactive
  - Tool: Manual testing in browser

- **Test 4:** Environment variable loading
  - Action: Access `process.env.OPENWEATHER_API_KEY` in API route
  - Expected: Value loaded from .env.local
  - Tool: Console log in dev server

**End-to-End Tests:**

- **Test 5:** Development workflow
  - Action: Clone repo, install dependencies, run dev server
  - Expected: Server starts, localhost:3000 accessible
  - Tool: Manual developer onboarding test

- **Test 6:** Production build workflow
  - Action: Run `npm run build`, then `npm run start`
  - Expected: Build succeeds, production server runs
  - Tool: Command line + browser verification

**Acceptance Testing:**

- **Test 7:** Epic 1 DoD (Definition of Done)
  - Action: Complete all 5 stories (1.1-1.5)
  - Expected: All acceptance criteria met
  - Tool: Checklist validation

**Manual Testing Checklist:**

```
□ npm install completes without errors
□ npm run dev starts server on localhost:3000
□ Landing page loads in browser
□ Tailwind CSS classes apply styling
□ Shadcn UI Button component renders
□ TypeScript errors shown in console
□ npm run build completes successfully
□ npm run start serves production build
□ npm run lint runs without errors
□ .env.local not in git (git status check)
□ PWA manifest accessible at /manifest.json
□ App icons present in public/icons/
```

**Testing Tools:**

- **TypeScript Compiler:** Type checking (`tsc --noEmit`)
- **ESLint:** Code quality (`npm run lint`)
- **Next.js Build:** Build validation (`npm run build`)
- **Browser DevTools:** Visual/network inspection
- **Lighthouse:** PWA manifest validation (basic check)

**No Automated Testing in Epic 1:**

- Epic 1 is foundation only - no features to test
- Configuration validated through successful builds
- Automated testing infrastructure added in Epic 5

---

**Epic 1 Tech Spec Complete** ✅

This technical specification provides all details needed to implement the foundation epic. Developers have clear guidance on project initialization, configuration, dependencies, and validation criteria.

**Next Steps:**
1. Implement Story 1.1 (Initialize Next.js Project)
2. Implement Stories 1.2-1.5 in sequence
3. Validate all acceptance criteria
4. Mark Epic 1 as complete
5. Proceed to Epic 2 (Weather Intelligence Engine)
