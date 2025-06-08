import { createSlice } from '@reduxjs/toolkit';

// Check for saved theme preference or default to 'light'
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

const themeSlice = createSlice({
  name: 'theme',
  initialState: savedTheme,
  reducers: {
    toggleTheme: (state) => {
      const newTheme = state === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return newTheme;
    },
    setTheme: (state, action) => {
      localStorage.setItem('theme', action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
      return action.payload;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;

export default themeSlice.reducer;
