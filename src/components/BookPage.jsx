import React, { useEffect, useState } from 'react';
import { useDispatch,useSelector } from 'react-redux';
import { useLocation, useNavigate  } from 'react-router-dom';
import axios from 'axios';
import { toggleTheme } from '../themeSlice';

const BookPage = () => {
  const theme = useSelector((state) => state.theme);
  const [bookList, setBookList] = useState([]);
  const location = useLocation();
  const bibleVersionID = new URLSearchParams(location.search).get('version');
  const abbreviation = new URLSearchParams(location.search).get('abbr');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleThemeChange = () => {
    dispatch(toggleTheme());
  }

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


  return (
    <div className={`list-container.section-list ${theme}`}>
      <header>
        <div className="container">
          <h1>
            <a className="flex" href="/">
              <span className="logo" title="HimQuarterz">
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
        <ul style={{ color: theme === 'dark' ? 'white' : 'black' }}>
            {bookList.map((book) => (
              <li key={book.id}>
                <a href={`/chapter/${bibleVersionID}/${abbreviation}/${book.id}`}
                style={{ color: theme === 'dark' ? 'white' : 'black' }}>
                  {book.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <button className="back-button" onClick={() => navigate(-1)}>Back</button>
    </div>
  );
};

export default BookPage;
