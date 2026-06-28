"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // Default true to prevent flash
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Cek apakah sudah di-install (standalone mode)
    const checkStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(checkStandalone);

    if (checkStandalone) return;

    // Cek apakah user pernah dismiss prompt ini sebelumnya
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed === "true") return;

    // Cek device iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    if (ios) {
      // Tampilkan prompt untuk iOS setelah delay
      setTimeout(() => setShowPrompt(true), 3000);
    } else {
      // Tangkap event install prompt bawaan Chrome/Android
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setTimeout(() => setShowPrompt(true), 3000);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl shadow-xl p-4 flex gap-4 items-start relative overflow-hidden backdrop-blur-xl bg-opacity-90">
          {/* Subtle gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent pointer-events-none" />

          <div className="bg-emerald-500/10 text-emerald-500 p-2.5 rounded-xl shrink-0 mt-0.5">
            <Download className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Pasang MoneyTracker
            </h3>
            {isIOS ? (
              <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                Tap <Share className="inline h-3.5 w-3.5 mx-0.5" /> lalu pilih{" "}
                <strong className="text-[var(--foreground)] font-medium">Add to Home Screen</strong>{" "}
                untuk akses offline & cepat.
              </p>
            ) : (
              <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                Pasang aplikasi ini di layar utama untuk akses lebih cepat dan dukungan offline.
              </p>
            )}

            {!isIOS && (
              <Button
                onClick={handleInstall}
                size="sm"
                className="mt-3 w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-none rounded-lg text-xs h-8"
              >
                Pasang Sekarang
              </Button>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
