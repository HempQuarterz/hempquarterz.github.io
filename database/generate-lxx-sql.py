#!/usr/bin/env python3
"""
Generate SQL file for LXX Septuagint Import
All4Yah Project - Phase 1 v1.0

Converts LXX CSV data into PostgreSQL-compatible SQL file.
Then use psql to import:
  PGPASSWORD="@4HQZgassmoe" psql -h db.txeeaekwhkdilycefczq.supabase.co -U postgres -d postgres -f database/lxx-import.sql -4

Usage:
  python3 database/generate-lxx-sql.py                # Generate full SQL file
  python3 database/generate-lxx-sql.py --tier 2       # Only deuterocanonical books
  python3 database/generate-lxx-sql.py --test         # Genesis 1 only
"""

import csv
import json
import re
import sys

# File paths
LXX_CSV = "manuscripts/lxx-morphology/LXX-Rahlfs-1935/11_end-users_files/MyBible/Bibles/LXX_final_main.csv"
TIER_MAP_JSON = "database/books_tier_map.json"
OUTPUT_SQL = "database/lxx-import.sql"

# Book ID mappings
BOOK_ID_MAP = {
    10: "GEN", 20: "EXO", 30: "LEV", 40: "NUM", 50: "DEU",
    60: "JOS", 70: "JDG", 80: "RUT", 90: "1SA", 100: "2SA",
    110: "1KI", 120: "2KI", 130: "1CH", 140: "2CH",
    150: "EZR", 160: "NEH", 190: "EST",
    220: "JOB", 230: "PSA", 240: "PRO", 250: "ECC", 260: "SNG",
    290: "ISA", 300: "JER", 310: "LAM", 330: "EZK", 340: "DAN",
    350: "HOS", 360: "JOL", 370: "AMO", 380: "OBA", 390: "JON",
    400: "MIC", 410: "NAM", 420: "HAB", 430: "ZEP", 440: "HAG",
    450: "ZEC", 460: "MAL",
    # Deuterocanonical books
    165: "1ES", 170: "TOB", 180: "JDT", 232: "PSS",
    462: "1MA", 464: "2MA", 466: "3MA", 467: "4MA",
    270: "WIS", 280: "SIR", 315: "LJE", 320: "BAR",
    325: "SUS", 345: "BEL", 800: "ODE"
}

def load_tier_map():
    """Load canonical tier mappings from JSON."""
    with open(TIER_MAP_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)
    books = data.get('books', [])
    return {book['code']: book for book in books}

def parse_lxx_verse(verse_text):
    """Parse LXX verse text with embedded morphology tags."""
    words = []
    morphology = []

    pattern = r'(\S+?)(?:<S>(\d+)</S>)?(?:<m>([^<]+)</m>)?(?:<S>(\d+)</S>)?(?:<S>(\d+)</S>)?'

    for match in re.finditer(pattern, verse_text):
        word = match.group(1)
        if word and not word.startswith('<'):
            word_clean = re.sub(r'<[^>]+>', '', word)
            if word_clean.strip():
                words.append(word_clean)

                strongs_nums = []
                for i in range(2, 6):
                    if match.group(i) and match.group(i).isdigit():
                        strongs_nums.append(f"G{match.group(i)}")

                morph = match.group(3) if match.group(3) else ""

                if strongs_nums or morph:
                    morphology.append({
                        "word": word_clean,
                        "strongs": strongs_nums,
                        "morph": morph
                    })

    cleaned_text = " ".join(words)
    return cleaned_text, morphology

def escape_sql_string(s):
    """Escape string for SQL."""
    return s.replace("'", "''")

