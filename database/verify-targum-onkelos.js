#!/usr/bin/env node
/**
 * Verify Targum Onkelos import completeness
 * Cross-reference with expected Torah verse counts
 */

const https = require('https');

const SUPABASE_URL = "https://txeeaekwhkdilycefczq.supabase.co";
const SUPABASE_KEY = "sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO";

// Expected verse counts per chapter for each book
const EXPECTED_COUNTS = {
  'GEN': {
    1: 31, 2: 25, 3: 24, 4: 26, 5: 32, 6: 22, 7: 24, 8: 22, 9: 29, 10: 32,
    11: 32, 12: 20, 13: 18, 14: 24, 15: 21, 16: 16, 17: 27, 18: 33, 19: 38, 20: 18,
    21: 34, 22: 24, 23: 20, 24: 67, 25: 34, 26: 35, 27: 46, 28: 22, 29: 35, 30: 43,
    31: 55, 32: 33, 33: 20, 34: 31, 35: 29, 36: 43, 37: 36, 38: 30, 39: 23, 40: 23,
    41: 57, 42: 38, 43: 34, 44: 34, 45: 28, 46: 34, 47: 31, 48: 22, 49: 33, 50: 26
  },
  'EXO': {
    1: 22, 2: 25, 3: 22, 4: 31, 5: 23, 6: 30, 7: 25, 8: 28, 9: 35, 10: 29,
    11: 10, 12: 51, 13: 22, 14: 31, 15: 27, 16: 36, 17: 16, 18: 27, 19: 25, 20: 23,
    21: 37, 22: 30, 23: 33, 24: 18, 25: 40, 26: 37, 27: 21, 28: 43, 29: 46, 30: 38,
    31: 18, 32: 35, 33: 23, 34: 35, 35: 35, 36: 38, 37: 29, 38: 31, 39: 43, 40: 38
  },
  'LEV': {
    1: 17, 2: 16, 3: 17, 4: 35, 5: 26, 6: 23, 7: 38, 8: 36, 9: 24, 10: 20,
    11: 47, 12: 8, 13: 59, 14: 57, 15: 33, 16: 34, 17: 16, 18: 30, 19: 37, 20: 27,
    21: 24, 22: 33, 23: 44, 24: 23, 25: 55, 26: 46, 27: 34
  },
  'NUM': {
    1: 54, 2: 34, 3: 51, 4: 49, 5: 31, 6: 27, 7: 89, 8: 26, 9: 23, 10: 36,
    11: 35, 12: 16, 13: 33, 14: 45, 15: 41, 16: 50, 17: 28, 18: 32, 19: 22, 20: 29,
    21: 35, 22: 41, 23: 30, 24: 25, 25: 18, 26: 65, 27: 23, 28: 31, 29: 40, 30: 17,
    31: 54, 32: 42, 33: 56, 34: 29, 35: 34, 36: 13
  },
  'DEU': {
    1: 46, 2: 37, 3: 29, 4: 49, 5: 33, 6: 25, 7: 26, 8: 20, 9: 29, 10: 22,
    11: 32, 12: 32, 13: 19, 14: 29, 15: 23, 16: 22, 17: 20, 18: 22, 19: 21, 20: 20,
    21: 23, 22: 29, 23: 26, 24: 22, 25: 19, 26: 19, 27: 26, 28: 69, 29: 28, 30: 20,
    31: 30, 32: 52, 33: 29, 34: 12
  }
};

async function querySupabase(query) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
    const options = {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ query }));
    req.end();
  });
}

async function getActualCounts() {
  const query = `
    SELECT book, chapter, COUNT(*) as verse_count
    FROM verses
    WHERE manuscript_id = (SELECT id FROM manuscripts WHERE code = 'ONKELOS')
    GROUP BY book, chapter
    ORDER BY book, chapter;
  `;

  const result = await querySupabase(query);
  return result;
}

async function verify() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Targum Onkelos Import Verification');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    const actualData = await getActualCounts();

    // Convert to lookup map
    const actualMap = {};
    for (const row of actualData) {
      if (!actualMap[row.book]) actualMap[row.book] = {};
      actualMap[row.book][row.chapter] = row.verse_count;
    }

    let totalExpected = 0;
    let totalActual = 0;
    let totalMissing = 0;
    const missingChapters = [];

    for (const [book, chapters] of Object.entries(EXPECTED_COUNTS)) {
      console.log(`\n${book}:`);
      let bookExpected = 0;
      let bookActual = 0;

      for (const [chapter, expectedCount] of Object.entries(chapters)) {
        const chapterNum = parseInt(chapter);
        const actualCount = actualMap[book]?.[chapterNum] || 0;

        bookExpected += expectedCount;
        bookActual += actualCount;

        if (actualCount !== expectedCount) {
          const missing = expectedCount - actualCount;
          console.log(`  Chapter ${chapter}: ${actualCount}/${expectedCount} verses (${missing} missing)`);
          missingChapters.push({ book, chapter: chapterNum, expected: expectedCount, actual: actualCount, missing });
        }
      }

      totalExpected += bookExpected;
      totalActual += bookActual;
      totalMissing += (bookExpected - bookActual);

      console.log(`  Total: ${bookActual}/${bookExpected} verses`);
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('Summary');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Expected total: ${totalExpected} verses`);
    console.log(`Actual total:   ${totalActual} verses`);
    console.log(`Missing:        ${totalMissing} verses`);
    console.log(`Completeness:   ${((totalActual/totalExpected)*100).toFixed(2)}%`);

    if (missingChapters.length > 0) {
      console.log('\n\nMissing Chapters:');
      for (const ch of missingChapters) {
        console.log(`  ${ch.book} ${ch.chapter}: ${ch.actual}/${ch.expected} (${ch.missing} missing)`);
      }
    } else {
      console.log('\n\n✅ All verses accounted for!');
    }

    console.log('───────────────────────────────────────────────────────────────\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verify();
