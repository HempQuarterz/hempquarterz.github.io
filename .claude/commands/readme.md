# All4Yah Slash Commands Directory

This directory contains custom slash commands for the All4Yah project.

## What are Slash Commands?

Slash commands are custom commands you can invoke in Claude Code using `/command-name` syntax. They provide quick access to common workflows and tasks.

## Available Commands:

### `/go`
Orchestrated development workflow using MCP servers for complex tasks.

**Usage:** Type `/go [task description]` in the chat

**What it does:**
- Reads project context and documentation
- Strategically uses available MCP servers
- Follows structured implementation process
- Ensures quality assurance and testing
- Maintains All4Yah project conventions

**Example:** `/go add pagination to manuscript viewer`

### `/deploy`
Deploy the application to Netlify with full verification steps.

**Usage:** Type `/deploy` in the chat

**What it does:**
- Runs production build
- Checks for uncommitted changes
- Verifies environment variables
- Pushes to GitHub
- Monitors deployment

### `/test-ui`
Launch Playwright visual testing for the manuscript viewer.

**Usage:** Type `/test-ui` in the chat

**What it does:**
- Starts dev server
- Tests manuscript viewer UI
- Verifies restoration toggle
- Takes screenshots
- Generates test report

### `/import-manuscript`
Guide through importing additional manuscripts (LXX or TR).

**Usage:** Type `/import-manuscript` in the chat

**What it does:**
- Shows import options
- Verifies prerequisites
- Runs import scripts
- Validates import success

### `/session-summary`
Generate a comprehensive session summary document.

**Usage:** Type `/session-summary` in the chat

**What it does:**
- Creates summary markdown file
- Documents all achievements
- Lists git commits
- Includes statistics
- Outlines next steps

## How to Use Slash Commands:

1. Type `/` in the Claude Code chat
2. Start typing the command name
3. Select from autocomplete suggestions
4. Press Enter to execute

Or simply type the full command:
```
/deploy
/test-ui
/import-manuscript
/session-summary
```

## Creating Custom Commands:

To create a new slash command:

1. Create a new `.md` file in `.claude/commands/`
2. Use kebab-case naming (e.g., `my-command.md`)
3. Write the command instructions in markdown
4. The filename becomes the command name: `/my-command`

### Command Template:

```markdown
# [Command Name]

[Brief description of what this command does]

## Steps:

1. [First step with details]
2. [Second step with details]
3. [Third step with details]

## Prerequisites:

- [Requirement 1]
- [Requirement 2]

## Expected Output:

[What the user should see when the command completes]

## Troubleshooting:

- **Issue 1:** [Solution]
- **Issue 2:** [Solution]
```

## Best Practices:

1. **Clear Instructions:** Write step-by-step instructions
2. **Include Context:** Explain why each step is needed
3. **Show Examples:** Include code snippets or commands
4. **Document Prerequisites:** List required tools or settings
5. **Add Troubleshooting:** Include common issues and solutions

## Command Naming Conventions:

- Use **kebab-case** for filenames: `test-ui.md`, `import-manuscript.md`
- Use **descriptive names** that indicate the action
- Keep names **short** but clear
- **Group related commands** with prefixes if needed

Examples:
- `deploy.md` → `/deploy`
- `test-ui.md` → `/test-ui`
- `db-backup.md` → `/db-backup`
- `doc-generate.md` → `/doc-generate`

## Advanced Features:

### Parameterized Commands:

Commands can accept parameters or ask for user input:

```markdown
# Import Specific Manuscript

Which manuscript would you like to import?
- LXX (Septuagint)
- TR (Textus Receptus)
- DSS (Dead Sea Scrolls)

[Proceed based on user selection]
```

### Conditional Logic:

Commands can include conditional instructions:

```markdown
# Deploy

1. Check git status
2. If uncommitted changes:
   - Ask user to commit or stash
3. If clean:
   - Proceed with build
```

### Integration with Skills:

Commands can invoke skills:

```markdown
# Full Test Suite

Use the manuscript-tester skill to run all tests.
Then use the database-manager skill to verify data integrity.
```

## Examples of Useful Commands:

- `/quick-test` - Run fast smoke tests
- `/full-test` - Run comprehensive test suite
- `/db-status` - Check database health
- `/build-prod` - Create production build
- `/git-clean` - Clean uncommitted changes
- `/env-check` - Verify environment variables
- `/docs-update` - Update all documentation

## Tips:

1. **Start Simple:** Create basic commands first, enhance later
2. **Be Specific:** Tailor commands to your project's needs
3. **Test Commands:** Verify they work as expected
4. **Update Regularly:** Keep commands current with codebase changes
5. **Share Knowledge:** Document commands for team members
