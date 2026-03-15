import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Proxy /api dilakukan oleh app/api/[...path]/route.ts agar header (Authorization, Cookie) diteruskan ke backend
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
    proxyClientMaxBodySize: "6mb",
  },
};

export default nextConfig;
