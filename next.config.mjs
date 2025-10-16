/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve TypeORM on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        typeorm: false,
        pg: false,
        'pg-native': false,
        'react-native-sqlite-storage': false,
      };
    }
    // Exclude TypeORM from the bundle
    config.externals = [...(config.externals || []), 'typeorm'];
    return config;
  },
};

export default nextConfig;
