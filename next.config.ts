import type { NextConfig } from "next";
import { DEMO_SLUG, OLD_DEMO_SLUGS } from "./src/lib/demo-slug";

const nextConfig: NextConfig = {
  // Runs with "next start" (Railway). Type errors are not blocking the build yet.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async redirects() {
    return OLD_DEMO_SLUGS.map((slug) => ({ source: `/${slug}`, destination: `/${DEMO_SLUG}`, permanent: false }));
  },
  allowedDevOrigins: [
    '.space.z.ai',
  ],
  experimental: {
    // Disable turbopack filesystem cache to fix corruption issues
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
