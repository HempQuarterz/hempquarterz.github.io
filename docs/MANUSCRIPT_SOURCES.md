# All4Yah Manuscript Sources
## Comprehensive Source List for Digital Dead Sea Scrolls Project

*Source: ChatGPT Analysis*
*Last Updated: 2025-10-18*

---

## 📚 Priority Import Order (Phase 1)

Based on our roadmap, we'll import sources in this order:

1. ✅ **Westminster Leningrad Codex (WLC)** - Hebrew OT baseline
2. ✅ **World English Bible (WEB)** - English baseline
3. ✅ **Textus Receptus** - Greek NT
4. ⏳ **MorphGNT** - Greek NT with morphology
5. ⏳ **Septuagint (LXX)** - Greek OT
6. ⏳ **Dead Sea Scrolls** - Earliest manuscripts

---

## 🔥 1. Hebrew Bible (Tanakh / Old Testament)

### Priority 1: Westminster Leningrad Codex (WLC)
- **What:** Complete Masoretic Text (~1008 CE)
- **Format:** TXT, XML, JSON
- **License:** ✅ Public Domain
- **Link:** https://github.com/openscriptures/morphhb
- **Status:** 🎯 **START HERE**
- **Import to:** `manuscripts` table (code: 'WLC')

### Priority 3: Open Scriptures Hebrew Bible (OSHB)
- **What:** Morphologically tagged Masoretic text
- **Format:** XML, JSON
- **License:** ✅ CC BY 4.0
- **Link:** https://github.com/openscriptures
- **Status:** ⏳ Phase 2
- **Import to:** `verses` + `morphology` column

### Priority 6: Aleppo Codex
- **What:** Oldest complete Hebrew Bible (partial but authoritative)
- **Format:** Scans
- **License:** ✅ Public Domain
- **Link:** http://www.aleppocodex.org/
- **Status:** ⏳ Phase 3 (images/comparison)

### Priority 7: Dead Sea Scrolls (DSS)
- **What:** Earliest Hebrew manuscripts (~250 BCE–50 CE)
- **Format:** Scans, transliterations
- **License:** ✅ Public Domain
- **Link:** https://www.deadseascrolls.org.il/
- **Status:** ⏳ Phase 3 (fragment comparison)

### Reference: Biblia Hebraica Stuttgartensia (BHS)
- **What:** Critical edition of the Hebrew Bible
- **Format:** TXT
- **License:** ✅ PD (older editions)
- **Link:** https://en.wikisource.org/wiki/Biblia_Hebraica_Stuttgartensia
- **Status:** ⏳ Reference only

### Tool: Tanakh.us Project
- **What:** Parsed Hebrew text and transliteration tools
- **Format:** Web, TXT
- **License:** ✅ Public Domain
- **Link:** https://tanakh.us/
- **Status:** ⏳ Phase 2 (tooling)

---

## ✝️ 2. Greek New Testament

### Priority 4: Textus Receptus (Scrivener 1894)
- **What:** Classic compiled NT text underlying KJV
- **Format:** TXT, XML
- **License:** ✅ Public Domain
- **Link:** https://github.com/biblicalhumanities/Nestle1904
- **Status:** 🎯 **Phase 1 - Week 3**
- **Import to:** `manuscripts` table (code: 'TR')

### Priority 5: MorphGNT
- **What:** Greek NT with lemma & morphology annotations
- **Format:** XML, JSON, SQL
- **License:** ✅ Public Domain
- **Link:** https://github.com/morphgnt/sblgnt
- **Status:** 🎯 **Phase 1 - Week 4**
- **Import to:** `verses` + `morphology` + `lexicon`

### Reference: Westcott & Hort (1881)
- **What:** Critical text based on Vaticanus & Sinaiticus
- **Format:** TXT
- **License:** ✅ Public Domain
- **Link:** https://github.com/morphgnt/wh-hgnt
- **Status:** ⏳ Phase 2 (variant comparison)

### Reference: Stephanus 1550
- **What:** Classic TR edition for textual comparison
- **Format:** TXT
- **License:** ✅ Public Domain
- **Link:** https://github.com/byztxt/byzantine-majority-text
- **Status:** ⏳ Phase 2

### Reference: Tischendorf 8th Edition
- **What:** 19th-century critical edition of Greek NT
- **Format:** TXT
- **License:** ✅ Public Domain
- **Link:** http://www.greeknewtestament.com/
- **Status:** ⏳ Phase 2

### Reference: Antoniades Patriarchal Text (1904)
- **What:** Standard Eastern Orthodox NT text
- **Format:** TXT
- **License:** ✅ Public Domain
- **Link:** https://github.com/byztxt/PatriarchalText
- **Status:** ⏳ Phase 3

---

## 📖 3. Ancient Greek OT (Septuagint – LXX)

### Priority 8: Septuagint (LXX) – Rahlfs Edition
- **What:** Greek OT (~3rd century BCE)
- **Format:** TXT, XML
- **License:** ✅ Public Domain
- **Link:** https://github.com/sleeptillseven/LXX-Swete
- **Status:** 🎯 **Phase 1 - Week 5**
- **Import to:** `manuscripts` table (code: 'LXX')

### Tool: CATSS Septuagint
- **What:** Parallel Hebrew–Greek alignment (research-grade)
- **Format:** XML
- **License:** ✅ Public Domain
- **Link:** http://ccat.sas.upenn.edu/gopher/text/religion/biblical/lxxmorph/
- **Status:** ⏳ Phase 2 (alignment tools)

