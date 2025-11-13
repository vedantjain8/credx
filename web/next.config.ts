import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "http://localhost:3000",
    "*.tunnelmole.net",
    "*.vercel.app",
  ],
};

export default nextConfig;
