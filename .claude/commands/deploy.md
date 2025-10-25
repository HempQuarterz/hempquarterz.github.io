# Deploy to Netlify

Build and verify the application is ready for deployment to Netlify.

## Steps:

1. Run the production build:
   - Execute `npm run build`
   - Verify build succeeds with no errors
   - Check bundle sizes are reasonable

2. Check for uncommitted changes:
   - Run `git status`
   - Commit any pending changes if needed

3. Verify environment variables are configured in Netlify:
   - REACT_APP_BIBLE_API_KEY
   - REACT_APP_SUPABASE_URL
   - REACT_APP_SUPABASE_ANON_KEY

4. Push to GitHub:
   - `git push origin master`
   - This will trigger automatic Netlify deployment

5. Monitor deployment:
   - Check Netlify dashboard for build status
   - Verify no secrets scanning errors
   - Test the live site after deployment

6. Post-deployment verification:
   - Visit the live site
   - Test manuscript viewer functionality
   - Verify divine name restoration toggle works
   - Check at least 3 sample verses load correctly
