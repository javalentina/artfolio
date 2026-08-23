import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/members/:path*",
        destination: "https://members.nataliauchitel.com/members/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
