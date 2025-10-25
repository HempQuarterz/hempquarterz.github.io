# Phase 1: Foundation - Immediate Action Plan
## Week-by-Week Breakdown for Getting Started

---

## 🎯 **Phase 1 Goal**
Build the foundation infrastructure and acquire the first manuscript data sources.

**Timeline:** 12 weeks (3 months)
**Budget:** $0-50/month (mostly free tier resources)

---

## **WEEK 1: Setup & Data Acquisition**

### Day 1-2: Supabase Setup
- [ ] Create Supabase account at https://supabase.com/
- [ ] Create new project: "All4Yah"
- [ ] Set up project structure:
  ```
  Organization: All4Yah
  Project: hempquarterz-manuscripts
  Region: Choose closest to your location
  ```
- [ ] Save API keys (anon + service_role) to `.env.local`

### Day 3-4: Database Schema Design
Create these tables in Supabase SQL Editor:

```sql
-- Manuscripts table
CREATE TABLE manuscripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL, -- 'WLC', 'TR', 'WEB', etc.
  name TEXT NOT NULL,
  language VARCHAR(10) NOT NULL, -- 'hebrew', 'greek', 'english'
  description TEXT,
  source_url TEXT,
  license TEXT,
  date_range TEXT, -- e.g., "1000 CE", "200 BCE - 100 CE"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Verses table (normalized)
CREATE TABLE verses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manuscript_id UUID REFERENCES manuscripts(id),
  book VARCHAR(3) NOT NULL, -- 'GEN', 'MAT', etc.
  chapter INT NOT NULL,
  verse INT NOT NULL,
  text TEXT NOT NULL, -- The actual verse text
  strong_numbers TEXT[], -- Array of Strong's numbers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(manuscript_id, book, chapter, verse)
);

-- Create index for fast lookups
CREATE INDEX idx_verses_lookup ON verses(manuscript_id, book, chapter, verse);
CREATE INDEX idx_verses_book ON verses(book);

-- Lexicon table
CREATE TABLE lexicon (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strong_number VARCHAR(10) UNIQUE NOT NULL, -- 'H3068', 'G2424'
  language VARCHAR(10) NOT NULL,
  transliteration TEXT,
  pronunciation TEXT,
  definition TEXT NOT NULL,
  root_word TEXT,
  usage_notes TEXT
);

-- Name mappings table
CREATE TABLE name_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_text TEXT NOT NULL, -- Hebrew/Greek
  traditional_rendering TEXT, -- 'LORD', 'Jesus'
  restored_rendering TEXT NOT NULL, -- 'Yahuah', 'Yahusha'
  strong_number VARCHAR(10),
  context_rules JSONB, -- Rules for when to apply
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Day 5-7: Download First Manuscript
**Westminster Leningrad Codex (WLC) - Hebrew Old Testament**

1. Clone the repository:
```bash
git clone https://github.com/openscriptures/morphhb.git
```

2. Explore the data structure:
```bash
cd morphhb/wlc
ls # You'll see files like: Gen.1.1, Exod.1.1, etc.
```

3. Create a parser script to extract:
   - Book name
   - Chapter number
   - Verse number
   - Hebrew text
   - Strong's numbers
   - Morphology data

---

## **WEEK 2: Data Import Pipeline**

### Create Import Script

Create `scripts/import_wlc.js`:

```javascript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importWLC() {
  // 1. Insert manuscript record
  const { data: manuscript } = await supabase
    .from('manuscripts')
    .insert({
      code: 'WLC',
      name: 'Westminster Leningrad Codex',
      language: 'hebrew',
      description: 'Masoretic Text of the Hebrew Bible',
      source_url: 'https://github.com/openscriptures/morphhb',
      license: 'CC BY 4.0',
      date_range: '1000 CE'
    })
    .select()
    .single();

  // 2. Parse and import verses
  const wlcDir = './morphhb/wlc';
  const files = fs.readdirSync(wlcDir);

  for (const file of files) {
    const content = fs.readFileSync(path.join(wlcDir, file), 'utf-8');
    // Parse XML or JSON format
    // Extract: book, chapter, verse, text, strongs
    // Insert into verses table
  }
}

