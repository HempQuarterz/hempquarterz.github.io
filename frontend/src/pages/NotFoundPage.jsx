import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import '../styles/not-found-page.css';

const NotFoundPage = () => {
  useDocumentTitle('Page not found');

  return (
    <div className="not-found-page">
      <div className="not-found-inner">
        <p className="not-found-eyebrow">404</p>
        <h1 className="not-found-title">This passage isn't here</h1>
        <p className="not-found-body">
          The page you're looking for couldn't be found. It may have moved,
          or the link may be broken.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="not-found-link not-found-link--primary">
            Return home
          </Link>
          <Link to="/manuscripts" className="not-found-link">
            Browse Scripture
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
