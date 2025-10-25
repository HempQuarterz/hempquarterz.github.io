# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
HimQuarterz Bible App - A React-based Bible reading application that allows users to read various Bible versions in different languages. The app fetches Bible content from the Scripture API and provides a clean interface for reading scripture.

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm start

# Build for production
npm run build

# Build without sourcemaps
npm run build:production

# Run tests
npm test
```

## Architecture Overview

### State Management
The app uses Redux Toolkit with two main slices:
- `bibleSlice.js` - Manages Bible data (verses, chapters, books) and API calls
- `themeSlice.js` - Handles light/dark theme switching with localStorage persistence

### Routing Structure
React Router v6 handles navigation:
- `/` - Landing page
- `/book` - Bible book selection
- `/chapter/:version/:abbr/:book` - Chapter view with verse list
- `/verse/:version/:abbr/:book/:chapter` - Individual verse view
- `/scripture/:bibleId/:version/:abbr/:book/:chapter/:verseId` - Full scripture display

### API Integration
- Uses Scripture API (api.scripture.api.bible) for Bible content
- API key stored in `src/config/api.js`
- Proxy configuration in package.json: `"proxy": "https://api.scripture.api.bible"`
- Implements FUMS (Fair Use Management System) tracking for Bible content usage

### Component Structure
Main components in `src/components/`:
- `BookPage.jsx` - Bible book selection
- `ChapterPage.jsx` - Chapter navigation and verse listing
- `VersePage.jsx` - Individual verse display
- `ScripturePage.jsx` - Full scripture content display
- `FumsModal.jsx` - FUMS compliance component

### Deployment
- Deployed on Netlify
- Build command: `npm run build`
- Publish directory: `hempquarterz.github.io/build`
- Single Page Application with `_redirects` file for client-side routing

## Key Development Notes

### Theme Implementation
- CSS variables defined in `src/index.css` for theming
- Theme toggle persists to localStorage
- Dark mode uses inverted color scheme

### Redux Store Setup
- Store configured in `src/store.js`
- Uses Redux Toolkit's `configureStore`
- Async actions handled with `createAsyncThunk`

### Environment Variables
When deploying, ensure these environment variables are set:
- API keys for Scripture API access