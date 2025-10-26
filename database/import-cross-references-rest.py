#!/usr/bin/env python3
"""
Cross-References Import Script - All4Yah Project (REST API Version)

Imports cross-reference data from OpenBible.info (via scrollmapper/bible_databases)
- 344,800 cross-reference links
- Parallel passages, quotations, thematic connections
- License: CC-BY (OpenBible.info)

Usage:
    python3 database/import-cross-references-rest.py --test      # First 100 links
    python3 database/import-cross-references-rest.py --limit 1000  # First 1000 links
    python3 database/import-cross-references-rest.py --full      # All 344,800 links
"""

import sys
import requests
import time

# Supabase credentials
SUPABASE_URL = "https://txeeaekwhkdilycefczq.supabase.co"
API_KEY = "sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO"

headers = {
    "apikey": API_KEY,
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Book name mapping
BOOK_CODE_MAP = {
    # Old Testament
    'Gen': 'GEN', 'Exod': 'EXO', 'Lev': 'LEV', 'Num': 'NUM', 'Deut': 'DEU',
    'Josh': 'JOS', 'Judg': 'JDG', 'Ruth': 'RUT',
    '1Sam': '1SA', '2Sam': '2SA', '1Kgs': '1KI', '2Kgs': '2KI',
    '1Chr': '1CH', '2Chr': '2CH',
    'Ezra': 'EZR', 'Neh': 'NEH', 'Esth': 'EST',
    'Job': 'JOB', 'Ps': 'PSA', 'Prov': 'PRO', 'Eccl': 'ECC', 'Song': 'SNG',
    'Isa': 'ISA', 'Jer': 'JER', 'Lam': 'LAM', 'Ezek': 'EZK', 'Dan': 'DAN',
    'Hos': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO', 'Obad': 'OBA', 'Jon': 'JON',
    'Mic': 'MIC', 'Nah': 'NAM', 'Hab': 'HAB', 'Zeph': 'ZEP',
    'Hag': 'HAG', 'Zech': 'ZEC', 'Mal': 'MAL',

    # New Testament
    'Matt': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN',
    'Acts': 'ACT', 'Rom': 'ROM',
    '1Cor': '1CO', '2Cor': '2CO',
    'Gal': 'GAL', 'Eph': 'EPH', 'Phil': 'PHP', 'Col': 'COL',
    '1Thess': '1TH', '2Thess': '2TH',
    '1Tim': '1TI', '2Tim': '2TI', 'Titus': 'TIT', 'Phlm': 'PHM',
    'Heb': 'HEB', 'Jas': 'JAS',
    '1Pet': '1PE', '2Pet': '2PE',
    '1John': '1JN', '2John': '2JN', '3John': '3JN',
    'Jude': 'JUD', 'Rev': 'REV'
}

# OT books (use WLC manuscript)
OT_BOOKS = {'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
    '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG',
    'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM',
    'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'}

def get_manuscript_ids():
    """Get WLC and SBLGNT manuscript IDs"""
    # Get WLC
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/manuscripts",
        headers=headers,
        params={"select": "id", "code": "eq.WLC"}
    )
    wlc_data = response.json()
    if not wlc_data:
        print("❌ WLC manuscript not found")
        sys.exit(1)
    wlc_id = wlc_data[0]['id']
    print(f"✅ Found WLC manuscript: {wlc_id}")

    # Get SBLGNT
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/manuscripts",
        headers=headers,
        params={"select": "id", "code": "eq.SBLGNT"}
    )
    sblgnt_data = response.json()
    if not sblgnt_data:
        print("❌ SBLGNT manuscript not found")
        sys.exit(1)
    sblgnt_id = sblgnt_data[0]['id']
    print(f"✅ Found SBLGNT manuscript: {sblgnt_id}")

    return wlc_id, sblgnt_id

def parse_reference(ref, wlc_id, sblgnt_id):
    """Parse reference like 'Gen.1.1' or 'Prov.8.22-Prov.8.30'"""
    # Handle ranges
    parts = ref.split('-')
    from_part = parts[0]

    # Parse book.chapter.verse
    ref_parts = from_part.split('.')
    if len(ref_parts) != 3:
        return None

    book_name, chapter, verse = ref_parts

    # Map book name to code
    book_code = BOOK_CODE_MAP.get(book_name)
    if not book_code:
        return None

    # Determine manuscript ID
    manuscript_id = wlc_id if book_code in OT_BOOKS else sblgnt_id

    return {
        'book': book_code,
        'chapter': int(chapter),
        'verse': int(verse),
        'manuscript_id': manuscript_id
    }

