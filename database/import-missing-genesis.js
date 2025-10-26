#!/usr/bin/env node
/**
 * Re-import missing Genesis chapters 2-3 from Sefaria
 */

const https = require('https');

const SEFARIA_API = 'https://www.sefaria.org/api';

function fetchFromSefaria(ref) {
  return new Promise((resolve, reject) => {
    const url = `${SEFARIA_API}/texts/Onkelos_${ref}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

function extractVerses(data, book, chapter) {
  const verses = [];
  const aramaic = Array.isArray(data.he) ? data.he : [data.he];

  for (let i = 0; i < aramaic.length; i++) {
    if (aramaic[i]) {
      verses.push({
        book,
        chapter,
        verse: i + 1,
        text: aramaic[i].trim()
      });
    }
  }
  return verses;
}

async function importMissingChapters() {
  console.log('BEGIN;\n');

  for (let chapter = 2; chapter <= 3; chapter++) {
    try {
      const ref = `Genesis.${chapter}`;
      console.error(`Fetching ${ref}...`);

      const data = await fetchFromSefaria(ref);
      const verses = extractVerses(data, 'GEN', chapter);

      if (verses.length > 0) {
        console.log(`-- Insert GEN ${chapter} (${verses.length} verses)`);
        console.log('INSERT INTO verses (manuscript_id, book, chapter, verse, text)');
        console.log('VALUES');

        const values = verses.map(v => {
          const text = v.text.replace(/'/g, "''");
          return `  ((SELECT id FROM manuscripts WHERE code = 'ONKELOS'), '${v.book}', ${v.chapter}, ${v.verse}, '${text}')`;
        }).join(',\n');

        console.log(values);
        console.log('ON CONFLICT (manuscript_id, book, chapter, verse)');
        console.log('DO UPDATE SET');
        console.log('  text = EXCLUDED.text,');
        console.log('  updated_at = NOW();\n');

        console.error(`✓ ${ref}: ${verses.length} verses`);
      }

      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`✗ Error: ${error.message}`);
    }
  }

  console.log('COMMIT;');
}

importMissingChapters().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
