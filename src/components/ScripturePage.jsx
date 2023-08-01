import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectVerses, fetchVerse } from '../bibleSlice';

const ScripturePage = () => {
  const dispatch = useDispatch();
  const verse = useSelector(selectVerses);
  const { bibleId, version, abbr, book, verseId } = useParams();
  const navigate = useNavigate();
 

  useEffect(() => {
    console.log('Bible ID:', bibleId); 
    console.log('Verse ID:', verseId); 

    if (bibleId && verseId) {
      dispatch(fetchVerse({ bibleId, verseId }));
    }
  }, [dispatch, bibleId, verseId]);

  const createMarkup = (htmlString) => {
    return { __html: htmlString };
  };

  return (
    <div>
    <header>
      <div className="container">
        <h1>
          <a className="flex" href="/">
            <span className="logo" title="HimQuarterz"></span>
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
          {verse && verse.content && <div dangerouslySetInnerHTML={createMarkup(verse.content)} />}
        </div>
    </main>
    <button className='back-button' onClick={() => navigate(-1)}>Back</button>
  </div>
  );
};

export default ScripturePage;
