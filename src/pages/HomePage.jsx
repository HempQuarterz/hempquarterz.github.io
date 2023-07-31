import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
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
    <div>
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
      </header>
      <div className="subheader">
        <div className="container flex">
          <div className="subheadings">
            <h2>Select a:</h2>
            <h3>Bible</h3>
          </div>
        </div>
      </div>
      <main className="container">
        {Object.entries(bibles).map(([language, versions]) => (
          <div key={language}>
            <h4 className="list-heading">
              <span>{language}</span>
            </h4>
            <ul>
              {versions.map((version) => (
                <li key={version.id}>
                  <Link to={`/book?version=${version.id}&abbr=${version.abbreviation}`}>
                    <abbr className="bible-version-abbr" title={version.name}>
                      {version.abbreviation}
                    </abbr>
                    <span>
                      <span className="bible-version-name">{version.name}</span>
                      {version.description && (
                        <span className="bible-version-desc">{version.description}</span>
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
