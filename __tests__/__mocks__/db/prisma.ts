// __tests__/__mocks__/db/prisma.ts
import { PrismaClient } from '@prisma/client';

// Tipos
export interface Context {
  prisma: PrismaClient;
}

// Definir operaciones permitidas
type PrismaOperation = 'findUnique' | 'create' | 'update' | 'delete';
type PrismaModel = keyof typeof prismaMock;

type MockPrismaFunction = jest.Mock & {
  mockResolvedValue: (value: any) => jest.Mock;
};

// Mock básico para PrismaClient
export const prismaMock = {
  user: {
    findUnique: jest.fn().mockImplementation(() => Promise.resolve()) as MockPrismaFunction,
    create: jest.fn().mockImplementation(() => Promise.resolve()) as MockPrismaFunction,
    update: jest.fn().mockImplementation(() => Promise.resolve()) as MockPrismaFunction,
    delete: jest.fn().mockImplementation(() => Promise.resolve()) as MockPrismaFunction,
    upsert: jest.fn().mockImplementation(() => Promise.resolve()) as MockPrismaFunction,
    deleteMany: jest.fn().mockImplementation(() => Promise.resolve({ count: 0 })) as MockPrismaFunction,
  },
  account: {
    deleteMany: jest.fn().mockImplementation(() => Promise.resolve({ count: 0 })) as MockPrismaFunction,
  },
  $queryRaw: jest.fn().mockImplementation(() => Promise.resolve([])) as MockPrismaFunction,
  $disconnect: jest.fn().mockImplementation(() => Promise.resolve()) as MockPrismaFunction,
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
  (prismaMock.user.findUnique as MockPrismaFunction).mockResolvedValue(mockUser);
  (prismaMock.user.create as MockPrismaFunction).mockResolvedValue(mockUser);
  (prismaMock.user.update as MockPrismaFunction).mockResolvedValue(mockUser);
  (prismaMock.user.delete as MockPrismaFunction).mockResolvedValue(mockUser);
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
    const prismaModel = model as PrismaModel;
    if (prismaMock[prismaModel]) {
      Object.entries(operations as Record<PrismaOperation, any>).forEach(([operation, value]) => {
        const prismaOperation = operation as PrismaOperation;
        const mockFn = prismaMock[prismaModel][prismaOperation];
        if (typeof mockFn === 'function') {
          (mockFn as MockPrismaFunction).mockResolvedValue(value);
        }
      });
    }
  });
};

export { prismaMock as prisma };
export default prismaMock;