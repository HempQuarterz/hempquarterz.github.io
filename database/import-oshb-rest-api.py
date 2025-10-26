#!/usr/bin/env python3
"""
OSHB Morphology Import via Supabase REST API

Uses Supabase REST API instead of direct PostgreSQL connection
to bypass IPv6 issues.

Usage:
    python3 database/import-oshb-rest-api.py database/oshb-genesis.sql
"""

import os
import re
import sys
import json
import requests
from urllib.parse import quote

# Supabase configuration
SUPABASE_URL = "https://txeeaekwhkdilycefczq.supabase.co"
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', 'sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO')

def parse_update_statement(sql):
    """Extract book, chapter, verse, and morphology from UPDATE statement"""
    # Extract morphology JSON
    morph_match = re.search(r"morphology = '(\[.*?\])'::jsonb", sql, re.DOTALL)
    if not morph_match:
        return None

    morphology_json = morph_match.group(1)
    morphology = json.loads(morphology_json)

    # Extract book
    book_match = re.search(r"book = '(\w+)'", sql)
    if not book_match:
        return None
    book = book_match.group(1)

    # Extract chapter
    chapter_match = re.search(r"chapter = (\d+)", sql)
    if not chapter_match:
        return None
    chapter = int(chapter_match.group(1))

    # Extract verse
    verse_match = re.search(r"verse = (\d+)", sql)
    if not verse_match:
        return None
    verse = int(verse_match.group(1))

    return {
        'book': book,
        'chapter': chapter,
        'verse': verse,
        'morphology': morphology
    }

def get_wlc_manuscript_id():
    """Get WLC manuscript ID from Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/manuscripts"
    headers = {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
        'Content-Type': 'application/json'
    }
    params = {'code': 'eq.WLC', 'select': 'id'}

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()

    data = response.json()
    if not data:
        raise Exception("WLC manuscript not found")

    return data[0]['id']

def update_verse_morphology(manuscript_id, verse_data):
    """Update verse morphology via Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/verses"
    headers = {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }

    # Build filter query
    params = {
        'manuscript_id': f'eq.{manuscript_id}',
        'book': f'eq.{verse_data["book"]}',
        'chapter': f'eq.{verse_data["chapter"]}',
        'verse': f'eq.{verse_data["verse"]}'
    }

    # Update data
    data = {'morphology': verse_data['morphology']}

    response = requests.patch(url, headers=headers, params=params, json=data)
    response.raise_for_status()

    return True

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 import-oshb-rest-api.py <sql-file>")
        sys.exit(1)

    sql_file = sys.argv[1]

    print("═" * 65)
    print("OSHB Morphology Import via Supabase REST API")
    print("═" * 65)
    print()

    # Read SQL file
    print(f"Reading SQL file: {sql_file}")
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    # Extract UPDATE statements
    updates = []
    current_update = ''

    for line in sql_content.split('\n'):
        if line.strip().startswith('--'):
            continue
        if line.strip() in ('BEGIN;', 'COMMIT;', ''):
            continue

        current_update += line + '\n'

        if line.strip().endswith(';') and 'UPDATE verses' in current_update:
            updates.append(current_update.strip())
            current_update = ''

    print(f"Found {len(updates)} UPDATE statements\n")

    # Get WLC manuscript ID
    print("Fetching WLC manuscript ID...")
    manuscript_id = get_wlc_manuscript_id()
    print(f"✅ WLC ID: {manuscript_id}\n")

    # Process updates
    print("Updating verses...")
    success_count = 0
    error_count = 0

    for i, update_sql in enumerate(updates):
        try:
            verse_data = parse_update_statement(update_sql)
            if not verse_data:
                print(f"  ⚠️  Could not parse statement {i + 1}")
                error_count += 1
                continue

            update_verse_morphology(manuscript_id, verse_data)
            success_count += 1

            if (i + 1) % 100 == 0:
                print(f"  Progress: {i + 1}/{len(updates)} verses updated")

        except Exception as e:
            print(f"  ❌ Error updating {verse_data.get('book', '?')} {verse_data.get('chapter', '?')}:{verse_data.get('verse', '?')}: {e}")
            error_count += 1

    print()
    print("═" * 65)
    print("Import Complete")
    print("═" * 65)
    print(f"Verses updated:     {success_count}")
    print(f"Errors:             {error_count}")
    print("─" * 65)
    print()

if __name__ == '__main__':
    main()
