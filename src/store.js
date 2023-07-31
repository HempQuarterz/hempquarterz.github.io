import { configureStore } from '@reduxjs/toolkit';
import bibleReducer from './bibleSlice';

export const store = configureStore({
  reducer: {
    bible: bibleReducer,
  },
});
