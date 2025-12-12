#!/bin/bash
# Strong's Lexicon Import via Direct SQL - All4Yah Project
#
# Generates SQL INSERT statements with ON CONFLICT and executes via psql

echo "📖 Strong's Lexicon Import Tool - All4Yah Project (Direct SQL)"
echo "======================================================================"
echo ""

# Generate SQL file from TSV data
python3 - << 'PYTHON_SCRIPT'
import sys
import re
import html

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

def escape_sql(text):
    """Escape single quotes for SQL"""
    if text is None:
        return 'NULL'
    return "'" + text.replace("'", "''").replace("\\", "\\\\") + "'"

def parse_and_generate_sql(file_path, language):
    print(f"📖 Processing {language} lexicon from: {file_path}", file=sys.stderr)

    data_started = False
    count = 0

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

            # Extract part of speech
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

            # Generate SQL INSERT with ON CONFLICT
            print(f"INSERT INTO lexicon (strong_number, language, original_word, transliteration, part_of_speech, definition, short_definition)")
            print(f"VALUES ({escape_sql(strong_number)}, {escape_sql(language)}, {escape_sql(original_word)}, " +
                  f"{escape_sql(transliteration if transliteration else None)}, {escape_sql(part_of_speech)}, " +
                  f"{escape_sql(definition_clean)}, {escape_sql(gloss if gloss else None)})")
            print(f"ON CONFLICT (strong_number) DO UPDATE SET")
            print(f"  language = EXCLUDED.language,")
            print(f"  original_word = EXCLUDED.original_word,")
            print(f"  transliteration = EXCLUDED.transliteration,")
            print(f"  part_of_speech = EXCLUDED.part_of_speech,")
            print(f"  definition = EXCLUDED.definition,")
            print(f"  short_definition = EXCLUDED.short_definition;")

            count += 1

    print(f"✅ Generated SQL for {count} {language} entries", file=sys.stderr)
    return count

# Process both files
hebrew_file = "manuscripts/strongs-lexicon/STEPBible-Data/Lexicons/TBESH - Translators Brief lexicon of Extended Strongs for Hebrew - STEPBible.org CC BY.txt"
greek_file = "manuscripts/strongs-lexicon/STEPBible-Data/Lexicons/TBESG - Translators Brief lexicon of Extended Strongs for Greek - STEPBible.org CC BY.txt"

hebrew_count = parse_and_generate_sql(hebrew_file, 'hebrew')
greek_count = parse_and_generate_sql(greek_file, 'greek')

print(f"✅ Total entries: {hebrew_count + greek_count}", file=sys.stderr)
PYTHON_SCRIPT

echo ""
echo "SQL generation complete. Now importing to database..."
echo ""

# Execute the generated SQL
python3 database/import-strongs-lexicon-psql.sh | \
  PGPASSWORD="@4HQZgassmoe" psql \
    -h db.txeeaekwhkdilycefczq.supabase.co \
    -U postgres \
    -d postgres \
    -4 \
    -q

echo ""
echo "======================================================================"
echo "📊 IMPORT COMPLETE"
echo "======================================================================"
echo ""

# Verify
PGPASSWORD="@4HQZgassmoe" psql \
  -h db.txeeaekwhkdilycefczq.supabase.co \
  -U postgres \
  -d postgres \
  -4 \
  -c "SELECT language, COUNT(*) as count FROM lexicon GROUP BY language ORDER BY language;"

echo ""
echo "🎉 Strong's lexicon import complete!"
