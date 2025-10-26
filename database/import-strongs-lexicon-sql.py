#!/usr/bin/env python3
"""
Strong's Lexicon Import Script - All4Yah Project (Direct SQL Version)

Uses PostgreSQL UPSERT (INSERT ... ON CONFLICT) for reliable importing.

Usage:
    python3 database/import-strongs-lexicon-sql.py --test      # First 100 entries
    python3 database/import-strongs-lexicon-sql.py --full      # All entries
"""

import sys
import psycopg2
from psycopg2.extras import execute_values
import re
import html

# Database connection
DB_HOST = "db.txeeaekwhkdilycefczq.supabase.co"
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "@4HQZgassmoe"

def clean_html(text):
    """Remove HTML tags and decode entities"""
    if not text:
        return ""
    # Remove <ref> tags and their content
    text = re.sub(r'<ref=[^>]*>.*?</ref>', '', text)
    # Remove other HTML tags but keep content
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', '', text)
    # Decode HTML entities
    text = html.unescape(text)
    # Clean up whitespace
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r'  +', ' ', text)
    return text.strip()

def normalize_strong_number(estrong):
    """Convert STEPBible format to database format: H0001 -> H1, G0001 -> G1"""
    if not estrong or len(estrong) < 2:
        return None

    prefix = estrong[0]  # H or G
    number = estrong[1:]  # Rest of the string

    # Remove leading zeros but preserve the number
    try:
        num_val = int(number)
        return f"{prefix}{num_val}"
    except ValueError:
        # If it contains non-numeric characters, just clean it
        clean_num = re.sub(r'^0+', '', number)
        return f"{prefix}{clean_num}" if clean_num else None