def load_cross_references(file_path, limit=None):
    """Load cross-references from TSV file"""
    print(f"📖 Loading cross-references from: {file_path}")

    cross_refs = []
    skipped = 0

    with open(file_path, 'r', encoding='utf-8') as f:
        # Skip header
        next(f)

        for line in f:
            line = line.strip()
            if not line:
                continue

            # Parse TSV
            parts = line.split('\t')
            if len(parts) != 3:
                skipped += 1
                continue

            from_verse, to_verse, votes = parts

            cross_refs.append({
                'from': from_verse,
                'to': to_verse,
                'votes': int(votes) if votes.lstrip('-').isdigit() else 0
            })

            if limit and len(cross_refs) >= limit:
                print(f"   Reached limit of {limit} cross-references")
                break

    print(f"✅ Loaded {len(cross_refs)} cross-references")
    if skipped > 0:
        print(f"   ⚠️  Skipped {skipped} invalid lines")

    return cross_refs

def import_cross_references(cross_refs, wlc_id, sblgnt_id):
    """Import cross-references to database"""
    print(f"\n📥 Importing {len(cross_refs)} cross-references to database...")

    BATCH_SIZE = 500
    imported = 0
    failed = 0

    for i in range(0, len(cross_refs), BATCH_SIZE):
        batch = cross_refs[i:i + BATCH_SIZE]
        records = []

        for ref in batch:
            from_parsed = parse_reference(ref['from'], wlc_id, sblgnt_id)
            to_parsed = parse_reference(ref['to'], wlc_id, sblgnt_id)

            if not from_parsed or not to_parsed:
                failed += 1
                continue

            records.append({
                'source_manuscript_id': from_parsed['manuscript_id'],
                'source_book': from_parsed['book'],
                'source_chapter': from_parsed['chapter'],
                'source_verse': from_parsed['verse'],
                'target_manuscript_id': to_parsed['manuscript_id'],
                'target_book': to_parsed['book'],
                'target_chapter': to_parsed['chapter'],
                'target_verse': to_parsed['verse'],
                'link_type': 'reference',
                'category': 'cross_reference',
                'direction': 'bidirectional',
                'notes': f"Votes: {ref['votes']} (OpenBible.info relevance score)"
            })

        if records:
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/cross_references",
                headers=headers,
                json=records
            )

            if response.status_code in [200, 201]:
                imported += len(records)
                print(f"\r   Progress: {imported}/{len(cross_refs)} ({int(imported/len(cross_refs)*100)}%)", end='', flush=True)
            else:
                print(f"\n❌ Failed batch {i}-{i+len(batch)}: {response.text}")
                failed += len(records)

        # Small delay to avoid rate limiting
        time.sleep(0.1)

    print(f"\n✅ Import complete: {imported} imported, {failed} failed\n")
    return imported, failed

def verify_import():
    """Verify the import"""
    print("🔍 Verifying import...")

    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/cross_references",
        headers=headers,
        params={"select": "*", "limit": 0}
    )

    # Get count from Content-Range header
    content_range = response.headers.get('Content-Range', '0-0/0')
    total = int(content_range.split('/')[-1])

    print(f"✅ Total cross-references in database: {total}")

    # Sample some
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/cross_references",
        headers=headers,
        params={"select": "source_book,source_chapter,source_verse,target_book,target_chapter,target_verse,notes", "limit": 5}
    )

    if response.status_code == 200:
        sample = response.json()
        if sample:
            print("\n📋 Sample cross-references:")
            for ref in sample:
                print(f"   {ref['source_book']} {ref['source_chapter']}:{ref['source_verse']} → {ref['target_book']} {ref['target_chapter']}:{ref['target_verse']}")
                print(f"      {ref['notes']}")

def main():
    args = sys.argv[1:]

    # Determine mode
    limit = None
    if '--test' in args:
        limit = 100
    elif '--full' in args:
        limit = None
    else:
        for arg in args:
            if arg.startswith('--limit'):
                limit = int(arg.split()[1] if ' ' in arg else arg.split('=')[1])
                break
        else:
            print("❌ Usage: python3 database/import-cross-references-rest.py --test|--limit N|--full")
            sys.exit(1)

    print("📖 Cross-References Import Tool - All4Yah Project")
    print("=" * 70)
    mode_str = f"TEST (100 links)" if limit == 100 else f"LIMIT ({limit} links)" if limit else "FULL (344,800 links)"
    print(f"🌍 Mode: {mode_str}\n")

    # Get manuscript IDs
    wlc_id, sblgnt_id = get_manuscript_ids()

    # Load cross-references
    file_path = "manuscripts/cross-references/openbible-cross-references.txt"
    cross_refs = load_cross_references(file_path, limit)

    # Import
    imported, failed = import_cross_references(cross_refs, wlc_id, sblgnt_id)

    # Verify
    verify_import()

    # Summary
    print("\n" + "=" * 70)
    print("📊 IMPORT SUMMARY")
    print("=" * 70)
    print("✅ Source: OpenBible.info (CC-BY)")
    print(f"✅ Total cross-references processed: {len(cross_refs)}")
    print(f"✅ Successfully imported: {imported}")
    print(f"❌ Failed: {failed}")
    print("📚 Database now contains biblical cross-references")
    print("\n🎉 Cross-references import complete!")

if __name__ == "__main__":
    main()
