#!/usr/bin/env python3
"""
Strong's Lexicon Import - Final Working Version
Uses Supabase REST API with proper UPSERT handling
"""

import sys
import requests
import re
import html
import time

# Supabase credentials
SUPABASE_URL = "https://txeeaekwhkdilycefczq.supabase.co"
API_KEY = "sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO"

headers = {
    "apikey": API_KEY,
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=minimal"
}

def clean_html(text):
    """Remove HTML tags and decode entities"""
    if not text:
        return ""
    text = re.sub(r'<ref=[^>]*>.*?</ref>', '', text)
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', '', text)
    text = html.unescape(text)
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r'  +', ' ', text)
    return text.strip()

def normalize_strong_number(estrong):
    """Convert H0001 -> H1"""
    if not estrong or len(estrong) < 2:
        return None
    prefix = estrong[0]
    number = estrong[1:]
    try:
        num_val = int(number)
        return f"{prefix}{num_val}"
    except ValueError:
        clean_num = re.sub(r'^0+', '', number)
        return f"{prefix}{clean_num}" if clean_num else None

def parse_tsv_file(file_path, language):
    """Parse STEPBible TSV lexicon file"""
    print(f"📖 Loading {language} lexicon from: {file_path}")

    entries = []
    data_started = False

    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            if not data_started:
                if re.match(r'^[HG]\d', line):
                    data_started = True
                else:
                    continue

            parts = line.split('\t')
            if len(parts) < 8:
                continue

            estrong, dstrong, ustrong, original_word, transliteration, morph, gloss, definition = parts[:8]

            if '=' in estrong or not re.match(r'^[HG]\d+$', estrong):
                continue

            strong_number = normalize_strong_number(estrong)
            if not strong_number:
                continue

            definition_clean = clean_html(definition)

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
                    part_of_speech = pos_map.get(pos_code)

            entries.append({
                'strong_number': strong_number,
                'language': language,
                'original_word': original_word,
                'transliteration': transliteration if transliteration else None,
                'part_of_speech': part_of_speech,
                'definition': definition_clean,
                'short_definition': gloss if gloss else None
            })

    print(f"✅ Loaded {len(entries)} {language} lexicon entries")
    return entries

def import_lexicon(entries):
    """Import lexicon entries using UPSERT"""
    print(f"\n📥 Importing {len(entries)} lexicon entries to database...")
    print("Using UPSERT strategy to handle duplicates...")

    BATCH_SIZE = 100
    imported = 0
    failed = 0

    for i in range(0, len(entries), BATCH_SIZE):
        batch = entries[i:i + BATCH_SIZE]

        # Use POST with resolution=merge-duplicates header
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/lexicon",
            headers=headers,
            json=batch
        )

        if response.status_code in [200, 201]:
            imported += len(batch)
            print(f"\r   Progress: {imported}/{len(entries)} ({int(imported/len(entries)*100)}%)", end='', flush=True)
        else:
            # If batch fails, try individual inserts with explicit UPSERT
            for record in batch:
                # Try using the query parameter for upsert
                upsert_response = requests.post(
                    f"{SUPABASE_URL}/rest/v1/lexicon?on_conflict=strong_number",
                    headers=headers,
                    json=[record]
                )
                if upsert_response.status_code in [200, 201]:
                    imported += 1
                else:
                    failed += 1

            print(f"\r   Progress: {imported}/{len(entries)} ({int(imported/len(entries)*100)}%)", end='', flush=True)

        time.sleep(0.05)  # Small delay to avoid rate limits

    print(f"\n✅ Import complete: {imported} imported, {failed} failed\n")
    return imported, failed

def verify_import():
    """Verify the import"""
    print("🔍 Verifying import...")

    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/lexicon",
        headers=headers,
        params={"select": "language", "limit": 0}
    )

    content_range = response.headers.get('Content-Range', '0-0/0')
    total = content_range.split('/')[-1]
    print(f"✅ Total lexicon entries in database: {total}")

    # Get counts by language
    for lang in ['hebrew', 'greek']:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/lexicon",
            headers=headers,
            params={"select": "strong_number", "language": f"eq.{lang}", "limit": 0}
        )
        content_range = response.headers.get('Content-Range', '0-0/0')
        count = content_range.split('/')[-1]
        print(f"   {lang.capitalize()}: {count} entries")

    # Sample entries
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/lexicon",
        headers=headers,
        params={
            "select": "strong_number,original_word,transliteration,short_definition",
            "strong_number": "in.(H1,H430,H3068,G1,G2316,G2424)",
            "order": "strong_number.asc"
        }
    )

    if response.status_code == 200:
        sample = response.json()
        if sample:
            print("\n📋 Sample entries:")
            for entry in sample:
                print(f"   {entry['strong_number']}: {entry['original_word']} ({entry.get('transliteration', 'N/A')}) - {entry.get('short_definition', 'N/A')}")

def main():
    print("📖 Strong's Lexicon Import Tool - All4Yah Project (Final Version)")
    print("=" * 70)
    print("🌍 Mode: FULL (Hebrew + Greek) with UPSERT\n")

    all_entries = []

    # Hebrew lexicon
    hebrew_file = "manuscripts/strongs-lexicon/STEPBible-Data/Lexicons/TBESH - Translators Brief lexicon of Extended Strongs for Hebrew - STEPBible.org CC BY.txt"
    hebrew_entries = parse_tsv_file(hebrew_file, 'hebrew')
    all_entries.extend(hebrew_entries)

    # Greek lexicon
    greek_file = "manuscripts/strongs-lexicon/STEPBible-Data/Lexicons/TBESG - Translators Brief lexicon of Extended Strongs for Greek - STEPBible.org CC BY.txt"
    greek_entries = parse_tsv_file(greek_file, 'greek')
    all_entries.extend(greek_entries)

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
