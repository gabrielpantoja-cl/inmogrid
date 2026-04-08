// app/api/chat/route.ts — handler delgado, lógica en @/features/chat
import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, type CoreMessage, type StreamTextResult } from 'ai';
import { auth } from '@/shared/lib/auth';
import {
  faqs,
  SOFIA_SYSTEM_PROMPT,
  saveUserMessage,
  saveBotMessage,
} from '@/features/chat';

export async function POST(req: NextRequest) {
  try {
    const authUser = await auth();
    const userId = authUser?.id;
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY environment variable');
      return new Response('Server configuration error: Missing API Key', {
        status: 500,
      });
    }

    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { messages }: { messages: CoreMessage[] } = await req.json();

    // Guardar último mensaje del usuario (best-effort)
    const lastUserMessage = messages[messages.length - 1];
    const lastMessageContent =
      typeof lastUserMessage?.content === 'string'
        ? lastUserMessage.content
        : JSON.stringify(lastUserMessage?.content ?? '');

    if (lastUserMessage?.role === 'user') {
      await saveUserMessage(userId, lastMessageContent);
    }

    // Short-circuit para FAQs exactas
    if (lastMessageContent && Object.prototype.hasOwnProperty.call(faqs, lastMessageContent)) {
      const answer = faqs[lastMessageContent];
      await saveBotMessage(userId, answer);
      return NextResponse.json({ message: answer });
    }

    // Stream desde OpenAI con system prompt prepended
    const messagesWithSystemPrompt: CoreMessage[] = [
      { role: 'system', content: SOFIA_SYSTEM_PROMPT },
      ...messages,
    ];

    const result: StreamTextResult<never, never> = await streamText({
      model: openai('gpt-4o-mini'),
      messages: messagesWithSystemPrompt,
      onFinish: async ({ text }: { text: string }) => {
        await saveBotMessage(userId, text);
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
