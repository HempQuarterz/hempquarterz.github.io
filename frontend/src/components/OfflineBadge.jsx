import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import '../styles/offline-badge.css';

/**
 * Slim banner that appears at the top of the viewport when the user
 * is offline. Reads from cached IDB; live Supabase queries will fail.
 */
const OfflineBadge = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="offline-badge" role="status" aria-live="polite">
      You're offline — reading from cached scripture
    </div>
  );
};

export default OfflineBadge;
