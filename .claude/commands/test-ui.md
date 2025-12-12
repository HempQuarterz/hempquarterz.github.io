# Test UI/UX with Playwright

Launch the development server and use Playwright MCP to visually test the manuscript viewer.

## Testing Workflow:

1. Start the dev server:
   - Run `npm start` in background
   - Wait for compilation to complete

2. Navigate to the manuscripts page:
   - Use Playwright to visit `http://localhost:3000/manuscripts`
   - Take screenshot of initial state

3. Test sample verse selection:
   - Click each of the 8 sample verse buttons
   - Verify manuscripts load for each verse
   - Take screenshots of key verses (Genesis 2:4, Psalm 23:1, Matthew 1:21, John 3:16)

4. Test restoration toggle:
   - Click the restoration toggle button
   - Verify text changes from restored to original
   - Click toggle again to restore
   - Verify gold highlighting (✦) appears/disappears

5. Test different verse types:
   - Old Testament (Hebrew + English): Genesis 1:1, Psalm 23:1
   - New Testament (Greek only): Matthew 1:21, John 3:16
   - YHWH verses: Genesis 2:4, Psalm 23:1

6. Verify visual elements:
   - Hebrew RTL rendering
   - Greek polytonic fonts
   - Responsive grid layout
   - Dark mode (if applicable)

7. Generate report:
   - Document any issues found
   - Save all screenshots
   - Note console errors (if any)