### Reference: Apostolic Bible Polyglot
- **What:** LXX with English interlinear (Greek ↔ English)
- **Format:** PDF, XML
- **License:** ✅ Public Domain
- **Link:** https://apostolicbible.com/
- **Status:** ⏳ Phase 2

---

## 🪶 4. Parallel Tools, Datasets, and Utilities

### Tool: Open Scriptures Morphology Projects
- **What:** Morphological tagging for Hebrew & Greek texts
- **Format:** JSON, XML
- **License:** ✅ CC BY 4.0
- **Link:** https://openscriptures.org/
- **Use:** Import to `morphology` column in `verses` table

### Tool: Bible OL / ETCBC Data
- **What:** Hebrew database with syntax trees
- **Format:** XML
- **License:** ✅ CC BY 4.0
- **Link:** https://github.com/ETCBC
- **Use:** Advanced Hebrew parsing (Phase 2)

### Tool: SBLGNT Dataset
- **What:** SBL Greek New Testament text
- **Format:** XML, JSON
- **License:** ✅ Public Domain
- **Link:** https://sblgnt.com/
- **Use:** Alternative Greek NT source

### Standard: OSIS Bible Format Spec
- **What:** Standard XML schema for storing Bible text
- **Format:** XML schema
- **License:** ✅ Open Standard
- **Link:** https://wiki.crosswire.org/OSIS_Bibles
- **Use:** Consider for export format (Phase 4)

---

## 🌐 5. Public Domain English Bibles

### Priority 2: World English Bible (WEB)
- **Year:** 2000
- **Format:** TXT, XML, JSON
- **License:** ✅ Public Domain
- **Link:** https://ebible.org/web/
- **Status:** 🎯 **Phase 1 - Week 2**
- **Import to:** `manuscripts` table (code: 'WEB')

### Reference: American Standard Version (ASV)
- **Year:** 1901
- **Format:** TXT
- **License:** ✅ Public Domain
- **Link:** https://www.gutenberg.org/ebooks/8001
- **Status:** ⏳ Phase 2

### Reference: Young's Literal Translation (YLT)
- **Year:** 1898
- **Format:** TXT
- **License:** ✅ Public Domain
- **Link:** https://www.gutenberg.org/ebooks/8294
- **Status:** ⏳ Phase 2 (literal comparison)

### Reference: Brenton Septuagint Translation
- **Year:** 1851
- **Format:** TXT
- **License:** ✅ Public Domain
- **Link:** https://www.ccel.org/ccel/brenton/lxx.html
- **Status:** ⏳ Phase 2

---

## 📁 Suggested Directory Structure

```
/home/hempquarterz/projects/All4Yah/manuscripts/
├─ hebrew/
│  ├─ wlc/                    # Westminster Leningrad Codex
│  ├─ oshb/                   # Open Scriptures Hebrew Bible
│  ├─ dss_transcriptions/     # Dead Sea Scrolls
│  └─ morphology/             # Hebrew morphology data
├─ greek_nt/
│  ├─ textus_receptus/        # Scrivener 1894
│  ├─ morphgnt/               # MorphGNT with annotations
│  ├─ westcott_hort/          # W&H 1881
│  └─ sblgnt/                 # SBL Greek NT
├─ septuagint/
│  ├─ lxx_rahlfs/             # Rahlfs LXX
│  └─ catss_alignment/        # CATSS Hebrew-Greek
├─ english_pd/
│  ├─ web/                    # World English Bible
│  ├─ asv/                    # American Standard
│  └─ ylt/                    # Young's Literal
└─ lexicons/
   ├─ strongs_hebrew/         # Strong's Hebrew dictionary
   └─ strongs_greek/          # Strong's Greek dictionary
```

---

## 🪔 Phase 1 Import Workflow (Weeks 1-12)

### Week 1-2: Foundation ✅
- [x] Set up Supabase
- [x] Create database schema
- [x] Install Supabase client

### Week 2-3: First Hebrew Import 🎯
- [ ] Clone WLC repository
- [ ] Parse WLC XML/JSON
- [ ] Import to `manuscripts` + `verses` tables
- [ ] Test with Genesis 1

### Week 3-4: First English Import
- [ ] Download WEB data
- [ ] Parse USFM/JSON format
- [ ] Import to database
- [ ] Create parallel view (Hebrew + English)

### Week 4-5: Greek NT Import
- [ ] Clone Textus Receptus
- [ ] Import Greek NT verses
- [ ] Test with John 1

### Week 5-6: Morphology Layer
- [ ] Import MorphGNT data
- [ ] Add Strong's numbers to verses
- [ ] Build lexicon table

### Week 7-8: Name Restoration
- [ ] Create name mapping rules (יהוה → Yahuah)
- [ ] Build restoration algorithm
- [ ] Test on sample passages

### Week 9-12: Testing & Refinement
- [ ] API endpoint creation
- [ ] Frontend integration
- [ ] Performance optimization
- [ ] Documentation

---

## 🎯 Success Metrics

### Phase 1 Complete When:
- [ ] 5+ manuscripts loaded into database
- [ ] 31,102 verses total (OT + NT)
- [ ] API returning Hebrew/Greek text
- [ ] Basic manuscript browser working
- [ ] Name restoration prototype functional

---

## 📚 Key Resources & Documentation

- **Open Scriptures Community:** https://openscriptures.org/
- **BibleHub API Docs:** https://biblehub.com/api/
- **Crosswire Sword Project:** https://crosswire.org/
- **eBible.org:** https://ebible.org/
- **SBL Resources:** https://www.sbl-site.org/

---

*This document will be updated as we progress through the imports.*
