import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s4.anilist.co",
      },
      {
        protocol: "https",
        hostname: "media.kitsu.io",
      },
      {
        protocol: "https",
        hostname: "cdn.noitatnemucod.net",
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
