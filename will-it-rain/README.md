# Will It Rain

A simple, radically simple Progressive Web App that answers one question: **Will it rain in the next 24 hours?**

## Description

Will It Rain provides instant yes/no rain forecasts for any location, helping users make quick decisions about their day. Built with Next.js 15 and TypeScript, this PWA delivers fast, reliable weather information in an accessible interface.

## Requirements

- Node.js 18.0.0 or higher
- npm, yarn, pnpm, or bun package manager

## Getting Started

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The app uses Turbopack for fast development builds. The page auto-updates as you edit files.

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5+ (strict mode)
- **Styling**: Tailwind CSS v4
- **Code Quality**: ESLint
- **Deployment**: Optimized for Vercel

## Project Structure

```
will-it-rain/
├── app/              # Next.js App Router pages and layouts
├── public/           # Static assets
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── next.config.ts    # Next.js configuration
```

## Development Notes

- TypeScript strict mode is enabled - no `any` types allowed
- Server Components are used by default (App Router)
- Path aliases configured: `@/*` maps to project root

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
