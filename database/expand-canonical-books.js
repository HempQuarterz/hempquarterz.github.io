#!/usr/bin/env node
/**
 * Expand canonical_books table to full 66-book Protestant canon
 * All4Yah Project - Phase 1 Final Expansion
 *
 * Adds remaining 63 Tier 1 books to complete the canonical core
 */

const fs = require('fs');
const path = require('path');

// Complete 66-book Protestant canon with detailed metadata
const CANONICAL_66_BOOKS = {
  "OLD_TESTAMENT": {
    // Torah/Pentateuch (5 books)
    "GEN": { name: "Genesis", era: "Torah (1450-1400 BCE trad.)", divine_count: 165 },
    "EXO": { name: "Exodus", era: "Torah (1450-1400 BCE trad.)", divine_count: 398 },
    "LEV": { name: "Leviticus", era: "Torah (1450-1400 BCE trad.)", divine_count: 311 },
    "NUM": { name: "Numbers", era: "Torah (1450-1400 BCE trad.)", divine_count: 394 },
    "DEU": { name: "Deuteronomy", era: "Torah (1450-1400 BCE trad.)", divine_count: 551 },

    // Historical Books (12 books)
    "JOS": { name: "Joshua", era: "Historical Books (1400-1370 BCE trad.)", divine_count: 218 },
    "JDG": { name: "Judges", era: "Historical Books (1370-1050 BCE trad.)", divine_count: 192 },
    "RUT": { name: "Ruth", era: "Historical Books (c. 1100 BCE trad.)", divine_count: 18 },
    "1SA": { name: "1 Samuel", era: "Historical Books (1050-1010 BCE)", divine_count: 381 },
    "2SA": { name: "2 Samuel", era: "Historical Books (1010-970 BCE)", divine_count: 279 },
    "1KI": { name: "1 Kings", era: "Historical Books (970-853 BCE)", divine_count: 273 },
    "2KI": { name: "2 Kings", era: "Historical Books (853-586 BCE)", divine_count: 299 },
    "1CH": { name: "1 Chronicles", era: "Historical Books (c. 450 BCE)", divine_count: 210 },
    "2CH": { name: "2 Chronicles", era: "Historical Books (c. 450 BCE)", divine_count: 262 },
    "EZR": { name: "Ezra", era: "Post-Exilic (c. 450 BCE)", divine_count: 40 },
    "NEH": { name: "Nehemiah", era: "Post-Exilic (c. 445 BCE)", divine_count: 46 },
    "EST": { name: "Esther", era: "Post-Exilic (c. 470 BCE)", divine_count: 0, note: "Divine name absent (or יהוה acrostics hidden)" },

    // Wisdom & Poetry (5 books)
    "JOB": { name: "Job", era: "Wisdom Literature (date uncertain, 2000-400 BCE)", divine_count: 31 },
    "PSA": { name: "Psalms", era: "Wisdom Literature (1000-400 BCE)", divine_count: 695 },
    "PRO": { name: "Proverbs", era: "Wisdom Literature (c. 950-700 BCE)", divine_count: 87 },
    "ECC": { name: "Ecclesiastes", era: "Wisdom Literature (c. 935 BCE trad.)", divine_count: 0 },
    "SNG": { name: "Song of Solomon", era: "Wisdom Literature (c. 960 BCE trad.)", divine_count: 0 },

    // Major Prophets (5 books)
    "ISA": { name: "Isaiah", era: "Major Prophets (740-681 BCE)", divine_count: 434 },
    "JER": { name: "Jeremiah", era: "Major Prophets (627-586 BCE)", divine_count: 727 },
    "LAM": { name: "Lamentations", era: "Major Prophets (c. 586 BCE)", divine_count: 32 },
    "EZK": { name: "Ezekiel", era: "Major Prophets (593-571 BCE)", divine_count: 439 },
    "DAN": { name: "Daniel", era: "Major Prophets (605-530 BCE)", divine_count: 7 },

    // Minor Prophets (12 books)
    "HOS": { name: "Hosea", era: "Minor Prophets (750-725 BCE)", divine_count: 47 },
    "JOL": { name: "Joel", era: "Minor Prophets (835 BCE or 400 BCE)", divine_count: 32 },
    "AMO": { name: "Amos", era: "Minor Prophets (760-750 BCE)", divine_count: 80 },
    "OBA": { name: "Obadiah", era: "Minor Prophets (586 BCE or earlier)", divine_count: 7 },
    "JON": { name: "Jonah", era: "Minor Prophets (c. 760 BCE)", divine_count: 25 },
    "MIC": { name: "Micah", era: "Minor Prophets (735-700 BCE)", divine_count: 39 },
    "NAH": { name: "Nahum", era: "Minor Prophets (663-612 BCE)", divine_count: 14 },
    "HAB": { name: "Habakkuk", era: "Minor Prophets (609-605 BCE)", divine_count: 13 },
    "ZEP": { name: "Zephaniah", era: "Minor Prophets (640-621 BCE)", divine_count: 34 },
    "HAG": { name: "Haggai", era: "Post-Exilic Prophets (520 BCE)", divine_count: 35 },
    "ZEC": { name: "Zechariah", era: "Post-Exilic Prophets (520-480 BCE)", divine_count: 152 },
    "MAL": { name: "Malachi", era: "Post-Exilic Prophets (c. 450 BCE)", divine_count: 47 }
  },

  "NEW_TESTAMENT": {
    // Gospels (4 books)
    "MAT": { name: "Matthew", era: "First Century CE (50-90 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "κύριος → Yahuah (OT quotes)"] },
    "MRK": { name: "Mark", era: "First Century CE (55-70 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "κύριος → Yahuah (OT quotes)"] },
    "LUK": { name: "Luke", era: "First Century CE (60-80 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "κύριος → Yahuah (OT quotes)"] },
    "JHN": { name: "John", era: "First Century CE (90-110 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "θεός → Elohim"] },

    // History (1 book)
    "ACT": { name: "Acts", era: "First Century CE (62-90 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "κύριος → Yahuah"] },

    // Pauline Epistles (13 books)
    "ROM": { name: "Romans", era: "First Century CE (57 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "κύριος → Yahuah (OT quotes)"] },
    "1CO": { name: "1 Corinthians", era: "First Century CE (55 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "κύριος → Yahuah"] },
    "2CO": { name: "2 Corinthians", era: "First Century CE (55-56 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "κύριος → Yahuah"] },
    "GAL": { name: "Galatians", era: "First Century CE (49-55 CE)", greek_restorations: ["Ἰησοῦς → Yahusha"] },
    "EPH": { name: "Ephesians", era: "First Century CE (60-62 CE)", greek_restorations: ["Ἰησοῦς → Yahusha"] },
    "PHP": { name: "Philippians", era: "First Century CE (61-62 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "κύριος → Yahuah"] },
    "COL": { name: "Colossians", era: "First Century CE (60-62 CE)", greek_restorations: ["Ἰησοῦς → Yahusha"] },
    "1TH": { name: "1 Thessalonians", era: "First Century CE (50-51 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "κύριος → Yahuah"] },
    "2TH": { name: "2 Thessalonians", era: "First Century CE (51-52 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "κύριος → Yahuah"] },
    "1TI": { name: "1 Timothy", era: "First Century CE (62-64 CE)", greek_restorations: ["Ἰησοῦς → Yahusha"] },
    "2TI": { name: "2 Timothy", era: "First Century CE (66-67 CE)", greek_restorations: ["Ἰησοῦς → Yahusha"] },
    "TIT": { name: "Titus", era: "First Century CE (62-64 CE)", greek_restorations: ["Ἰησοῦς → Yahusha"] },
    "PHM": { name: "Philemon", era: "First Century CE (60-62 CE)", greek_restorations: ["Ἰησοῦς → Yahusha"] },

    // General Epistles (8 books)
    "HEB": { name: "Hebrews", era: "First Century CE (60-90 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "κύριος → Yahuah (frequent OT quotes)"] },
    "JAS": { name: "James", era: "First Century CE (45-50 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "κύριος → Yahuah"] },
    "1PE": { name: "1 Peter", era: "First Century CE (62-64 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "κύριος → Yahuah (OT quotes)"] },
    "2PE": { name: "2 Peter", era: "First Century CE (64-68 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "κύριος → Yahuah"] },
    "1JN": { name: "1 John", era: "First Century CE (90-110 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "θεός → Elohim"] },
    "2JN": { name: "2 John", era: "First Century CE (90-110 CE)", greek_restorations: ["Ἰησοῦς → Yahusha"] },
    "3JN": { name: "3 John", era: "First Century CE (90-110 CE)", greek_restorations: ["Ἰησοῦς → Yahusha"] },
    "JUD": { name: "Jude", era: "First Century CE (65-80 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "κύριος → Yahuah"] },

    // Apocalypse (1 book)
    "REV": { name: "Revelation", era: "First Century CE (90-96 CE)", greek_restorations: ["Ἰησοῦς → Yahusha", "κύριος → Yahuah"] }
  }
};

// Generate SQL INSERT statements for the 63 missing canonical books
function generateCanonicalExpansionSQL() {
  const inserts = [];

  // Old Testament books
  for (const [code, data] of Object.entries(CANONICAL_66_BOOKS.OLD_TESTAMENT)) {
    // Skip books already in database (GEN, EXO)
    if (['GEN', 'EXO'].includes(code)) continue;

    const name = data.name;
    const era = data.era;
    const divineCount = data.divine_count || 0;
    const note = data.note || `Hebrew Old Testament canonical book. Part of the 66-book Protestant canon.`;

    inserts.push(`('${code}', '${name}', 'OT', 1, 'canonical', '${era}', 'Hebrew', 'Hebrew', 1, ARRAY['WLC','DSS','LXX'], ARRAY['Protestant','Catholic','Orthodox','Ethiopian'], NULL, ${divineCount}, ARRAY[]::TEXT[], '${note}')`);
  }

  // New Testament books
  for (const [code, data] of Object.entries(CANONICAL_66_BOOKS.NEW_TESTAMENT)) {
    // Skip books already in database (MAT)
    if (['MAT'].includes(code)) continue;

    const name = data.name;
    const era = data.era;
    const restorations = data.greek_restorations || [];
    const restorationArray = restorations.length > 0
      ? `ARRAY['${restorations.join("','")}']`
      : 'ARRAY[]::TEXT[]';
    const note = `Greek New Testament canonical book. Part of the 66-book Protestant canon.`;

    inserts.push(`('${code}', '${name}', 'NT', 1, 'canonical', '${era}', 'Greek', 'Greek', 1, ARRAY['SBLGNT','P45','P46','P66','P75','Codex Sinaiticus','Codex Vaticanus'], ARRAY['Protestant','Catholic','Orthodox','Ethiopian'], NULL, 0, ${restorationArray}, '${note}')`);
  }

  return inserts.join(',\n');
}

// Main execution
console.log('================================================================================');
console.log('Expand canonical_books to Full 66-Book Protestant Canon');
console.log('================================================================================\n');

const insertStatements = generateCanonicalExpansionSQL();

const sql = `
BEGIN;

-- Insert remaining 63 canonical books (GEN, EXO, MAT already exist)
INSERT INTO canonical_books (
  book_code, book_name, testament, canonical_tier, canonical_status,
  era, language_origin, language_extant, provenance_confidence,
  manuscript_sources, included_in_canons, quoted_in_nt,
  divine_name_occurrences, divine_name_restorations, notes
) VALUES
${insertStatements};

-- Verify counts
SELECT
  testament,
  COUNT(*) as book_count
FROM canonical_books
WHERE canonical_tier = 1
GROUP BY testament
ORDER BY testament;

-- Total Tier 1 count (should be 66)
SELECT COUNT(*) as total_tier1_books
FROM canonical_books
WHERE canonical_tier = 1;

COMMIT;
`;

// Write SQL to file
const sqlFilePath = path.join(__dirname, 'expand-canonical-books.sql');
fs.writeFileSync(sqlFilePath, sql, 'utf8');

console.log(`✅ Generated SQL for 63 additional canonical books\n`);
console.log(`SQL written to: ${sqlFilePath}`);
console.log(`\nTo execute via Supabase MCP:`);
console.log(`  mcp__supabase__execute_sql with the generated SQL\n`);
console.log('After execution, canonical_books will contain:');
console.log('  - Tier 1: 66 books (39 OT + 27 NT) - Complete Protestant canon');
console.log('  - Tier 2: 21 books (Deuterocanonical/Ethiopian)');
console.log('  - Tier 3: 2 books (Apocrypha)');
console.log('  - Tier 4: 1 book (Ethiopian heritage)');
console.log('  - TOTAL: 90 books\n');
