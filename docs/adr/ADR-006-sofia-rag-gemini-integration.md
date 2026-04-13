# ADR-006: Sofia RAG Chatbot with Gemini AI

**Date**: 2026-04-13
**Status**: Accepted (Phase 1-3,5 implemented, Phase 4 pending)
**Deciders**: Gabriel Pantoja

## Context

Sofia was a standalone RAG chatbot at `sofia.pantojapropiedades.cl` (Express + pgvector + OpenAI). With pantojapropiedades.cl being retired, Sofia needed a new home. The goal was to integrate Sofia into inmogrid.cl as a feature at `/sofia`, using entirely free infrastructure.

The existing inmogrid.cl chat feature (`features/chat`) is a simple FAQ assistant without RAG. Sofia brings real semantic search capabilities.

## Decision

### LLM: Gemini 2.5 Flash (Google AI, free tier)
- 500 requests/day free, <2s latency
- Excellent Spanish language quality for Chilean real estate domain
- No local fallback — if Google is down, Sofia shows "no disponible"

**Why not local (Qwen/Gemma on VPS)?** Qwen 8B on ARM takes 20-40s per response. Unacceptable UX. Gemini Flash is 10x faster and better quality in Spanish.

### Embeddings: Gemini text-embedding-004 (768 dimensions)
- Free tier included with same API key
- Good Spanish quality for legal/real estate vocabulary
- 768 dimensions (vs 1536 for OpenAI) — smaller vectors, faster search

### Vector DB: Supabase pgvector
- Extension already available in the shared Supabase project
- HNSW index with cosine distance for fast similarity search
- Multi-threshold cascade search (ported from Sofia standalone)

### No Source Attribution
- Some knowledge base materials have copyright restrictions
- RAG improves answer quality but Sofia never cites specific documents
- This is a conscious design choice, not a limitation

## Architecture

```
/sofia (Next.js page, public)
  └── SofiaChatInterface (client component, streaming)
        └── POST /api/sofia/chat (SSE streaming)
              ├── Embed query → Gemini text-embedding-004
              ├── Vector search → Supabase pgvector (top 5 docs)
              ├── Build context (3000 chars, no citations)
              ├── Generate → Gemini 2.5 Flash (streaming)
              └── Save messages → Supabase

Tables:
  inmogrid_sofia_documents      → Knowledge base + vector(768) embeddings
  inmogrid_sofia_conversations  → Chat sessions (auth + anonymous)
  inmogrid_sofia_messages       → Message history
```

## Implementation Status

| Phase | Status | Description |
|-------|--------|-------------|
| 1. Gemini client + RAG | Done | `shared/lib/gemini.ts`, Zod schemas, multi-threshold search |
| 2. API route (streaming) | Done | `api/sofia/chat/route.ts` with SSE |
| 3. Frontend UI | Done | Chat interface at `/sofia` with streaming display |
| 4. Knowledge base seeding | **Pending** | Needs working Gemini API quota + seed documents |
| 5. Prisma models + polish | Done | Schema, CSP headers, env config |

## Costs

| Component | Cost |
|-----------|------|
| Gemini 2.5 Flash + text-embedding-004 | $0/month |
| Supabase pgvector | $0 (existing plan) |
| Vercel hosting | $0 (existing plan) |

## Related

- `ADR-005` — Dual-backend architecture (Supabase + Neon)
- `docs/sql-migrations/006-sofia-rag-tables.sql` — Database migration
