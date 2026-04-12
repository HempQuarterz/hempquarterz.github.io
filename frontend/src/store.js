import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import manuscriptsReducer from './manuscriptsSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    manuscripts: manuscriptsReducer,
  },
});
