import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 2,
  },
  async redirects() {
    return [
      { source: "/memory", destination: "/patient/memory", permanent: false },
      { source: "/timeline", destination: "/patient/timeline", permanent: false },
      { source: "/medications", destination: "/patient/medications", permanent: false },
      { source: "/risks", destination: "/patient/risks", permanent: false },
      { source: "/consent", destination: "/patient", permanent: false },
      { source: "/audit", destination: "/patient", permanent: false },
      { source: "/evidence", destination: "/patient/memory", permanent: false },
    ];
  },
};

export default nextConfig;
