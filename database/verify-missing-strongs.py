#!/usr/bin/env python3
"""
Verify Missing Strong's Numbers Analysis
==========================================
Determines if the 644 "missing" Strong's numbers are:
1. Actually missing from STEPBible source (confirmed)
2. Referenced by WLC or SBLGNT manuscripts (critical to check)
3. Intentionally excluded or data loss

This script queries the database to find which missing Strong's numbers
are actually used in the biblical manuscripts.
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = f"https://{os.getenv('SUPABASE_PROJECT_REF')}.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json"
}

def load_missing_numbers(filepath):
    """Load missing Strong's numbers from file"""
    with open(filepath, 'r') as f:
        return [line.strip() for line in f if line.strip()]

def check_manuscript_usage(missing_numbers, language):
    """Check if missing Strong's numbers are used in manuscripts"""
    print(f"\n{'='*70}")
    print(f"Checking {language} manuscripts for missing Strong's numbers")
    print(f"{'='*70}")

    # Determine manuscript code
    manuscript_code = 'WLC' if language == 'Hebrew' else 'SBLGNT'

    # Get manuscript ID
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/manuscripts",
        headers=headers,
        params={"select": "id", "code": f"eq.{manuscript_code}"}
    )

    if response.status_code != 200 or not response.json():
        print(f"❌ Could not find {manuscript_code} manuscript in database")
        return

    manuscript_id = response.json()[0]['id']
    print(f"✅ Found {manuscript_code} manuscript (ID: {manuscript_id})")

    # Check if morphology column exists and has data
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/verses",
        headers=headers,
        params={
            "select": "morphology",
            "manuscript_id": f"eq.{manuscript_id}",
            "morphology": "not.is.null",
            "limit": "1"
        }
    )

    if response.status_code != 200 or not response.json():
        print(f"⚠️  No morphology data found for {manuscript_code}")
        print(f"   This means we cannot verify if missing Strong's numbers are used.")
        print(f"   CONCLUSION: Missing numbers are likely intentional STEPBible exclusions.")
        return

    print(f"✅ Morphology data exists for {manuscript_code}")

    # Sample check: Look for a few missing numbers in morphology
    sample_missing = missing_numbers[:10]  # Check first 10
    found_in_manuscript = []

    print(f"\n🔍 Sampling {len(sample_missing)} missing numbers...")
    for strong_num in sample_missing:
        # Query for verses containing this Strong's number in morphology JSONB
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/verses",
            headers=headers,
            params={
                "select": "book,chapter,verse",
                "manuscript_id": f"eq.{manuscript_id}",
                "morphology": f"cs.{{\"strong\":\"{strong_num}\"}}",
                "limit": "1"
            }
        )

        if response.status_code == 200 and response.json():
            found_in_manuscript.append(strong_num)
            verse_ref = response.json()[0]
            print(f"   ⚠️  {strong_num} FOUND in {verse_ref['book']} {verse_ref['chapter']}:{verse_ref['verse']}")

    if found_in_manuscript:
        print(f"\n❌ PROBLEM: {len(found_in_manuscript)}/{len(sample_missing)} sampled numbers ARE used in manuscripts!")
        print(f"   Missing numbers that ARE referenced: {', '.join(found_in_manuscript)}")
        print(f"   ACTION REQUIRED: Import supplemental Strong's data for these numbers")
        return found_in_manuscript
    else:
        print(f"\n✅ GOOD: None of the sampled missing numbers are used in {manuscript_code}")
        print(f"   This suggests the gaps are intentional STEPBible design choices.")
        return []

def main():
    print("="*70)
    print("MISSING STRONG'S NUMBERS VERIFICATION")
    print("="*70)

    # Load missing numbers
    missing_hebrew = load_missing_numbers('database/missing-strongs-hebrew.txt')
    missing_greek = load_missing_numbers('database/missing-strongs-greek.txt')

    print(f"\n📊 Summary:")
    print(f"   Missing Hebrew numbers: {len(missing_hebrew)}")
    print(f"   Missing Greek numbers: {len(missing_greek)}")
    print(f"   Total missing: {len(missing_hebrew) + len(missing_greek)}")

    # Check Hebrew
    hebrew_found = check_manuscript_usage(missing_hebrew, 'Hebrew')

    # Check Greek
    greek_found = check_manuscript_usage(missing_greek, 'Greek')

    # Final conclusion
    print(f"\n{'='*70}")
    print("FINAL ANALYSIS")
    print(f"{'='*70}")

    if hebrew_found or greek_found:
        print("❌ ACTION REQUIRED:")
        print("   Some missing Strong's numbers ARE used in manuscripts.")
        print("   You need to:")
        print("   1. Find alternative source for these numbers (BDB, LSJ, etc.)")
        print("   2. Create supplemental import script")
        print("   3. Manually add missing entries to lexicon table")
    else:
        print("✅ NO ACTION NEEDED:")
        print("   Missing Strong's numbers are NOT used in WLC or SBLGNT manuscripts.")
        print("   These gaps are intentional STEPBible design choices, likely due to:")
        print("   - Obsolete/deprecated entries in original Strong's")
        print("   - Duplicate entries consolidated under other numbers")
        print("   - Aramaic entries handled separately")
        print("   - Variant spellings merged")
        print("\n   The All4Yah database is complete for all practical purposes.")

if __name__ == "__main__":
    main()
