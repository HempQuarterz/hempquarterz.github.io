/**
 * LibraryPanel - Book selection panel for the CovenantDock
 * Shows all canonical books organized by testament
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import DockPanel, { panelItemVariants } from '../DockPanel';
import { getCanonicalBooks } from '../../../api/canonicalBooks';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

const LibraryPanel = ({ onClose, isMobile, currentBook, onBookSelect }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const isOnManuscripts = location.pathname.startsWith('/manuscripts');

  useEffect(() => {
    getCanonicalBooks({ orderBy: 'order_number' })
      .then(setBooks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleBookClick = (bookCode) => {
    if (isOnManuscripts && onBookSelect) {
      onBookSelect(bookCode);
    } else {
      // Navigate to manuscripts page with this book
      navigate(`/manuscripts?book=${bookCode}&chapter=1&verse=1`);
    }
    if (isMobile) onClose();
  };

  // Group books by testament (simplified - first 39 are OT)
  const otBooks = books.slice(0, 39);
  const ntBooks = books.slice(39);

  return (
    <DockPanel title="Library" onClose={onClose} isMobile={isMobile}>
      {loading ? (
        <div className="panel-loading">Loading books...</div>
      ) : (
        <div className="library-panel-content">
          {/* Old Testament */}
          <div className="library-section">
            <h3 className="library-section-title">Old Testament</h3>
            <div className="library-grid">
              {otBooks.map(book => (
                <motion.button
                  key={book.book_code}
                  variants={prefersReducedMotion ? {} : panelItemVariants}
                  onClick={() => handleBookClick(book.book_code)}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  className={`library-book-btn ${currentBook === book.book_code ? 'active' : ''}`}
                >
                  <span className="book-name">{book.book_name}</span>
                  {currentBook === book.book_code && (
                    <motion.div
                      layoutId="activeBookDot"
                      className="active-book-dot"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* New Testament */}
          <div className="library-section">
            <h3 className="library-section-title">New Testament</h3>
            <div className="library-grid">
              {ntBooks.map(book => (
                <motion.button
                  key={book.book_code}
                  variants={prefersReducedMotion ? {} : panelItemVariants}
                  onClick={() => handleBookClick(book.book_code)}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  className={`library-book-btn ${currentBook === book.book_code ? 'active' : ''}`}
                >
                  <span className="book-name">{book.book_name}</span>
                  {currentBook === book.book_code && (
                    <motion.div
                      layoutId="activeBookDot"
                      className="active-book-dot"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}
    </DockPanel>
  );
};

export default LibraryPanel;
