# All4Yah - Digital Dead Sea Scrolls

> **"Restoring the Word, verse by verse."**

A React-based Scripture platform displaying original Hebrew, Greek, and English manuscripts with divine name restoration (Yahuah, Yahusha, Elohim).

## 🌐 Live Production Site

**Status:** ✅ **LIVE** | Deployed via Netlify

Visit the All4Yah Manuscript Viewer at your Netlify URL.

---

## 🎯 Project Mission

All4Yah is a "Digital Dead Sea Scrolls" initiative dedicated to restoring the Word verse by verse using:
- **Original manuscripts** (Westminster Leningrad Codex, SBL Greek New Testament)
- **Transparent scholarship** (documented name restoration mappings)
- **Modern technology** (React, Supabase, AI-powered translation)

We restore the original divine names:
- **יהוה** (H3068) → **Yahuah** - The personal name of the Creator (5,518× in OT)
- **יהושע** (H3091) / **Ἰησοῦς** (G2424) → **Yahusha** - "Yahuah saves"
- **אלהים** (H430) / **θεός** (G2316) → **Elohim** - Mighty One, Creator

---

## ✨ Features (Phase 1 - Complete)

### Manuscript Viewer
- ✅ **Parallel manuscript display** - Hebrew/Greek/Latin + English side-by-side
- ✅ **Divine name restoration toggle** - Switch between original and restored
- ✅ **248,871 verses** - Complete coverage across 12 manuscripts (Hebrew, Greek, Latin, Aramaic, English)
- ✅ **12 manuscripts** - WLC, SBLGNT, WEB, LXX, DSS, VUL, SIN, TR, BYZMT, N1904, ONKELOS, PESHITTA
- ✅ **12 divine name mappings** - Hebrew, Greek, English, and Aramaic restorations
- ✅ **Gold highlighting (✦)** - Visually distinct restored names
- ✅ **Hover tooltips** - See original text on hover
- ✅ **Responsive design** - Mobile-friendly 3-column grid

### Typography
- 📜 **Noto Serif Hebrew** - RTL Hebrew text with vowel points
- 📖 **Noto Serif** - Polytonic Greek with diacritics
- ✍️ **Cardo** - Biblical English serif font

### User Experience
- 🎨 Dark mode support
- 🚀 Fast loading with optimized builds
- 📱 Mobile-responsive design
- ♿ Accessibility features
- 🔍 8 quick-select sample verses
- ✨ **Loading skeletons** - Animated placeholders for polished UX
- ⚡ **Query optimization** - Name mappings cached (1 API call per session)
- 🌍 **English-first display** - Accessible manuscript ordering

---

## 🗄️ Database

**Provider:** Supabase (PostgreSQL)

**Statistics:**
- **Total Verses:** 248,871 verses across all manuscripts
- **Manuscripts:** 12 (WLC, SBLGNT, WEB, LXX, DSS, VUL, SIN, TR, BYZMT, N1904, ONKELOS, PESHITTA)
- **Languages:** Hebrew, Greek, Latin, Aramaic (Syriac), English
- **Strong's Lexicon:** 19,027 entries (Hebrew H1-H8674 + Greek G1-G5624)
- **Cross-References:** 343,869 parallel passages and quotations
- **Canonical Books:** 90 (Tier 1-4 classification: 66 Canonical + 21 Deuterocanonical + 2 Apocrypha + 1 Ethiopian)
- **English Coverage:** 38,080 verses (31,402 canonical + 6,678 deuterocanonical)
- **Name Mappings:** 12 divine name restorations (Hebrew, Greek, English, Aramaic)

**Manuscripts Breakdown:**

| Code | Name | Language | Testament | Verses | Date/Era |
|------|------|----------|-----------|--------|----------|
| **WLC** | Westminster Leningrad Codex | Hebrew | OT | 24,661 | 1008 CE |
| **SBLGNT** | SBL Greek New Testament | Greek | NT | 7,927 | Critical Text |
| **WEB** | World English Bible | English | OT+NT+Deut | 38,080 | Modern |
| **LXX** | Septuagint | Greek | OT | 27,947 | 3rd-1st c. BCE |
| **DSS** | Dead Sea Scrolls | Hebrew | OT | 52,153 | 3rd c. BCE - 1st c. CE |
| **VUL** | Vulgate | Latin | OT+NT | 35,811 | 4th c. CE |
| **SIN** | Codex Sinaiticus | Greek | NT | 9,657 | 4th c. CE |
| **TR** | Textus Receptus | Greek | NT | 7,957 | 16th c. |
| **BYZMT** | Byzantine Majority Text | Greek | NT | 6,911 | Medieval |
| **N1904** | Nestle 1904 | Greek | NT | 7,943 | 1904 |
| **ONKELOS** | Targum Onkelos | Aramaic | Torah | 5,839 | 1st-2nd c. CE |
| **PESHITTA** | Peshitta (Syriac/Aramaic OT) | Aramaic | OT | 23,985 | 2nd-5th c. CE |

