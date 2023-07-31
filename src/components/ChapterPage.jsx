import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ChapterPage = () => {
    const [chapterList, setChapterList] = useState([]);
    const [chapterContent, setChapterContent] = useState([]);
    const { version: bibleId, abbr: abbreviation, book: bookId } = useParams();
  
  
    useEffect(() => {
        console.log('Bible:', bibleId);
        console.log('Abbreviation:', abbreviation);
 

    const fetchChapters = async () => {
      try {
        const response = await fetch(
          `https://api.scripture.api.bible/v1/bibles/0c2ff0a5c8b9069c-01/books/MRK/chapters`,
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

  const handleChapterSelect = async (chapterId) => {
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
            <h3>{bookId}</h3>
          </div>
        </div>
      </div>
      <main className="container">
        <h4 className="list-heading">
          <span>Select a Chapter</span>
        </h4>
        <div className="list-container numeric-list">
          <ul>
            {chapterList.map((chapter) => (
              <li key={chapter.id}>
                <a href={`/verse/${bibleId}/${abbreviation}/${bookId}/${chapter.id}`}>
                  {chapter.number} - {chapter.reference}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default ChapterPage;