def parse_tsv_file(file_path, language, limit=None):
    """Parse STEPBible TSV lexicon file"""
    print(f"📖 Loading {language} lexicon from: {file_path}")

    entries = []
    skipped = 0
    data_started = False

    with open(file_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()

            # Skip empty lines
            if not line:
                continue

            # Look for start of data (lines beginning with H or G followed by digits)
            if not data_started:
                if re.match(r'^[HG]\d', line):
                    data_started = True
                else:
                    continue

            # Parse TSV line
            parts = line.split('\t')
            if len(parts) < 8:
                skipped += 1
                continue

            estrong, dstrong, ustrong, original_word, transliteration, morph, gloss, definition = parts[:8]

            # Skip if not a primary Strong's number
            if '=' in estrong or not re.match(r'^[HG]\d+$', estrong):
                continue

            # Normalize Strong's number
            strong_number = normalize_strong_number(estrong)
            if not strong_number:
                skipped += 1
                continue

            # Clean definition
            definition_clean = clean_html(definition)

            # Extract part of speech from morphology code
            part_of_speech = None
            if morph and ':' in morph:
                morph_parts = morph.split(':')
                if len(morph_parts) > 1:
                    pos_code = morph_parts[1].split('-')[0]
                    pos_map = {
                        'N': 'noun', 'V': 'verb', 'A': 'adjective',
                        'D': 'adverb', 'C': 'conjunction', 'P': 'preposition',
                        'R': 'pronoun', 'I': 'interjection', 'T': 'particle',
                        'X': 'other'
                    }
                    part_of_speech = pos_map.get(pos_code, pos_code)

            entries.append((
                strong_number,
                language,
                original_word,
                transliteration if transliteration else None,
                part_of_speech,
                definition_clean,
                gloss if gloss else None
            ))

            if limit and len(entries) >= limit:
                print(f"   Reached limit of {limit} entries")
                break

    print(f"✅ Loaded {len(entries)} {language} lexicon entries")
    if skipped > 0:
        print(f"   ⚠️  Skipped {skipped} invalid lines")

    return entries

def import_lexicon(conn, entries):
    """Import lexicon entries using PostgreSQL UPSERT"""
    print(f"\n📥 Importing {len(entries)} lexicon entries to database...")

    BATCH_SIZE = 1000
    imported = 0

    cursor = conn.cursor()

    # UPSERT query
    upsert_query = """
        INSERT INTO lexicon (strong_number, language, original_word, transliteration,
                            part_of_speech, definition, short_definition)
        VALUES %s
        ON CONFLICT (strong_number)
        DO UPDATE SET
            language = EXCLUDED.language,
            original_word = EXCLUDED.original_word,
            transliteration = EXCLUDED.transliteration,
            part_of_speech = EXCLUDED.part_of_speech,
            definition = EXCLUDED.definition,
            short_definition = EXCLUDED.short_definition
    """

    for i in range(0, len(entries), BATCH_SIZE):
        batch = entries[i:i + BATCH_SIZE]

        execute_values(cursor, upsert_query, batch)
        conn.commit()

        imported += len(batch)
        print(f"\r   Progress: {imported}/{len(entries)} ({int(imported/len(entries)*100)}%)", end='', flush=True)

    cursor.close()
    print(f"\n✅ Import complete: {imported} entries imported\n")
    return imported

def verify_import(conn):
    """Verify the import"""
    print("🔍 Verifying import...")

    cursor = conn.cursor()

    # Get counts by language
    cursor.execute("SELECT language, COUNT(*) as count FROM lexicon GROUP BY language ORDER BY language")
    results = cursor.fetchall()

    for lang, count in results:
        print(f"✅ {lang.capitalize()}: {count} entries")

    # Sample some entries
    cursor.execute("""
        SELECT strong_number, original_word, transliteration, short_definition
        FROM lexicon
        WHERE strong_number IN ('H1', 'H430', 'H3068', 'G1', 'G2316', 'G2424')
        ORDER BY strong_number
    """)
    sample = cursor.fetchall()

    if sample:
        print("\n📋 Sample entries:")
        for row in sample:
            print(f"   {row[0]}: {row[1]} ({row[2]}) - {row[3]}")

    cursor.close()

def main():
    args = sys.argv[1:]

    # Determine mode
    test_mode = '--test' in args
    full_mode = '--full' in args

    if not any([test_mode, full_mode]):
        print("❌ Usage: python3 database/import-strongs-lexicon-sql.py --test|--full")
        sys.exit(1)

    print("📖 Strong's Lexicon Import Tool - All4Yah Project (SQL Version)")
    print("=" * 70)
    mode_str = "TEST (100 entries)" if test_mode else "FULL (Hebrew + Greek)"
    print(f"🌍 Mode: {mode_str}\n")

    all_entries = []

    # Hebrew lexicon
    hebrew_file = "manuscripts/strongs-lexicon/STEPBible-Data/Lexicons/TBESH - Translators Brief lexicon of Extended Strongs for Hebrew - STEPBible.org CC BY.txt"
    limit = 50 if test_mode else None
    hebrew_entries = parse_tsv_file(hebrew_file, 'hebrew', limit)
    all_entries.extend(hebrew_entries)

    # Greek lexicon
    greek_file = "manuscripts/strongs-lexicon/STEPBible-Data/Lexicons/TBESG - Translators Brief lexicon of Extended Strongs for Greek - STEPBible.org CC BY.txt"
    limit = 50 if test_mode else None
    greek_entries = parse_tsv_file(greek_file, 'greek', limit)
    all_entries.extend(greek_entries)

    # Connect to database
    print("\n🔌 Connecting to database...")
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    print("✅ Connected to database")

    # Import
    imported = import_lexicon(conn, all_entries)

    # Verify
    verify_import(conn)

    # Close connection
    conn.close()

    # Summary
    print("\n" + "=" * 70)
    print("📊 IMPORT SUMMARY")
    print("=" * 70)
    print("✅ Source: STEPBible-Data (CC BY 4.0)")
    print(f"✅ Total lexicon entries processed: {len(all_entries)}")
    print(f"✅ Successfully imported: {imported}")
    print("📚 Database now contains Strong's lexicon definitions")
    print("\n🎉 Strong's lexicon import complete!")

if __name__ == "__main__":
    main()
