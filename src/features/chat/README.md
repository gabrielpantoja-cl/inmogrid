# Feature: `chat` (Sofia)

Asistente conversacional de inmogrid.cl. Usa OpenAI `gpt-4o-mini` vía Vercel AI SDK con streaming, short-circuit para FAQs y persistencia best-effort en `inmogrid_chat_messages`.

## Scope

- Componente `Chatbot` (UI con `useChat` de `ai/react`)
- System prompt + FAQs precacheadas (`lib/faqs.ts`)
- Persistencia de mensajes user/bot (`lib/persistence.ts`)
- Handler delgado en `app/api/chat/route.ts` que delega aquí

## Estructura

```
features/chat/
├── components/
│   └── Chatbot.tsx          # UI con streaming
├── lib/
│   ├── faqs.ts              # FAQs + SOFIA_SYSTEM_PROMPT
│   └── persistence.ts       # saveUserMessage, saveBotMessage
└── index.ts                 # API pública
```

## API pública

```ts
import {
  Chatbot,
  faqs,
  SOFIA_SYSTEM_PROMPT,
  saveUserMessage,
  saveBotMessage,
} from '@/features/chat';
```

## Dependencias permitidas

- Internas: `@/lib/prisma`, `@/lib/auth` (migran a `@/shared/lib/` en Sprint 3)
- Externas: `ai`, `@ai-sdk/openai`, `ai/react`, `@heroicons/react`

## Variables de entorno

- `OPENAI_API_KEY` — requerida. Sin esta, `/api/chat` devuelve 500.

## Consumido por

- `src/app/api/chat/route.ts` — POST /api/chat
- `src/app/chatbot/page.tsx` — página `/chatbot`

## Pendiente

- Rate limiting por usuario (actualmente cualquier user autenticado puede spamear OpenAI)
- Extraer lógica de streaming del route a `features/chat/lib/stream.ts` (el route sigue teniendo ~60L de orquestación)
- Migrar FAQs a tabla de BD para edición sin redeploy
- Tests de `saveUserMessage` / `saveBotMessage` con mock de Prisma
