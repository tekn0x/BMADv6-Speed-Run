import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  // Service worker source file location
  swSrc: "app/sw.ts",
  // Service worker output location (in public folder)
  swDest: "public/sw.js",
  // Only enable in production builds (Serwist doesn't support Turbopack)
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  /* config options here */
  // Explicitly configure turbopack as empty to silence webpack/turbopack conflict
  turbopack: {},
};

export default withSerwist(nextConfig);
