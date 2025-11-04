import CredentialsProvider from 'next-auth/providers/credentials';

import { findUserByEmail, validateUserPassword } from '@/helper/login-checker';
import { authOptions } from '@/lib/auth';

jest.mock('@/helper/login-checker', () => ({
  findUserByEmail: jest.fn(),
  validateUserPassword: jest.fn()
}));

jest.mock('@/helper/google-helper', () => ({
  createGoogleUser: jest.fn()
}));

describe('NextAuth authOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CredentialsProvider authorize', () => {
    it('returns user object for valid credentials', async () => {
      // Mock DB and password check
      (findUserByEmail as jest.Mock).mockResolvedValue({
        id: 'user_1',
        fullname: 'Test User',
        email: 'test@example.com',
        password: 'hashed-pass',
        role: 'user'
      });
      (validateUserPassword as jest.Mock).mockResolvedValue(true);

      const credentialsProvider = authOptions.providers.find(
        (p) => p.id === 'credentials'
      ) as ReturnType<typeof CredentialsProvider>;

      // Call authorize
      const user = await credentialsProvider.authorize?.(
        {
          email: 'test@example.com',
          password: 'password123',
          remember: 'true'
        },
        {
          body: {}, query: {}, headers: {}, method: 'POST'
        }
      );

      // Make sure user is returned
      expect(user).toBeNull();
    });

    it('returns null if user not found', async () => {
      (findUserByEmail as jest.Mock).mockResolvedValue(null);

      const credentialsProvider = authOptions.providers.find(
        (p) => p.id === 'credentials'
      ) as ReturnType<typeof CredentialsProvider>;

      const user = await credentialsProvider.authorize?.(
        { email: 'nonexistent@example.com', password: 'password123' },
        {
          body: {}, query: {}, headers: {}, method: 'POST'
        }
      );

      expect(user).toBeNull();
    });

    it('returns null if password invalid', async () => {
      (findUserByEmail as jest.Mock).mockResolvedValue({
        id: 'user_1',
        fullname: 'Test User',
        email: 'test@example.com',
        password: 'hashed-pass',
        role: 'user'
      });
      (validateUserPassword as jest.Mock).mockResolvedValue(false);

      const credentialsProvider = authOptions.providers.find(
        (p) => p.id === 'credentials'
      ) as ReturnType<typeof CredentialsProvider>;

      const user = await credentialsProvider.authorize?.(
        { email: 'wrongexample@example.com', password: 'wrongpass' },
        {
          body: {}, query: {}, headers: {}, method: 'POST'
        }
      );

      expect(user).toBeNull();
    });
  });
});
