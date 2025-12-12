#!/usr/bin/env python3
"""
Import Targum Onkelos via Supabase REST API
Avoids IPv6 connection issues by using HTTPS
"""

import sys
import re
import requests
import time
from collections import defaultdict

SUPABASE_URL = "https://txeeaekwhkdilycefczq.supabase.co"
SUPABASE_KEY = "sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO"  # Service role key

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

def get_manuscript_id():
    """Get ONKELOS manuscript ID"""
    print("🔍 Fetching ONKELOS manuscript ID...")

    url = f"{SUPABASE_URL}/rest/v1/manuscripts"
    params = {"code": "eq.ONKELOS", "select": "id"}

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()

    data = response.json()
    if not data:
        raise Exception("ONKELOS manuscript not found!")

    manuscript_id = data[0]['id']
    print(f"✅ ONKELOS ID: {manuscript_id}\n")
    return manuscript_id

def parse_sql_file(filename):
    """Parse SQL INSERT statements from file"""
    print(f"📖 Parsing {filename}...")

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract INSERT VALUES statements
    pattern = r"INSERT INTO verses.*?VALUES\s+(.*?)\s+ON CONFLICT"
    matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)

    verses = []
    for match in matches:
        # Parse individual value rows
        # Format: (manuscript_id_subquery, 'BOOK', chapter, verse, 'text')
        row_pattern = r"\(\(SELECT.*?\),\s*'([^']+)',\s*(\d+),\s*(\d+),\s*'((?:[^']|'')+)'\)"
        rows = re.findall(row_pattern, match)

        for book, chapter, verse, text in rows:
            # Unescape SQL quotes
            text = text.replace("''", "'")
            verses.append({
                'book': book,
                'chapter': int(chapter),
                'verse': int(verse),
                'text': text
            })

    print(f"✅ Parsed {len(verses)} verses\n")
    return verses

def import_verses(manuscript_id, verses, batch_size=100):
    """Import verses via REST API in batches"""
    print(f"📥 Importing {len(verses)} verses in batches of {batch_size}...")

    stats = defaultdict(int)
    errors = []

    url = f"{SUPABASE_URL}/rest/v1/verses"

    for i in range(0, len(verses), batch_size):
        batch = verses[i:i+batch_size]

        # Prepare batch data
        batch_data = []
        for v in batch:
            batch_data.append({
                'manuscript_id': manuscript_id,
                'book': v['book'],
                'chapter': v['chapter'],
                'verse': v['verse'],
                'text': v['text']
            })

        # Send batch
        try:
            response = requests.post(url, headers=headers, json=batch_data)
            response.raise_for_status()

            stats['imported'] += len(batch)

            # Progress indicator
            if (i // batch_size) % 10 == 0:
                print(f"  📊 Progress: {stats['imported']}/{len(verses)} verses...")

        except Exception as e:
            stats['errors'] += len(batch)
            errors.append(f"Batch {i//batch_size + 1}: {str(e)}")
            print(f"  ❌ Error in batch {i//batch_size + 1}: {e}")

        # Rate limiting
        time.sleep(0.05)  # 50ms between batches

    return stats, errors

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 import-targum-rest-api.py <sql-file>")
        sys.exit(1)

    sql_file = sys.argv[1]

    print("═" * 70)
    print("Targum Onkelos Import via Supabase REST API")
    print("═" * 70)
    print()

    try:
        # Step 1: Get manuscript ID
        manuscript_id = get_manuscript_id()

        # Step 2: Parse SQL file
        verses = parse_sql_file(sql_file)

        # Step 3: Import verses
        stats, errors = import_verses(manuscript_id, verses)

        # Summary
        print()
        print("═" * 70)
        print("Import Complete")
        print("═" * 70)
        print(f"✅ Verses imported: {stats['imported']}")
        print(f"❌ Errors: {stats['errors']}")

        if errors:
            print("\nErrors:")
            for error in errors[:10]:  # Show first 10 errors
                print(f"  - {error}")

        print("─" * 70)

    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
