# Update What's New Page

1. **Review the current branch** - Analyze all commits and changes in the current branch compared to the base branch (master/main).

2. **Review the format** - Examine `@src/background/whats-new-page/whats-new-data.ts` to understand the existing format, style, and structure of version updates.

3. **Check version** - Read `@package.json` and determine the current version string. Verify if this version already exists in `whats-new-data.ts`.

4. **Add or update the version entry in code**:
   - If the version from `package.json` is not present in `whats-new-data.ts`, programmatically **append a new `IVersionUpdates` entry** to the exported `versionUpdates` array in `@src/background/whats-new-page/whats-new-data.ts`.
   - If the version **already exists** in `whats-new-data.ts` but has no corresponding git tag yet (check with `git tag --list "vX.Y.Z"`), update the existing entry's `date` field to today's date using `getDate('YYYY-MM-DD')` format.
   - Use today's date with `getDate('YYYY-MM-DD')` format when setting the `date` field.
   - Follow the existing structure and style of the surrounding entries (ordering, indentation, and types).

5. **Create client-facing updates based on branch changes**:
   - Review all changes from step 1 (git diff vs base branch).
   - Identify **user-visible** improvements, fixes, or new features (ignore purely internal/test/build changes).
   - For the new version entry you add in step 4, generate `updates` items that are:
     - **Client-facing** - Focus on user benefits, not technical implementation details.
     - **Clear and concise** - Avoid technical jargon.
     - **Professional** - Match the tone and length of existing entries.
   - Use appropriate types: `'new'`, `'fixed'`, or `'improved'`.
   - Use `\n` in the `description` string to create bullet lists (rendered as `<ul>` in the UI) when listing multiple related points.

6. **Handle developer-only branches**:
   - If all detected changes are developer-side only (tests, refactoring, build config, docs, etc.) and not interesting to end users, **do not modify `whats-new-data.ts`**.
   - In that case, explain in chat that no new user-facing entry was added because changes are internal-only.

7. **Summarize the result in chat**:
   - If a new version entry was added, briefly summarize the key user-facing updates that were written to `whats-new-data.ts` (version, date, and high-level bullets).
   - If no code changes were made (step 6), clearly state that the whats-new data file was left unchanged and why.

**Guidelines:**
- Keep descriptions concise and benefit-focused.
- Use bullet points (via `\n`) for multiple related points.
- Ensure consistency with existing entry styles.
- Focus on what users will notice or benefit from.