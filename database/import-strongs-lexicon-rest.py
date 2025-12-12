#!/usr/bin/env python3
"""
Strong's Lexicon Import Script - All4Yah Project (REST API Version)

Imports Strong's lexicon data from STEPBible-Data repository
- Hebrew Strong's numbers: H1-H8674+ (Extended Strong's from STEPBible)
- Greek Strong's numbers: G1-G5624+ (Extended Strong's from STEPBible)
- Source: https://github.com/STEPBible/STEPBible-Data
- License: CC BY 4.0

Data Format (TSV):
- eStrong: Extended Strong's number (H0001, G0001)
- dStrong: Disambiguated Strong's
- uStrong: Unified Strong's
- Original Word: Hebrew/Greek text
- Transliteration: Romanized form
- Morph: Morphology code
- Gloss: Brief English definition
- Definition: Full lexicon entry

Usage:
    python3 database/import-strongs-lexicon-rest.py --test      # First 100 entries
    python3 database/import-strongs-lexicon-rest.py --hebrew    # Hebrew only
    python3 database/import-strongs-lexicon-rest.py --greek     # Greek only
    python3 database/import-strongs-lexicon-rest.py --full      # Both languages
"""

import sys
import requests
import re
import html

# Supabase credentials
SUPABASE_URL = "https://txeeaekwhkdilycefczq.supabase.co"
API_KEY = "sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO"

headers = {
    "apikey": API_KEY,
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

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
    """
    Convert STEPBible format to database format:
    H0001 -> H1, G0001 -> G1
    But preserve extended numbers: H9001 -> H9001
    """
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

            # Skip if not a primary Strong's number (e.g., skip "G0001G =", keep "G0001")
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
                # Format like "H:N-M" or "G:V-PAI-1S"
                morph_parts = morph.split(':')
                if len(morph_parts) > 1:
                    pos_code = morph_parts[1].split('-')[0]
                    # Map codes to readable forms
                    pos_map = {
                        'N': 'noun', 'V': 'verb', 'A': 'adjective',
                        'D': 'adverb', 'C': 'conjunction', 'P': 'preposition',
                        'R': 'pronoun', 'I': 'interjection', 'T': 'particle',
                        'X': 'other'
                    }
                    part_of_speech = pos_map.get(pos_code, pos_code)

            entries.append({
                'strong_number': strong_number,
                'language': language,
                'original_word': original_word,
                'transliteration': transliteration if transliteration else None,
                'part_of_speech': part_of_speech,
                'definition': definition_clean,
                'short_definition': gloss if gloss else None
            })

            if limit and len(entries) >= limit:
                print(f"   Reached limit of {limit} entries")
                break

    print(f"✅ Loaded {len(entries)} {language} lexicon entries")
    if skipped > 0:
        print(f"   ⚠️  Skipped {skipped} invalid lines")

    return entries

def clear_existing_lexicon():
    """Clear existing lexicon data"""
    print("🗑️  Clearing existing lexicon data...")

    response = requests.delete(
        f"{SUPABASE_URL}/rest/v1/lexicon",
        headers=headers,
        params={"id": "neq.00000000-0000-0000-0000-000000000000"}  # Delete all
    )

    if response.status_code in [200, 204]:
        print("✅ Existing lexicon data cleared")
    else:
        print(f"⚠️  Clear operation response: {response.status_code}")

def import_lexicon(entries):
    """Import lexicon entries to database using UPSERT"""
    print(f"\n📥 Importing {len(entries)} lexicon entries to database...")

    BATCH_SIZE = 500
    imported = 0
    failed = 0

    # Use upsert headers to handle duplicates
    upsert_headers = {
        **headers,
        "Prefer": "resolution=merge-duplicates"
    }

    for i in range(0, len(entries), BATCH_SIZE):
        batch = entries[i:i + BATCH_SIZE]

        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/lexicon",
            headers=upsert_headers,
            json=batch
        )

        if response.status_code in [200, 201]:
            imported += len(batch)
            print(f"\r   Progress: {imported}/{len(entries)} ({int(imported/len(entries)*100)}%)", end='', flush=True)
        else:
            print(f"\n❌ Failed batch {i}-{i+len(batch)}: {response.status_code} - {response.text[:200]}")
            failed += len(batch)

    print(f"\n✅ Import complete: {imported} imported, {failed} failed\n")
    return imported, failed

def verify_import():
    """Verify the import"""
    print("🔍 Verifying import...")

    # Get counts by language
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/lexicon",
        headers=headers,
        params={
            "select": "language,strong_number",
            "limit": 0
        }
    )

    # Get total count from Content-Range header
    content_range = response.headers.get('Content-Range', '0-0/0')
    total = content_range.split('/')[-1]
    if total != '*':
        print(f"✅ Total lexicon entries in database: {total}")

    # Sample some entries
    for lang in ['hebrew', 'greek']:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/lexicon",
            headers=headers,
            params={
                "select": "strong_number,original_word,transliteration,short_definition",
                "language": f"eq.{lang}",
                "limit": 3,
                "order": "strong_number.asc"
            }
        )

        if response.status_code == 200:
            sample = response.json()
            if sample:
                print(f"\n📋 Sample {lang} entries:")
                for entry in sample:
                    print(f"   {entry['strong_number']}: {entry['original_word']} ({entry['transliteration']}) - {entry['short_definition']}")

def main():
    args = sys.argv[1:]

    # Determine mode
    test_mode = '--test' in args
    hebrew_only = '--hebrew' in args
    greek_only = '--greek' in args
    full_mode = '--full' in args

    if not any([test_mode, hebrew_only, greek_only, full_mode]):
        print("❌ Usage: python3 database/import-strongs-lexicon-rest.py --test|--hebrew|--greek|--full")
        sys.exit(1)

    print("📖 Strong's Lexicon Import Tool - All4Yah Project")
    print("=" * 70)
    mode_str = "TEST (100 entries)" if test_mode else "HEBREW only" if hebrew_only else "GREEK only" if greek_only else "FULL (Hebrew + Greek)"
    print(f"🌍 Mode: {mode_str}\n")

    all_entries = []

    # Hebrew lexicon
    if not greek_only:
        hebrew_file = "manuscripts/strongs-lexicon/STEPBible-Data/Lexicons/TBESH - Translators Brief lexicon of Extended Strongs for Hebrew - STEPBible.org CC BY.txt"
        limit = 50 if test_mode else None
        hebrew_entries = parse_tsv_file(hebrew_file, 'hebrew', limit)
        all_entries.extend(hebrew_entries)

    # Greek lexicon
    if not hebrew_only:
        greek_file = "manuscripts/strongs-lexicon/STEPBible-Data/Lexicons/TBESG - Translators Brief lexicon of Extended Strongs for Greek - STEPBible.org CC BY.txt"
        limit = 50 if test_mode else None
        greek_entries = parse_tsv_file(greek_file, 'greek', limit)
        all_entries.extend(greek_entries)

    # Clear existing data (except in test mode)
    if not test_mode:
        clear_existing_lexicon()

    # Import
    imported, failed = import_lexicon(all_entries)

    # Verify
    verify_import()

    # Summary
    print("\n" + "=" * 70)
    print("📊 IMPORT SUMMARY")
    print("=" * 70)
    print("✅ Source: STEPBible-Data (CC BY 4.0)")
    print(f"✅ Total lexicon entries processed: {len(all_entries)}")
    print(f"✅ Successfully imported: {imported}")
    print(f"❌ Failed: {failed}")
    print("📚 Database now contains Strong's lexicon definitions")
    print("\n🎉 Strong's lexicon import complete!")

if __name__ == "__main__":
    main()
