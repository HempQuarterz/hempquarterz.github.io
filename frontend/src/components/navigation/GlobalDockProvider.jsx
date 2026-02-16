/**
 * GlobalDockProvider - Connects CovenantDock to Redux store
 *
 * Provides manuscript state and actions to the dock panels
 * Uses Redux for persistence across route changes
 */

import React, { useState, useMemo, createContext, useContext, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setSelectedVerse } from '../../manuscriptsSlice';
import CovenantDock from './CovenantDock';

// Context for dock state (exported for consumption in components)
export const DockContext = createContext(null);

export const useDockContext = () => {
  const context = useContext(DockContext);
  // Return null instead of throwing - allows components to check if context exists
  return context;
};

const GlobalDockProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  // Get manuscript state from Redux with stable default
  const reduxSelectedVerse = useSelector(state => state.manuscripts?.selectedVerse);
  const selectedVerse = useMemo(() => reduxSelectedVerse || {
    book: 'GEN',
    chapter: 1,
    verse: 1
  }, [reduxSelectedVerse]);

  // Local state for view settings (not in Redux)
  const [showRestored, setShowRestored] = useState(true);
  const [viewMode, setViewMode] = useState('chapter');

  // Handle book change
  const handleBookChange = useCallback((bookCode) => {
    const newVerse = {
      book: bookCode,
      chapter: 1,
      verse: 1
    };
    dispatch(setSelectedVerse(newVerse));

    // Update URL if on manuscripts page
    if (window.location.pathname.startsWith('/manuscripts')) {
      setSearchParams({
        book: bookCode,
        chapter: '1',
        verse: '1'
      });
    } else {
      // Navigate to manuscripts page
      navigate(`/manuscripts?book=${bookCode}&chapter=1&verse=1`);
    }
  }, [dispatch, navigate, setSearchParams]);

  // Handle chapter change
  const handleChapterChange = useCallback((chapter) => {
    const newVerse = {
      ...selectedVerse,
      chapter: parseInt(chapter),
      verse: 1
    };
    dispatch(setSelectedVerse(newVerse));

    // Update URL if on manuscripts page
    if (window.location.pathname.startsWith('/manuscripts')) {
      setSearchParams({
        book: selectedVerse.book,
        chapter: String(chapter),
        verse: '1'
      });
    } else {
      navigate(`/manuscripts?book=${selectedVerse.book}&chapter=${chapter}&verse=1`);
    }
  }, [dispatch, navigate, selectedVerse, setSearchParams]);

  // Toggle divine name restoration
  const toggleRestoration = useCallback(() => {
    setShowRestored(prev => !prev);
  }, []);

  // Context value
  const contextValue = {
    currentBook: selectedVerse.book,
    currentChapter: selectedVerse.chapter,
    currentVerse: selectedVerse.verse,
    onBookChange: handleBookChange,
    onChapterChange: handleChapterChange,
    showRestored,
    toggleRestoration,
    viewMode,
    setViewMode
  };

  return (
    <DockContext.Provider value={contextValue}>
      {/* Render the CovenantDock with context */}
      <CovenantDock
        currentBook={selectedVerse.book}
        currentChapter={selectedVerse.chapter}
        currentVerse={selectedVerse.verse}
        onBookChange={handleBookChange}
        onChapterChange={handleChapterChange}
        showRestored={showRestored}
        toggleRestoration={toggleRestoration}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Render children (routes) */}
      {children}
    </DockContext.Provider>
  );
};

export default GlobalDockProvider;
