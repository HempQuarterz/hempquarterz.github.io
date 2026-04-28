import { useEffect, useState } from 'react';

/**
 * Tracks navigator.onLine. Returns true when online, false when offline.
 * Most browsers fire `online`/`offline` reliably; Safari is occasionally
 * lazy on Wi-Fi sleep, which is acceptable for a non-critical UI hint.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
