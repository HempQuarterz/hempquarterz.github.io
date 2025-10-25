# Open Source Manuscripts - Import Roadmap
**Date:** October 25, 2025
**Purpose:** Prioritized plan for importing only fully open, legally accessible manuscripts

---

## 🎯 Philosophy: Open Source Only

**All4Yah Mission:** Restoring divine names using only **fully open, legally accessible** manuscripts.

**Exclusions:**
- ❌ Restricted lexicons (BDB, HALOT, LSJ) - require paid academic licenses
- ❌ Samaritan Pentateuch - academic permission required
- ❌ Peshitta (Syriac) - partial/licensed digital copies

**Included:** 12 fully open manuscripts and sources

---

## ✅ Currently Imported (10 Manuscripts - "Authentic 10")

### Tier 1: Primary Manuscripts (9 sources)

| # | Code | Manuscript | Language | Lines | Status | License |
|---|------|------------|----------|-------|--------|---------|
| 1 | **DSS** | Dead Sea Scrolls | Hebrew | 52,153 | ✅ 100% | CC BY-NC-SA 3.0 |
| 2 | **WLC** | Westminster Leningrad Codex | Hebrew | 24,661 | ✅ 100% | Public Domain |
| 3 | **LXX** | Septuagint (Rahlfs) | Greek | 27,947 | ✅ 100% | Public Domain |
| 4 | **SBLGNT** | SBL Greek NT | Greek | 7,927 | ✅ 100% | CC BY-SA 4.0 |
| 5 | **N1904** | Nestle 1904 | Greek | 7,943 | ✅ 100% | Public Domain |
| 6 | **BYZMT** | Byzantine Majority Text | Greek | 6,911 | ✅ 100% | Public Domain |
| 7 | **TR** | Textus Receptus | Greek | 7,957 | ✅ 100% | Public Domain |
| 8 | **SIN** | Codex Sinaiticus | Greek | 9,657 | ✅ 100% | Public Domain |
| 9 | **VUL** | Clementine Vulgate | Latin | 35,811 | ✅ 100% | Public Domain |

### Tier 2: English Translation (1 source)

| # | Code | Manuscript | Language | Lines | Status | License |
|---|------|------------|----------|-------|--------|---------|
| 10 | **WEB** | World English Bible | English | 31,402 | ✅ 100% | Public Domain |

**Total Imported:** 212,369 verses/lines across 10 manuscripts

---

## 🎯 Phase 2: Additional Open Sources (5 remaining)

### ⚠️ Understanding "Partial Access"

**"Public Access (Partial)"** means content is viewable but may have restrictions:

| Type | What You Can Do | What You Can't Do |
|------|----------------|-------------------|
| 🟢 **Fully Open** | View, download, redistribute, use in AI | Nothing restricted |
| 🟠 **Partial Access** | View online, read samples | Download full dataset, redistribute, AI training |
| 🔴 **Restricted** | Request academic permission | Public access without approval |

**Examples:**
- **Aleppo Codex**: Viewable online, but only ~60% survives; museum may restrict downloads
- **Dead Sea Scrolls (Leon Levy)**: All fragments viewable, but downloading for AI use requires permission
- **Samaritan Pentateuch**: Sample excerpts online, full scans restricted to scholars

**All4Yah Policy**: Prioritize 🟢 Fully Open sources. Use 🟠 Partial sources only if license permits redistribution.

---

## 🎯 Phase 2: Prioritized by Openness Level

### Priority 1 (🟢 FULLY OPEN): OpenScriptures Hebrew Bible (OSHB)
**Source:** #9 from list
**Description:** Morphologically tagged open Hebrew corpus
**Status:** 🟢 Fully open - downloadable, redistributable
**License:** CC BY 4.0 (permits commercial use, redistribution, AI training)
**URL:** https://github.com/openscriptures/morphhb

**Full Access Confirmed:**
- ✅ Complete dataset available on GitHub
- ✅ Download entire corpus freely
- ✅ Redistribute and modify allowed
- ✅ Use in AI/ML training permitted
- ✅ No attribution restrictions for derived works

**What to Import:**
- Enhanced WLC text with morphological tags
- Lemma data for every Hebrew word
- Part-of-speech tagging
- Root word analysis

