import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Next.js <Image> optimisation for YouTube thumbnails
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  compiler: {
    // Strip console.* calls in production builds
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
