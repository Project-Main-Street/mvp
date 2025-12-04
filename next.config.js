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
};

module.exports = nextConfig;
