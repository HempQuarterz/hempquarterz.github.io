# Manuscript Tester Skill

A skill for testing manuscript data integrity and divine name restoration.

## Test Categories:

### 1. Data Integrity Tests
- Verify verse counts match expected totals
- Check for missing verses in sequences
- Validate book/chapter/verse numbering
- Ensure no duplicate entries

### 2. Restoration Tests
- Test all 8 divine name mappings
- Verify pattern matching works correctly
- Check Strong's number matching
- Test contextual restoration rules

### 3. API Tests
- Test getVerse() for all manuscripts
- Test getParallelVerse() for OT verses
- Test restoreVerse() for all mappings
- Verify error handling

### 4. UI Component Tests
- Test ManuscriptViewer with sample verses
- Verify restoration toggle functionality
- Check font rendering (Hebrew RTL, Greek polytonic)
- Test responsive layout

## Test Execution:

When invoked, this skill will:

1. **Run Data Integrity Tests:**
   ```bash
   node database/verify-sblgnt.js
   node database/verify-wlc.js
   ```

2. **Run Restoration Tests:**
   ```bash
   node database/test-greek-restoration.js
   node database/test-hebrew-restoration.js
   ```

3. **Test Sample Verses:**
   - Genesis 1:1 (Elohim)
   - Genesis 2:4 (Yahuah Elohim)
   - Psalm 23:1 (Yahuah)
   - Isaiah 53:5 (pierced for transgressions)
   - Matthew 1:21 (Yahusha)
   - John 1:1 (In the beginning)
   - John 3:16 (Elohim)

4. **Generate Test Report:**
   - Total tests run
   - Passed/failed counts
   - Detailed failure messages
   - Performance metrics

## Expected Results:

All tests should pass with:
- ✅ 54,217 total verses
- ✅ 8/8 name mappings working
- ✅ All restoration patterns matching correctly
- ✅ No missing or duplicate verses
- ✅ API endpoints responding correctly

## Error Handling:

If tests fail:
1. Document the specific failure
2. Check database connection
3. Verify environment variables
4. Examine recent code changes
5. Provide debugging recommendations
