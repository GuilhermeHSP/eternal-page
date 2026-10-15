import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Runs with "next start" (Railway). Type errors are not blocking the build yet.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    '.space.z.ai',
  ],
  experimental: {
    // Disable turbopack filesystem cache to fix corruption issues
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
