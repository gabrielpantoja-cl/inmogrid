// lib/users.ts
import { prisma } from '@/lib/prisma';

export async function fetchUsers() {
  return await prisma.profile.findMany({
    select: {
      id: true,
      fullName: true,
    },
  });
}
