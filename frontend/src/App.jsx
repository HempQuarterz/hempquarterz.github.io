import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ManuscriptsPage from './pages/ManuscriptsPage';
import BookPage from './components/BookPage';
import ChapterPage from './components/ChapterPage';
import VersePage from './components/VersePage';
import ScripturePage from './components/ScripturePage';
import { store } from './store';
import { Provider } from 'react-redux';



const App = () => {
  return (
    <Provider store={store} >
    <Router>
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/manuscripts" element={<ManuscriptsPage />} />
        <Route path="/manuscript" element={<ManuscriptsPage />} />
        <Route path="/manuscripts/:book/:chapter/:verse" element={<ManuscriptsPage />} />
        <Route path="/manuscript/:book/:chapter/:verse" element={<ManuscriptsPage />} />
        <Route path="/book" element={<BookPage />} />
        <Route path="/chapter/:version/:abbr/:book" element={<ChapterPage />} />
        <Route path="/verse/:version/:abbr/:book/:chapter" element={<VersePage />} />
        <Route path="/scripture/:bibleId/:version/:abbr/:book/:chapter/:verseId" element={<ScripturePage />} />
  </Routes>
  </Router>
  </Provider>
  );
};

export default App;
