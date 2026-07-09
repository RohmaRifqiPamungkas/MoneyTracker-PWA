import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  // Lokasi source service worker
  swSrc: "app/sw.ts",
  // Lokasi output service worker yang sudah dikompilasi
  swDest: "public/sw.js",
  // Disable saat development agar tidak mengganggu hot-reload
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns', 'framer-motion'],
  },
  async headers() {
    return [
      // Security headers untuk semua route
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",            value: "nosniff" },
          { key: "X-Frame-Options",                   value: "DENY" },
          { key: "Referrer-Policy",                   value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control",            value: "on" },
          { key: "Permissions-Policy",                value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // Header khusus untuk service worker — jangan di-cache oleh browser
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type",    value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control",   value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
