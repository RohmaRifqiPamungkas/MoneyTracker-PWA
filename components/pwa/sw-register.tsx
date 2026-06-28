"use client";

import { useEffect } from "react";

/**
 * Mendaftarkan service worker saat app pertama kali dimuat.
 * Hanya aktif di production (sw.js hanya ada di production build).
 */
export function SwRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then((registration) => {
          console.log("[SW] Registered:", registration.scope);
        })
        .catch((err) => {
          console.error("[SW] Registration failed:", err);
        });
    }
  }, []);

  return null;
}
