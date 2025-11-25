import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ManuscriptsPage from './pages/ManuscriptsPage';
import AboutPage from './pages/AboutPage';
import LSIPage from './pages/LSIPage';
import BookPage from './components/BookPage';
import ChapterPage from './components/ChapterPage';
import VersePage from './components/VersePage';
import ScripturePage from './components/ScripturePage';
import AudioCaptureDemo from './components/lsi/AudioCaptureDemo';
import { store } from './store';
import { Provider } from 'react-redux';

// Scholarly theme components - ancient text aesthetic
import FloatingLetters from './components/FloatingLetters';
import ParchmentFilters from './components/ParchmentFilters';
import InkRipple from './components/InkRipple';
import PageTurnTransition from './components/PageTurnTransition';
import './styles/scholarly-theme.css';



const App = () => {
  return (
    <Provider store={store}>
      {/* SVG filter definitions for parchment effects */}
      <ParchmentFilters />

      {/* Parchment background with texture */}
      <div className="parchment-background" aria-hidden="true" />

      {/* Candle glow (dark mode only) */}
      <div className="candle-glow" aria-hidden="true" />

      {/* Floating Hebrew/Greek letters */}
      <FloatingLetters count={30} hebrewRatio={0.6} density="medium" />

      {/* Ink ripple click effect */}
      <InkRipple />

      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PageTurnTransition>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/manuscripts" element={<ManuscriptsPage />} />
            <Route path="/manuscript" element={<ManuscriptsPage />} />
            <Route path="/manuscripts/:book/:chapter/:verse" element={<ManuscriptsPage />} />
            <Route path="/manuscript/:book/:chapter/:verse" element={<ManuscriptsPage />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/chapter/:version/:abbr/:book" element={<ChapterPage />} />
            <Route path="/verse/:version/:abbr/:book/:chapter" element={<VersePage />} />
            <Route path="/scripture/:bibleId/:version/:abbr/:book/:chapter/:verseId" element={<ScripturePage />} />
            <Route path="/lsi" element={<LSIPage />} />
            <Route path="/lsi/demo" element={<AudioCaptureDemo />} />
          </Routes>
        </PageTurnTransition>
      </Router>
    </Provider>
  );
};

export default App;
