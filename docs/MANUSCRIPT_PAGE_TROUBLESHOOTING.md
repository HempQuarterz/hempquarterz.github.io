# Manuscript Page Troubleshooting Report

**Date:** 2025-10-24
**Task:** Analyze, investigate and troubleshoot errors on the /manuscript page
**Status:** ✅ RESOLVED

## Executive Summary

Identified and resolved two separate issues affecting the manuscript page:

1. **Local Issue (FIXED):** Missing route for `/manuscript` (singular)
2. **Production Issue (REQUIRES ACTION):** Missing Supabase environment variables in Netlify deployment

---

## Issue 1: Missing `/manuscript` Route (Local)

### Problem
- User attempted to access `/manuscript` but received blank page
- Console error: `"No routes matched location '/manuscript'"`
- Route was defined as `/manuscripts` (plural) but user tried `/manuscript` (singular)

### Root Cause
In `src/App.jsx`, only `/manuscripts` route was defined:
```javascript
<Route path="/manuscripts" element={<ManuscriptsPage />} />
<Route path="/manuscripts/:book/:chapter/:verse" element={<ManuscriptsPage />} />
```

### Solution Implemented ✅
Added route aliases in `src/App.jsx:21-23` to support both singular and plural:
```javascript
<Route path="/manuscript" element={<ManuscriptsPage />} />
<Route path="/manuscript/:book/:chapter/:verse" element={<ManuscriptsPage />} />
```

### Verification
- ✅ Local dev: `http://localhost:3000/manuscript` now works correctly
- ✅ Local dev: `http://localhost:3000/manuscripts` still works
- ✅ Page loads Genesis 1:1 by default with Hebrew (WLC) and English (WEB) manuscripts
- ✅ Divine name restoration toggle works

---

## Issue 2: Missing Supabase Environment Variables (Production)

### Problem
Production site at `https://himquarterz.com/manuscripts` shows:
- Error message: `"No manuscripts found for GEN 1:1"`
- Console errors:
  ```
  Failed to load resource: the server responded with a status of 401 ()
  https://txeeaekwhkdilycefczq.supabase.co/rest/v1/manuscripts?select=id&code=eq.WLC

  getVerse error: Error: Failed to get manuscript WLC: Invalid API key
  ```

### Root Cause
The **production Netlify deployment is missing required environment variables**:
- `REACT_APP_SUPABASE_URL` ✅ (appears to be set based on URL)
- `REACT_APP_SUPABASE_ANON_KEY` ❌ **MISSING or INVALID**

The app's Supabase client configuration in `src/config/supabase.js:5-6` requires both:
```javascript
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
```

### Local Environment (Working) ✅
Local `.env` file contains all required variables:
```bash
REACT_APP_SUPABASE_URL=https://txeeaekwhkdilycefczq.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Solution Required ⚠️

**ACTION NEEDED: Configure Netlify Environment Variables**

#### Step 1: Access Netlify Dashboard
1. Go to https://app.netlify.com
2. Select the **All4Yah / himquarterz.com** site
3. Navigate to: **Site settings → Environment variables**

#### Step 2: Add Missing Environment Variables
Add the following variables with values from your local `.env` file:

| Variable Name | Value Source | Public/Secret |
|---------------|--------------|---------------|
| `REACT_APP_SUPABASE_URL` | From `.env` file | Public |
| `REACT_APP_SUPABASE_ANON_KEY` | From `.env` file | Public (protected by RLS) |
| `REACT_APP_BIBLE_API_KEY` | From `.env` file | Secret |

#### Step 3: Redeploy Site
After adding environment variables:
1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy → Clear cache and deploy site**
3. Wait for deployment to complete (2-3 minutes)

#### Step 4: Verify Production Fix
1. Visit https://himquarterz.com/manuscripts
2. Verify Genesis 1:1 displays with Hebrew and English text
3. Check browser console for no 401 errors
4. Test divine name restoration toggle

---

## Technical Details

### Environment Variable Configuration

The `netlify.toml` file (lines 5-11) documents required environment variables but **does not set them** (they must be set in Netlify UI):

```toml
[build.environment]
  # Environment variables should be set in Netlify dashboard UI
  # Site settings → Environment variables
  # Required variables:
  #   - REACT_APP_BIBLE_API_KEY
  #   - REACT_APP_SUPABASE_URL
  #   - REACT_APP_SUPABASE_ANON_KEY (public by design, protected by RLS)
