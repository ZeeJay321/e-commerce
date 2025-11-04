import bcrypt from 'bcrypt';

import { POST } from '@/app/api/auth/reset-password/route';
import { mockPrisma } from '@/tests/jest.setup';

jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password'))
}));

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if token is invalid or expired', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const req = new Request('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: 'invalid-token', password: 'newPass123' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: 'Reset token is invalid or expired' });
    expect(mockPrisma.user.findFirst).toHaveBeenCalledTimes(1);
  });

  it('should reset password successfully', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user_1',
      fullname: 'Test User',
      email: 'test@example.com',
      phoneNumber: '+92123456789',
      password: 'hashed-password',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
      resetToken: 'valid-token',
      resetTokenExpiresAt: new Date(Date.now() + 10000),
      stripeCustomerId: null
    });

    mockPrisma.user.update.mockResolvedValue({
      id: 'user_1',
      fullname: 'Test User',
      email: 'test@example.com',
      phoneNumber: '+92123456789',
      password: 'hashed-password',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
      resetToken: null,
      resetTokenExpiresAt: null,
      stripeCustomerId: null
    });

    const req = new Request('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: 'valid-token', password: 'newPass123' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      message: 'Password has been reset successfully'
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('newPass123', 10);

    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      data: {
        password: 'hashed-password',
        resetToken: null,
        resetTokenExpiresAt: null
      }
    });
  });

  it('should handle unexpected server errors', async () => {
    mockPrisma.user.findFirst.mockRejectedValue(new Error('Database down'));

    const req = new Request('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: 'valid-token', password: 'pass123' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toHaveProperty('error', 'Database down');
  });

  it('should return 400 if token or password is missing', async () => {
    const req = new Request('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: 'Token and password are required' });
  });
});
