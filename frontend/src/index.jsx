import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/glass.css'; // Premium Glass Effects
import './styles/layout-utilities.css'; // Layout utilities (replaces Tailwind)
import App from './App';
import './styles/modern.css';
import { registerServiceWorker } from './services/registerSW';
import { ensureCacheVersion } from './services/offlineDb';

// Wipe stale IDB caches if DATA_VERSION bumped (no-op when up to date).
ensureCacheVersion();

// Register SW in production only (dev uses Vite HMR, no SW).
registerServiceWorker();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
