import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["framer-motion"],
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
