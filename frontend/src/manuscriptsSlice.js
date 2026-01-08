import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedVerse: {
        book: 'GEN',
        chapter: 1,
        verse: 1
    },
    isReaderMode: false,
};

export const manuscriptsSlice = createSlice({
    name: 'manuscripts',
    initialState,
    reducers: {
        setSelectedVerse: (state, action) => {
            state.selectedVerse = action.payload;
        },
        setReaderMode: (state, action) => {
            state.isReaderMode = action.payload;
        },
    },
});

export const { setSelectedVerse, setReaderMode } = manuscriptsSlice.actions;
export default manuscriptsSlice.reducer;
