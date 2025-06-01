// bibleSlice.js - Enhanced Redux slice with better API integration and caching
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_KEY = '5875acef5839ebced9e807466f8ee3ce';
const BASE_URL = 'https://api.scripture.api.bible/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'api-key': API_KEY,
  },
});

// Fetch specific verse
export const fetchVerse = createAsyncThunk(
  'bible/fetchVerse',
  async ({ bibleId, verseId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bibles/${bibleId}/verses/${verseId}`, {
        params: {
          'content-type': 'html',
          'include-notes': false,
          'include-titles': true,
          'include-chapter-numbers': true,
          'include-verse-numbers': true,
          'include-verse-spans': false,
        }
      });

      // Handle FUMS tracking
      if (response.data.meta?.fumsId && window._BAPI) {
        window._BAPI.t(response.data.meta.fumsId);
      }

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch all verses in a chapter
export const fetchChapterVerses = createAsyncThunk(
  'bible/fetchChapterVerses',
  async ({ bibleId, chapterId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bibles/${bibleId}/chapters/${chapterId}/verses`);

      if (response.data.meta?.fumsId && window._BAPI) {
        window._BAPI.t(response.data.meta.fumsId);
      }

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch chapter text with better formatting options
export const fetchChapterText = createAsyncThunk(
  'bible/fetchChapterText',
  async ({ bibleId, chapterId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bibles/${bibleId}/chapters/${chapterId}`, {
        params: {
          'content-type': 'html',
          'include-notes': false,
          'include-titles': true,
          'include-chapter-numbers': true,
          'include-verse-numbers': true,
          'include-verse-spans': false,
        }
      });

      if (response.data.meta?.fumsId && window._BAPI) {
        window._BAPI.t(response.data.meta.fumsId);
      }

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch books for a specific Bible version
export const fetchBooks = createAsyncThunk(
  'bible/fetchBooks',
  async ({ bibleId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bibles/${bibleId}/books`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch chapters for a specific book
export const fetchChapters = createAsyncThunk(
  'bible/fetchChapters',
  async ({ bibleId, bookId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bibles/${bibleId}/books/${bookId}/chapters`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Search for passages
export const searchPassages = createAsyncThunk(
  'bible/searchPassages',
  async ({ bibleId, query, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bibles/${bibleId}/search`, {
        params: {
          query,
          limit,
          sort: 'relevance',
        }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state with caching
const initialState = {
  // Data storage
  verses: {},
  chapterText: null,
  books: {},
  chapters: {},
  searchResults: [],
  
  // UI state
  loading: false,
  error: null,
  
  // Cache management
  cache: {
    verses: {},
    chapters: {},
    books: {},
  },
  
  // User preferences
  preferences: {
    fontSize: 'medium',
    theme: 'light',
    lastRead: null,
    bookmarks: [],
    highlights: [],
  }
};

export const bibleSlice = createSlice({
  name: 'bible',
  initialState,
  reducers: {
    // Cache management
    clearCache: (state) => {
      state.cache = {
        verses: {},
        chapters: {},
        books: {},
      };
    },
    
    // User preferences
    setFontSize: (state, action) => {
      state.preferences.fontSize = action.payload;
    },
    
    setLastRead: (state, action) => {
      state.preferences.lastRead = action.payload;
    },
    
    addBookmark: (state, action) => {
      const bookmark = action.payload;
      if (!state.preferences.bookmarks.find(b => b.id === bookmark.id)) {
        state.preferences.bookmarks.push(bookmark);
      }
    },
    
    removeBookmark: (state, action) => {
      state.preferences.bookmarks = state.preferences.bookmarks.filter(
        b => b.id !== action.payload
      );
    },
    
    addHighlight: (state, action) => {
      state.preferences.highlights.push(action.payload);
    },
    
    removeHighlight: (state, action) => {
      state.preferences.highlights = state.preferences.highlights.filter(
        h => h.id !== action.payload
      );
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch verse
      .addCase(fetchVerse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVerse.fulfilled, (state, action) => {
        state.loading = false;
        state.verses[action.payload.id] = action.payload;
        state.cache.verses[action.payload.id] = {
          data: action.payload,
          timestamp: Date.now()
        };
      })
      .addCase(fetchVerse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch chapter text
      .addCase(fetchChapterText.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChapterText.fulfilled, (state, action) => {
        state.loading = false;
        state.chapterText = action.payload;
        state.cache.chapters[action.payload.id] = {
          data: action.payload,
          timestamp: Date.now()
        };
      })
      .addCase(fetchChapterText.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch books
      .addCase(fetchBooks.fulfilled, (state, action) => {
        const bibleId = action.meta.arg.bibleId;
        state.books[bibleId] = action.payload;
        state.cache.books[bibleId] = {
          data: action.payload,
          timestamp: Date.now()
        };
      })
      
      // Fetch chapters
      .addCase(fetchChapters.fulfilled, (state, action) => {
        const { bookId } = action.meta.arg;
        state.chapters[bookId] = action.payload;
      })
      
      // Search passages
      .addCase(searchPassages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPassages.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchPassages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  clearCache,
  setFontSize,
  setLastRead,
  addBookmark,
  removeBookmark,
  addHighlight,
  removeHighlight,
  clearError,
} = bibleSlice.actions;

// Selectors with cache checking
export const selectVerses = (state) => state.bible.verses;
export const selectChapterText = (state) => state.bible.chapterText;
export const selectBooks = (bibleId) => (state) => state.bible.books[bibleId];
export const selectChapters = (bookId) => (state) => state.bible.chapters[bookId];
export const selectSearchResults = (state) => state.bible.searchResults;
export const selectLoading = (state) => state.bible.loading;
export const selectError = (state) => state.bible.error;
export const selectPreferences = (state) => state.bible.preferences;
export const selectBookmarks = (state) => state.bible.preferences.bookmarks;
export const selectHighlights = (state) => state.bible.preferences.highlights;

// Check if data is cached and still fresh (5 minutes)
export const selectCachedData = (type, id) => (state) => {
  const cached = state.bible.cache[type]?.[id];
  if (cached && Date.now() - cached.timestamp < 300000) {
    return cached.data;
  }
  return null;
};

export default bibleSlice.reducer;