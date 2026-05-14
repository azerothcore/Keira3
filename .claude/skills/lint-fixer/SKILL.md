---
name: lint-fixer
description: This skill should be used when the user asks to "run lint", "fix lint", "fix linting errors", "lint the project", "run and fix lint", "ESLint errors", "prettier errors", "fix formatting", or mentions lint failures in this project. Handles running ESLint and Prettier for specific libraries or all affected projects and iteratively fixes violations.
context: fork
---

# Lint Runner & Fixer Skill

## Overview

This skill runs linting for the Keira3 Nx monorepo and iteratively fixes violations until all checks pass. It uses a context fork (Agent tool) to isolate the lint execution loop from the main conversation.

## When This Skill Applies

- User asks to run lint for a specific library or all affected projects
- User asks to fix ESLint or Prettier errors
- User wants to verify code style after a code change
- Pre-commit or CI lint failures need to be resolved

## Key Commands

```bash
# Lint a specific library
nx lint <project-name>

# Lint all affected projects
npm run lint

# Format all files with Prettier
npm run format

# Examples
nx lint keira-features-creature
nx lint keira-shared-utils
```

## How to Execute This Skill

**Always use the Agent tool (general-purpose) to fork context** for the lint run-and-fix loop. This prevents lint output from polluting the main conversation context.

### Agent Prompt Template

When this skill activates, delegate to a general-purpose agent with this prompt:

```
You are running and fixing lint errors in the Keira3 Angular/Nx monorepo.

Target: [SPECIFIC_PROJECT or "all affected projects"]

## Your Process

1. **Run lint** using the appropriate command:
   - Specific project: `nx lint <project-name>`
   - All affected: `npm run lint`

2. **Parse the output** to identify:
   - Which files have violations
   - The ESLint rule(s) being violated
   - Whether it's an auto-fixable issue

3. **Fix violations iteratively**:
   - Read the offending file before editing
   - Apply fixes following the project's code conventions (see below)
   - Re-run lint on the same project to confirm: `nx lint <project-name>`
   - Repeat until all violations in that project are resolved

4. **For Prettier formatting issues**:
   - Run `npm run format` to auto-fix formatting
   - Prettier config: 140 char line width, single quotes, trailing commas

5. **Code conventions to enforce when fixing**:
   - Standalone components (no NgModules)
   - OnPush change detection on all components
   - Use `inject()` for dependency injection — NOT constructor injection
   - Component selector prefix: `keira-` (kebab-case elements, camelCase directives)
   - Self-closing tags required in templates (e.g., `<keira-foo />` not `<keira-foo></keira-foo>`)
   - No `console.log` — only `console.warn`, `console.info`, `console.error` allowed
   - Module boundary rule: features can only import from shared; respect `@nx/enforce-module-boundaries`
   - All path aliases use `@keira/*` (declared in `tsconfig.base.json`)

6. **Do NOT auto-fix module boundary violations** — these indicate a real architectural problem. Report them to the user instead.

7. **Report back**:
   - Summary of what was fixed and which rules were violated
   - Any remaining issues that require architectural decisions
   - Files changed
```

## Important Notes

- Do NOT suppress ESLint rules with `// eslint-disable` comments unless absolutely necessary and pre-approved by the user
- Do NOT change production logic to satisfy lint — only style/pattern fixes are acceptable
- Module boundary violations (`@nx/enforce-module-boundaries`) require architectural review — do not silently fix by moving code
- Prettier is enforced via pre-commit hook (`pretty-quick --staged`) — format issues in staged files will block commits
