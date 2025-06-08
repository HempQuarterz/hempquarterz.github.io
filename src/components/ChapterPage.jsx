import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_CONFIG, getApiHeaders } from '../config/api';
import ModernHeader from './ModernHeader';
import Loading from './Loading';
import '../styles/modern.css';

const ChapterPage = () => {
  const [chapterList, setChapterList] = useState([]);
  const [chapterContent, setChapterContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const { version: bibleId, abbr: abbreviation, book: bookId } = useParams();
  const { chapterId } = useParams();
  
    useEffect(() => {
        console.log('Bible:', bibleId);
        console.log('Abbreviation:', abbreviation);
 

    const fetchChapters = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/bibles/${bibleId}/books/${bookId}/chapters`,
          {
            headers: getApiHeaders(),
          }
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();  
        console.log("ChapterPage - API Response:", data);
        console.log("ChapterPage - First chapter example:", data.data?.[0]);

        setChapterList(data.data);
      } catch (error) {
        console.error('Error fetching chapters', error);
      } finally {
        setLoading(false);
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
          `${API_CONFIG.BASE_URL}/bibles/${bibleId}/chapters/${chapterId}`,
          {
            headers: getApiHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
    
        const data = await response.json();
        setChapterContent(data.data);
      } catch (error) {
        console.error('Error fetching chapter content', error);
      }
    };
  
    if (bibleId && chapterId) {
      fetchChapterContent();
    }
  }, [bibleId, chapterId, setChapterContent]); 
  

  return (
    <div className="fade-in">
      <ModernHeader title={bookId} />
      
      <main className="container" style={{ paddingTop: '2rem' }}>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Select a Chapter</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{abbreviation} - {bookId}</p>
        </div>

        {loading ? (
          <Loading type="skeleton" />
        ) : (
          <div className="grid grid-cols-4" style={{ gap: '0.75rem' }}>
            {chapterList.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/verse/${bibleId}/${abbreviation}/${bookId}/${chapter.id}`}
                className="card"
                style={{ 
                  textAlign: 'center',
                  padding: '1.5rem',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '1.25rem',
                  fontWeight: '500'
                }}
              >
                {chapter.number}
              </Link>
            ))}
          </div>
        )}
        
        {chapterContent && chapterContent.length > 0 && (
          <div className="verse-card" style={{ marginTop: '2rem' }}>
            {chapterContent.map((verse, index) => (
              <p key={index} style={{ marginBottom: '1rem' }}>{verse}</p>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ChapterPage;
