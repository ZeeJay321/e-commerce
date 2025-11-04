import { jest } from '@jest/globals';

import type { PrismaClient } from '@/app/generated/prisma';
import { createMockPrisma } from '@/tests/utils/mock-prisma';

export const mockPrisma = createMockPrisma() as unknown as jest.Mocked<PrismaClient>;

jest.mock('@/app/generated/prisma', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

jest.mock('@/services/stripe', () => ({
  createStripeCustomer: jest.fn()
}));

jest.mock('@/helper/login-checker', () => ({
  findUserByEmail: jest.fn(),
  validateUserPassword: jest.fn()
}));

jest.mock('@/helper/reset-email', () => ({
  sendResetLink: jest.fn()
}));

afterEach(() => {
  jest.clearAllMocks();
});