def generate_sql(tier_filter=None, test_mode=False):
    """Generate SQL import file."""
    print(f"Loading canonical tier mappings from {TIER_MAP_JSON}...")
    tier_map = load_tier_map()
    print(f"✓ Loaded {len(tier_map)} book definitions\n")

    print(f"Reading LXX CSV data from {LXX_CSV}...")
    verses_by_book = {}

    with open(LXX_CSV, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter='\t')
        for row in reader:
            if len(row) < 4:
                continue

            book_id = int(row[0])
            chapter = int(row[1])
            verse = int(row[2])
            verse_text = row[3]

            book_code = BOOK_ID_MAP.get(book_id)
            if not book_code:
                continue

            tier_info = tier_map.get(book_code, {})
            canonical_tier = tier_info.get('tier', 1)

            if tier_filter and canonical_tier != tier_filter:
                continue

            if test_mode and book_code != "GEN":
                continue
            if test_mode and chapter > 1:
                continue

            cleaned_text, morphology = parse_lxx_verse(verse_text)

            if book_code not in verses_by_book:
                verses_by_book[book_code] = {
                    'tier': canonical_tier,
                    'name': tier_info.get('name', book_code),
                    'verses': []
                }

            verses_by_book[book_code]['verses'].append({
                'chapter': chapter,
                'verse': verse,
                'text': cleaned_text,
                'morphology': morphology
            })

    print(f"✓ Loaded {len(verses_by_book)} books\n")

    print(f"Generating SQL file: {OUTPUT_SQL}...")
    from datetime import datetime
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    with open(OUTPUT_SQL, 'w', encoding='utf-8') as f:
        f.write("-- LXX Septuagint Import\n")
        f.write("-- All4Yah Project - Phase 1 v1.0\n")
        f.write(f"-- Generated: {timestamp}\n\n")

        f.write("BEGIN;\n\n")

        # Create/update LXX manuscript
        f.write("-- Create or update LXX manuscript\n")
        f.write("""
INSERT INTO manuscripts (code, name, language, date_range, license, canonical_tier, canonical_status, era, provenance_confidence, manuscript_attestation)
VALUES (
    'LXX',
    'LXX Septuagint (Rahlfs 1935)',
    'greek',
    '250 BCE - 100 CE',
    'CC BY-SA 4.0',
    1,
    'canonical',
    'Hellenistic Judaism (250 BCE - 100 CE)',
    1.0,
    ARRAY['Codex Vaticanus (4th c.)', 'Codex Sinaiticus (4th c.)', 'Codex Alexandrinus (5th c.)']
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    date_range = EXCLUDED.date_range;

""")

        # Insert verses
        total_verses = 0
        for book_code, book_data in sorted(verses_by_book.items()):
            tier = book_data['tier']
            name = book_data['name']
            verses = book_data['verses']

            f.write(f"-- {book_code}: {name} (Tier {tier}) - {len(verses)} verses\n")

            for v in verses:
                text_escaped = escape_sql_string(v['text'])
                morph_json = json.dumps(v['morphology']).replace("'", "''")

                f.write(f"""
INSERT INTO verses (manuscript_id, book, chapter, verse, text, morphology, canonical_tier)
SELECT m.id, '{book_code}', {v['chapter']}, {v['verse']}, '{text_escaped}', '{morph_json}'::jsonb, {tier}
FROM manuscripts m WHERE m.code = 'LXX'
ON CONFLICT (manuscript_id, book, chapter, verse) DO UPDATE SET
    text = EXCLUDED.text,
    morphology = EXCLUDED.morphology,
    canonical_tier = EXCLUDED.canonical_tier;
""")

            total_verses += len(verses)

        f.write("\nCOMMIT;\n\n")
        f.write(f"-- Import complete: {total_verses:,} verses from {len(verses_by_book)} books\n")

    print(f"✅ Generated SQL file with {total_verses:,} verses\n")
    print("To import, run:")
    print(f'  PGPASSWORD="@4HQZgassmoe" psql -h db.txeeaekwhkdilycefczq.supabase.co -U postgres -d postgres -f {OUTPUT_SQL} -4\n')

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Generate LXX import SQL")
    parser.add_argument("--tier", type=int, choices=[1, 2], help="Only this tier")
    parser.add_argument("--test", action="store_true", help="Test mode (Genesis 1)")
    args = parser.parse_args()

    generate_sql(tier_filter=args.tier, test_mode=args.test)
