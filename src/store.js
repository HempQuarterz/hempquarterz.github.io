import { configureStore } from '@reduxjs/toolkit';
import bibleReducer from './bibleSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    bible: bibleReducer,
    theme: themeReducer,
  },
});
