'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { encryptSession, decryptSession } from '@/lib/crypto-utils';

const INACTIVE_THRESHOLD_MS = 60 * 1000;
const ENCRYPTED_SESSION_KEY = 'moneytracker_encrypted_session';
const LAST_ACTIVE_KEY = 'moneytracker_last_active';

export function usePinLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setHasSession(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Initialize state
  useEffect(() => {
    const checkState = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasSession(!!session);

      const encryptedSession = localStorage.getItem(ENCRYPTED_SESSION_KEY);
      
      if (encryptedSession) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHasPin(true);
        
        const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY);
        
        if (lastActiveStr) {
          const lastActive = parseInt(lastActiveStr, 10);
          const timeDiff = Date.now() - lastActive;
          
          if (isNaN(lastActive) || timeDiff > INACTIVE_THRESHOLD_MS) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsLocked(true);
            if (session) {
              await lockApp();
            }
          } else if (!session) {
            // App was closed, Supabase session might be empty if we cleared cookies
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsLocked(true);
          }
        } else {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsLocked(true);
          if (session) {
            await lockApp();
          }
        }
      }
      
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsReady(true);
    };

    checkState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lockApp = useCallback(async () => {
    // Sign out locally to clear cookies and localStorage, but keep the refresh token valid on server
    // Note: scope: 'local' is the standard way to clear client state without revoking the token
    await supabase.auth.signOut({ scope: 'local' });
    setIsLocked(true);
  }, [supabase]);

  // Track activity to auto-lock
  useEffect(() => {
    if (!hasPin) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY);
        if (lastActiveStr) {
          const lastActive = parseInt(lastActiveStr, 10);
          if (Date.now() - lastActive > INACTIVE_THRESHOLD_MS) {
            await lockApp();
          }
        }
      } else {
        localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
      }
    };

    const handleFocus = () => {
      handleVisibilityChange();
    };

    const handleBlur = () => {
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    };

    const resetActivity = () => {
      if (!isLocked) {
        localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
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
  }, [hasPin, isLocked, lockApp]);

  const verifyPin = useCallback(async (pin: string) => {
    const encryptedSession = localStorage.getItem(ENCRYPTED_SESSION_KEY);
    if (!encryptedSession) return { success: false, error: 'No session found' };
    
    try {
      // 1. Decrypt the session JSON string
      const sessionJsonStr = await decryptSession(encryptedSession, pin);
      const sessionObj = JSON.parse(sessionJsonStr);

      // 2. Set the session back into Supabase (this sets the cookies too)
      if (sessionObj.access_token && sessionObj.refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token: sessionObj.access_token,
          refresh_token: sessionObj.refresh_token,
        });

        if (error && error.message !== 'Auth session missing!') {
          console.error('Failed to set session', error);
          return { success: false, error: `Set session: ${error.message}` };
        }
        
        if (error && error.message === 'Auth session missing!') {
          console.warn('Ignored Supabase SSR cookie sync quirk (Auth session missing!)');
        }

        // 3. Unlock app
        setIsLocked(false);
        localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
        return { success: true };
      }
      return { success: false, error: 'Missing tokens in session obj' };
    } catch (e: any) {
      // Incorrect PIN or corrupted data
      console.error('verifyPin Error:', e);
      return { success: false, error: 'Decrypt: ' + e.message };
    }
  }, [supabase]);

  const setupPin = useCallback(async (pin: string) => {
    // 1. Get current active session
    const { data } = await supabase.auth.getSession();
    
    if (data.session) {
      // 2. Encrypt the whole session object
      const sessionJsonStr = JSON.stringify(data.session);
      const encryptedSession = await encryptSession(sessionJsonStr, pin);
      
      // 3. Store the encrypted session
      localStorage.setItem(ENCRYPTED_SESSION_KEY, encryptedSession);
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
      
      setHasPin(true);
      setIsLocked(false);
    } else {
      throw new Error("No active session to encrypt. Please login first.");
    }
  }, [supabase]);

  const clearPin = useCallback(async () => {
    localStorage.removeItem(ENCRYPTED_SESSION_KEY);
    localStorage.removeItem(LAST_ACTIVE_KEY);
    await supabase.auth.signOut(); // Fully sign out since we are clearing PIN
    setHasPin(false);
    setIsLocked(false);
  }, [supabase]);

  return {
    isLocked,
    hasPin,
    hasSession,
    isReady,
    verifyPin,
    setupPin,
    clearPin,
  };
}
