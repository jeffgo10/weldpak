import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_USE_FIREBASE_FUNCTIONS: process.env.NEXT_PUBLIC_USE_FIREBASE_FUNCTIONS,
    NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL: process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL,
  },
};

export default nextConfig;