**Value:**
- Same base text as WLC (already imported)
- Adds linguistic analysis layer
- Machine-readable morphology
- Perfect for advanced search features

**Estimated Data:**
- 23,145 verses (same as WLC)
- ~305,000 individual words with morphology
- Each word tagged with: lemma, POS, root, Strong's number

**Implementation:**
- ✅ Import morphology data to existing WLC verses
- ✅ Populate `morphology` JSONB column
- ✅ Enable word-by-word hover tooltips
- ✅ Create interlinear view (Hebrew + morphology + English)
- ✅ Host data directly in All4Yah database

**Timeline:** Phase 2, Month 1 (NOW HIGHEST PRIORITY)

---

### Priority 2 (🟢 FULLY OPEN): Sefaria Digital Library
**Source:** #10 from list
**Description:** Online corpus of Hebrew/Aramaic texts & commentaries
**Status:** 🟢 Fully open - downloadable via API
**License:** CC BY 4.0 / CC BY-SA 4.0 (varies by text)
**URL:** https://www.sefaria.org/ / https://github.com/Sefaria/Sefaria-Project

**Full Access Confirmed:**
- ✅ Complete API access for programmatic download
- ✅ GitHub repository with all source code
- ✅ Openly licensed texts (CC BY 4.0)
- ✅ Redistribute and modify allowed
- ✅ Use in AI/ML training permitted

**What to Import:**
- Hebrew Bible texts (cross-reference with WLC)
- Targumim (Aramaic translations of Hebrew Bible)
- English translations
- Cross-reference metadata

**Value:**
- Community-driven open source project
- Rich metadata and cross-references
- Multiple text versions for comparison
- API access for programmatic import

**Estimated Data:**
- Full Hebrew Bible (~23,000 verses)
- Multiple Targumim versions
- Extensive cross-reference data

**Implementation:**
- ✅ Use Sefaria API for programmatic import
- ✅ Import as comparison layer to WLC
- ✅ Use for cross-reference system
- ✅ Display variant readings in UI
- ✅ Host data directly in All4Yah database

**Timeline:** Phase 2, Month 2

---

### Priority 3 (🟢 FULLY OPEN): StepBible / BibleHub Data APIs
**Source:** #15 from list
**Description:** Interlinear data for multiple Bible versions
**Status:** 🟢 Fully open - downloadable datasets
**License:** CC BY-SA 4.0
**URL:** https://www.stepbible.org/ / https://biblehub.com/

**Full Access Confirmed:**
- ✅ Complete datasets available for download
- ✅ Open licensing (CC BY-SA 4.0)
- ✅ Redistribute with attribution allowed
- ✅ Use in AI/ML training permitted

**What to Import:**
- Interlinear alignment data (Hebrew-Greek-English)
- Strong's concordance numbers
- Cross-reference data
- Lexicon entries (open source portion)

**Value:**
- Rich interlinear data
- Strong's numbers already mapped
- Cross-reference system
- Multiple translation comparison

**Estimated Data:**
- Full Bible interlinear alignment
- ~8,000 Strong's Hebrew entries
- ~5,000 Strong's Greek entries
- Extensive cross-reference database

**Implementation:**
- ✅ Import Strong's numbers to existing verses
- ✅ Create interlinear display view
- ✅ Build cross-reference system
- ✅ Enable Strong's number search
- ✅ Host data directly in All4Yah database

**Timeline:** Phase 2, Month 3

---

### Priority 4 (🟠 PARTIAL ACCESS - Reference Only): Aleppo Codex
**Source:** #3 from list
**Description:** Oldest partially preserved Masoretic manuscript (930 CE)
**Status:** 🟠 Viewable online only - download restrictions apply
**License:** Public Domain (viewing), museum control for redistribution
**URL:** http://www.aleppocodex.org/

**Access Restrictions:**
- ⚠️ Only surviving portions (~60%) are digitized
- 📖 Viewable online but full download restricted
- 🔒 Museum control may limit AI training or bulk redistribution
- ❌ Cannot host full manuscript data in database

**Implementation Strategy (Reference-Only):**
```json
{
  "manuscript": "Aleppo Codex",
  "license": "Public Domain (viewing only)",
  "access_level": "partial",
  "download_permission": false,
  "implementation": "cross-link only",
  "external_url": "http://www.aleppocodex.org/",
  "notes": "View this fragment at AleppoCodex.org"
}
```

**What We CAN Do:**
- 📎 Cross-link to public viewer from All4Yah UI
- 📝 Store metadata about textual variants vs WLC
- 🔗 Provide "View at Source" links for users
- 📊 Display comparison notes (without hosting manuscript)

**What We CANNOT Do:**
- ❌ Download and host full manuscript images
- ❌ Redistribute diplomatic transcription
- ❌ Use in AI training without permission
- ❌ Store complete text in database

**Value:**
- 80 years older than Leningrad Codex
- Gold standard for Masoretic vowel pointing
- Critical for textual criticism of Hebrew Bible

**Implementation:**
- 🔗 Create external link system in UI
- 📝 Store variant notes as metadata on WLC verses
- ⚠️ Add disclaimer: "Manuscript viewable at source only"
- 📎 Deep-link to specific verses at aleppocodex.org

**Risk Assessment:** 🟡 MEDIUM - Reference-only, no direct import

**Timeline:** Phase 2, Month 4 (low priority - reference links only)

---

### Priority 5 (🟠 PARTIAL ACCESS - Investigate License): Digital Vatican Library - Codex Vaticanus
**Source:** #14 from list
**Description:** Manuscript facsimiles including Codex Vaticanus (4th c. CE)
**Status:** 🟠 Public domain scans - redistribution terms unclear
**License:** Public Domain (Vatican claims), verify download/redistribution rights
**URL:** https://digi.vatlib.it/

**Access Uncertainty:**
- ❓ High-resolution scans publicly viewable
- ❓ Download permissions unclear
- ❓ Redistribution and AI training terms not explicit
- ⚠️ Requires license verification before import

**Implementation Strategy:**
1. **First: Verify License Terms**
   - Contact Vatican Library for explicit permission
   - Check if downloadable transcriptions exist
   - Confirm redistribution rights

2. **If Fully Open:**
   - ✅ Download manuscript images
   - ✅ Use existing transcription databases
   - ✅ Create variant comparison (Vaticanus vs Sinaiticus)
   - ✅ Host data directly in database

3. **If Partial/Restricted:**
   - 🔗 Cross-link to Vatican Library viewer
   - 📝 Store variant metadata only
   - ⚠️ Reference-only implementation

**Value:**
- 4th century CE (same age as Sinaiticus)
- Different textual tradition than Sinaiticus
- Critical for Greek NT textual criticism
- Used as base for Westcott-Hort critical text

**Estimated Data:**
- Complete Greek OT (LXX)
- Complete Greek NT
- ~35,000 verses total

**Risk Assessment:** 🟡 MEDIUM - Requires license verification

**Timeline:** Phase 2, Month 5 (pending license clarification)

---

## 📊 Phase 2 Summary

### Fully Open Sources (Priorities 1-3) - READY FOR IMPORT
| Priority | Source | License | Import Method | Timeline |
|----------|--------|---------|---------------|----------|
| 🥇 1 | OSHB Morphology | CC BY 4.0 | Direct import | Month 1 |
| 🥈 2 | Sefaria API | CC BY 4.0 | API download | Month 2 |
| 🥉 3 | StepBible/BibleHub | CC BY-SA 4.0 | Dataset download | Month 3 |

### Partial Access Sources (Priorities 4-5) - REFERENCE ONLY
| Priority | Source | Access Level | Implementation | Timeline |
|----------|--------|--------------|----------------|----------|
| 4 | Aleppo Codex | Viewable only | Cross-link | Month 4 |
| 5 | Codex Vaticanus | License unclear | Investigate first | Month 5 |

**Total Fully Importable:** 3 sources
**Total Reference-Only:** 2 sources

---

## 📋 Phase 2 Implementation Plan

### Month 1: OSHB Morphology Import ✅ (FULLY OPEN)
**Tasks:**
1. Clone GitHub repository: https://github.com/openscriptures/morphhb
2. Parse morphological data format
3. Create import script for morphology JSONB column
4. Import morphology data to existing WLC verses
5. Verify all 305,000 words tagged correctly

**Expected Output:**
- All WLC verses enriched with morphology
- Word-by-word lemma, POS, root, Strong's data
- Foundation for interlinear UI display

---

### Month 2: Sefaria API Integration ✅ (FULLY OPEN)
**Tasks:**
1. Register for Sefaria API access
2. Download Hebrew Bible cross-reference data
3. Import Targumim (Aramaic) texts
4. Create cross-reference mapping system
5. Build UI for variant display

**Expected Output:**
- Complete cross-reference database
- Aramaic Targumim imported
- Side-by-side comparison views

---

### Month 3: StepBible/BibleHub Import ✅ (FULLY OPEN)
**Tasks:**
1. Download Strong's concordance datasets
2. Import interlinear alignment data
3. Map Strong's numbers to existing verses
4. Create concordance search system
5. Build Strong's number lookup UI

**Expected Output:**
- ~13,000 Strong's entries imported
- Full interlinear alignment
- Concordance search functional

---

### Month 4: Aleppo Codex Reference System 🔗 (REFERENCE ONLY)
**Tasks:**
1. Research licensing terms (confirm viewable-only status)
2. Create external link database schema
3. Map WLC verses to Aleppo Codex online viewer
4. Store textual variant metadata
5. Build "View at Source" UI component

**Expected Output:**
- Deep-links to aleppocodex.org
- Variant notes displayed on WLC verses
- No hosted manuscript data (reference only)

---

### Month 5: Codex Vaticanus License Investigation 🔍 (PENDING)
**Tasks:**
1. Contact Vatican Library for license clarification
2. Research existing transcription databases
3. If open: Download and import
4. If restricted: Create reference-link system
5. Document final decision and implementation

**Expected Output:**
- Clear license determination
- Either full import OR reference-only system
- Documentation of restrictions

---

## 📊 Complete Open Source Manuscript Inventory

### Current Database (Phase 1 Complete)
- **10 manuscripts** imported
- **212,369 verses/lines**
- **4 languages:** Hebrew, Greek, Latin, English
- **Time span:** 2,500+ years (100 BCE - 1000 CE)

### After Phase 2 (Fully Open Sources Only)
- **13 manuscripts/sources** (10 imported + 3 new imports)
- **~270,000+ verses/lines** (including morphology and cross-references)
- **5 languages:** Hebrew, Aramaic, Greek, Latin, English
- **Time span:** 2,500+ years (250 BCE - 2000 CE)
- **2 reference-only sources** (Aleppo, Vaticanus - external links only)

### Manuscript Timeline (Oldest to Newest)

```
250 BCE ─────────────────────────────────────────────────── 2000 CE
    │
    ├─ 250 BCE-68 CE: Dead Sea Scrolls (DSS) ✅ IMPORTED
    │
    ├─ 3rd c. BCE: Septuagint (LXX) ✅ IMPORTED
    │
    ├─ 4th c. CE: Codex Sinaiticus (SIN) ✅ IMPORTED
    │
    ├─ 4th c. CE: Codex Vaticanus (VAT) 🔗 REFERENCE-ONLY (Phase 2)
    │
    ├─ 4th-5th c. CE: Vulgate (VUL) ✅ IMPORTED
    │
    ├─ 930 CE: Aleppo Codex (ALEP) 🔗 REFERENCE-ONLY (Phase 2)
    │
    ├─ 1008 CE: Leningrad Codex (WLC) ✅ IMPORTED
    │   └─ + OSHB Morphology ⏳ Phase 2 Month 1 (IMPORTABLE)
    │
    ├─ Modern Critical Editions:
    │   - Nestle 1904 (N1904) ✅ IMPORTED
    │   - SBLGNT ✅ IMPORTED
    │   - Byzantine (BYZMT) ✅ IMPORTED
    │   - Textus Receptus (TR) ✅ IMPORTED
    │   - WEB (2000 CE) ✅ IMPORTED
    │
    └─ Open Data Sources:
        - Sefaria API ⏳ Phase 2 Month 2 (IMPORTABLE)
        - StepBible/BibleHub ⏳ Phase 2 Month 3 (IMPORTABLE)
```

**Legend:**
- ✅ = Fully imported in database
- ⏳ = Planned import (fully open license)
- 🔗 = Reference-only (external links, no direct import)

---

## 🚫 Excluded Sources (Not Open)

### Restricted Academic Lexicons
- **BDB** (Brown-Driver-Briggs Hebrew Lexicon) - Requires Logos/academic license
- **HALOT** (Hebrew and Aramaic Lexicon of the Old Testament) - Paid license
- **LSJ** (Liddell-Scott-Jones Greek Lexicon) - University access required

**Alternative:** Use open Strong's Concordance and Sefaria lexicon data

### Limited Access Manuscripts
- **Samaritan Pentateuch** - Academic permission required, partial scans
  - **Alternative:** Use DSS and WLC for Pentateuch coverage
- **Peshitta (Syriac)** - Licensed digital copies (Peshitta Institute)
  - **Alternative:** Use Vulgate (Latin) and LXX (Greek) for OT coverage

---

## 🎯 Success Metrics

### Phase 1 (COMPLETE ✅)
- ✅ 10 manuscripts imported
- ✅ 212,369 verses/lines
- ✅ 100% success rate for all imports
- ✅ "Authentic 10" milestone achieved

### Phase 2 (Revised Target - Fully Open Only)
- 🎯 **3 fully open sources** imported (OSHB, Sefaria, StepBible)
- 🎯 **2 reference-only sources** (Aleppo, Vaticanus - external links)
- 🎯 **~270,000 total verses/lines** (including morphology)
- 🎯 Morphology data for all Hebrew texts
- 🎯 Cross-reference system complete
- 🎯 Interlinear display functional
- 🎯 Strong's concordance integrated
- 🎯 External link system for partial-access manuscripts

---

## 💡 Why Open Source Only?

### Legal Compliance
- ✅ No licensing fees
- ✅ No academic restrictions
- ✅ Free redistribution allowed
- ✅ Commercial use permitted (where applicable)

### Mission Alignment
- ✅ "Restoring truth, one name at a time"
- ✅ Accessible to everyone worldwide
- ✅ No paywalls blocking divine names
- ✅ Open data = transparent scholarship

### Technical Benefits
- ✅ API access available
- ✅ Machine-readable formats
- ✅ Community-maintained data
- ✅ Version control and updates

### Spiritual Integrity
- ✅ No corporate gatekeeping of Scripture
- ✅ Original languages freely available
- ✅ Divine names not behind paywalls
- ✅ Truth accessible to all seekers

---

## 🎯 Next Steps

### Immediate (Post Phase 1)
1. ✅ Commit DSS 100% import results
2. ✅ Update documentation
3. ⏳ Test divine name restoration with all 10 manuscripts
4. ⏳ Verify UI displays all manuscripts correctly

### Phase 2 Preparation (Month 1)
1. Research Aleppo Codex data sources
2. Download manuscript images
3. Identify best transcription source
4. Plan comparison UI for Aleppo vs WLC

### Long-term Vision
- Complete "Authentic 15" - all fully open sources
- Build comprehensive cross-reference system
- Create advanced morphological search
- Develop AI-powered textual criticism tools
- Make divine name restoration accessible worldwide

---

**Mission:** "Restoring truth, one name at a time."
**Commitment:** 100% open source, 100% accessible, 100% transparent

---

## 📚 Source URLs (Reference)

### Currently Imported
1. Dead Sea Scrolls: https://www.deadseascrolls.org.il/
2. Westminster Leningrad: https://tanach.us/ / https://github.com/openscriptures/morphhb
3. Septuagint: http://ccat.sas.upenn.edu/gopher/text/religion/biblical/lxxmorph/
4. SBLGNT: https://sblgnt.com/ / https://github.com/morphgnt/sblgnt
5. Nestle 1904: https://github.com/biblicalhumanities/Nestle1904
6. Byzantine Text: https://github.com/byztxt/byzantine-majority-text
7. Textus Receptus: https://github.com/morphgnt/textus-receptus
8. Codex Sinaiticus: http://codexsinaiticus.org/
9. Vulgate: http://www.vulsearch.org/
10. World English Bible: https://ebible.org/web/

### Phase 2 Targets
11. Aleppo Codex: http://www.aleppocodex.org/
12. OSHB: https://github.com/openscriptures/morphhb
13. Codex Vaticanus: https://digi.vatlib.it/
14. Sefaria: https://www.sefaria.org/ / https://github.com/Sefaria/Sefaria-Project
15. StepBible: https://www.stepbible.org/ / BibleHub: https://biblehub.com/

---

**Status:** Phase 1 - 100% COMPLETE (10/15 sources)
**Next:** Phase 2 - Month 1 (Aleppo Codex import)
