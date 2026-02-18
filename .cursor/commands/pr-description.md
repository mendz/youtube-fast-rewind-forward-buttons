# Review Branch and Generate PR Description

1. **Analyze branch changes** - Review all changes in the current branch compared to the base branch (main/master). Use git diff information to understand:
   - Files added, modified, or deleted
   - Key functional changes
   - Bug fixes
   - Refactorings
   - Test updates

2. **Identify key changes**:
   - **Bug fixes**: What problems were solved?
   - **New features**: What functionality was added?
   - **Refactorings**: What code improvements were made?
   - **Test updates**: What test coverage was added/modified?

3. **Review related files**:
   - Read relevant source files to understand the implementation
   - Check test files to understand what scenarios are covered
   - Review any documentation updates (AGENTS.md, README, etc.)

4. **Generate PR description** in markdown format with:
   - **Title/Summary**: Brief one-line description of the PR
   - **Key Changes**: Organized sections for:
     - Bug fixes (with problem/solution format)
     - New features
     - Refactorings
     - Test updates
   - **Files changed**: List of modified files grouped by category
   - **Testing**: What tests were added/updated and what they cover
   - **Impact**: User-facing and developer-facing impacts
   - **Migration Notes**: Any breaking changes or migration steps needed

5. **Output format**:
   - Use clear markdown formatting with headers, bullet points, and code blocks
   - Include emoji indicators (🐛 for bugs, ✨ for features, 🔧 for refactoring, ✅ for tests)
   - Be specific about what changed and why
   - Focus on both technical details and user impact

6. **Output to file**: Write the complete PR description to a markdown file (e.g., `pr-description-output.md` in the project root). This makes it easy to copy the content into a PR description field on GitHub/GitLab. Display a brief note in chat confirming the file was written and where to find it.

**Guidelines:**
- Be comprehensive but concise
- Group related changes together
- Explain the "why" behind changes, not just the "what"
- Highlight user-facing improvements prominently
- Include code examples or file paths when helpful
- Note any breaking changes or migration requirements