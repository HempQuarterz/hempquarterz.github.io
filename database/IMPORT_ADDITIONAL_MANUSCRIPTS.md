# Importing Additional Manuscripts

This guide explains how to import additional Greek manuscripts into the All4Yah database.

## Available Manuscript Import Scripts

| Manuscript | Script | Language | Testament | Status |
|------------|--------|----------|-----------|--------|
| **Septuagint (LXX)** | `import-lxx.js` | Greek | OT | ✅ Script Ready |
| **Textus Receptus (TR)** | `import-textus-receptus.js` | Greek | NT | ✅ Script Ready |

---

## 1. Septuagint (LXX) - Greek Old Testament

### About the Septuagint
- **Full Name:** Septuagint (LXX)
- **Edition:** Rahlfs' Septuagint
- **Language:** Greek
- **Testament:** Old Testament (39 books)
- **Date:** c. 3rd century BCE - 1st century CE
- **Significance:** The Greek translation of the Hebrew Bible used by early Christians

### Download Instructions

1. **Source Repository:**
   ```bash
   git clone https://github.com/sleeptillseven/LXX-Swete.git
   ```

2. **Create directory structure:**
   ```bash
   mkdir -p ../../../manuscripts/septuagint/lxx-swete
   ```

3. **Copy data files:**
   ```bash
   # Extract text files to the lxx-swete directory
   # Format varies by source - may need to adjust parser
   ```

### Import Commands

```bash
# Test import (Genesis only)
node database/import-lxx.js --test

# Import specific book
node database/import-lxx.js --book=Genesis

# Full import (all OT books)
node database/import-lxx.js --full
```

### Expected Results
- **Books:** 39 (Old Testament)
- **Verses:** ~23,000 (varies by edition)
- **Database Code:** `LXX`

---

## 2. Textus Receptus (TR) - Greek New Testament

### About the Textus Receptus
- **Full Name:** Textus Receptus (Scrivener 1894)
- **Edition:** F.H.A. Scrivener's 1894 edition
- **Language:** Greek
- **Testament:** New Testament (27 books)
- **Date:** 1894 CE (compilation of 16th-century texts)
- **Significance:** The Greek text underlying the King James Version

### Download Instructions

1. **Source Repository:**
   ```bash
   git clone https://github.com/byztxt/byzantine-majority-text.git
   ```

   *Alternative source:*
   ```bash
   git clone https://github.com/biblicalhumanities/Nestle1904.git
   ```

2. **Create directory structure:**
   ```bash
   mkdir -p ../../../manuscripts/greek_nt/textus_receptus
   ```

3. **Copy data files:**
   ```bash
   # Extract Greek text files (one per book)
   # Files should be named: MAT.txt, MRK.txt, LUK.txt, etc.
   ```

### Import Commands

```bash
# Test import (John only)
node database/import-textus-receptus.js --test

# Import specific book by number (64 = John)
node database/import-textus-receptus.js --book=64

# Full import (all NT books)
node database/import-textus-receptus.js --full
```

### Expected Results
- **Books:** 27 (New Testament)
- **Verses:** ~7,900
- **Database Code:** `TR`

---

## Manuscript Comparison

After importing all manuscripts, you'll have:

| Manuscript | Code | Language | Testament | Verses | Status |
|------------|------|----------|-----------|--------|--------|
| Westminster Leningrad Codex | WLC | Hebrew | OT | 23,145 | ✅ Imported |
| World English Bible | WEB | English | OT+NT | 23,145 | ✅ Imported |
| SBL Greek New Testament | SBLGNT | Greek | NT | 7,927 | ✅ Imported |
| **Septuagint** | **LXX** | **Greek** | **OT** | **~23,000** | ⏳ Ready to Import |
| **Textus Receptus** | **TR** | **Greek** | **NT** | **~7,900** | ⏳ Ready to Import |

---

## Updating the ManuscriptViewer Component

After importing additional manuscripts, update the `ManuscriptViewer.jsx` component to include them:

```javascript
// In ManuscriptViewer.jsx

// For Old Testament verses, add LXX option:
if (isOldTestament) {
  manuscriptPromises.push(
    getVerse('WLC', book, chapter, verse)
      .then(v => ({ ...v, name: 'Westminster Leningrad Codex', lang: 'hebrew' }))
      .catch(() => null)
  );
  manuscriptPromises.push(
    getVerse('LXX', book, chapter, verse)  // <-- Add this
      .then(v => ({ ...v, name: 'Septuagint (LXX)', lang: 'greek' }))
      .catch(() => null)
  );
  manuscriptPromises.push(
    getVerse('WEB', book, chapter, verse)
      .then(v => ({ ...v, name: 'World English Bible', lang: 'english' }))
      .catch(() => null)
  );
}

// For New Testament verses, add TR option:
else {
  manuscriptPromises.push(
    getVerse('SBLGNT', book, chapter, verse)
      .then(v => ({ ...v, name: 'SBL Greek New Testament', lang: 'greek' }))
      .catch(() => null)
  );
  manuscriptPromises.push(
    getVerse('TR', book, chapter, verse)  // <-- Add this
      .then(v => ({ ...v, name: 'Textus Receptus', lang: 'greek' }))
      .catch(() => null)
  );
  manuscriptPromises.push(
    getVerse('WEB', book, chapter, verse)
      .then(v => ({ ...v, name: 'World English Bible', lang: 'english' }))
      .catch(() => null)
  );
}
```

This will display up to 3 manuscripts in parallel for each verse!

---

## Greek Name Restoration

The Greek name restoration system already supports both SBLGNT and TR manuscripts:

| Original (Greek) | Restored | Strong's # |
|------------------|----------|------------|
| Ἰησοῦς | Yahusha | G2424 |
| θεός | Elohim | G2316 |
| κύριος | Yahuah | G2962 (contextual) |

No additional configuration needed!

---

## Troubleshooting

### File Format Issues

Different sources may use different file formats. You may need to adjust the parser functions:
- `parseLXXVerse()` in `import-lxx.js`
- `parseTRLine()` in `import-textus-receptus.js`

Common formats:
```
# Format 1: Book Chapter:Verse Text
Gen 1:1 Ἐν ἀρχῇ ἐποίησεν ὁ θεὸς...

# Format 2: Chapter:Verse Text (book in filename)
1:1 Ἐν ἀρχῇ ἐποίησεν ὁ θεὸς...

# Format 3: Tab-separated
Gen\t1\t1\tἘν ἀρχῇ ἐποίησεν ὁ θεὸς...
```

### Directory Structure

Expected directory structure:
```
All4Yah/
├── manuscripts/
│   ├── hebrew/
│   │   └── wlc/              ✅ (imported)
│   ├── english/
│   │   └── web/              ✅ (imported)
│   ├── greek_nt/
│   │   ├── sblgnt/           ✅ (imported)
│   │   └── textus_receptus/  ⏳ (download here)
│   └── septuagint/
│       └── lxx-swete/        ⏳ (download here)
```

### Database Connection Issues

Ensure your `.env` file has the correct Supabase credentials:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

---

## Next Steps

After importing additional manuscripts:

1. ✅ Update `ManuscriptViewer.jsx` to display all manuscripts
2. ✅ Test the parallel view with 3 manuscripts
3. ✅ Add Greek name restoration for LXX
4. ✅ Create comparison views
5. ✅ Commit changes to git

**Total Manuscript Collection:**
- 5 manuscripts
- 3 languages (Hebrew, Greek, English)
- ~62,000 verses
- Full OT + NT coverage with multiple Greek editions

---

*For questions or issues, refer to the main project documentation in VISION_ROADMAP.md*
