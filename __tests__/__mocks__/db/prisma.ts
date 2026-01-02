// __tests__/__mocks__/db/prisma.ts
import { PrismaClient } from '@prisma/client';

// Tipos
export interface Context {
  prisma: PrismaClient;
}

// Mock básico para PrismaClient
export const prismaMock = {
  user: {
    findUnique: jest.fn().mockImplementation(() => Promise.resolve()),
    create: jest.fn().mockImplementation(() => Promise.resolve()),
    update: jest.fn().mockImplementation(() => Promise.resolve()),
    delete: jest.fn().mockImplementation(() => Promise.resolve()),
    upsert: jest.fn().mockImplementation(() => Promise.resolve()),
    deleteMany: jest.fn().mockImplementation(() => Promise.resolve({ count: 0 })),
  },
  account: {
    deleteMany: jest.fn().mockImplementation(() => Promise.resolve({ count: 0 })),
  },
  $queryRaw: jest.fn().mockImplementation(() => Promise.resolve([])),
  $disconnect: jest.fn().mockImplementation(() => Promise.resolve()),
} as unknown as PrismaClient;

// Datos mock para pruebas
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  image: 'https://example.com/image.jpg',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Reset del mock entre pruebas
beforeEach(() => {
  jest.clearAllMocks();
  setupDefaultMocks();
});

// Configuración inicial de mocks
const setupDefaultMocks = () => {
  (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  (prismaMock.user.create as jest.Mock).mockResolvedValue(mockUser);
  (prismaMock.user.update as jest.Mock).mockResolvedValue(mockUser);
  (prismaMock.user.delete as jest.Mock).mockResolvedValue(mockUser);
};

// Mock del contexto de Prisma
export const createMockContext = (): Context => {
  return {
    prisma: prismaMock,
  };
};

// Helper para configurar datos mock específicos
export const setMockPrismaData = (data: Record<string, any>) => {
  Object.entries(data).forEach(([model, operations]) => {
    if (prismaMock[model as keyof typeof prismaMock]) {
      Object.entries(operations as Record<string, any>).forEach(([operation, value]) => {
        const mockFn = prismaMock[model as keyof typeof prismaMock][operation as keyof typeof prismaMock[keyof typeof prismaMock]];
        if (typeof mockFn === 'function') {
          (mockFn as jest.Mock).mockResolvedValue(value);
        }
      });
    }
  });
};

export { prismaMock as prisma };
export default prismaMock;