import { createSlice } from '@reduxjs/toolkit';

// Check for saved theme preference or default to 'light'
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    return savedTheme;
  }
  return 'light';
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: getInitialTheme(),
  reducers: {
    toggleTheme: (state) => {
      // Return new theme - side effects handled in middleware or components
      return state === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action) => {
      // Return new theme - side effects handled in middleware or components
      return action.payload;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;

// Selector
export const selectTheme = (state) => state.theme;

export default themeSlice.reducer;
