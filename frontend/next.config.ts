import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const DEFAULT_BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://ai-onboarding-service.onrender.com"
    : "http://localhost:8000";
const BACKEND_URL = (
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  DEFAULT_BACKEND_URL
).replace(/\/+$/, "");
const PROJECT_ROOT = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  turbopack: {
    root: PROJECT_ROOT,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
