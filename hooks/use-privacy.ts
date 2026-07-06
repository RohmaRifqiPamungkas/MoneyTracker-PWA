"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "mt_hide_balance";

export function usePrivacy() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Initial load
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setHidden(saved === "true");
    }

    // Listen for changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setHidden(e.newValue === "true");
      }
    };

    // Listen for custom event within same window
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ hidden: boolean }>;
      setHidden(customEvent.detail.hidden);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("mt_privacy_change", handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("mt_privacy_change", handleCustomEvent as EventListener);
    };
  }, []);

  const toggleHidden = () => {
    const next = !hidden;
    setHidden(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    window.dispatchEvent(
      new CustomEvent("mt_privacy_change", { detail: { hidden: next } })
    );
  };

  return { hidden, toggleHidden };
}
