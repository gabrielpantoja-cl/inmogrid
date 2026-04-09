/**
 * Persistencia de mensajes del chat (tabla `inmogrid_chat_messages`).
 * Las escrituras son best-effort: si fallan, el chat sigue funcionando
 * y solo se loggea el error.
 */

import { randomUUID } from 'crypto';
import { db } from '@/shared/lib/prisma';
import { MessageRole } from '@prisma/client';

export async function saveUserMessage(userId: string, content: string) {
  try {
    await db.chatMessage.create({
      data: {
        id: randomUUID(),
        userId,
        role: MessageRole.user,
        content,
      },
    });
  } catch (err) {
    console.error('[chat/persistence] saveUserMessage error:', err);
  }
}

export async function saveBotMessage(userId: string, content: string) {
  try {
    await db.chatMessage.create({
      data: {
        id: randomUUID(),
        userId,
        role: MessageRole.bot,
        content,
      },
    });
  } catch (err) {
    console.error('[chat/persistence] saveBotMessage error:', err);
  }
}