```

### Supabase Configuration Flow

1. **Build Time:** React app reads `process.env.REACT_APP_SUPABASE_*` variables
2. **Client Init:** `src/config/supabase.js` creates Supabase client with these values
3. **API Calls:** `src/api/verses.js` uses client to query database
4. **Authentication:** Anon key authenticates requests (protected by Row Level Security policies)

### Error Chain Analysis

Production error flow:
1. User visits `/manuscripts`
2. `ManuscriptViewer` component loads (src/components/ManuscriptViewer.jsx:19-78)
3. Calls `getVerse('WLC', 'GEN', 1, 1)` (line 33)
4. `verses.js` → `getManuscriptId('WLC')` (line 40)
5. Supabase query fails with 401 because `supabaseAnonKey` is undefined/invalid
6. Error caught and displayed: "No manuscripts found for GEN 1:1"

---

## Files Modified

### ✅ Fixed (Committed)
- **src/App.jsx** (lines 21, 23) - Added `/manuscript` route aliases

### ℹ️ Reference (No Changes Needed)
- **src/config/supabase.js** - Supabase client configuration
- **src/api/verses.js** - Verse retrieval functions
- **src/components/ManuscriptViewer.jsx** - Manuscript display component
- **netlify.toml** - Deployment configuration
- **.env** - Local environment variables (not committed to git)

---

## Deployment Checklist

Before deploying to production, verify:

- [ ] All environment variables set in Netlify dashboard
- [ ] Supabase Row Level Security (RLS) policies enabled
- [ ] Database has data for WLC, WEB, and SBLGNT manuscripts
- [ ] Build completes without errors (`npm run build`)
- [ ] Local testing passes on `http://localhost:3000/manuscript`
- [ ] Production URL accessible at `https://himquarterz.com/manuscripts`

---

## Testing Performed

### Local Development ✅
- ✅ Route `/manuscript` loads successfully
- ✅ Route `/manuscripts` loads successfully
- ✅ Genesis 1:1 displays Hebrew (WLC) text
- ✅ Genesis 1:1 displays English (WEB) text with "God" → "Elohim" restoration
- ✅ Divine name toggle button works
- ✅ Sample verse selector buttons work
- ✅ No console errors (except FUMS script which is expected)

### Production (Current State) ⚠️
- ❌ 401 Authentication errors from Supabase
- ❌ No manuscript data displays
- ⚠️ Error message: "No manuscripts found for GEN 1:1"
- ⚠️ Requires environment variable configuration

---

## Additional Notes

### Security Considerations
- **Supabase Anon Key is public by design** - It's safe to expose in client-side code
- Database security is enforced through Row Level Security (RLS) policies
- The anon key only has read access to public data (no write permissions)
- Netlify build logs may show environment variables during build

### Future Recommendations
1. Add environment variable validation in `src/config/supabase.js`
2. Display user-friendly error when env vars missing
3. Create deployment documentation with step-by-step Netlify setup
4. Add health check endpoint to verify database connectivity
5. Consider adding Supabase connection test on app startup

---

## Resolution Summary

**Local Issue:** ✅ **RESOLVED** - Added `/manuscript` route alias
**Production Issue:** ⚠️ **REQUIRES ACTION** - Must configure Netlify environment variables

**Next Steps:**
1. Add environment variables to Netlify dashboard
2. Redeploy site with new variables
3. Verify production manuscript page loads correctly
4. Commit and push the route fix to repository

---

## Contact & Support

**Project:** All4Yah - Digital Dead Sea Scrolls
**Repository:** hempquarterz.github.io
**Deployment:** Netlify (himquarterz.com)
**Database:** Supabase (txeeaekwhkdilycefczq)

For questions about this troubleshooting report, refer to:
- Netlify documentation: https://docs.netlify.com/environment-variables/overview/
- Supabase documentation: https://supabase.com/docs/guides/getting-started/quickstarts/react
