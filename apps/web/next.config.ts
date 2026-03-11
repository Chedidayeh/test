import type { NextConfig } from "next";

import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Optimize webpack config for build environments
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
