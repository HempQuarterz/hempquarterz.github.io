# All4Yah Skills Directory

This directory contains reusable skills for the All4Yah project.

## What are Skills?

Skills are reusable capabilities that can be invoked by Claude Code to perform specific tasks. They provide structured workflows for common operations.

## Available Skills:

### 1. Database Manager (`database-manager.md`)
**Purpose:** Manage Supabase database operations

**Use when:**
- Checking database status
- Running queries
- Verifying data integrity
- Guiding through imports

**Example invocation:** "Use the database manager skill to check total verse count"

### 2. Manuscript Tester (`manuscript-tester.md`)
**Purpose:** Test manuscript data and restoration functionality

**Use when:**
- Running comprehensive tests
- Verifying divine name restoration
- Testing API endpoints
- Validating UI components

**Example invocation:** "Use the manuscript tester skill to verify all restorations"

## How to Use Skills:

Skills are invoked automatically by Claude Code when relevant to your request. You can also explicitly request a skill:

```
"Use the database-manager skill to check the database"
"Run the manuscript-tester skill"
```

## Creating New Skills:

To create a new skill:

1. Create a new `.md` file in `.claude/skills/`
2. Use descriptive naming (e.g., `deployment-checker.md`)
3. Document the skill's capabilities
4. Provide usage examples
5. Include safety considerations

### Skill Template:

```markdown
# [Skill Name]

[Brief description of what this skill does]

## Capabilities:

### 1. [Capability Name]
- [What it does]
- [How it works]

### 2. [Another Capability]
- [Details]

## Usage:

When invoked, this skill will:
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Examples:

[Code examples or command examples]

## Safety:

[Any safety considerations or limitations]
```

## Best Practices:

1. **Be Specific:** Clearly define what the skill can and cannot do
2. **Document Safety:** Note any operations that modify data
3. **Provide Examples:** Include concrete usage examples
4. **Keep Updated:** Update skills as features change
5. **Test Thoroughly:** Verify skills work as documented

## Integration with Slash Commands:

Skills can be referenced from slash commands:

```markdown
# /my-command

Use the database-manager skill to check status before proceeding with the task.
```

This creates powerful, reusable workflows for common development tasks.