importWLC();
```

### Tasks:
- [ ] Write XML/JSON parser for WLC format
- [ ] Test import on Genesis chapter 1
- [ ] Run full import (all OT books)
- [ ] Verify data in Supabase dashboard

---

## **WEEK 3-4: Build API Layer**

### Create API Routes in Next.js (or Express)

**Option A: Add to React app with API routes**
Convert to Next.js:
```bash
npx create-next-app@latest all4yah-web --use-npm
```

**Option B: Separate backend**
Create Express API server:
```bash
mkdir all4yah-api
cd all4yah-api
npm init -y
npm install express @supabase/supabase-js cors dotenv
```

### API Endpoints to Build:

```javascript
// GET /api/manuscripts
// Returns list of all available manuscripts

// GET /api/verse/:manuscript/:book/:chapter/:verse
// Returns specific verse in original language
// Example: /api/verse/WLC/GEN/1/1

// GET /api/parallel/:book/:chapter/:verse
// Returns parallel view (multiple manuscripts)
// Example: /api/parallel/GEN/1/1
// Returns: { WLC: "...", WEB: "...", TR: "..." }

// GET /api/lexicon/:strong
// Returns word definition
// Example: /api/lexicon/H3068
```

### Implementation Example:

```javascript
// routes/verse.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function getVerse(req, res) {
  const { manuscript, book, chapter, verse } = req.params;

  // Get manuscript ID
  const { data: ms } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', manuscript)
    .single();

  if (!ms) {
    return res.status(404).json({ error: 'Manuscript not found' });
  }

  // Get verse
  const { data, error } = await supabase
    .from('verses')
    .select('*')
    .eq('manuscript_id', ms.id)
    .eq('book', book)
    .eq('chapter', parseInt(chapter))
    .eq('verse', parseInt(verse))
    .single();

  if (error) {
    return res.status(404).json({ error: 'Verse not found' });
  }

  res.json(data);
}
```

---

## **WEEK 5-6: Frontend Integration**

### Add Hebrew Font Support

1. Download SBL Hebrew font:
   - https://www.sbl-site.org/educational/BiblicalFonts_SBLHebrew.aspx

2. Add to `public/fonts/`:
```
public/
  fonts/
    SBLHebrew.woff2
    SBLGreek.woff2
