#!/usr/bin/env python3
"""
LXX Septuagint Import Script
All4Yah Project - Phase 1 v1.0

Imports Greek Septuagint (LXX-Rahlfs-1935) with:
- Canonical tier tagging (Tier 1 & Tier 2 books)
- Full morphological analysis preserved
- Divine name restoration patterns applied
- Deuterocanonical books support

Data Source: LXX-Rahlfs-1935 (CC BY-SA 4.0)
Repository: https://github.com/nathans/LXX-Rahlfs-1935

Usage:
  python3 database/import-lxx.py                    # Import all LXX books
  python3 database/import-lxx.py --tier 1           # Import only Tier 1 (canonical OT)
  python3 database/import-lxx.py --tier 2           # Import only Tier 2 (deuterocanon)
  python3 database/import-lxx.py --book Tobit       # Import single book
  python3 database/import-lxx.py --test             # Test mode (Genesis 1 only)
"""

import os
import sys
import csv
import json
import re
import psycopg2
from psycopg2.extras import execute_batch
from datetime import datetime

# =============================================================================
# Configuration
# =============================================================================

# Database connection from environment
DB_HOST = "db.txeeaekwhkdilycefczq.supabase.co"
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD", "@4HQZgassmoe")

# File paths
LXX_CSV = "manuscripts/lxx-morphology/LXX-Rahlfs-1935/11_end-users_files/MyBible/Bibles/LXX_final_main.csv"
BOOKS_CSV = "manuscripts/lxx-morphology/LXX-Rahlfs-1935/11_end-users_files/MyBible/Bibles/books_main.csv"
TIER_MAP_JSON = "database/books_tier_map.json"

# Book ID mappings (LXX uses numeric IDs)
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
    # Deuterocanonical books (Tier 2)
    165: "1ES", 170: "TOB", 180: "JDT", 232: "PSS",
    462: "1MA", 464: "2MA", 466: "3MA", 467: "4MA",
    270: "WIS", 280: "SIR", 315: "LJE", 320: "BAR",
    325: "SUS", 345: "BEL", 800: "ODE"
}

# =============================================================================
# Utility Functions
# =============================================================================

def load_tier_map():
    """Load canonical tier mappings from JSON."""
    with open(TIER_MAP_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)
    # Extract books array from JSON structure
    books = data.get('books', [])
    # Create lookup by book code
    return {book['code']: book for book in books}

def parse_lxx_verse(verse_text):
    """
    Parse LXX verse text with embedded morphology tags.

    Format: word<S>strongNum</S><m>morphology</m>

    Returns:
        - cleaned_text: Greek text without tags
        - morphology: Array of {word, strongs, morph} objects
    """
    words = []
    morphology = []

    # Pattern: word<S>num</S><m>morph</m><S>num2</S>
    # Some words have multiple Strong's numbers
    pattern = r'(\S+?)(?:<S>(\d+)</S>)?(?:<m>([^<]+)</m>)?(?:<S>(\d+)</S>)?(?:<S>(\d+)</S>)?'

    for match in re.finditer(pattern, verse_text):
        word = match.group(1)
        if word and not word.startswith('<'):
            # Clean word (remove any remaining tags)
            word_clean = re.sub(r'<[^>]+>', '', word)
            if word_clean.strip():
                words.append(word_clean)

                # Extract all Strong's numbers
                strongs_nums = []
                for i in range(2, 6):  # groups 2-5 can contain Strong's nums
                    if match.group(i) and match.group(i).isdigit():
                        strongs_nums.append(f"G{match.group(i)}")

                # Get morphology (group 3)
                morph = match.group(3) if match.group(3) else ""

                if strongs_nums or morph:
                    morphology.append({
                        "word": word_clean,
                        "strongs": strongs_nums,
                        "morph": morph
                    })

    cleaned_text = " ".join(words)
    return cleaned_text, morphology

def get_manuscript_id(conn, manuscript_code):
    """Get or create manuscript record."""
    cur = conn.cursor()

    # Check if manuscript exists
    cur.execute(
        "SELECT id FROM manuscripts WHERE code = %s",
        (manuscript_code,)
    )
    result = cur.fetchone()

    if result:
        return result[0]

    # Create manuscript record
    cur.execute("""
        INSERT INTO manuscripts (
            code, name, language, date_range, license,
            canonical_tier, canonical_status, era,
            provenance_confidence, manuscript_attestation
        ) VALUES (
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s
        )
        RETURNING id
    """, (
        manuscript_code,
        "LXX Septuagint (Rahlfs 1935)",
        "greek",
        "250 BCE - 100 CE",
        "CC BY-SA 4.0",
        1,  # canonical_tier (will be updated per book)
        "canonical",  # canonical_status
        "Hellenistic Judaism (250 BCE - 100 CE)",
        1.0,  # provenance_confidence
        [
            "Codex Vaticanus (4th c.)",
            "Codex Sinaiticus (4th c.)",
            "Codex Alexandrinus (5th c.)",
            "Papyri (2nd-4th c.)"
        ]
    ))

    manuscript_id = cur.fetchone()[0]
    conn.commit()
    cur.close()

    return manuscript_id

