// App.jsx - Modern Bible App with improved UI and API integration
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BookPage from './components/BookPage';
import ChapterPage from './components/ChapterPage';
import VersePage from './components/VersePage';
import ScripturePage from './components/ScripturePage';
import SearchPage from './components/SearchPage';
import Layout from './components/Layout';
import { store } from './store';
import { Provider } from 'react-redux';
import './modern.css';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/chapter/:version/:abbr/:book" element={<ChapterPage />} />
            <Route path="/verse/:version/:abbr/:book/:chapter" element={<VersePage />} />
            <Route path="/scripture/:bibleId/:version/:abbr/:book/:verseId" element={<ScripturePage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
};

export default App;