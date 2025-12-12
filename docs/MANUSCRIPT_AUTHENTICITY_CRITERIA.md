# Manuscript Authenticity Criteria & Tier Classification

**Last Updated:** 2025-10-25
**Purpose:** Define what makes a manuscript suitable for AI-driven divine name restoration

---

## 🎯 Mission-Critical Distinction

For the All4Yah project, not all "open" texts are equal. This document defines the crucial distinction between:

1. **Texts that are free AND unaltered** (Tier 1: Authentic)
2. **Texts that are open but filtered** (Tier 2: Filtered)
3. **Texts that are restricted or heavily edited** (Tier 3: Restricted)

---

## 📋 Three-Tier Classification System

### ✅ TIER 1: AUTHENTIC - Free & Unaltered Primary Sources

**Definition:** Texts suitable for primary AI restoration work

**Criteria:**
1. **License:** Public domain OR open license allowing full reuse (CC BY, CC BY-SA, CC0, etc.)
2. **Textual Fidelity:** Reflects original language data with no theological paraphrasing, smoothing, or redaction
3. **Editorial Interference:** Minimal - ideally diplomatic or facsimile-level editions
4. **Language:** Original languages only (Hebrew, Aramaic, Greek, Syriac, Latin)

**Why It Matters:**
- AI restoration requires access to the *actual words* as written in original manuscripts
- Any theological interpretation layer corrupts the restoration process
- Divine name patterns (יהוה, κύριος, etc.) must be preserved as originally written

**Current Tier 1 Manuscripts (5/6 imported):**

| Code | Manuscript | Language | License | Why Tier 1 |
|------|------------|----------|---------|------------|
| WLC | Westminster Leningrad Codex | Hebrew | Public Domain | Diplomatic Masoretic text from Leningrad Codex B19A (1008 CE). Complete, faithful transcription with cantillation, vowel points, and morphology. No doctrinal bias. |
| SBLGNT | SBL Greek New Testament | Greek | CC BY-SA 4.0 | Open-licensed critical edition with morphological tagging. No interpretive bias. Pure Greek text. |
| LXX | Septuagint (Rahlfs 1935) | Greek | CC BY-NC-SA 4.0 | Critical diplomatic edition based on CCAT data. Ancient Greek translation preserving pre-Christian Jewish divine name usage. No paraphrasing. |
| VUL | Clementine Vulgate | Latin | Public Domain | Jerome's Latin translation (~400 CE). Not modernized or paraphrased. Historical primary source. |
| TR | Textus Receptus | Greek | Public Domain | Traditional Byzantine text type underlying KJV. Pure Greek with morphology and Strong's numbers. No editorial smoothing. |

**Future Tier 1 Targets:**

| # | Manuscript | Language | Status | Why It Qualifies |
|---|------------|----------|--------|------------------|
| 1 | Dead Sea Scrolls (Leon Levy) | Hebrew/Aramaic | Downloaded | Digitized photographs and direct transcriptions. No editorial rewriting, only fragment labeling. Oldest biblical manuscripts (250 BCE - 68 CE). |
| 2 | Aleppo Codex | Hebrew | Not yet downloaded | Direct photographic facsimile of 10th century codex. Partial but fully authentic. No later redaction. |
| 3 | Codex Sinaiticus | Greek | Downloaded | 4th-century uncial codex. Direct scans + transcriptions. Unaltered photographic and text data from ITSEE Birmingham. |
| 4 | OpenScriptures Hebrew Bible (OSHB) | Hebrew | Not yet downloaded | Pure WLC text with open morphology tags. Machine-readable but not retranslated. Same base as WLC. |
| 5 | Perseus Digital Library | Greek/Latin | Not yet downloaded | Original-language scholarly editions. Fully open under CC BY-SA. Classical and biblical texts. |
| 6 | Digital Vatican Library | Multi-language | Not yet downloaded | High-resolution manuscript scans. Unaltered photographic sources. Public domain facsimiles. |

**Total Tier 1 Target:** 10-11 manuscripts (the "Authentic 10" corpus)

---

### ⚠️ TIER 2: FILTERED - Partially Free or Filtered Texts

**Definition:** Openly accessible but containing interpretation layers

**Characteristics:**
- **License:** Open/public domain ✅
- **Textual Fidelity:** Filtered through modern tagging, commentary, corrections, or translations ⚠️
- **Editorial Interference:** Significant - modernization, smoothing, or derivative processing
- **Language:** May be translations rather than original languages

**Use Cases:**
- Cross-reference and comparison
- English readability for non-scholars
- Modern linguistic annotations
- **NOT suitable for primary restoration work**

