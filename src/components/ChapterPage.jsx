import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toggleTheme } from '../themeSlice';

const ChapterPage = () => {
  const theme = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  const handleThemeChange = () => {
    dispatch(toggleTheme());
  }

    const [chapterList, setChapterList] = useState([]);
    const [setChapterContent] = useState([]);
    const { version: bibleId, abbr: abbreviation, book: bookId } = useParams();
    const { chapterId } = useParams();
    const navigate = useNavigate();
  
    useEffect(() => {
        console.log('Bible:', bibleId);
        console.log('Abbreviation:', abbreviation);
 

    const fetchChapters = async () => {
      try {
        const response = await fetch(
          `https://api.scripture.api.bible/v1/bibles/${bibleId}/books/${bookId}/chapters`,
          {
            headers: {
              'api-key': `5875acef5839ebced9e807466f8ee3ce`, 
            },
          }
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();  
        console.log("response", data);

        setChapterList(data.data);
      } catch (error) {
        console.error('Error fetching chapters', error);
      }
    };

    if (bibleId && abbreviation && bookId) {
      fetchChapters();
    }
  }, [bibleId, abbreviation, bookId]);

  useEffect(() => {
    const fetchChapterContent = async () => {
      try {
        const response = await fetch(
          `https://api.scripture.api.bible/v1/bible/${bibleId}/chapters/${chapterId}`,
          {
            headers: { 
              'api-key': `5875acef5839ebced9e807466f8ee3ce`,
            },
          }
        );
    
        setChapterContent(response.data);
      } catch (error) {
        console.error('Error fetching chapter content', error);
      }
    };
  
    
    if (bibleId && chapterId) {
      fetchChapterContent();
    }
  }, [bibleId, chapterId]); 
  

  return (
    <div className={`list-container.section-list ${theme}`}>
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
            <h3>{bookId}</h3>
          </div>
        </div>
      </div>
      <main className="container">
        <h4 className="list-heading">
          <span>Select a Chapter</span>
        </h4>
        <div className="list-container numeric-list">
        <ul style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
        color: theme === 'dark' ? 'white' : 'black' }}>
            {chapterList.map((chapter) => (
              <li key={chapter.id}>
                <a href={`/verse/${bibleId}/${abbreviation}/${bookId}/${chapter.id}`}
                style={{ color: theme === 'dark' ? 'white' : 'black' }}>
                  {chapter.number} - {chapter.reference}
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

export default ChapterPage;
