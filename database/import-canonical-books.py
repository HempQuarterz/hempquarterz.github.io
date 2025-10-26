#!/usr/bin/env python3
"""
Import Canonical Books Reference Data
All4Yah Project - Phase 1 Completion

Populates the canonical_books table from books_tier_map.json with:
- Book codes and names
- Canonical tier classifications
- Testament categorization
- Historical era information
- Provenance confidence scores
- Manuscript source attestations
- Divine name occurrence counts

This completes the canonical tier infrastructure started in migration 002.

Usage:
  python3 database/import-canonical-books.py
"""

import os
import sys
import json
import psycopg2
from psycopg2.extras import execute_batch
from datetime import datetime

# =============================================================================
# Configuration
# =============================================================================

# Database connection
DB_HOST = "db.txeeaekwhkdilycefczq.supabase.co"
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD", "@4HQZgassmoe")

# File paths
TIER_MAP_JSON = "database/books_tier_map.json"

# =============================================================================
# Main Import Function
# =============================================================================

def import_canonical_books():
    """
    Import canonical book reference data from books_tier_map.json.
    """
    print("=" * 80)
    print("Canonical Books Import - All4Yah Phase 1 Completion")
    print("=" * 80)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    # Load book data from JSON
    print(f"Loading book definitions from {TIER_MAP_JSON}...")
    with open(TIER_MAP_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)

    books = data.get('books', [])
    print(f"✓ Loaded {len(books)} book definitions\n")

    # Connect to database
    print("Connecting to Supabase PostgreSQL...")
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            options="-c client_encoding=UTF8"
        )
        print("✓ Connected\n")
    except psycopg2.OperationalError as e:
        print(f"❌ Connection failed: {e}")
        print("\nNote: If you see 'Network is unreachable', this is the IPv6 issue.")
        print("Workaround: Copy the SQL statements below and run in Supabase Dashboard SQL Editor:\n")
        print_sql_statements(books)
        sys.exit(1)

    # Import books
    print("Importing canonical books to database...\n")
    cur = conn.cursor()

    # Clear existing data (for clean re-import)
    cur.execute("DELETE FROM canonical_books")
    conn.commit()
    print("✓ Cleared existing canonical_books data\n")

    imported_count = 0
    for book in books:
        book_code = book.get('code')
        book_name = book.get('name')
        testament = book.get('testament', 'OT')
        tier = book.get('tier', 1)
        status = book.get('status', 'canonical')
        era = book.get('era')
        language_origin = book.get('language_origin')
        language_extant = book.get('language_extant', language_origin)
        provenance_confidence = book.get('provenance_confidence', 1.0)
        manuscript_sources = book.get('manuscript_sources', [])
        included_in_canons = book.get('included_in_canons', [])
        quoted_in_nt = book.get('quoted_in_nt')
        divine_name_occurrences = book.get('divine_name_occurrences', 0)
        divine_name_restorations = book.get('divine_name_restorations', [])
        notes = book.get('notes')

        print(f"  Importing: {book_code:5} | {book_name:30} | Tier {tier} | {testament}")

        cur.execute("""
            INSERT INTO canonical_books (
                book_code, book_name, testament, canonical_tier, canonical_status,
                era, language_origin, language_extant, provenance_confidence,
                manuscript_sources, included_in_canons, quoted_in_nt,
                divine_name_occurrences, divine_name_restorations, notes
            ) VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s
            )
            ON CONFLICT (book_code) DO UPDATE SET
                book_name = EXCLUDED.book_name,
                testament = EXCLUDED.testament,
                canonical_tier = EXCLUDED.canonical_tier,
                canonical_status = EXCLUDED.canonical_status,
                era = EXCLUDED.era,
                language_origin = EXCLUDED.language_origin,
                language_extant = EXCLUDED.language_extant,
                provenance_confidence = EXCLUDED.provenance_confidence,
                manuscript_sources = EXCLUDED.manuscript_sources,
                included_in_canons = EXCLUDED.included_in_canons,
                quoted_in_nt = EXCLUDED.quoted_in_nt,
                divine_name_occurrences = EXCLUDED.divine_name_occurrences,
                divine_name_restorations = EXCLUDED.divine_name_restorations,
                notes = EXCLUDED.notes,
                updated_at = NOW()
        """, (
            book_code, book_name, testament, tier, status,
            era, language_origin, language_extant, provenance_confidence,
            manuscript_sources, included_in_canons, quoted_in_nt,
            divine_name_occurrences, divine_name_restorations, notes
        ))

        imported_count += 1

    conn.commit()
    cur.close()

    print(f"\n{'=' * 80}")
    print(f"✅ Import Complete!")
    print(f"{'=' * 80}")
    print(f"Total books imported: {imported_count}")
    print(f"Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'=' * 80}\n")

    # Verification query
    print("Verifying import...")
    cur = conn.cursor()
    cur.execute("""
        SELECT canonical_tier, COUNT(*) as count
        FROM canonical_books
        GROUP BY canonical_tier
        ORDER BY canonical_tier
    """)
    results = cur.fetchall()

    print("\nBooks by Canonical Tier:")
    for tier, count in results:
        tier_names = {
            1: "Canonical",
            2: "Deuterocanonical",
            3: "Apocryphal",
            4: "Ethiopian/Cultural",
            5: "Excluded"
        }
        tier_name = tier_names.get(tier, f"Tier {tier}")
        print(f"  Tier {tier} ({tier_name}): {count} books")

    cur.close()
    conn.close()

    print(f"\n✅ canonical_books table successfully populated!")
    print(f"✅ Phase 1 canonical tier infrastructure COMPLETE!\n")

