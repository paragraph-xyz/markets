import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino", "pino-pretty", "thread-stream"],
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
