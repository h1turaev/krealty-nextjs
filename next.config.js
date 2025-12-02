/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    REACT_APP_API_GRAPHQL_URL: process.env.REACT_APP_API_GRAPHQL_URL,
    REACT_APP_API_WS: process.env.REACT_APP_API_WS,
    // Client-side uchun NEXT_PUBLIC_ prefiksli variable'lar
    NEXT_PUBLIC_REACT_APP_API_URL: process.env.NEXT_PUBLIC_REACT_APP_API_URL,
    NEXT_PUBLIC_REACT_APP_API_GRAPHQL_URL: process.env.NEXT_PUBLIC_REACT_APP_API_GRAPHQL_URL,
    NEXT_PUBLIC_REACT_APP_API_WS: process.env.NEXT_PUBLIC_REACT_APP_API_WS,
  },
  // Compile tezligini yaxshilash
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // TypeScript va ESLint checklarini faqat build vaqtida ishlatish
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Webpack optimizatsiyalari
  webpack: (config, { dev, isServer }) => {
    // Development rejimida compile tezligini yaxshilash
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      // Cache optimizatsiyasi
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    return config;
  },
  // Experimental features
  experimental: {
    optimizeCss: false, // CSS optimizatsiyasi compile vaqtini oshiradi
  },
};

const { i18n } = require('./next-i18next.config');
nextConfig.i18n = i18n;

module.exports = nextConfig;
