import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, NetworkOnly, Serwist } from "serwist";

// This declares the value of `self.__SW_MANIFEST` to be of type PrecacheEntry[]
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  // Precache entries auto-injected by Serwist during build
  precacheEntries: self.__SW_MANIFEST,
  // Immediately activate new service worker
  skipWaiting: true,
  // Take control of all clients immediately
  clientsClaim: true,
  // Enable navigation preload for faster navigation
  navigationPreload: true,
  // Runtime caching strategies
  runtimeCaching: [
    // Cache-first strategy for static Next.js assets (JavaScript, CSS)
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: new CacheFirst({
        cacheName: "static-cache-v1",
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              return response.status === 200 ? response : null;
            },
          },
        ],
      }),
    },
    // Cache-first strategy for images (including PWA icons)
    {
      matcher: ({ url }) => {
        const imageExtensions = [".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp", ".ico"];
        return imageExtensions.some((ext) => url.pathname.endsWith(ext));
      },
      handler: new CacheFirst({
        cacheName: "image-cache-v1",
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              return response.status === 200 ? response : null;
            },
          },
        ],
      }),
    },
    // Network-only strategy for API routes (never cache weather data)
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },
  ],
});

// Add event listeners
serwist.addEventListeners();
