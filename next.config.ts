import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jktsoupvggiwatbqjrgx.supabase.co",
      },
      {
        protocol: "https",
        hostname: "pub-a9e6177ad43e4c0eb03154d542a34529.r2.dev",
      },
      {
        protocol: "https",
        hostname: "assets.nexcampus.io.vn",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
