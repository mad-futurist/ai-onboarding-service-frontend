import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
const PROJECT_ROOT = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  turbopack: {
    root: PROJECT_ROOT,
  },
  async rewrites() {
    return [
      // Trailing-slash preserved variant first
      {
        source: "/api/:path*/",
        destination: `${BACKEND_URL}/:path*/`,
      },
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
