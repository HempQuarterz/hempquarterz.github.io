import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG, getApiHeaders } from '../config/api';
import ModernHeader from './ModernHeader';
import Loading from './Loading';
import '../styles/modern.css';

const BookPage = () => {
  const [bookList, setBookList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const bibleVersionID = new URLSearchParams(location.search).get('version');
  const abbreviation = new URLSearchParams(location.search).get('abbr');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/bibles/${bibleVersionID}/books`,
          {
            headers: getApiHeaders(),
          }
        );

        setBookList(response.data.data);
      } catch (error) {
        console.error('Error fetching books', error);
        setBookList([]);
      } finally {
        setLoading(false);
      }
    };

    if (bibleVersionID) {
      fetchBooks();
    }
  }, [bibleVersionID]);


  const filteredBooks = bookList.filter(book => 
    book.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group books by testament
  const oldTestament = filteredBooks.filter(book => 
    ['GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'].includes(book.id)
  );
  
  const newTestament = filteredBooks.filter(book => 
    ['MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'].includes(book.id)
  );

  return (
    <div className="fade-in">
      <ModernHeader title={abbreviation} />
      
      <main className="container" style={{ paddingTop: '2rem' }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Search for a book..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              transition: 'all var(--transition-fast)'
            }}
          />
        </div>

        {loading ? (
          <Loading type="skeleton" />
        ) : (
          <div>
            {/* Old Testament */}
            {oldTestament.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  marginBottom: '1rem',
                  color: 'var(--text-secondary)'
                }}>
                  Old Testament
                </h3>
                <div className="grid grid-cols-3" style={{ gap: '0.75rem' }}>
                  {oldTestament.map((book) => (
                    <Link
                      key={book.id}
                      to={`/chapter/${bibleVersionID}/${abbreviation}/${book.id}`}
                      className="card"
                      style={{ 
                        textAlign: 'center',
                        padding: '1rem',
                        textDecoration: 'none',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <p style={{ fontWeight: '500' }}>{book.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* New Testament */}
            {newTestament.length > 0 && (
              <div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  marginBottom: '1rem',
                  color: 'var(--text-secondary)'
                }}>
                  New Testament
                </h3>
                <div className="grid grid-cols-3" style={{ gap: '0.75rem' }}>
                  {newTestament.map((book) => (
                    <Link
                      key={book.id}
                      to={`/chapter/${bibleVersionID}/${abbreviation}/${book.id}`}
                      className="card"
                      style={{ 
                        textAlign: 'center',
                        padding: '1rem',
                        textDecoration: 'none',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <p style={{ fontWeight: '500' }}>{book.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default BookPage;
