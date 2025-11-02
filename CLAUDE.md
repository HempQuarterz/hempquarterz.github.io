# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**All4Yah - Digital Dead Sea Scrolls**: A React-based Scripture platform displaying original Hebrew, Greek, Latin, and Aramaic manuscripts alongside English translations with divine name restoration (Yahuah, Yahusha, Elohim). The project combines a React frontend with Node.js database import scripts and a Supabase PostgreSQL backend.

**Mission**: Verse-by-verse restoration of divine names using original manuscripts (Westminster Leningrad Codex, SBL Greek New Testament, Dead Sea Scrolls, etc.) with transparent scholarship and documented name restoration mappings.

**Current Status**: Phase 1 complete with 224,886 verses across 11 manuscripts, 19,027 Strong's lexicon entries, and 343,869 cross-references deployed live via Netlify.

## Project Structure

```
All4Yah/
├── frontend/              # React application (main UI)
│   ├── src/
│   │   ├── api/          # Verse retrieval & restoration engine
│   │   ├── components/   # React components (ManuscriptViewer, etc.)
│   │   ├── pages/        # Route pages (HomePage, ManuscriptsPage)
│   │   └── styles/       # CSS files
│   ├── public/
│   └── package.json      # Frontend dependencies & scripts
├── database/             # Node.js import & migration scripts
│   ├── import-*.js       # Manuscript import scripts
│   ├── schema.sql        # Database schema
│   └── *.md             # Import documentation
├── manuscripts/          # Raw manuscript data files
├── scripts/              # Utility scripts (deployment, etc.)
└── docs/                 # API & restoration documentation
```

## Development Commands

### Frontend Development (React)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm start

# Build for production
npm run build

# Build without sourcemaps (for deployment)
npm run build:production

# Run tests
npm test
```

### Database Operations (Node.js)
All database scripts run from the project root and require `SUPABASE_SERVICE_ROLE_KEY` in `.env`:

```bash
# Import individual manuscripts
node database/import-wlc.js --full           # Hebrew OT (Westminster Leningrad Codex)
node database/import-sblgnt.js --full        # Greek NT (SBL Greek New Testament)
node database/import-web.js --full           # World English Bible
node database/import-lxx.js --full           # Septuagint (Greek OT)
node database/import-dss.js --full           # Dead Sea Scrolls
node database/import-vulgate.js --full       # Latin Vulgate
node database/import-sinaiticus.js --full    # Codex Sinaiticus

# Import divine name mappings
node database/import-greek-name-mappings.js

# Verify imports
node database/verify-sblgnt.js
node database/test-greek-restoration.js
node database/check-all-data.js

# Check database state
node database/check-books.js
```

## Architecture Overview

### Frontend Architecture (React)

**State Management**: Redux Toolkit with slices:
- `bibleSlice.js` - Manages Bible data (verses, chapters, books) and API calls
- `themeSlice.js` - Handles light/dark theme with localStorage persistence

**Routing** (React Router v6):
- `/` - Landing page
- `/manuscripts` - Manuscript viewer page with parallel display
- Dynamic routing for books, chapters, and verses

**API Layer** (`frontend/src/api/`):
- `verses.js` (370 lines) - Verse retrieval from Supabase, parallel verse fetching
- `restoration.js` (304 lines) - Divine name restoration engine with Strong's number matching

**Key Components** (`frontend/src/components/`):
- `ManuscriptViewer.jsx` (220 lines) - Parallel manuscript display with 3-column responsive grid
- `FumsModal.jsx` - FUMS (Fair Use Management System) compliance for Scripture API

**Styling** (`frontend/src/styles/`):
- `manuscripts.css` (360 lines) - Manuscript viewer styles with RTL Hebrew support
- CSS Grid for responsive layouts
- CSS Variables for theming (light/dark mode)
- Custom fonts: Noto Serif Hebrew (Hebrew), Noto Serif (Greek), Cardo (English)

### Backend Architecture (Supabase + Node.js)

**Database**: PostgreSQL via Supabase
- **Verses Table**: 224,886 verses across 11 manuscripts
- **Manuscripts**: WLC, SBLGNT, WEB, LXX, DSS, VUL, SIN, TR, BYZMT, N1904, ONKELOS
- **Strong's Lexicon**: 19,027 entries (Hebrew H1-H8674 + Greek G1-G5624)
- **Cross-References**: 343,869 parallel passages and quotations
- **Canonical Books**: 90 books with tier classification (1-4)
- **Name Mappings**: 8 divine name restoration mappings

**Security**:
- Row Level Security (RLS) enabled
- Public read access policies
- `REACT_APP_SUPABASE_ANON_KEY` for browser use (RLS-protected)
- `SUPABASE_SERVICE_ROLE_KEY` for server-side imports only (never in browser)

**Import Scripts Pattern** (`database/import-*.js`):
Each manuscript import script follows a consistent pattern:
1. Parse source data (XML, JSON, or text format)
2. Transform to canonical structure (book, chapter, verse, text, morphology)
3. Batch insert to Supabase (typically 1000 rows at a time)
4. Verify import with count checks
5. Log progress and errors

## Environment Variables

Create `.env` in project root:
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key      # Safe for browser
SUPABASE_SERVICE_ROLE_KEY=your-service-key     # Server-side only

# Scripture API (for traditional Bible versions, optional)
REACT_APP_BIBLE_API_KEY=your-bible-api-key
```

