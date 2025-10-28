import { jest } from '@jest/globals';

jest.mock('@/app/generated/prisma', () => {
  const mClient = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    $transaction: jest.fn((fn: unknown) => {
      if (typeof fn === 'function') {
        return fn(mClient);
      }
      return undefined;
    })
  };

  jest.mock('@/services/stripe', () => ({
    createStripeCustomer: jest.fn()
  }));

  jest.mock('@/helper/reset-email', () => ({
    sendResetLink: jest.fn()
  }));

  jest.mock('@/helper/login-checker', () => ({
    findUserByEmail: jest.fn(),
    validateUserPassword: jest.fn()
  }));

  jest.mock('@/helper/google-helper', () => ({
    createGoogleUser: jest.fn()
  }));
});
