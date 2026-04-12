Review the current changes in this branch for code quality, security, and correctness.

## Steps

1. Run `git diff` to see all staged and unstaged changes
2. For each changed file, check:
   - TypeScript strict mode compliance (no `any`, no `as` casting without justification)
   - Prisma field names use camelCase (matching schema.prisma mappings)
   - API routes follow the standard pattern (auth check, Zod validation, Prisma error handling)
   - No hardcoded secrets, API keys, or credentials
   - No `dangerouslySetInnerHTML` or raw SQL without parameterization
   - Supabase Auth patterns match the project conventions (getUser/requireAuth)
3. Check for Chilean data compliance (Ley 19.628): no RUT exposure, no personal data in public endpoints
4. Report findings as a checklist: pass/fail for each category

Be concise. Only flag real issues, not style preferences.