**Cross-Reference System:**
- **343,869 cross-references** linking related passages
- Enables parallel passage navigation
- Tracks quotations, allusions, and thematic connections
- Source: Comprehensive biblical cross-reference database
- Powers "Related Verses" and "Parallel Passages" features

**Security:**
- Row Level Security (RLS) enabled
- Public read access policies
- Indexed queries for performance

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for database)

### Installation

```bash
# Clone the repository
git clone https://github.com/HempQuarterz/hempquarterz.github.io.git
cd hempquarterz.github.io

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm start

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file in the project root:

```bash
# Scripture API (for traditional Bible versions)
REACT_APP_BIBLE_API_KEY=your-bible-api-key

# Supabase Configuration
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# Server-side only (for import scripts)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important:**
- The **anon key** is safe for browser use (protected by RLS)
- The **service role key** is for server-side scripts only - never expose in browser

---

## 📂 Project Structure

```
hempquarterz.github.io/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── verses.js           # Verse retrieval API (370 lines)
│   │   │   └── restoration.js      # Name restoration engine (355 lines)
│   │   ├── components/
│   │   │   ├── ManuscriptViewer.jsx   # Parallel manuscript display (351 lines)
│   │   │   ├── ManuscriptSkeleton.jsx # Loading skeleton (56 lines)
│   │   │   └── ...                     # Other components
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Landing page
│   │   │   └── ManuscriptsPage.jsx # Manuscript viewer page (240 lines)
│   │   ├── styles/
│   │   │   ├── manuscripts.css     # Manuscript viewer styles (360 lines)
│   │   │   └── skeleton.css        # Loading skeleton styles (127 lines)
│   │   └── config/
│   │       ├── api.js              # API configuration
│   │       └── supabase.js         # Supabase client setup
│   └── public/
│       └── index.html
├── database/
│   ├── schema.sql              # Database schema
│   ├── import-wlc.js           # Hebrew OT import (330 lines)
│   ├── import-sblgnt.js        # Greek NT import (360 lines)
│   ├── import-web.js           # English import (350 lines)
│   ├── import-greek-name-mappings.js  # Greek restorations (200 lines)
│   └── test-greek-restoration.js      # Test suite (420 lines)
└── docs/
    ├── API_USAGE.md            # API documentation
    ├── NAME_RESTORATION.md     # Restoration guide
    └── PHASE_1_ACTIONS.md      # Implementation plan
```

---

## 🔧 Available Scripts

### Development
```bash
npm start              # Start dev server (http://localhost:3000)
npm test               # Run test suite
npm run build          # Create production build
npm run build:production  # Build without sourcemaps
```

### Database Operations
```bash
# Import manuscripts (requires service role key)
node database/import-wlc.js --full           # Import Hebrew OT
node database/import-sblgnt.js --full        # Import Greek NT
node database/import-web.js --full           # Import English

# Import name mappings
node database/import-greek-name-mappings.js

# Verify imports
node database/verify-sblgnt.js
node database/test-greek-restoration.js
```

---

## 📖 API Documentation

### Verse Retrieval

```javascript
import { getVerse } from './api/verses';

// Get a single verse
const verse = await getVerse('WLC', 'GEN', 1, 1);
// Returns: { manuscript_id, book, chapter, verse, text, morphology }

// Get parallel verses (Hebrew + English)
const parallel = await getParallelVerse('GEN', 1, 1);
// Returns: [wlcVerse, webVerse]
```

### Divine Name Restoration

```javascript
import { restoreVerse } from './api/restoration';

// Apply restoration to a verse
const restoredVerse = await restoreVerse(verse);
// Adds: { restorations: [{ original, restored, strongsNumber, count }] }
```

---

## 🎨 Styling

### CSS Architecture
- **CSS Grid** for responsive layouts
- **CSS Variables** for theming
- **Media queries** for dark mode
- **RTL support** for Hebrew text
- **Custom fonts** via Google Fonts CDN

