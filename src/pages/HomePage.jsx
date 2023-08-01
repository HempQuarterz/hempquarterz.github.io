import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../main.css';
import { toggleTheme } from '../themeSlice';

const HomePage = () => {
  const theme = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  const handleThemeChange = () => {
    dispatch(toggleTheme());
  }

  const [bibles, setBibles] = useState([]);
  const apiKey = '5875acef5839ebced9e807466f8ee3ce';

  useEffect(() => {
    const fetchBibles = async () => {
      try {
        const response = await axios.get('https://api.scripture.api.bible/v1/bibles', {
          headers: {
            'api-key': apiKey,
          },
        });
        const sortedBibles = sortVersionsByLanguage(response.data.data);
        setBibles(sortedBibles);
      } catch (error) {
        console.error('Error fetching Bibles', error);
      }
    };

    fetchBibles();
  }, [apiKey]);

  const sortVersionsByLanguage = (bibleVersionList) => {
    let sortedVersions = {};

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
  };

  return (
    <div className={`list-container.section-list ${theme}`}>
      <header>
        <div className="container">
          <h1>
            <a className="flex" href="/">
              <span className="logo" title="American Bible Society">
                
              </span>
              <span>HimQuarterz Bible App</span>
            </a>
          </h1>
        </div>
        <button onClick={handleThemeChange} className="themeButton">Toggle Theme</button>
      </header>
      <div className="subheader">
        <div className="container flex">
          <div className="subheadings">
            <h2>Select a:</h2>
            <h3>Bible</h3>
          </div>
        </div>
      </div>
      <main className=".list-container.section-list">
        {Object.entries(bibles).map(([language, versions]) => (
          <div key={language} className='.list-container.section-list'>
            <h4 className="list-heading">
              <span>{language}</span>
            </h4>
            <ul style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px", color: theme === 'dark' ? 'white' : 'black' }}>
              {versions.map((version) => (
                <li key={version.id} className='.list-container.section-list'>
                  <Link to={`/book?version=${version.id}&abbr=${version.abbreviation}`}
                  style={{ color: theme === 'dark' ? 'white' : 'black' }}>
                    <abbr className=".list-container.section-list" title={version.name}>
                      {version.abbreviation}
                    </abbr>
                    <span className='.list-container.section-list'>
                      <span className="list-container.bible-list">{version.name}</span>
                      {version.description && (
                        <span className="list-container.bible-list">{version.description}</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </main>
    </div>
  );
};

export default HomePage;
