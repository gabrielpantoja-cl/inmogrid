---
description: TypeScript and React code style conventions for inmogrid.cl
globs: ["src/**/*.ts", "src/**/*.tsx"]
---

# Code Style

- TypeScript strict mode — avoid `any`, prefer explicit types
- Import alias: `@/` maps to `src/`
- Feature-based structure: `src/features/{feature}/`
- Components: functional only, named exports
- Hooks: prefix with `use`, place in `src/hooks/` or feature-local `hooks/`
- Prisma models: use camelCase field names (Prisma handles `@map` to snake_case)
- Tailwind CSS for all styling — no CSS modules, no styled-components
- shadcn/ui components in `src/components/ui/`
- Zod for all runtime validation (forms, API input)
- No default exports except Next.js pages/layouts
