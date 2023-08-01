import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchVerse = createAsyncThunk(
  'bible/fetchVerse',
  async ({ bibleId, verseId }) => {
    console.log("Inside Function", verseId, bibleId)
    const response = await axios.get(
      `https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/${verseId}`,
      {
        headers: {
          'api-key': '5875acef5839ebced9e807466f8ee3ce',
        },
      }
    );

    if (response.data.meta && response.data.meta.fumsId) {
      window._BAPI.t(response.data.meta.fumsId); // Send FUMS data
    }

    return response.data.data;
  }
);
export const fetchVerses = createAsyncThunk(
  'bible/fetchVerse',
  async ({ bibleId, chapterId }) => {
    const response = await axios.get(
      `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapterId}/verses`,
      {
        headers: {
          'api-key': '5875acef5839ebced9e807466f8ee3ce',
        },
      }
    );

    if (response.data.meta && response.data.meta.fumsId) {
      window._BAPI.t(response.data.meta.fumsId); // Send FUMS data
    }

    return response.data.data;
  }
);

export const fetchChapterText = createAsyncThunk(
  'bible/fetchChapterText',
  async ({ bibleId, bookId, chapterId }) => {
    const response = await axios.get(
      `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapterId}`,
      {
        headers: {
          'api-key': '5875acef5839ebced9e807466f8ee3ce',
        },
      }
    );

    if (response.data.meta && response.data.meta.fumsId) {
      window._BAPI.t(response.data.meta.fumsId); // Send FUMS data
    }

    return response.data.data;
  }
);

export const bibleSlice = createSlice({
  name: 'bible',
  initialState: {
    verses: [],
    chapterText: null,
    selectedVerse: null,
  },
  reducers: {
    setVerses: (state, action) => {
      state.verses = action.payload;
    },
    selectChapterText: (state, action) => {
      state.chapterText = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVerse.fulfilled, (state, action) => {
        state.verses = action.payload;
      })
      .addCase(fetchChapterText.fulfilled, (state, action) => {
        state.chapterText = action.payload;
      });
  },
});

export const { setVerses, setChapterText } = bibleSlice.actions;

export const selectVerses = (state) => state.bible.verses;
export const selectSelectedVerse = (state) => state.bible.selectedVerse;
export const selectChapterText = (state) => state.bible.chapterText;

export default bibleSlice.reducer;
