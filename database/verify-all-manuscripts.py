#!/usr/bin/env python3
"""
Verify all manuscripts and get verse counts via REST API
"""

import requests
import os

SUPABASE_URL = "https://txeeaekwhkdilycefczq.supabase.co"
API_KEY = "sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO"

headers = {
    "apikey": API_KEY,
    "Authorization": f"Bearer {API_KEY}"
}

# Get all manuscripts
manuscripts_response = requests.get(
    f"{SUPABASE_URL}/rest/v1/manuscripts",
    headers=headers,
    params={"select": "id,code,name,language"}
)
manuscripts = manuscripts_response.json()

print("═" * 80)
print("All4Yah Manuscript Verification - Final Count")
print("═" * 80)
print()

total_verses = 0

for m in sorted(manuscripts, key=lambda x: x['code']):
    # Count verses for this manuscript
    verses_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/verses",
        headers={**headers, "Prefer": "count=exact"},
        params={
            "manuscript_id": f"eq.{m['id']}",
            "select": "id"
        }
    )

    # Extract count from Content-Range header
    content_range = verses_response.headers.get('Content-Range', '0-0/0')
    count = int(content_range.split('/')[-1])

    total_verses += count

    print(f"{m['code']:10} | {m['language']:10} | {count:>8,} verses | {m['name']}")

print()
print("─" * 80)
print(f"{'TOTAL':10} | {'':10} | {total_verses:>8,} verses | 11 manuscripts")
print("═" * 80)
