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

  // Ensure proper handling of API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig;
