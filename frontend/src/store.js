import { configureStore } from '@reduxjs/toolkit';
import bibleReducer from './bibleSlice';
import themeReducer from './themeSlice';
import manuscriptsReducer from './manuscriptsSlice';

export const store = configureStore({
  reducer: {
    bible: bibleReducer,
    theme: themeReducer,
    manuscripts: manuscriptsReducer,
  },
});
