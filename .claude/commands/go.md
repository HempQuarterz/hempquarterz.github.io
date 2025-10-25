---
description: "Orchestrated development workflow using MCP servers"
thinking: true
---

# Go Command - Orchestrated Development Workflow

Always use this structured approach for any development task:

## 1. Read Project Context
First, read the `README.md` and any relevant project documentation to understand the current state and architecture.

## 2. MCP Server Strategy
- **Context7**: Use for up-to-date documentation on third-party libraries (React, Supabase, etc.)
- **Supabase**: Use for database operations, schema management, and RLS policies
- **GitHub**: Use for repository management, code search, and pull requests
- **Playwright**: Use for browser automation, visual testing, and UI verification
- **Desktop Commander**: Use for file operations, process management, and local analysis
- **Brave Search**: Use for researching solutions and best practices
- **Hemp Knowledge Graph**: Use for storing project insights and relationships
- **Memory Bank**: Use for persisting project documentation and learnings

## 3. Task Execution
For the requested task: $ARGUMENTS

### Process:
1. **Analyze**: Break down the task into clear, actionable steps
2. **Research**: Use Context7 for any third-party library documentation needed
3. **Explore**: Use Grep/Glob or GitHub search to find relevant existing code patterns
4. **Implement**: Make the necessary changes following project conventions
5. **Test**: Use Playwright for visual testing and browser DevTools for debugging
6. **Validate**: Ensure database schema and API consistency with Supabase MCP tools

### Implementation Guidelines:
- Follow existing code patterns and conventions (React 18 with Hooks)
- Use JavaScript with ESLint for code quality
- Maintain consistency with the All4Yah project structure
- Use Redux Toolkit for state management (bibleSlice, themeSlice)
- Update documentation (README.md, SESSION_SUMMARY files) as needed
- Consider performance implications (especially for large Bible texts)
- Ensure mobile responsiveness and accessibility
- Follow divine name restoration patterns (יהוה→Yahuah, Ἰησοῦς→Yahusha)
- Respect Hebrew RTL and Greek polytonic rendering requirements

## 4. Quality Assurance
- Run ESLint for code quality (`npm run lint` if available)
- Test functionality across different scenarios (use `/test-ui` for visual testing)
- Verify Supabase database operations and RLS policies
- Check for accessibility compliance (ARIA labels, keyboard navigation)
- Test divine name restoration toggle in ManuscriptViewer
- Verify Hebrew RTL and Greek text rendering
- Test on mobile devices and different screen sizes
- Run production build to catch any build errors

Let's implement: $ARGUMENTS