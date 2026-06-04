/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a standalone build for the Docker runner stage
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:8001/:path*',
      },
    ];
  },
  // Enable React strict mode for development
  reactStrictMode: true,
  // Disable x-powered-by header
  poweredByHeader: false,
};

module.exports = nextConfig;
