import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: "standalone",
  webpack: (config: any, options: any) => {
    return config;
  },
};

export default nextConfig;
