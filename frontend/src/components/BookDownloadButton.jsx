import React, { useEffect, useState } from 'react';
import { downloadBook, isBookDownloaded, removeBookFromCache } from '../services/offlineCache';
import '../styles/book-download-button.css';

/**
 * Tier 3 offline cache UI: download / remove the current book in the
 * given manuscript for offline reading.
 */
const BookDownloadButton = ({ manuscript = 'WEB', book, totalChapters, bookName }) => {
  const [downloaded, setDownloaded] = useState(false);
  const [progress, setProgress] = useState(null); // null | { done, total }
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setProgress(null);
    setError(null);
    isBookDownloaded(manuscript, book).then((result) => {
      if (!cancelled) setDownloaded(result);
    });
    return () => { cancelled = true; };
  }, [manuscript, book]);

  if (!book || !totalChapters) return null;

  const handleDownload = async () => {
    try {
      setError(null);
      setProgress({ done: 0, total: totalChapters });
      await downloadBook(manuscript, book, totalChapters, (done, total) => {
        setProgress({ done, total });
      });
      setDownloaded(true);
      setProgress(null);
    } catch (err) {
      console.error('Book download failed:', err);
      setError(err.message || 'Download failed');
      setProgress(null);
    }
  };

  const handleRemove = async () => {
    try {
      await removeBookFromCache(manuscript, book);
      setDownloaded(false);
    } catch (err) {
      console.error('Remove failed:', err);
      setError(err.message || 'Remove failed');
    }
  };

  if (progress) {
    const pct = Math.round((progress.done / progress.total) * 100);
    return (
      <div className="bdl-progress" role="status" aria-live="polite">
        <div className="bdl-progress-bar" style={{ width: `${pct}%` }} />
        <span className="bdl-progress-label">
          Downloading {bookName || book}… {progress.done} / {progress.total} chapters
        </span>
      </div>
    );
  }

  if (downloaded) {
    return (
      <button
        type="button"
        className="bdl-btn bdl-btn--downloaded"
        onClick={handleRemove}
        title={`Remove ${bookName || book} from offline cache`}
      >
        ✓ Offline
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        className="bdl-btn"
        onClick={handleDownload}
        title={`Download ${bookName || book} for offline reading`}
      >
        ↓ Download
      </button>
      {error && <span className="bdl-error" role="alert">{error}</span>}
    </>
  );
};

export default BookDownloadButton;
