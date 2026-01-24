# Update What's New Page

1. **Review the current branch** - Analyze all commits and changes in the current branch compared to the base branch (master/main).

2. **Review the format** - Examine `@src/background/whats-new-page/whats-new-data.ts` to understand the existing format, style, and structure of version updates.

3. **Check version** - Verify if the version number from `@package.json` already exists in the whats-new-data.ts file.

4. **Add version entry** (if missing):
   - If the version from package.json is not present, add a new version entry
   - Use today's date with `getDate('YYYY-MM-DD')` format
   - Follow the existing structure and style

5. **Create client-facing updates**:
   - Review all changes from step 1
   - Identify user-visible improvements, fixes, or new features
   - Write update entries that are:
     - **Client-facing** - Focus on user benefits, not technical implementation
     - **Clear and concise** - Avoid technical jargon
     - **Professional** - Match the tone of existing entries
   - Use appropriate types: `'new'`, `'fixed'`, or `'improved'`
   - Use `\n` to create bullet lists (rendered as `<ul>` in the UI)

6. **Report developer-only changes** - If you determine that all changes are developer-side only (tests, refactoring, build config, etc.) and won't be interesting to end users, inform me instead of adding an entry.

**Guidelines:**
- Keep descriptions concise and benefit-focused
- Use bullet points (via `\n`) for multiple related points
- Ensure consistency with existing entry styles
- Focus on what users will notice or benefit from