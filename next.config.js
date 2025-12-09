/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    viewTransitions: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "content.stack-auth.com",
      },
    ],
  },
};

module.exports = nextConfig;
