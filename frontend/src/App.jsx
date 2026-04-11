import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ManuscriptsPage from './pages/ManuscriptsPage';
import ErrorBoundary from './components/ErrorBoundary';
import Loading from './components/Loading';
import { store } from './store';
import { Provider } from 'react-redux';

// Scholarly theme components - ancient text aesthetic
import FloatingLetters from './components/FloatingLetters';
import ParchmentFilters from './components/ParchmentFilters';
import InkRipple from './components/InkRipple';
import PageTurnTransition from './components/PageTurnTransition';

import './styles/scholarly-theme.css';

// Covenant Navigation System
import { BreadcrumbRibbon, GlobalDockProvider } from './components/navigation';

// Lazy-loaded routes (reduces initial bundle)
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LSIPage = lazy(() => import('./pages/LSIPage'));
const BookPage = lazy(() => import('./components/BookPage'));
const ChapterPage = lazy(() => import('./components/ChapterPage'));
const VersePage = lazy(() => import('./components/VersePage'));
const ScripturePage = lazy(() => import('./components/ScripturePage'));
const AudioCaptureDemo = lazy(() => import('./components/lsi/AudioCaptureDemo'));

const App = () => {
  return (
    <Provider store={store}>
      {/* Skip Navigation Link */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

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
        {/* Global Dock State Provider (includes CovenantDock) */}
        <GlobalDockProvider>
          {/* Breadcrumb Header */}
          <BreadcrumbRibbon />

          <PageTurnTransition>
            <div id="main-content" className="page-with-dock">
              <ErrorBoundary>
                <Suspense fallback={<Loading />}>
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
                </Suspense>
              </ErrorBoundary>
            </div>
          </PageTurnTransition>
        </GlobalDockProvider>
      </Router>
    </Provider>
  );
};

export default App;