def print_sql_statements(books):
    """
    Print SQL statements for manual execution (IPv6 workaround).
    """
    print("-- Canonical Books Import SQL")
    print("-- Copy and paste into Supabase Dashboard SQL Editor")
    print("\nBEGIN;\n")
    print("DELETE FROM canonical_books;\n")

    for book in books:
        book_code = book.get('code')
        book_name = book.get('name', '').replace("'", "''")
        testament = book.get('testament', 'OT')
        tier = book.get('tier', 1)
        status = book.get('status', 'canonical')
        era = book.get('era', '').replace("'", "''") if book.get('era') else None
        language_origin = book.get('language_origin', '').replace("'", "''") if book.get('language_origin') else None
        language_extant = book.get('language_extant', language_origin)
        provenance_confidence = book.get('provenance_confidence', 1.0)
        manuscript_sources = book.get('manuscript_sources', [])
        included_in_canons = book.get('included_in_canons', [])
        quoted_in_nt = book.get('quoted_in_nt', '').replace("'", "''") if book.get('quoted_in_nt') else None
        divine_name_occurrences = book.get('divine_name_occurrences', 0)
        divine_name_restorations = book.get('divine_name_restorations', [])
        notes = book.get('notes', '').replace("'", "''") if book.get('notes') else None

        # Format arrays for SQL
        ms_array = "ARRAY['" + "','".join(manuscript_sources) + "']" if manuscript_sources else "ARRAY[]::TEXT[]"
        canons_array = "ARRAY['" + "','".join(included_in_canons) + "']" if included_in_canons else "ARRAY[]::TEXT[]"
        restorations_array = "ARRAY['" + "','".join(divine_name_restorations) + "']" if divine_name_restorations else "ARRAY[]::TEXT[]"

        print(f"""INSERT INTO canonical_books (
    book_code, book_name, testament, canonical_tier, canonical_status,
    era, language_origin, language_extant, provenance_confidence,
    manuscript_sources, included_in_canons, quoted_in_nt,
    divine_name_occurrences, divine_name_restorations, notes
) VALUES (
    '{book_code}', '{book_name}', '{testament}', {tier}, '{status}',
    {"'" + era + "'" if era else "NULL"}, {"'" + language_origin + "'" if language_origin else "NULL"}, {"'" + language_extant + "'" if language_extant else "NULL"}, {provenance_confidence},
    {ms_array}, {canons_array}, {"'" + quoted_in_nt + "'" if quoted_in_nt else "NULL"},
    {divine_name_occurrences}, {restorations_array}, {"'" + notes + "'" if notes else "NULL"}
);
""")

    print("COMMIT;\n")
    print(f"-- Total: {len(books)} books\n")

# =============================================================================
# CLI Entry Point
# =============================================================================

if __name__ == "__main__":
    import_canonical_books()