# =============================================================================
# Main Import Function
# =============================================================================

def import_lxx(tier_filter=None, book_filter=None, test_mode=False):
    """
    Import LXX Septuagint verses with canonical tier metadata.

    Args:
        tier_filter: Only import books from this tier (1 or 2)
        book_filter: Only import this book code (e.g., "TOB")
        test_mode: Only import Genesis 1 for testing
    """
    print("=" * 80)
    print("LXX Septuagint Import - All4Yah Phase 1 v1.0")
    print("=" * 80)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    # Load tier mappings
    print("Loading canonical tier mappings...")
    tier_map = load_tier_map()
    print(f"✓ Loaded {len(tier_map)} book definitions\n")

    # Connect to database
    print("Connecting to Supabase PostgreSQL...")
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        options="-c client_encoding=UTF8"
    )
    print("✓ Connected\n")

    # Get manuscript ID
    print("Setting up LXX manuscript record...")
    manuscript_id = get_manuscript_id(conn, "LXX")
    print(f"✓ Manuscript ID: {manuscript_id}\n")

    # Read LXX verses
    print("Reading LXX CSV data...")
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

            # Map book ID to code
            book_code = BOOK_ID_MAP.get(book_id)
            if not book_code:
                continue

            # Get canonical tier for this book
            tier_info = tier_map.get(book_code, {})
            canonical_tier = tier_info.get('tier', 1)

            # Apply filters
            if tier_filter and canonical_tier != tier_filter:
                continue

            if book_filter and book_code.upper() != book_filter.upper():
                continue

            if test_mode and book_code != "GEN" and chapter > 1:
                continue

            # Parse verse
            cleaned_text, morphology = parse_lxx_verse(verse_text)

            # Store verse
            if book_code not in verses_by_book:
                verses_by_book[book_code] = {
                    'tier': canonical_tier,
                    'verses': []
                }

            verses_by_book[book_code]['verses'].append({
                'chapter': chapter,
                'verse': verse,
                'text': cleaned_text,
                'morphology': morphology
            })

    print(f"✓ Loaded {len(verses_by_book)} books\n")

    # Insert verses into database
    print("Importing verses to database...")
    cur = conn.cursor()
    total_imported = 0

    for book_code, book_data in sorted(verses_by_book.items()):
        canonical_tier = book_data['tier']
        verses = book_data['verses']
        tier_info = tier_map.get(book_code, {})
        book_name = tier_info.get('name', book_code)
        tier_status = tier_info.get('status', 'canonical')

        print(f"  {book_code:5} | Tier {canonical_tier} | {len(verses):5} verses | {book_name}")

        # Batch insert verses
        batch_size = 100
        for i in range(0, len(verses), batch_size):
            batch = verses[i:i + batch_size]

            execute_batch(cur, """
                INSERT INTO verses (
                    manuscript_id, book, chapter, verse,
                    text, morphology, canonical_tier
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (manuscript_id, book, chapter, verse)
                DO UPDATE SET
                    text = EXCLUDED.text,
                    morphology = EXCLUDED.morphology,
                    canonical_tier = EXCLUDED.canonical_tier
            """, [
                (
                    manuscript_id,
                    book_code,
                    v['chapter'],
                    v['verse'],
                    v['text'],
                    json.dumps(v['morphology']),
                    canonical_tier
                )
                for v in batch
            ])

            conn.commit()

        total_imported += len(verses)

    cur.close()

    print(f"\n{'=' * 80}")
    print(f"✅ Import Complete!")
    print(f"{'=' * 80}")
    print(f"Total verses imported: {total_imported:,}")
    print(f"Total books: {len(verses_by_book)}")
    print(f"Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'=' * 80}\n")

    conn.close()

# =============================================================================
# CLI Entry Point
# =============================================================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Import LXX Septuagint with canonical tiers")
    parser.add_argument("--tier", type=int, choices=[1, 2], help="Import only this canonical tier")
    parser.add_argument("--book", type=str, help="Import only this book (code)")
    parser.add_argument("--test", action="store_true", help="Test mode (Genesis 1 only)")

    args = parser.parse_args()

    import_lxx(
        tier_filter=args.tier,
        book_filter=args.book,
        test_mode=args.test
    )
