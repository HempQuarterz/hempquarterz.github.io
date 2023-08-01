import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectVerses, selectChapterText, fetchChapterText, fetchVerses } from '../bibleSlice';
import { toggleTheme } from '../themeSlice';


const VersePage = () => {
    const theme = useSelector((state) => state.theme);
    const dispatch = useDispatch();
    const handleThemeChange = () => {
      dispatch(toggleTheme());
    }
    const verses = useSelector(selectVerses);
    const chapterText = useSelector(selectChapterText);
    const { version: bibleId, abbr: abbreviation, book: bookId, chapter: chapterId, verse: verseId } = useParams();
    const navigate = useNavigate();

  useEffect(() => {
    console.log('Version:', bibleId); 
    console.log('Abbreviation:', abbreviation);
    console.log('Book:', bookId);
    console.log('Chapter:', chapterId); 
    console.log("Before message")
    if (bibleId && abbreviation && bookId && chapterId) {
        console.log("After message")
         dispatch(fetchVerses({ bibleId, chapterId }));
        dispatch(fetchChapterText({ bibleId, bookId, chapterId }));
      }
    }, [dispatch, bibleId, bookId, chapterId, abbreviation]);

    const createMarkup = (htmlString) => {
      return { __html: htmlString };
    };

   
  return (
    <div className={`content-container ${theme}`}>
     <header>
        <div className="container">
          <h1>
            <a className="flex" href="/">
              <span className="logo" title="HimQuarterz"></span>
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
            <h3>{chapterId}</h3>
          </div>
        </div>
      </div>
      <main className="container">
        <h4 className="list-heading">
          <span>Select a Verse</span>
        </h4>
        <div className="list-container numeric-list" style={{ color: theme === 'dark' ? 'white' : 'black' }}>
        <ul style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
         color: theme === 'dark' ? 'white' : 'black' }}>
            {verses.map((verse) => (
              <li key={verse.id} className='grid'>
              <a href={`/scripture/${bibleId}/${abbreviation}/${bookId}/${chapterId}/${verse.id}`} style={{ color: theme === 'dark' ? 'white' : 'black' }}>
                {verse.reference}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <div className="eb-container" id="chapter-text" style={{ color: theme === 'dark' ? 'white' : 'black' }}>
      {chapterText && <div dangerouslySetInnerHTML={createMarkup(chapterText.content)} />}
      </div>
      <button className="back-button" onClick={() => navigate(-1)}>Back</button>
    </div>
  );
};

export default VersePage;
