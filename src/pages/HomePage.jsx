import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/modern.css';
import { API_CONFIG, getApiHeaders } from '../config/api';
import { logApiError } from '../utils/debug';
import ModernHeader from '../components/ModernHeader';
import Loading from '../components/Loading';

const HomePage = () => {
  const [bibles, setBibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const abortController = new AbortController();

    const fetchBibles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_CONFIG.BASE_URL}/bibles`, {
          headers: getApiHeaders(),
          signal: abortController.signal
        });
        const sortedBibles = sortVersionsByLanguage(response.data.data);
        setBibles(sortedBibles);
      } catch (err) {
        if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
          logApiError('/bibles', err);
          setError('Failed to load Bible versions. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBibles();

    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortVersionsByLanguage = useCallback((bibleVersionList) => {
    const sortedVersions = {};

    for (const version of bibleVersionList) {
      if (!sortedVersions[version.language.name]) {
        sortedVersions[version.language.name] = [];
      }
      sortedVersions[version.language.name].push(version);
    }

    for (const version in sortedVersions) {
      sortedVersions[version].sort((a, b) => a.abbreviation.localeCompare(b.abbreviation));
    }

    return sortedVersions;
  }, []);

  const filteredBibles = useMemo(() =>
    searchTerm
      ? Object.entries(bibles).reduce((acc, [language, versions]) => {
          const filtered = versions.filter(
            (v) =>
              v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              v.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (filtered.length > 0) acc[language] = filtered;
          return acc;
        }, {})
      : bibles,
    [bibles, searchTerm]
  );

  return (
    <div className="fade-in">
      <ModernHeader title="ForYah Bible" />
      
      <main className="container" style={{ paddingTop: '2rem' }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <label htmlFor="version-search" className="visually-hidden">
            Search for a Bible version
          </label>
          <input
            id="version-search"
            type="search"
            placeholder="Search for a Bible version..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search for a Bible version"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              transition: 'all var(--transition-fast)'
            }}
          />
        </div>

        {/* Welcome Card */}
        <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: 'white' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Welcome to ForYah Bible</h2>
          <p style={{ opacity: 0.9 }}>Select a Bible version to start reading</p>
        </div>

        {loading ? (
          <Loading type="skeleton" />
        ) : error ? (
          <div
            className="card"
            style={{
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: 'var(--error-bg, #fee)',
              color: 'var(--error-text, #c33)'
            }}
          >
            <p style={{ marginBottom: '1rem' }}>{error}</p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div>
            {Object.entries(filteredBibles).map(([language, versions]) => (
              <div key={language} style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  marginBottom: '1rem',
                  color: 'var(--text-secondary)'
                }}>
                  {language}
                </h3>
                <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                  {versions.map((version) => (
                    <Link
                      key={version.id}
                      to={`/book?version=${version.id}&abbr=${version.abbreviation}`}
                      className="card"
                      aria-label={`Select ${version.name} (${version.abbreviation})`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        display: 'block'
                      }}
                    >
                      <h4 style={{ 
                        fontSize: '1.125rem', 
                        marginBottom: '0.5rem',
                        color: 'var(--primary)'
                      }}>
                        {version.abbreviation}
                      </h4>
                      <p style={{ 
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.25rem'
                      }}>
                        {version.name}
                      </p>
                      {version.description && (
                        <p style={{ 
                          fontSize: '0.75rem',
                          color: 'var(--text-tertiary)',
                          lineHeight: '1.4'
                        }}>
                          {version.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
