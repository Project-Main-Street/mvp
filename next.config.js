/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "content.stack-auth.com",
      },
    ],
  },
  // Development optimizations
  experimental: {
    // Enable optimized package imports for faster dev server startup
    optimizePackageImports: ['@radix-ui/themes', '@radix-ui/react-icons'],
  },
  // Empty turbopack config to silence warning (Turbopack is default in Next.js 16)
  turbopack: {},
};

module.exports = nextConfig;
