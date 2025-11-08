/**
 * PageTurnTransition - Route transition animation
 * Page turning effect like ancient manuscript
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/page-turn.css';

const PageTurnTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = React.useState(location);
  const [transitionStage, setTransitionStage] = React.useState('fadeIn');

  React.useEffect(() => {
    if (location !== displayLocation) {
      // Start page turn animation
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  const onAnimationEnd = () => {
    if (transitionStage === 'fadeOut') {
      setTransitionStage('fadeIn');
      setDisplayLocation(location);
    }
  };

  return (
    <div
      className={`page-turn-wrapper ${transitionStage}`}
      onAnimationEnd={onAnimationEnd}
    >
      {children}
    </div>
  );
};

export default PageTurnTransition;
