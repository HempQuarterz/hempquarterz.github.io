import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectVerses, selectChapterText, fetchChapterText, fetchVerses } from '../bibleSlice';


const VersePage = () => {
    const dispatch = useDispatch();
    const verses = useSelector(selectVerses);
    const chapterText = useSelector(selectChapterText);
    const { version: bibleId, abbr: abbreviation, book: bookId, chapter: chapterId, verse: verseId } = useParams();

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
    <div>
     <header>
        <div className="container">
          <h1>
            <a className="flex" href="/">
              <span className="logo" title="American Bible Society"></span>
              <span>HimQuarterz Bible App</span>
            </a>
          </h1>
        </div>
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
        <div className="list-container numeric-list">
        <ul style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {verses.map((verse) => (
              <li key={verse.id} className='grid'>
              <a href={`/scripture/${bibleId}/${abbreviation}/${bookId}/${chapterId}/${verseId}`}>
                {verse.reference}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <div className="eb-container" id="chapter-text">
      {chapterText && <div dangerouslySetInnerHTML={createMarkup(chapterText.content)} />}
      </div>
    </div>
  );
};

export default VersePage;
