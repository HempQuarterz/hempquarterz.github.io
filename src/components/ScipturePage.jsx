import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectVerses, fetchVerse } from '../bibleSlice';

const ScripturePage = () => {
  const dispatch = useDispatch();
  const verse = useSelector(selectVerses);
  const { bibleId, verseId } = useParams();

  useEffect(() => {
    console.log('Bible ID:', bibleId); // Use the renamed variable
    console.log('Verse ID:', verseId); // Use the renamed variable

    if (bibleId && verseId) {
      dispatch(fetchVerse({ bibleId, verseId }));
    }
  }, [dispatch, bibleId, verseId]);

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
    <main className="container">
      <h4 className="list-heading">
        <span>Verse Content</span>
      </h4>
      <div className="content-container">
        <p>{verse}</p>
      </div>
    </main>
  </div>
  );
};

export default ScripturePage;
