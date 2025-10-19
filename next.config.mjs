/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for serverless deployment
  output: 'standalone',

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve TypeORM on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        typeorm: false,
        pg: false,
        'pg-native': false,
        'react-native-sqlite-storage': false,
        'better-sqlite3': false,
        sqlite3: false,
      };
    }

    // Exclude TypeORM and database drivers from the bundle
    config.externals = [
      ...(config.externals || []),
      'typeorm',
      'pg-native',
      'better-sqlite3',
      'sqlite3',
    ];

    return config;
  },

  // Enable experimental features for better performance
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Security and API headers
  async headers() {
    return [
      // Security headers for all routes
      {
        source: '/:path*',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Enable XSS protection
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions policy
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://*.clerk.accounts.dev",
              "worker-src 'self' blob:",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.openrouter.ai https://*.clerk.accounts.dev https://clerk.com wss://*.clerk.accounts.dev",
              "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
      // CORS headers for API routes
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ];
  },
};

export default nextConfig;