Create `.env` in `frontend/` directory (copy from root or use same values):
```bash
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_BIBLE_API_KEY=your-bible-api-key
```

**Important**: Never commit `.env` files. The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and should never be exposed in browser code.

## Divine Name Restoration System

The core innovation of All4Yah is the divine name restoration system that replaces traditional substitutions with original Hebrew names.

**Restoration Mappings** (8 total):
- H3068 (יהוה YHWH) → **Yahuah** (5,518 OT occurrences)
- H3091 (יהושע Yehoshua) → **Yahusha**
- G2424 (Ἰησοῦς Iesous) → **Yahusha**
- H430 (אלהים Elohim) → **Elohim**
- G2316 (θεός theos) → **Elohim**
- Additional mappings for compound forms

**How It Works**:
1. Source manuscripts stored with original text + morphology
2. Frontend calls `restoreVerse(verse)` from `api/restoration.js`
3. Engine matches Strong's numbers in morphology data
4. Replaces matched words with restored forms
5. Highlights restored names in gold (✦) with hover tooltips showing original

**Visual Indicators**:
- Gold highlighting for restored divine names
- Hover tooltips show original Hebrew/Greek
- Toggle to show/hide restorations
- Side-by-side comparison with unresto versions

## Deployment

**Platform**: Netlify
**Live Site**: Connected to Git repository with auto-deploy

**Deployment Process**:
1. Push changes to main branch
2. Netlify automatically triggers build
3. Runs `cd frontend && npm run build:production`
4. Deploys `frontend/build` directory
5. Environment variables set in Netlify dashboard

**Netlify Configuration** (`netlify.toml`):
- Build command: `cd frontend && npm run build`
- Publish directory: `frontend/build`
- SPA redirects configured for client-side routing

**VPS Deployment** (alternative):
- Scripts in `/scripts` directory for VPS setup
- `setup-vps.sh` - Server configuration
- `deploy-vps.sh` - Deployment automation

## Key Development Patterns

### Working with Manuscripts

When adding new manuscripts or modifying verse data:

1. **Always use the database scripts** from project root, not frontend directory
2. **Check existing manuscripts first**: `node database/check-books.js`
3. **Follow the import pattern**: Parse → Transform → Batch Insert → Verify
4. **Include morphology data** when available for restoration system
5. **Update the README** with new manuscript statistics

### Adding Divine Name Restorations

When adding new divine name mappings:

1. Edit `database/import-greek-name-mappings.js` or equivalent
2. Follow the pattern: `{ strongsNumber, original, restored, language }`
3. Run import script: `node database/import-greek-name-mappings.js`
4. Test with: `node database/test-greek-restoration.js`
5. Verify in UI that gold highlighting and tooltips work

### Frontend Development Workflow

When working on UI features:

1. **Always work in the `/frontend` directory**
2. **Use Redux for state management**: Don't bypass the store
3. **Follow component structure**: Pages in `/pages`, reusable components in `/components`
4. **Test with real data**: Use sample verses from the quick-select panel
5. **Check both light and dark modes**: Theme toggle in corner
6. **Verify mobile responsiveness**: CSS Grid collapses to single column

### Database Schema Changes

When modifying database structure:

1. **Create SQL migration files** in `/database` directory
2. **Apply via migration script**: `node database/apply-migration.js`
3. **Update schema.sql** to reflect changes
4. **Test imports still work** after schema changes
5. **Document in /database/*.md files**

## Common Development Tasks

### Running a Single Test
```bash
cd frontend
npm test -- --testNamePattern="pattern"
```

### Rebuilding After Database Changes
```bash
# Re-import affected manuscript
node database/import-[manuscript].js --full

# Verify import
node database/check-all-data.js

# Test in frontend
cd frontend && npm start
```

### Checking Import Status
```bash
# See verse counts per manuscript
node database/check-all-data.js

# Verify specific manuscript
node database/verify-sblgnt.js

# Check book definitions
node database/check-books.js
```

### Debugging Restoration Issues
```bash
# Test restoration engine
node database/test-greek-restoration.js

# Check name mappings exist
# Query Supabase directly or check via frontend hover tooltips
```

## Documentation

**In-Repo Documentation**:
- `README.md` - Project overview, statistics, roadmap
- `docs/API_USAGE.md` - API endpoints and examples
- `docs/NAME_RESTORATION.md` - Divine name restoration guide
- `database/*.md` - Import process documentation

**Session Summaries**:
- `SESSION_SUMMARY_*.md` - Development session notes and accomplishments

## Important Notes

### File Organization
- **Frontend code**: Always in `/frontend` directory
- **Database scripts**: Always in `/database` directory, run from project root
- **Raw data**: Stored in `/manuscripts` directory
- **Never commit** `.env` files, build outputs, or node_modules

### Security
- **Service role key** is for database scripts only, never in browser code
- **Anon key** is RLS-protected and safe for browser use
- **All database operations** from frontend use RLS-protected anon key

### Performance
- **Batch inserts**: Database scripts use 1000-row batches for imports
- **Indexed queries**: All verse lookups indexed on (manuscript_id, book, chapter, verse)
- **CDN fonts**: Fonts loaded from Google Fonts CDN
- **Code splitting**: React lazy loading for routes

### Manuscript Data Integrity
- **Never modify manuscripts directly** in database, always re-import from source
- **Original text is canonical**: Restoration is applied at display time only
- **Morphology data is critical**: Required for divine name restoration matching
- **Cross-references are bidirectional**: Both directions stored for navigation