```

3. Add to CSS:
```css
@font-face {
  font-family: 'SBL Hebrew';
  src: url('/fonts/SBLHebrew.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}

.hebrew-text {
  font-family: 'SBL Hebrew', 'Ezra SIL', serif;
  direction: rtl; /* Right-to-left */
  unicode-bidi: bidi-override;
  font-size: 1.5rem;
  line-height: 2;
}
```

### Create Manuscript Viewer Component

```jsx
// components/ManuscriptViewer.jsx
import { useState, useEffect } from 'react';

export default function ManuscriptViewer({ book, chapter, verse }) {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/parallel/${book}/${chapter}/${verse}`)
      .then(res => res.json())
      .then(data => {
        setManuscripts(data);
        setLoading(false);
      });
  }, [book, chapter, verse]);

  if (loading) return <div>Loading manuscripts...</div>;

  return (
    <div className="manuscript-viewer">
      {manuscripts.map(ms => (
        <div key={ms.code} className="manuscript-panel">
          <h3>{ms.name}</h3>
          <div className={ms.language === 'hebrew' ? 'hebrew-text' : ''}>
            {ms.text}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Add to Existing App

Create new route: `/manuscripts`

```jsx
// pages/manuscripts/[book]/[chapter]/[verse].jsx
import ManuscriptViewer from '@/components/ManuscriptViewer';
import ModernHeader from '@/components/ModernHeader';

export default function ManuscriptPage() {
  const { book, chapter, verse } = useParams();

  return (
    <div>
      <ModernHeader title={`${book} ${chapter}:${verse} - Manuscripts`} />
      <ManuscriptViewer book={book} chapter={chapter} verse={verse} />
    </div>
  );
}
```

---

## **WEEK 7-8: Add World English Bible (WEB)**

### Download WEB
```bash
git clone https://github.com/scriptures/eng_web.git
```

### Import Process:
1. Add WEB manuscript record to database
2. Parse USFM format files
3. Import all verses
4. Now you have parallel Hebrew + English!

---

## **WEEK 9-10: Name Restoration Prototype**

### Create Restoration Rules

```javascript
// utils/nameRestoration.js
export const NAME_MAPPINGS = {
  // Divine name
  'יהוה': { traditional: 'LORD', restored: 'Yahuah' },
  'יְהוָה': { traditional: 'LORD', restored: 'Yahuah' },

  // Messiah's name
  'יהושע': { traditional: 'Joshua', restored: 'Yahusha' },
  'ישוע': { traditional: 'Jesus', restored: 'Yahusha' },

  // Other names
  'אלהים': { traditional: 'God', restored: 'Elohim' },
  'אדני': { traditional: 'Lord', restored: 'Adonai' }
};

export function restoreNames(text, language = 'english') {
  let restored = text;

  if (language === 'english') {
    // Replace LORD with Yahuah
    restored = restored.replace(/\bLORD\b/g, 'Yahuah');
    restored = restored.replace(/\bJesus\b/g, 'Yahusha');
  }

  return restored;
}
```

### Add Toggle to UI

```jsx
const [showRestored, setShowRestored] = useState(true);

<button onClick={() => setShowRestored(!showRestored)}>
  {showRestored ? 'Traditional Names' : 'Restored Names'}
</button>

<div className="verse-text">
  {showRestored ? restoreNames(verse.text) : verse.text}
</div>
```

---

## **WEEK 11-12: Testing & Documentation**

### Testing Checklist:
- [ ] Can view Hebrew text (WLC) for Genesis 1:1
- [ ] Hebrew text displays right-to-left correctly
- [ ] Can view English text (WEB) for Genesis 1:1
- [ ] Parallel view shows both manuscripts
- [ ] Name restoration toggle works
- [ ] YHWH → Yahuah replacement working
- [ ] API endpoints return correct data
- [ ] No errors in console
- [ ] Mobile responsive

### Documentation:
- [ ] API documentation (endpoints, examples)
- [ ] Data format documentation
- [ ] Contributing guide
- [ ] Manuscript sources citation page

---

## 📊 **Success Criteria for Phase 1**

By end of Week 12, you should have:

✅ **Data Infrastructure:**
- Supabase database with 5+ tables
- Westminster Leningrad Codex fully imported
- World English Bible fully imported
- 31,102 verses in database (OT + NT)

✅ **API Layer:**
- 4+ working API endpoints
- Fast verse lookups (<100ms)
- Parallel manuscript comparison

✅ **Frontend:**
- Hebrew font rendering correctly
- RTL text support working
- Manuscript viewer component
- Name restoration toggle
- `/manuscripts/:book/:chapter/:verse` route

✅ **Documentation:**
- README with setup instructions
- API documentation
- Data source citations

---

## 💰 **Estimated Costs (Month 1-3)**

- Supabase Free Tier: $0 (500MB database, enough for Phase 1)
- Netlify Hosting: $0 (free tier)
- Domain (optional): $12/year
- **Total: $0-12 for first 3 months**

---

## 🚀 **What Happens After Phase 1?**

Phase 1 gives you the foundation. In Phase 2, you'll add:
- AI translation engine (OpenAI/Claude integration)
- Textus Receptus (Greek NT)
- Septuagint (Greek OT)
- Morphological analysis
- Interlinear views
- Advanced search

**But first, nail Phase 1.** Get the data infrastructure solid, import your first manuscripts, and build the basic viewing experience.

---

## ❓ **Common Questions**

**Q: Do I need to know Hebrew/Greek?**
A: Not for Phase 1! You're just importing and displaying the data. The manuscripts you download already have the text and Strong's numbers tagged.

**Q: What if I get stuck?**
A: The open-source Bible community is very helpful:
- Open Scriptures Discord
- STEP Bible forums
- eBible.org community

**Q: Can I do this part-time?**
A: Absolutely. Allocate 5-10 hours per week. Phase 1 is achievable in 3 months at that pace.

**Q: What if my budget is $0?**
A: You can complete Phase 1 entirely on free tiers (Supabase free, Netlify free, open-source manuscripts).

---

## 📞 **Need Help?**

If you get stuck on any week:
1. Check the repository issues/discussions
2. Review Supabase docs
3. Ask in relevant communities
4. Take a break and come back fresh

Remember: **This is a marathon, not a sprint.** Building the "Digital Dead Sea Scrolls" takes time, but you're creating something incredibly valuable.

---

*Let's start with Week 1! 🚀*
