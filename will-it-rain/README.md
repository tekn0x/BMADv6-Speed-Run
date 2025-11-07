# Will It Rain

A simple, radically simple Progressive Web App that answers one question: **Will it rain in the next 24 hours?**

## Description

Will It Rain provides instant yes/no rain forecasts for any location, helping users make quick decisions about their day. Built with Next.js 16 and TypeScript, this PWA delivers fast, reliable weather information in an accessible interface.

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

3. Set up environment variables:

```bash
# Copy the example environment file
cp .env.example .env.local
```

4. Configure your API keys in `.env.local`:
   - **OpenWeather API**: Get a free API key at [https://openweathermap.org/api](https://openweathermap.org/api)
     - Sign up for a free account
     - Navigate to API keys section
     - Generate a new key
     - Free tier includes 1,000 API calls per day

   - **Upstash Redis** (for analytics): Get credentials at [https://upstash.com/](https://upstash.com/)
     - Create a free account
     - Create a new Redis database
     - Copy the REST URL and REST TOKEN
     - Free tier includes 256MB storage and 500K commands/month

Your `.env.local` file should look like this:

```env
OPENWEATHER_API_KEY=your_actual_api_key_here
UPSTASH_REDIS_REST_URL=your_actual_upstash_url_here
UPSTASH_REDIS_REST_TOKEN=your_actual_upstash_token_here
```

**Important Security Notes:**
- Never commit `.env.local` to version control (already in `.gitignore`)
- Do not share your API keys publicly
- Environment variables are server-side only and not exposed to the browser

### Development

#### Available Scripts

- **`npm run dev`** - Start development server with Turbopack (fast HMR < 1 second)
- **`npm run build`** - Create optimized production build
- **`npm run start`** - Serve production build locally for testing
- **`npm run lint`** - Run ESLint checks on all TypeScript/TSX files
- **`npm run type-check`** - Run TypeScript type checking without emitting files

#### Starting Development

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

### Code Quality

Run ESLint to check code quality:

```bash
npm run lint
```

Run TypeScript type checking:

```bash
npm run type-check
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

## Troubleshooting

### Environment Variable Issues

**Problem: "Environment Variable Validation Failed" error**

This means required environment variables are missing or incorrectly configured.

**Solutions:**
1. Ensure `.env.local` file exists in the root directory:
   ```bash
   ls -la .env.local
   ```

2. Verify all required variables are defined in `.env.local`:
   - OPENWEATHER_API_KEY
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN

3. Check that variable values are not empty or still set to placeholders

4. Restart the development server after making changes:
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

**Problem: "Cannot find module '@/lib/env'" error**

This usually means TypeScript can't resolve the path alias.

**Solutions:**
1. Ensure you're running commands from the project root directory
2. Restart your IDE/editor to pick up tsconfig.json changes
3. Clear Next.js cache: `rm -rf .next` and restart dev server

**Problem: API keys not working**

1. Double-check your API keys are correctly copied (no extra spaces)
2. Verify your OpenWeather API key is activated (can take 10-15 minutes after creation)
3. Ensure you're using the correct Upstash Redis REST credentials (not standard Redis host/port)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Environment Variables Guide](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
