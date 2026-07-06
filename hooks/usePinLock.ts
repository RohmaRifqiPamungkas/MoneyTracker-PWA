'use client';

import { useState, useEffect, useCallback } from 'react';

// Waktu threshold inaktif (dalam milidetik). Misal: 1 menit = 60000ms
const INACTIVE_THRESHOLD_MS = 60 * 1000;
const PIN_HASH_KEY = 'moneytracker_pin_hash';
const LAST_ACTIVE_KEY = 'moneytracker_last_active';

/**
 * Utility function to hash the PIN using SHA-256
 */
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function usePinLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Initialize state
  useEffect(() => {
    const storedHash = localStorage.getItem(PIN_HASH_KEY);
    if (storedHash) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasPin(true);
      
      const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY);
      if (lastActiveStr) {
        const lastActive = parseInt(lastActiveStr, 10);
        const timeDiff = Date.now() - lastActive;
        // Lock if time diff is greater than threshold, or if lastActive was somehow cleared/invalid
        if (isNaN(lastActive) || timeDiff > INACTIVE_THRESHOLD_MS) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsLocked(true);
        }
      } else {
        // If there's a PIN but no last active time (e.g. app just closed entirely and re-opened), lock it
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLocked(true);
      }
    }
    
    // Update last active on initial load
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsReady(true);
  }, []);

  // Track activity to auto-lock when returning to app
  useEffect(() => {
    if (!hasPin) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if we need to lock
        const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY);
        if (lastActiveStr) {
          const lastActive = parseInt(lastActiveStr, 10);
          if (Date.now() - lastActive > INACTIVE_THRESHOLD_MS) {
            setIsLocked(true);
          }
        }
      } else {
        // App goes to background
        localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
      }
    };

    // Also track focus/blur if on desktop
    const handleFocus = () => {
      handleVisibilityChange();
    };

    const handleBlur = () => {
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    };

    // Update activity timer when user clicks/types (only needed to reset timer if they don't leave the app)
    const resetActivity = () => {
      if (!isLocked) {
        localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    // Reset activity on common user interactions
    window.addEventListener('click', resetActivity);
    window.addEventListener('keydown', resetActivity);
    window.addEventListener('scroll', resetActivity, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('click', resetActivity);
      window.removeEventListener('keydown', resetActivity);
      window.removeEventListener('scroll', resetActivity);
    };
  }, [hasPin, isLocked]);

  const verifyPin = useCallback(async (pin: string) => {
    const storedHash = localStorage.getItem(PIN_HASH_KEY);
    if (!storedHash) return false;
    
    const hashedInput = await hashPin(pin);
    if (hashedInput === storedHash) {
      setIsLocked(false);
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
      return true;
    }
    return false;
  }, []);

  const setupPin = useCallback(async (pin: string) => {
    const hashedInput = await hashPin(pin);
    localStorage.setItem(PIN_HASH_KEY, hashedInput);
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    setHasPin(true);
    setIsLocked(false);
  }, []);

  const clearPin = useCallback(() => {
    localStorage.removeItem(PIN_HASH_KEY);
    localStorage.removeItem(LAST_ACTIVE_KEY);
    setHasPin(false);
    setIsLocked(false);
  }, []);

  return {
    isLocked,
    hasPin,
    isReady,
    verifyPin,
    setupPin,
    clearPin,
  };
}
