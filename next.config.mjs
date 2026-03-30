/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ignoreDuringBuilds: true,
  },
  typescript: {
    // ignoreBuildErrors: true,
  },

  // ── Build optimizations ────────────────────────────────────────────────────
  // Use Turbopack (stable in Next.js 16) for significantly faster builds
  turbopack: {},

  // Strip console.* and debugger statements from production bundles
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Produce a self-contained build folder (faster cold starts, smaller image)
  output: "standalone",

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
