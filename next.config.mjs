/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow iframe embedding of models
  async headers() {
    return [
      {
        source: '/api/models/:id/runner',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
