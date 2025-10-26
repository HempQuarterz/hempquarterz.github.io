import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_CONFIG, getApiHeaders } from './config/api';
import { logApiCall, logApiResponse, logApiError } from './utils/debug';

export const fetchVerse = createAsyncThunk(
  'bible/fetchVerse',
  async ({ bibleId, verseId }) => {
    const url = `${API_CONFIG.BASE_URL}/bibles/${bibleId}/verses/${verseId}`;
    logApiCall('GET', url, { bibleId, verseId });

    const response = await axios.get(url, {
      headers: getApiHeaders(),
    });

    logApiResponse(url, response.data);

    if (response.data.meta && response.data.meta.fumsId && window._BAPI) {
      window._BAPI.t(response.data.meta.fumsId);
    }

    return response.data.data;
  }
);
export const fetchVerses = createAsyncThunk(
  'bible/fetchVerses',
  async ({ bibleId, chapterId }) => {
    const url = `${API_CONFIG.BASE_URL}/bibles/${bibleId}/chapters/${chapterId}/verses`;
    logApiCall('GET', url, { bibleId, chapterId });

    try {
      const response = await axios.get(url, {
        headers: getApiHeaders(),
      });

      logApiResponse(url, response.data);

      if (response.data.meta && response.data.meta.fumsId && window._BAPI) {
        window._BAPI.t(response.data.meta.fumsId);
      }

      return response.data.data;
    } catch (error) {
      logApiError(url, error);
      throw error;
    }
  }
);

export const fetchChapterText = createAsyncThunk(
  'bible/fetchChapterText',
  async ({ bibleId, bookId, chapterId }) => {
    const url = `${API_CONFIG.BASE_URL}/bibles/${bibleId}/chapters/${chapterId}`;
    logApiCall('GET', url, { bibleId, bookId, chapterId });

    try {
      const response = await axios.get(url, {
        headers: getApiHeaders(),
      });

      logApiResponse(url, response.data);

      if (response.data.meta && response.data.meta.fumsId && window._BAPI) {
        window._BAPI.t(response.data.meta.fumsId);
      }

      return response.data.data;
    } catch (error) {
      logApiError(url, error);
      throw error;
    }
  }
);

export const bibleSlice = createSlice({
  name: 'bible',
  initialState: {
    verses: [],
    chapterText: null,
    selectedVerse: null,
    loading: false,
    error: null,
  },
  reducers: {
    setVerses: (state, action) => {
      state.verses = action.payload;
    },
    selectChapterText: (state, action) => {
      state.chapterText = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch single verse
      .addCase(fetchVerse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVerse.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedVerse = action.payload;
      })
      .addCase(fetchVerse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch verses
      .addCase(fetchVerses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVerses.fulfilled, (state, action) => {
        state.loading = false;
        state.verses = action.payload;
      })
      .addCase(fetchVerses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch chapter text
      .addCase(fetchChapterText.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChapterText.fulfilled, (state, action) => {
        state.loading = false;
        state.chapterText = action.payload;
      })
      .addCase(fetchChapterText.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setVerses, setChapterText, clearError } = bibleSlice.actions;

export const selectVerses = (state) => state.bible.verses;
export const selectSelectedVerse = (state) => state.bible.selectedVerse;
export const selectChapterText = (state) => state.bible.chapterText;
export const selectLoading = (state) => state.bible.loading;
export const selectError = (state) => state.bible.error;

export default bibleSlice.reducer;