**Current Tier 2 Manuscripts (1/6 imported):**

| Code | Manuscript | Language | Issue | Why Tier 2 |
|------|------------|----------|-------|------------|
| WEB | World English Bible | English | Modern translation | Excellent public domain English Bible, but it's a 2000 CE translation, not original Hebrew/Greek. Useful for comparison but not for divine name restoration from original languages. |

**Future Tier 2 Considerations:**

| Manuscript | Issue | Potential Use |
|------------|-------|---------------|
| Samaritan Pentateuch | Access limited to academic consortia; online transcriptions are derivative and incomplete | May import if high-quality diplomatic edition becomes available |
| Peshitta (Syriac) | Text digitizations often include Western corrections or modern punctuation. Original "Ur-Peshitta" not fully open. | Import if we can find uncorrected scholarly edition |
| Sefaria | Excellent Hebrew/Aramaic data but includes modern tagging, formatting, and commentary layers mixed with raw text | Use for cross-reference but not primary restoration |
| StepBible / BibleHub APIs | Clean interlinear data but derived from modern English baselines; not primary manuscripts | Use for educational comparison |

---

### ❌ TIER 3: RESTRICTED - Not Free or Heavily Filtered

**Definition:** Proprietary, behind paywalls, or heavily edited

**Characteristics:**
- **License:** Copyright restricted, requires paid license, or academic-only access
- **Textual Fidelity:** May be excellent but legally unusable
- **Editorial Interference:** Varies - could be diplomatic but inaccessible

**Use Cases:**
- Reference only (summaries, citations)
- Cannot integrate into public All4Yah database
- May cite in documentation but not redistribute

**Tier 3 Examples:**

| Source | Limitation | Alternative |
|--------|------------|-------------|
| BDB / HALOT / LSJ Lexicons | Proprietary academic content. Cannot redistribute full entries. | Use Strong's Lexicon (public domain) or summarize under fair use |
| NA28 (Nestle-Aland 28) | © All rights reserved by Deutsche Bibelgesellschaft. Paid license required. | Use SBLGNT instead (similar critical text, open license) |
| Logos Bible Software Data | Proprietary datasets behind paywall | Use OpenScriptures, MorphGNT, and other open alternatives |

---

## 🔬 Authenticity Verification Checklist

Before importing any new manuscript, verify:

### 1. License Check ✅
- [ ] Public domain? (Pre-1923 or explicitly released)
- [ ] Open license? (CC BY, CC BY-SA, CC BY-NC-SA, CC0, MIT)
- [ ] Commercial reuse allowed? (Check NC restrictions)
- [ ] Attribution required? (Document in import script)

### 2. Textual Fidelity Check ✅
- [ ] Original language? (Hebrew, Aramaic, Greek, Syriac, Latin)
- [ ] Diplomatic edition? (Minimal editorial changes)
- [ ] Facsimile or transcription? (Direct from manuscript)
- [ ] No theological smoothing? (Check scholarly notes)
- [ ] No interpretive paraphrasing? (Word-for-word accuracy)

### 3. Editorial Interference Check ✅
- [ ] Manuscript-based? (Not a modern reconstruction)
- [ ] Morphology tags separate from text? (JSONB column)
- [ ] No embedded commentary? (Or can be stripped)
- [ ] Versification preserved? (Original chapter/verse boundaries)
- [ ] Divine names preserved as written? (יהוה not pre-substituted)

### 4. Source Provenance Check ✅
- [ ] Scholarly consensus source? (University, museum, consortium)
- [ ] Peer-reviewed transcription? (Academic validation)
- [ ] Transparent methodology? (Transcription rules documented)
- [ ] Versioned data? (Can track changes/corrections)

---

## 📊 Database Implementation

### Schema Changes (Migration 002)

```sql
-- Add authenticity tier to manuscripts table
ALTER TABLE manuscripts
ADD COLUMN authenticity_tier INTEGER CHECK (authenticity_tier IN (1, 2, 3));

ADD COLUMN tier_notes TEXT;
```

### Tier Values

| Tier | Name | Database Value | Use in Queries |
|------|------|----------------|----------------|
| Tier 1 | Authentic | `1` | `WHERE authenticity_tier = 1` |
| Tier 2 | Filtered | `2` | `WHERE authenticity_tier = 2` |
| Tier 3 | Restricted | `3` | `WHERE authenticity_tier = 3` |

### Example Queries

**Get only authentic manuscripts:**
```sql
SELECT * FROM manuscripts WHERE authenticity_tier = 1;
```

