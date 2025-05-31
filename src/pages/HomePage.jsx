// pages/HomePage.jsx - Modern homepage with improved API integration
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
  const [bibles, setBibles] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const apiKey = '5875acef5839ebced9e807466f8ee3ce';

  useEffect(() => {
    const fetchBibles = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://api.scripture.api.bible/v1/bibles', {
          headers: {
            'api-key': apiKey,
          },
        });
        const sortedBibles = sortVersionsByLanguage(response.data.data);
        setBibles(sortedBibles);
      } catch (error) {
        console.error('Error fetching Bibles', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBibles();
  }, []);

  const sortVersionsByLanguage = (bibleVersionList) => {
    let sortedVersions = {};

    for (const version of bibleVersionList) {
      const langName = version.language.name;
      if (!sortedVersions[langName]) {
        sortedVersions[langName] = [];
      }
      sortedVersions[langName].push(version);
    }

    // Sort versions within each language
    for (const language in sortedVersions) {
      sortedVersions[language].sort((a, b) => 
        a.abbreviation.localeCompare(b.abbreviation)
      );
    }

    return sortedVersions;
  };

  const getLanguages = () => {
    const languages = Object.keys(bibles);
    return languages.sort();
  };

  const getFilteredBibles = () => {
    if (selectedLanguage === 'all') {
      return bibles;
    }
    return { [selectedLanguage]: bibles[selectedLanguage] };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ 
          fontFamily: "'Playfair Display', serif", 
          fontSize: '3rem', 
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Read the Bible
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--text-secondary)',
          marginBottom: '2rem'
        }}>
          Choose from {Object.values(bibles).flat().length} Bible versions in {Object.keys(bibles).length} languages
        </p>
        
        {/* Language Filter */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${selectedLanguage === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedLanguage('all')}
          >
            All Languages
          </button>
          {getLanguages().slice(0, 5).map(lang => (
            <button 
              key={lang}
              className={`btn ${selectedLanguage === lang ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedLanguage(lang)}
            >
              {lang}
            </button>
          ))}
          {getLanguages().length > 5 && (
            <select 
              className="btn btn-secondary"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{ paddingRight: '2rem' }}
            >
              <option value="">More...</option>
              {getLanguages().slice(5).map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Bible Versions Grid */}
      <div className="version-grid">
        {Object.entries(getFilteredBibles()).map(([language, versions]) => (
          <div key={language} className="language-section fade-in">
            <div className="language-header">
              {language} ({versions.length} version{versions.length > 1 ? 's' : ''})
            </div>
            <div className="version-list">
              {versions.map((version) => (
                <Link 
                  key={version.id} 
                  to={`/book?version=${version.id}&abbr=${version.abbreviation}`}
                  className="version-card"
                >
                  <div className="version-abbr">{version.abbreviation}</div>
                  <div className="version-name">{version.name}</div>
                  {version.description && (
                    <div className="version-desc">
                      {version.description.length > 100 
                        ? version.description.substring(0, 100) + '...' 
                        : version.description}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;