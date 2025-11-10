# Product Brief: Will It Rain

**Date:** 2025-11-05
**Author:** BMad
**Context:** Greenfield Software Project
**Project Type:** Personal/Hobby Tool (with potential for broader audience)

---

## Executive Summary

Will It Rain is a focused, privacy-first weather application designed to answer one simple question: "Will it rain in the next 24 hours?" Built as a Next.js Progressive Web App, it prioritizes simplicity over complexity, providing outdoor activity planners with a clear YES/NO answer backed by probability data and relevant rainfall details when needed. The application represents an intentional rejection of feature bloat in favor of doing one thing exceptionally well.

**Key Highlights:**
- Single-purpose tool for outdoor activity planning decisions
- Privacy-first design (manual location entry only, no tracking)
- Simple 50% probability threshold with helpful "close call" messaging
- Stateless architecture - no caching, no persistence, fresh data every time
- Built with Next.js, Shadcn UI, and OpenWeather API

---

## Core Vision

### Initial Vision

The spark for Will It Rain comes from a desire to create a tool that does one thing perfectly: help people make quick outdoor activity decisions. Unlike comprehensive weather apps loaded with features, this tool strips away everything except the essential question outdoor planners need answered.

From your brainstorming session, the core truth is elegant:
> User provides location → App determines rain probability in next 24 hours → If rain expected, show relevant rainfall details

This isn't trying to be a weather platform - it's a focused decision-making tool built on the principle that simplicity is a feature, not a limitation.

### Problem Statement

People need to make decisions about their day - work, play, community activities, errands, events - and rain is often a critical factor. Existing weather apps bury this simple question under layers of complex data: hourly forecasts, radar maps, temperature graphs, humidity percentages, wind speeds.

The user is forced to:
- Interpret complex meteorological data
- Synthesize information across multiple forecast hours
- Make their own judgment call about probability thresholds
- Spend mental energy on analysis instead of decision-making

**The core problem:** When all someone needs is a trusted YES or NO answer to "Will it rain?", they shouldn't have to become amateur meteorologists to extract that answer.

### Proposed Solution

Will It Rain provides exactly one thing: a trusted, clear answer to whether it will rain in the next 24 hours.

**User experience:**
1. Enter zipcode or city name
2. Get your answer: YES or NO

That's it. One step.

**What you get:**
- **If YES (≥50% probability):** Clear answer + probability % + when rain peaks + intensity/amount details
- **If NO (<50% probability):** Clear answer + probability %
- **If "Close call" (40-49%):** Context message to help you decide

**What makes this different:**
- **One-step simplicity:** Enter location, get answer - no navigation, no menus, no complexity
- **Universal applicability:** Doesn't prescribe what you do with the answer - work, play, community - that's your choice
- **Privacy-first:** Manual location entry only, no geolocation tracking
- **Radically simple architecture:** No caching, no saved searches, no persistence - fresh answer every time
- **Trustworthy threshold:** Clear 50% decision point removes guesswork
- **Helpful context:** "Close call" messaging acknowledges the gray area when probability is borderline

---

## Target Users

### Primary Users

**Anyone who needs a quick, trusted answer to "Will it rain?"**

This tool doesn't segment users by demographics or activities. The user is defined by a single need: making a decision where rain is a factor.

**User characteristics:**
- **Need:** Clear answer to inform planning decisions (work, play, community, errands, events)
- **Context:** Time-constrained - wants answer immediately, not after analyzing data
- **Values:** Privacy (appreciates no tracking), simplicity (no app complexity), trustworthiness (clear threshold)
- **Technical comfort:** Any level - the interface is intentionally minimal
- **Location:** Anywhere OpenWeather API provides coverage (global)

**Why they choose this over comprehensive weather apps:**
- They don't need hourly forecasts, radar maps, or extended outlooks
- They don't want to interpret meteorological data
- They value speed and clarity over comprehensive information
- They appreciate privacy-first design
- They're making a simple go/no-go decision, not planning around complex weather patterns

**Example decision moments:**
- "Should I bike to work or drive?"
- "Can we have the outdoor event today?"
- "Do I need to reschedule the service call?"
- "Should I walk the dog now or wait?"
- "Is today good for yard work?"

The beauty is that the tool doesn't care which scenario - it just answers the question.

---

## MVP Scope

### Core Features

**1. Location Input**
- Single search field accepting zipcode OR city name
- Placeholder text: "Enter zipcode or city"
- Manual entry only (no geolocation/GPS)
- Input validation with helpful error messaging

**2. Rain Probability Engine**
- Fetch OpenWeather API hourly forecast for next 24 hours
- Find highest rain probability across all hours in that window
- Apply 50% threshold decision logic
- Backend processes all calculations (proprietary logic)

**3. Clear Answer Display**
- **YES answer (≥50%):** Show probability %, peak rain time, intensity, and amount details
- **NO answer (<50%):** Show probability % only
- **"Close call" messaging (40-49%):** Add context to help user decide

**4. Landing Page**
- Quick explanation of what the app does
- Immediate access to search (no barriers)
- Clean, minimal design (Shadcn UI components)

