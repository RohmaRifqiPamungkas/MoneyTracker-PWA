import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MoneyTracker — Kelola Keuanganmu",
    short_name: "MoneyTracker",
    description: "Aplikasi manajemen keuangan pribadi yang cerdas dan mudah digunakan.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0f1a",
    theme_color: "#10b981",
    categories: ["finance", "productivity"],
    lang: "id",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [],
    shortcuts: [
      {
        name: "Dashboard",
        url: "/dashboard",
        description: "Buka dashboard keuangan",
      },
    ],
  };
}
