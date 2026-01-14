/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4004',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'usdt.skylith.cloud',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'usdt.skylith.cloud',
        pathname: '/api/uploads/**',
      },
    ],
  },
  
  // Environment-specific configuration
  env: {
    NEXT_PUBLIC_APP_NAME: 'GroandInvest',
  },
  
  // Output configuration for production
  output: 'standalone',
};

export default nextConfig;
