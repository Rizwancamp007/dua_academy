import type { NextConfig } from "next";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("CRITICAL ERROR: NEXTAUTH_SECRET environment variable is missing.");
}

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
