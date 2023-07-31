import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useHistory  } from 'react-router-dom';
import axios from 'axios';

const BookPage = () => {
  const [bookList, setBookList] = useState([]);
  const location = useLocation();
  const bibleVersionID = new URLSearchParams(location.search).get('version');
  const abbreviation = new URLSearchParams(location.search).get('abbr');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(
          `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/books`,
          {
            headers: {
              'api-key': '5875acef5839ebced9e807466f8ee3ce',
            },
          }
        );

        setBookList(response.data.data);
      } catch (error) {
        console.error('Error fetching books', error);
        setBookList([]);
      }
    };

    if (bibleVersionID) {
      fetchBooks();
    }
  }, [bibleVersionID]);


  function searchButton() {
    const searchInput = document.querySelector(`#search-input`);
    window.location.href = `./search.html?&version=${bibleVersionID}&abbr=${abbreviation}&query=${searchInput.value}`;
  }

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
            <h2>Viewing:</h2>
            <h3>{abbreviation}</h3>
          </div>
        </div>
      </div>
      <main className="container">
        <h4 className="list-heading">
          <span>Select a Book</span>
        </h4>
        <div className="list-container">
          <ul>
            {bookList.map((book) => (
              <li key={book.id}>
                <a href={`/chapter/${bibleVersionID}/${abbreviation}/${book.id}`}>
                  {book.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default BookPage;
