import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/glass.css'; // Premium Glass Effects
import './styles/layout-utilities.css'; // Layout utilities (replaces Tailwind)
import App from './App';
import './styles/modern.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
