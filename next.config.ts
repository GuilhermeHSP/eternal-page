import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
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
