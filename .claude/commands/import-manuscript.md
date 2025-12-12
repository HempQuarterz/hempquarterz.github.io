# Import Additional Manuscript

Import a new manuscript (LXX or Textus Receptus) into the Supabase database.

## Prerequisites:

- Manuscript data downloaded to `manuscripts/` directory
- SUPABASE_SERVICE_ROLE_KEY set in .env file
- Database connection verified

## Import Options:

### Option 1: Septuagint (LXX) - Greek Old Testament
```bash
# Download LXX data first
cd manuscripts
git clone https://github.com/septuaginta/lxx-swete.git septuagint/lxx-swete

# Import to database
cd ../database
node import-lxx.js --test    # Test with one book first
node import-lxx.js --full    # Import all books

# Verify import
node verify-lxx.js
```

### Option 2: Textus Receptus (TR) - Greek New Testament
```bash
# Download TR data first
cd manuscripts/greek_nt
git clone https://github.com/byztxt/byzantine-majority-text.git textus_receptus

# Import to database
cd ../../database
node import-textus-receptus.js --test    # Test with one book first
node import-textus-receptus.js --full    # Import all books

# Verify import
node verify-textus-receptus.js
```

## Post-Import:

1. Verify verse counts match expected totals
2. Test sample verses in ManuscriptViewer
3. Update documentation with new manuscript stats
4. Commit database import scripts if modified