### Color Scheme
- **Primary:** Green gradients
- **Accent:** Gold (#DAA520) for restored names
- **Background:** Light/Dark mode adaptive
- **Text:** High contrast for readability

---

## 🔐 Security

### Best Practices Implemented
- ✅ No credentials in source code
- ✅ No secrets in git history
- ✅ Environment variables via Netlify dashboard
- ✅ Supabase RLS policies active
- ✅ Public anon key (browser-safe)
- ✅ Private service role key (server-only)
- ✅ HTTPS enabled (Netlify default)

### Netlify Configuration

Set these environment variables in Netlify dashboard:
- `REACT_APP_BIBLE_API_KEY`
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

---

## 📊 Performance

### Production Build Stats
- **JavaScript:** 169.14 KB (gzipped)
- **CSS:** 3.47 KB (gzipped)
- **Build Time:** ~30 seconds
- **Load Time:** < 2 seconds

### Optimizations
- Code splitting
- Tree shaking
- Minification
- Gzip compression
- CDN fonts
- Optimized images

---

## 🗺️ Roadmap

### Phase 1 ✅ (Complete)
- ✅ Database infrastructure (Supabase)
- ✅ Import WLC Hebrew, SBLGNT Greek, WEB English
- ✅ Divine name restoration system (12 mappings)
- ✅ API endpoints (verses.js, restoration.js)
- ✅ React UI with ManuscriptViewer component
- ✅ Production deployment (Netlify)
- ✅ UX Polish: Loading skeletons, query optimization, English-first ordering
- ✅ Performance: Name mappings cached (90% API call reduction)

### Phase 2 (Partially Complete)
- ✅ Import additional manuscripts (LXX, DSS, VUL, SIN, TR, BYZMT, N1904, ONKELOS)
- ✅ Strong's Concordance integration (19,027 entries)
- ✅ Cross-reference system (344,369 entries)
- ✅ Canonical tier classification (5-tier system)
- ✅ Cross-Reference UI (Tiers 1-8: Sidebar, Badges, Parallel Viewer, OT Quotations, Network Graph, Thematic Discovery, Timeline, Audio)
- [ ] Global search with Strong's numbers
- [ ] AI translation engine (GPT-4/Claude)
- [ ] Morphological analysis UI
- [ ] Interlinear word-by-word display

### Phase 3 (Months 7-9)
- [ ] Linguistic Spirit Interface (LSI) - **NEW** 🕊️
  - [ ] Spiritual Tongues Analyzer (STA) - AI-assisted prayer pattern reflection
  - [ ] Heavenly Speech Mapper (HSM) - Waveform visualization as celestial art
  - [ ] Prayer Journal with Scripture suggestions
  - [ ] Faith Alignment Framework integration
- [ ] Manuscript provenance timeline
- [ ] Community annotation system
- [ ] Scholar verification badges
- [ ] Public discussion threads

### Phase 4 (Months 10-12)
- [ ] Complete site redesign
- [ ] Landing page overhaul
- [ ] Documentation system
- [ ] Blog/progress updates
- [ ] Newsletter integration
- [ ] Mobile app versions
- [ ] LSI Community Mode (optional anonymous waveform sharing)

---

## 📝 Documentation

### Technical Guides
- **[API Usage Guide](docs/API_USAGE.md)** - API endpoints and examples
- **[Name Restoration Guide](docs/NAME_RESTORATION.md)** - How divine names are restored
- **[Phase 1 Actions](docs/PHASE_1_ACTIONS.md)** - Implementation plan

### Spiritual Technology
- **[Linguistic Spirit Interface (LSI)](docs/LINGUISTIC_SPIRIT_INTERFACE.md)** - AI-assisted prayer reflection system 🕊️

### Session Summaries
- **[Session Summary Oct 24](SESSION_SUMMARY_2025-10-24.md)** - Phase 1 completion
- **[Session Summary Oct 25](SESSION_SUMMARY_2025-10-25.md)** - UI testing & deployment

---

## 🤝 Contributing

This is a personal project for restoring divine names in Scripture. If you'd like to contribute:

1. **Report issues** - Found a bug or incorrect restoration? Open an issue
2. **Suggest features** - Have ideas for improvement? Share them
3. **Verify restorations** - Help verify name restoration mappings
4. **Translate** - Help translate the UI to other languages

---

## 📜 License

### Code
MIT License - Feel free to use, modify, and distribute

### Scripture Data
- **Westminster Leningrad Codex (WLC)** - Public Domain
- **SBL Greek New Testament (SBLGNT)** - CC BY-SA 4.0
- **World English Bible (WEB)** - Public Domain

---

## 🙏 Acknowledgments

**Data Sources:**
- Open Scriptures Hebrew Bible (WLC)
- morphgnt.org (SBLGNT with morphology)
- ebible.org (World English Bible)

**Technologies:**
- React 18 + Hooks
- Supabase (PostgreSQL + Auth)
- Netlify (Hosting + CI/CD)
- Google Fonts (Noto Serif Hebrew, Noto Serif, Cardo)

**Special Thanks:**
- Claude Code (AI-assisted development)
- The open source community
- All Scripture scholars and translators

---

## 📞 Contact

**Project:** All4Yah - Digital Dead Sea Scrolls
**Repository:** https://github.com/HempQuarterz/hempquarterz.github.io
**Issues:** https://github.com/HempQuarterz/hempquarterz.github.io/issues

---

**"This is my name forever, the name you shall call me from generation to generation."** - Exodus 3:15

*Restoring truth, one name at a time.* ✦
