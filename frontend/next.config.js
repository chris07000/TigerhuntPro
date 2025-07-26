/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}/api`
        : 'https://your-domain.vercel.app/api'
      : 'http://localhost:5000',
    NEXT_PUBLIC_WS_URL: process.env.NODE_ENV === 'production'
      ? process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}/api`
        : 'https://your-domain.vercel.app/api'
      : 'http://localhost:5000',
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },

  // Image optimization
  images: {
    domains: ['app.hyperliquid.xyz'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig 