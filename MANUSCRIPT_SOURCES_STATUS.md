# Manuscript Sources Status & Acquisition Plan

**Last Updated:** 2025-10-25
**Current Status:** 5 of 15 sources imported (33%)

---

## 📊 Overview

The All4Yah project aims to provide access to 15 primary manuscript repositories representing the most significant ancient biblical texts. Currently, 5 core manuscripts are implemented (WLC, SBLGNT, WEB, Vulgate, TR), with 10 additional sources planned for future phases.

---

## ✅ IMPLEMENTED SOURCES (5/15)

### 1. Westminster Leningrad Codex (WLC) ✅
- **Type:** Hebrew Old Testament (Masoretic Text)
- **Date:** 1008 CE (based on Leningrad Codex B19A)
- **Verses:** 23,145 (100% complete)
- **Language:** Hebrew
- **License:** CC BY 4.0
- **Status:** FULLY IMPORTED
- **Data Source:** morphhb.org / OpenScriptures
- **Special Features:** Cantillation marks, vowel points, morphological tagging

### 2. SBL Greek New Testament (SBLGNT) ✅
- **Type:** Greek New Testament (Critical edition)
- **Date:** 2010 CE (based on ancient manuscripts)
- **Verses:** 7,927 (100% complete)
- **Language:** Greek (Koine)
- **License:** CC BY-SA 4.0
- **Status:** FULLY IMPORTED
- **Data Source:** MorphGNT / SBL
- **Special Features:** Morphological tagging, lexical data

### 3. World English Bible (WEB) ✅
- **Type:** Modern English translation
- **Date:** 2000 CE
- **Verses:** 31,098 (100% complete - full Bible)
- **Language:** English
- **License:** Public Domain
- **Status:** FULLY IMPORTED
- **Data Source:** ebible.org
- **Special Features:** Complete OT + NT, public domain

### 4. Clementine Vulgate (VUL) ✅
- **Type:** Latin Bible (Jerome's translation)
- **Date:** ~400 CE
- **Verses:** 35,811 (100% complete - full Bible with Deuterocanonical books)
- **Language:** Latin
- **License:** Public Domain
- **Status:** FULLY IMPORTED
- **Data Source:** emilekm2142/vulgate-bible-full-text (GitHub)
- **Special Features:** Complete 73-book Catholic canon, JSON format import

### 5. Textus Receptus (TR) ✅
- **Type:** Greek New Testament (Traditional Byzantine text)
- **Date:** 16th century (based on Byzantine manuscripts)
- **Verses:** 7,957 (100% complete NT)
- **Language:** Greek (Koine)
- **License:** Public Domain
- **Status:** FULLY IMPORTED
- **Data Source:** byztxt/greektext-textus-receptus (Dr. Maurice A. Robinson)
- **Special Features:** Morphological tagging, Strong's numbers, underlies KJV translation

---

## 🟡 HIGH PRIORITY - PHASE 1 (Next 3 months)

### 6. Septuagint (LXX) 🟡
- **Type:** Greek Old Testament
- **Date:** 3rd-1st century BCE
- **Verses:** ~23,000 (OT in Greek)
- **Language:** Greek (Koine)
- **License:** Public Domain / CC BY-SA
- **Status:** NOT YET IMPORTED
- **Priority:** **URGENT** - Needed for κύριος (kyrios) validation
- **Data Sources Available:**
  - CCAT (Computer-assisted Tools for Septuagint Studies)
  - NETS (New English Translation of the Septuagint)
  - Rahlfs-Hanhart edition
- **Next Steps:**
  1. Research best data source (CCAT vs Rahlfs)
  2. Download LXX text files
  3. Create import script (similar to import-sblgnt.js)
  4. Import ~23,000 verses
  5. Cross-reference with WLC for κύριος = יהוה validation

---

## ⏳ MEDIUM PRIORITY - PHASE 2-3 (3-12 months)

### 7. Dead Sea Scrolls (DSS) - Selected Texts
- **Type:** Hebrew biblical manuscripts + commentaries
- **Date:** 250 BCE - 68 CE
- **Verses:** ~5,000 high-value verses
- **Language:** Hebrew (+ some Aramaic, Greek)
- **License:** Public Domain
- **Status:** NOT IMPLEMENTED
- **Why Important:** Oldest known biblical manuscripts, contains divine name יהוה
- **Data Source:** Digital Dead Sea Scrolls (IAA + Google)
- **Implementation Strategy:**
  - Start with Great Isaiah Scroll (1QIsaᵃ)
  - Add Habakkuk Commentary (1QpHab) - shows יהוה usage
  - Import ~10-20 high-significance scrolls
  - Focus on passages with divine name

### 8. Peshitta (Syriac) - New Testament
- **Type:** Syriac New Testament
- **Date:** 5th century CE
- **Verses:** ~7,900 (NT only to start)
- **Language:** Syriac (Aramaic)
- **License:** Public Domain
- **Status:** NOT IMPLEMENTED
- **Why Important:** Early Aramaic witness to NT text
- **Data Source:** SEDRA (Syriac Electronic Data Research Archive)

### 9. Targumim (Aramaic Translations)
- **Type:** Aramaic paraphrases of Hebrew Bible
- **Date:** 1st-5th century CE
- **Verses:** Select passages (~2,000 verses)
- **Language:** Aramaic
- **License:** Public Domain
- **Status:** NOT IMPLEMENTED
- **Why Important:** Shows how divine name was handled in Aramaic
- **Data Source:** Comprehensive Aramaic Lexicon Project

### 10. Samaritan Pentateuch
- **Type:** Torah (first 5 books)
- **Date:** ~100 BCE (text tradition)
- **Verses:** ~5,800 (Genesis - Deuteronomy)
- **Language:** Samaritan Hebrew
- **License:** Public Domain
- **Status:** NOT IMPLEMENTED
- **Why Important:** Independent textual tradition, divine name variants
- **Data Source:** Digital Samaritan Pentateuch project

---

## 🔮 LONG-TERM - PHASE 4+ (12+ months)

### 11. Codex Sinaiticus
- **Type:** Greek Bible (oldest complete NT)
- **Date:** 4th century CE
- **Verses:** ~7,900 NT verses
- **Language:** Greek (Koine)
- **License:** Public Domain
- **Status:** NOT IMPLEMENTED
- **Data Source:** codexsinaiticus.org (British Library)

### 12. Codex Vaticanus
- **Type:** Greek Bible
- **Date:** 4th century CE
- **Verses:** ~31,000 (mostly complete Bible)
- **Language:** Greek
- **License:** Public Domain
- **Status:** NOT IMPLEMENTED
- **Data Source:** Vatican Library digital collection

### 13. Nestle-Aland 28 (NA28)
- **Type:** Greek NT (modern critical edition)
- **Date:** 2012 CE
- **Verses:** ~7,900 (NT only)
- **Language:** Greek
- **License:** **COPYRIGHT** - May require licensing
- **Status:** NOT IMPLEMENTED
- **Note:** May not be implementable due to copyright restrictions

### 14. Early Papyri (P45, P46, P52, etc.)
- **Type:** Greek NT fragments
- **Date:** 2nd-3rd century CE
- **Verses:** ~500 fragmentary verses
- **Language:** Greek
- **License:** Public Domain
- **Status:** NOT IMPLEMENTED
- **Data Source:** Various university and museum collections

### 15. Additional Hebrew Codices (Aleppo, Cairo Genizah)
- **Type:** Hebrew OT variants
- **Date:** 10th century CE
- **Verses:** Select variants (~1,000 verses)
- **Language:** Hebrew
- **License:** Public Domain
- **Status:** NOT IMPLEMENTED
- **Data Source:** Various digital humanities projects

---

## 📅 Implementation Roadmap

### Phase 1 (Weeks 1-10) - CURRENT
- [x] Import Strong's Lexicon (14,197 entries) ✅
- [x] Add provenance tracking schema ✅
- [ ] Complete theophoric names import (153+ entries)
- [ ] **Import Septuagint (LXX) - ~23,000 verses**
- [ ] Add confidence scoring to restoration.js

### Phase 2 (Months 3-6)
- [ ] Import Dead Sea Scrolls (selected high-value texts)
- [ ] Import Peshitta NT (~7,900 verses)
- [ ] Implement verse alignment system
- [ ] Build UI enhancements for manuscript comparison

### Phase 3 (Months 6-12)
- [ ] Import Targumim (select passages)
- [ ] Import Samaritan Pentateuch
- [ ] Add textual variant tracking
- [ ] Implement manuscript variant comparison view

### Phase 4 (Year 2+)
- [ ] Import major codices (Sinaiticus, Vaticanus)
- [ ] Import Vulgate
- [ ] Import Textus Receptus
- [ ] Import early papyri fragments
- [ ] Comprehensive manuscript comparison tools

---

## 💾 Data Storage Requirements

### Current Usage:
- WLC: ~50 MB (with morphology)
- SBLGNT: ~15 MB (with morphology)
- WEB: ~5 MB (plain text)
- Lexicon: ~4 MB
- **Total Current:** ~74 MB

### Projected Requirements (All 15 Sources):
- Dead Sea Scrolls: ~10 MB (high-value selections)
- LXX: ~25 MB
- Peshitta: ~15 MB
- Targumim: ~5 MB
- Samaritan Pentateuch: ~3 MB
- Codices (Sinaiticus, Vaticanus): ~30 MB
- Vulgate: ~10 MB
- Textus Receptus: ~15 MB
- NA28: ~15 MB (if licensed)
- Papyri: ~2 MB
- Additional Hebrew: ~5 MB
- **Total Projected:** ~209 MB (~3x current size)

**Supabase Free Tier:** 500 MB database limit
**Current Usage:** 74 MB (15% of limit)
**After All Sources:** 209 MB (42% of limit) ✅ FEASIBLE

---

## 🎯 Strategic Priorities

### Why LXX is Next (Urgent):
1. **Validation of Restoration:** LXX shows how Hebrew יהוה was translated as κύριος (kyrios)
2. **Cross-Reference Power:** LXX ↔ WLC alignment proves divine name locations
3. **Historical Evidence:** Pre-Christian translation preserves Jewish divine name usage
4. **Size vs Impact:** ~23,000 verses for massive theological value

### Why DSS After LXX:
1. **Oldest Manuscripts:** Closest to original texts
2. **Divine Name Evidence:** Contains יהוה in paleo-Hebrew script
3. **Targeted Approach:** Don't need all 900+ scrolls, just high-value passages

### Why Peshitta Matters:
1. **Aramaic Connection:** Language Jesus likely spoke
2. **Early NT Witness:** Complements Greek manuscripts
3. **Divine Name Treatment:** Shows Aramaic handling of sacred names

---

## 🔍 Data Source Research Status

| Manuscript | Best Data Source | Format | Availability | License |
|------------|-----------------|---------|--------------|---------|
| LXX | CCAT / Rahlfs | Plain text / XML | ✅ Public | PD / CC BY-SA |
| DSS | IAA Digital DSS | Images + transcriptions | ✅ Public | PD |
| Peshitta | SEDRA | Syriac Unicode | ✅ Available | PD |
| Targumim | CAL Project | Plain text | ✅ Available | PD |
| Samaritan | SamP Digital | Unicode | ✅ Available | PD |
| Sinaiticus | British Library | Transcription | ✅ Available | PD |
| Vaticanus | Vatican Library | Images | 🟡 Limited | PD |
| Vulgate | Clementine | Plain text | ✅ Available | PD |
| TR | Scrivener | Plain text / XML | ✅ Available | PD |
| NA28 | Deutsche Bibelgesellschaft | Licensed | ❌ Copyright | © All rights reserved |
| Papyri | Various | Transcriptions | 🟡 Scattered | PD |

---

## ✅ Next Actions (Week 2)

1. **Research LXX Data Sources:**
   - Download CCAT LXX files OR
   - Download Rahlfs-Hanhart edition
   - Evaluate data quality and format

2. **Create LXX Import Script:**
   - Model after import-sblgnt.js
   - Handle Greek text encoding (Unicode)
   - Parse book/chapter/verse structure
   - Import ~23,000 verses

3. **Verify LXX Import:**
   - Check verse counts per book
   - Verify κύριος occurrences
   - Cross-reference with WLC יהוה locations

4. **Document LXX Integration:**
   - Update MANUSCRIPT_SOURCES_STATUS.md
   - Add to DATA_VERIFICATION_REPORT.md
   - Create LXX-specific test scripts

---

## 📚 Resources

### Data Source Repositories:
- **OpenScriptures:** https://github.com/openscriptures
- **MorphGNT:** https://github.com/morphgnt
- **CCAT LXX:** http://ccat.sas.upenn.edu/gopher/text/religion/biblical/lxxmorph/
- **Dead Sea Scrolls:** https://www.deadseascrolls.org.il/
- **SEDRA (Peshitta):** https://sedra.bethmardutho.org/
- **CAL (Targumim):** http://cal.huc.edu/
- **Codex Sinaiticus:** http://www.codexsinaiticus.org/

### Documentation:
- DOSSIER_ALIGNMENT_ANALYSIS.md - Strategic roadmap
- PHASE_1_PROGRESS.md - Week-by-week tracking
- PHASE_1_WEEK_1_COMPLETE.md - Week 1 accomplishments
- DATA_VERIFICATION_REPORT.md - Current data status

---

**Status:** 5/15 sources implemented (33%) ✅
**Recent Additions:** Vulgate (35,811 verses), Textus Receptus (7,957 verses)
**Total Verses in Database:** 105,938 verses across 5 manuscripts
**Next Milestone:** LXX import (would bring to 6/15 = 40%)
**Target by End of Phase 1:** 6-7 sources (40-47%)

**Mission:** "Restoring truth, one name at a time." 🔥
