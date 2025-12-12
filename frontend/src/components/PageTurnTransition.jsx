/**
 * PageTurnTransition - Route transition animation
 * Page turning effect like ancient manuscript
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/page-turn.css';

const PageTurnTransition = ({ children }) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="page-turn-wrapper fade-in"
      style={{ animation: 'simpleFadeIn 0.5s ease-out forwards' }}
    >
      {children}
    </div>
  );
};

export default PageTurnTransition;
