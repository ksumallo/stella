import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/s',
        destination: '/s/home',
        permanent: true, // Use 301 for permanent redirect
      },
      {
        source: '/s/',
        destination: '/s/home',
        permanent: true, // Also handle trailing slash
      },
    ]
  }
};

export default nextConfig;
