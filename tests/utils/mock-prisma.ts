import { jest } from '@jest/globals';

import { PrismaClient } from '@/app/generated/prisma';

/**
 * Creates a fully typed, Jest-mocked Prisma client.
 */
export function createMockPrisma() {
  const mockClient = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    product: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    order: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    $transaction: jest.fn((fn: (client: typeof mockClient) => unknown) => fn(mockClient))
  };

  return mockClient as unknown as jest.Mocked<PrismaClient>;
}
