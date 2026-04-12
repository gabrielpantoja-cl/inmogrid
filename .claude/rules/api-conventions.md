---
description: API route conventions for Next.js App Router
globs: ["src/app/api/**/*.ts"]
---

# API Conventions

## Route Structure
- `/api/public/*` — no auth required, publicly accessible
- `/api/*` — auth required, middleware enforces Supabase session

## Standard Pattern
```typescript
export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  // Zod validation → Prisma query → response
}
```

## Error Handling
- P2002 (unique violation) → 409 Conflict
- P2025 (not found) → 404 Not Found
- Zod validation failure → 400 Bad Request
- Always return JSON with `{ error: string }` shape for errors

## Security
- Never expose internal IDs or stack traces in error responses
- Validate all user input with Zod schemas
- No raw SQL — use Prisma queries exclusively
- Chilean data: never return RUT or personal identifiers in public endpoints
