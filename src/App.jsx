import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BookPage from './components/BookPage';
import ChapterPage from './components/ChapterPage';
import SearchPage from './components/SearchPage';
import VersePage from './components/VersePage';
import ScripturePage from './components/ScipturePage';
import { store } from './store';
import { Provider } from 'react-redux';

const App = () => {
  return (
    <Provider store={store} >
    <Router>
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book" element={<BookPage />} />
        <Route path="/chapter/:version/:abbr/:book" element={<ChapterPage />} />
        <Route path="/verse/:version/:abbr/:book/:chapter" element={<VersePage />} />
        <Route path="/scripture/:version/:abbr/:book/:chapter/:verse" element={<ScripturePage />} />
        <Route path="/search" element={<SearchPage />} />
        {/* Add more routes for other pages */}
  </Routes>  
  </Router>
  </Provider>
  );
};

export default App;