**5. Error Handling**
- OpenWeather API failures: "Error - Please check back later"
- Invalid locations: Helpful error + suggest nearby valid locations/zipcodes
- Clear, user-friendly messaging for all error states

**6. Progressive Web App**
- Installable as PWA (works on any device)
- Responsive design (mobile, tablet, desktop)
- Works in browser or as installed app

**7. Analytics (Privacy-First)**
- Log search location + timestamp for usage insights
- No user tracking, no geolocation beyond what user manually enters
- Data used only to understand search patterns (location popularity, time of day trends)

### Out of Scope for MVP

**Explicitly excluded to maintain simplicity:**
- Saved locations or recent searches
- User accounts or authentication
- Data caching or persistence
- Multiple time windows (12-hour, 3-day options) - deferred to future
- Geolocation/GPS tracking
- Extended forecasts beyond 24 hours
- Additional weather data (temperature, wind, humidity, etc.)
- Radar maps or visualizations
- Notifications or alerts
- Social sharing features

### MVP Success Criteria

**The MVP is successful when:**
1. User can enter any valid zipcode or city and get an immediate answer
2. Answer accuracy matches OpenWeather API data reliability
3. Page loads and delivers answer in under 2 seconds
4. Error states are clear and helpful (not technical)
5. Interface requires zero learning curve - immediately understandable
6. Privacy commitment is maintained (no tracking beyond basic analytics)
7. Works seamlessly across mobile, tablet, and desktop
8. PWA is installable on all major platforms

### Future Vision Features

**Planned for post-MVP:**
- Different time window options: next 12 hours, next 3 days (in addition to 24-hour default)

**Intentionally NOT planned:**
- Feature expansion that compromises simplicity
- Transformation into comprehensive weather platform
- Monetization through ads or user data

## Technical Preferences

**Frontend Stack:**
- **Framework:** Next.js (latest version) - Progressive Web App
- **UI Components:** Shadcn UI for polished, accessible interface
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript for type safety

**Backend:**
- **Platform:** Next.js API routes (serverless)
- **Purpose:** Proprietary rain probability logic + analytics logging
- **Data Source:** OpenWeather API (single source of truth)

**Architecture Philosophy:**
- **Stateless:** No caching, no persistence, no stored user data
- **Privacy-first:** No geolocation tracking, minimal analytics (location + timestamp only)
- **Simplicity:** Resist complexity at every level - code, features, infrastructure

**Data Flow:**
1. User input → Next.js frontend
2. Frontend → Backend API route
3. Backend → OpenWeather API (fetch 24-hour hourly forecast)
4. Backend processes data (find max probability, apply threshold logic)
5. Backend logs analytics (location + timestamp)
6. Backend → Frontend (YES/NO + details)
7. Frontend displays answer

**Why These Choices:**
- **Next.js PWA:** Modern, performant, works everywhere (browser or installed)
- **Shadcn UI:** High-quality components, minimal effort, professional appearance
- **Tailwind CSS v4:** Latest tooling for efficient styling
- **OpenWeather API:** Already have API key, reliable, global coverage
- **Stateless architecture:** Simplifies everything - no database, no auth, no complexity
- **TypeScript:** Prevents bugs, improves developer experience

## Risks and Assumptions

**Key Assumptions:**
- OpenWeather API reliability is sufficient for user trust
- 50% probability threshold provides appropriate decision boundary
- Users value simplicity over feature richness
- 24-hour forecast window meets most use cases
- Manual location entry is acceptable (no GPS required)

**Risks & Mitigation:**
- **OpenWeather API downtime:** Show clear error message, user can retry later (low traffic means rate limits not a concern)
- **Invalid location inputs:** Helpful error messaging with suggestions for nearby valid locations
- **Ambiguous city names:** OpenWeather API handles disambiguation (e.g., "Springfield" may default to most common)
- **User expects features not included:** Clear landing page sets expectations about single-purpose tool

**Open Questions:**
- What exactly constitutes "intensity" and "amount" details to show on YES answers?
- Should "Close call" messaging appear at exactly 40-49%, or different range?
- How specific should location suggestions be for invalid inputs?

(These will be resolved during design and development phases)

## Supporting Materials

This Product Brief incorporates insights from:

**Brainstorming Session** (2025-11-05)
- Location: `docs/bmm-brainstorming-session-2025-11-05.md`
- Techniques used: First Principles Thinking, What If Scenarios
- Key outputs: Technical architecture decisions, core feature definitions, UX considerations, error handling strategies
- Core insights incorporated:
  - Simplicity as a feature (stateless architecture, no caching)
  - Privacy-first design (manual entry only, no tracking)
  - Clear decision logic (50% threshold, "close call" messaging)
  - Technology stack (Next.js PWA, Shadcn UI, OpenWeather API)
  - Focused product vision (single-purpose tool, intentional scope limitation)

---

_This Product Brief captures the vision and requirements for Will It Rain._

_It was created through collaborative discovery and reflects the unique needs of this personal/hobby project._

_Next: The PRD workflow will transform this brief into detailed product requirements and epic breakdown for implementation._
