// themeSlice.js - Enhanced theme management
import { createSlice } from '@reduxjs/toolkit';

// Check for saved theme preference or system preference
const getInitialTheme = () => {
  // Check localStorage first
  const savedTheme = localStorage.getItem('bibleAppTheme');
  if (savedTheme) {
    return savedTheme;
  }
  
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: getInitialTheme(),
  reducers: {
    toggleTheme: (state) => {
      const newTheme = state === 'light' ? 'dark' : 'light';
      localStorage.setItem('bibleAppTheme', newTheme);
      return newTheme;
    },
    setTheme: (state, action) => {
      localStorage.setItem('bibleAppTheme', action.payload);
      return action.payload;
    }
  }
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;