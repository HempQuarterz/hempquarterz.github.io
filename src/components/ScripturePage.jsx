import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectVerses, fetchVerse } from '../bibleSlice';
import { toggleTheme } from '../themeSlice';

const ScripturePage = () => {
  const theme = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const handleThemeChange = () => {
    dispatch(toggleTheme());
  }
  const verse = useSelector(selectVerses);
  const { bibleId, verseId } = useParams();
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
    <main className="container">
      <h4 className="list-heading">
        <span>Verse Content</span>
      </h4>
      <div className="content-container" style={{ color: theme === 'dark' ? 'white' : 'black' }}>
          {verse && verse.content && <div dangerouslySetInnerHTML={createMarkup(verse.content)} />}
        </div>
    </main>
    <button className='back-button' onClick={() => navigate(-1)}>Back</button>
  </div>
  );
};

export default ScripturePage;