**Get manuscripts suitable for AI restoration (Tier 1 only):**
```sql
SELECT * FROM authentic_manuscripts; -- Uses view
```

**Get all imported manuscripts with tier classification:**
```sql
SELECT code, name, language, authenticity_tier,
  CASE authenticity_tier
    WHEN 1 THEN 'Authentic'
    WHEN 2 THEN 'Filtered'
    WHEN 3 THEN 'Restricted'
  END as tier_name
FROM manuscripts
ORDER BY authenticity_tier, code;
```

---

## 🎯 Strategic Priorities Based on Tiers

### Phase 1: Build the "Authentic 10" Corpus (Current Phase)
- [x] WLC (Tier 1) ✅
- [x] SBLGNT (Tier 1) ✅
- [x] LXX (Tier 1) ✅
- [x] VUL (Tier 1) ✅
- [x] TR (Tier 1) ✅
- [ ] Dead Sea Scrolls (Tier 1) - HIGH PRIORITY
- [ ] Codex Sinaiticus (Tier 1)
- [ ] Aleppo Codex (Tier 1)
- [ ] OSHB (Tier 1) - Duplicate of WLC with different morphology
- [ ] Perseus Digital Library (Tier 1)

**Goal:** 10 Tier 1 manuscripts = complete "Authentic Corpus"

### Phase 2: Add Filtered Sources for Comparison
- [x] WEB (Tier 2) ✅
- [ ] Peshitta (Tier 2) - If uncorrected edition found
- [ ] Samaritan Pentateuch (Tier 2) - If high-quality diplomatic edition found

**Goal:** Provide modern translations and secondary sources for user comparison

### Phase 3: Reference Materials (Not for Import)
- Lexicons (Tier 3) - Cite under fair use, don't redistribute
- NA28 (Tier 3) - Reference only, cannot integrate

---

## 🛡️ Legal & Ethical Guidelines

### What We Can Do:
✅ Import and redistribute Tier 1 manuscripts (within license terms)
✅ Create derivative works (AI translations) from Tier 1 sources
✅ Attribute sources properly per license requirements
✅ Use Tier 3 materials for personal research and fair use citations

### What We Cannot Do:
❌ Redistribute Tier 3 proprietary content
❌ Violate NC (non-commercial) clauses if monetizing
❌ Claim Tier 2 filtered texts are "original manuscripts"
❌ Strip attribution required by CC BY licenses

### Gray Areas (Proceed with Caution):
⚠️ Tier 2 sources where "filtering" is unclear - verify with source
⚠️ Academic-only licenses - may use for non-commercial research but not public release
⚠️ Derivative digitizations - verify chain of licenses (e.g., GitHub repo of a manuscript scan)

---

## 📚 Resources & Citations

### Tier 1 Source Repositories:
- **OpenScriptures:** https://github.com/openscriptures
- **MorphGNT:** https://github.com/morphgnt
- **LXX Rahlfs 1935:** https://github.com/eliranwong/LXX-Rahlfs-1935
- **Dead Sea Scrolls:** https://www.deadseascrolls.org.il/
- **Codex Sinaiticus:** http://www.codexsinaiticus.org/
- **Textus Receptus:** https://github.com/byztxt/greektext-textus-receptus
- **Vulgate:** https://github.com/emilekm2142/vulgate-bible-full-text

### License Information:
- **Public Domain:** Pre-1923 works, explicitly released (CC0, Unlicense)
- **CC BY 4.0:** Attribution required, commercial use OK
- **CC BY-SA 4.0:** Attribution + share-alike, commercial use OK
- **CC BY-NC-SA 4.0:** Attribution + share-alike, non-commercial only

### Academic Standards:
- ITSEE (Institute for Textual Scholarship and Electronic Editing)
- CATSS (Computer Assisted Tools for Septuagint Studies)
- ETCBC (Eep Talstra Centre for Bible and Computer)

---

## ✅ Summary: The "Authentic 10" Strategy

**Goal:** Build a foundation of 10 unaltered, primary-source manuscripts for AI restoration

**Current Status:** 5/10 Tier 1 manuscripts imported (50%)

**Next Steps:**
1. Import Dead Sea Scrolls (high-value texts) - Tier 1
2. Import Codex Sinaiticus - Tier 1
3. Evaluate Peshitta sources for Tier 1 vs Tier 2 classification
4. Document each manuscript's tier classification in import scripts
5. Create UI toggle: "Show only authentic manuscripts" for scholarly users

**Mission:** "Restoring truth, one name at a time." 🔥

*With the "Authentic 10" corpus, All4Yah will have the most comprehensive collection of unaltered biblical manuscripts available in any open-source project worldwide.*
