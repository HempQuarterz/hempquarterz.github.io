import React, { useState, useEffect } from 'react';
import axios from 'axios'; // use axios for http requests

const API_KEY = '5875acef5839ebced9e807466f8ee3ce'; // replace with your actual API key

function BibleSearch() {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [offset, setOffset] = useState(0);
  const [bibleVersionID, setBibleVersionID] = useState('defaultBibleVersionID'); // replace with your actual default Bible version ID
  const [abbreviation, setAbbreviation] = useState('defaultAbbreviation'); // replace with your actual default abbreviation

  const search = (searchText, offset = 0, bibleVersionID) => {
    setSearchText(searchText);
    getResults(searchText, offset, bibleVersionID);
  }

  const getResults = (searchText, offset = 0, bibleVersionID) => {
    axios.get(`https://v2.api.bible/bibles/${bibleVersionID}/search?query=${searchText}&offset=${offset}`, {
      headers: {
        'api-key': API_KEY
      }
    }).then(response => {
      let data = response.data;
      // handle your data as required
      setSearchResults(data);
    }).catch(err => {
      console.log('error: ', err);
    });
  }

  const handleSearchInput = (e) => {
    setSearchText(e.target.value);
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    search(searchText, offset, bibleVersionID);
  }

  return (
    <div>
      <form onSubmit={handleSearchSubmit}>
        <input type="text" value={searchText} onChange={handleSearchInput} />
        <button type="submit">Search</button>
      </form>
      <div>
        {/* iterate over searchResults and render the results here */}
        {searchResults.map((result, index) => (
          <div key={index}>
            {/* your result structure here */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BibleSearch;
