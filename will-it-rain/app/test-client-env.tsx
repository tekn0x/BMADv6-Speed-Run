'use client';

/**
 * Test Client Component - Verifies Environment Variables are NOT accessible client-side
 *
 * This component attempts to access environment variables from the client.
 * Expected behavior: All values should be undefined (security requirement).
 *
 * This is a test file for development only - should be removed before production.
 */

export function TestClientEnv() {
  // Attempt to access environment variables from client-side
  // These should ALL be undefined because they don't have NEXT_PUBLIC_ prefix
  const clientApiKey = process.env.OPENWEATHER_API_KEY;
  const clientUpstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const clientUpstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  return (
    <div className="p-4 border-2 border-destructive rounded-lg bg-surface/50">
      <h3 className="text-lg font-semibold mb-2 text-destructive">
        ⚠️ Client-Side Environment Variable Test
      </h3>
      <p className="text-sm text-muted mb-4">
        All values below should be &quot;undefined&quot; to confirm security (server-side only access):
      </p>
      <ul className="space-y-1 text-sm font-mono">
        <li>
          OPENWEATHER_API_KEY: <span className={clientApiKey === undefined ? 'text-success' : 'text-destructive'}>
            {String(clientApiKey)}
          </span>
        </li>
        <li>
          UPSTASH_REDIS_REST_URL: <span className={clientUpstashUrl === undefined ? 'text-success' : 'text-destructive'}>
            {String(clientUpstashUrl)}
          </span>
        </li>
        <li>
          UPSTASH_REDIS_REST_TOKEN: <span className={clientUpstashToken === undefined ? 'text-success' : 'text-destructive'}>
            {String(clientUpstashToken)}
          </span>
        </li>
      </ul>
      <p className="text-xs text-muted mt-4">
        ✅ Green = Secure (undefined) | ❌ Red = Security Issue (exposed)
      </p>
    </div>
  );
}
