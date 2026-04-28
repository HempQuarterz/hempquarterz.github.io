import React, { useEffect, useState } from 'react';
import { getCacheStats, clearAllCache } from '../services/offlineCache';
import '../styles/cache-settings.css';

/**
 * User-facing offline-cache control. Shows live stats and offers a
 * Clear-All escape hatch. Reads/writes IDB via offlineCache helpers.
 */
const CacheSettings = () => {
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [error, setError] = useState(null);

  const refreshStats = async () => {
    try {
      setError(null);
      const result = await getCacheStats();
      setStats(result);
    } catch (err) {
      setError(err.message || 'Failed to read cache stats');
    }
  };

  useEffect(() => { refreshStats(); }, []);

  const handleClear = async () => {
    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }
    try {
      setBusy(true);
      setError(null);
      await clearAllCache();
      await refreshStats();
      setConfirmingClear(false);
    } catch (err) {
      setError(err.message || 'Clear failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="cache-settings" aria-labelledby="cache-settings-heading">
      <h2 id="cache-settings-heading">Offline cache</h2>
      <p className="cache-settings-intro">
        Verses you read are cached locally so you can keep reading without
        a connection. Use the download button on the Scripture page to grab
        an entire book at once.
      </p>

      <dl className="cache-stats">
        <div>
          <dt>Verses cached</dt>
          <dd>{stats ? stats.verseCount.toLocaleString() : '—'}</dd>
        </div>
        <div>
          <dt>Chapters fully cached</dt>
          <dd>{stats ? stats.chapterCount.toLocaleString() : '—'}</dd>
        </div>
        <div>
          <dt>Books downloaded</dt>
          <dd>{stats ? stats.bookCount.toLocaleString() : '—'}</dd>
        </div>
      </dl>

      {error && <p className="cache-settings-error" role="alert">{error}</p>}

      <div className="cache-settings-actions">
        <button
          type="button"
          className="cache-btn"
          onClick={refreshStats}
          disabled={busy}
        >
          Refresh
        </button>
        <button
          type="button"
          className={`cache-btn ${confirmingClear ? 'cache-btn--danger' : 'cache-btn--ghost'}`}
          onClick={handleClear}
          disabled={busy || (stats?.verseCount === 0 && !confirmingClear)}
        >
          {busy ? 'Clearing…' : confirmingClear ? 'Confirm — delete all cached verses' : 'Clear cache'}
        </button>
        {confirmingClear && !busy && (
          <button
            type="button"
            className="cache-btn cache-btn--ghost"
            onClick={() => setConfirmingClear(false)}
          >
            Cancel
          </button>
        )}
      </div>
    </section>
  );
};

export default CacheSettings;
