import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'b.zmtcdn.com',
        pathname: '/data/**',
      },
      {
        protocol: 'https',
        hostname: '**.zmtcdn.com',
      },
    ],
  },
};

export default nextConfig;
