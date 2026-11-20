import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.29.156'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/aida-public/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.hashnode.com',
        pathname: '/res/hashnode/image/upload/**',
      },
    ],
  },
};

export default nextConfig;
