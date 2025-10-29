import crypto from 'crypto';

import { POST } from '@/app/api/auth/forget-password/route';
import { sendResetLink } from '@/helper/reset-email';
import { mockPrisma } from '@/tests/jest.setup';

jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mocked-token')
  }))
}));

describe('POST /api/auth/forget-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if email is missing from request body', async () => {
    const req = new Request('http://localhost/api/auth/forget-password', {
      method: 'POST',
      body: JSON.stringify({}), // missing email
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Email is required');
  });

  it('should respond 200 even if email does not exist', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const req = new Request('http://localhost/api/auth/forget-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent@example.com' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('If that email exists, reset instructions were sent.');
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(sendResetLink).not.toHaveBeenCalled();
  });

  it('should generate reset token, update user, and send reset link', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user_123',
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

    mockPrisma.user.update.mockResolvedValue({
      id: 'user_123',
      fullname: 'Test User',
      email: 'test@example.com',
      phoneNumber: '+92123456789',
      password: 'new-hashed-password',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
      resetToken: 'Valid-token',
      resetTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 10),
      stripeCustomerId: null
    });

    const req = new Request('http://localhost/api/auth/forget-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
      headers: {
        'Content-Type': 'application/json',
        host: 'localhost:3000'
      }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('If that email exists, reset instructions were sent.');
    expect(crypto.randomBytes).toHaveBeenCalledWith(32);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_123' },
      data: expect.objectContaining({
        resetToken: 'mocked-token',
        resetTokenExpiresAt: expect.any(Date)
      })
    });
    expect(sendResetLink).toHaveBeenCalledWith(
      expect.stringMatching(/^http/),
      'test@example.com',
      'mocked-token'
    );
  });

  it('should handle unexpected server errors', async () => {
    mockPrisma.user.findFirst.mockRejectedValueOnce(new Error('Database error'));

    const req = new Request('http://localhost/api/auth/forget-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('Database error');
  });

  it('should return 500 if sendResetLink throws', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user_123',
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

    mockPrisma.user.update.mockResolvedValue({
      id: 'user_123',
      fullname: 'Test User',
      email: 'test@example.com',
      phoneNumber: '+92123456789',
      password: 'new-hashed-password',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
      resetToken: 'Valid-token',
      resetTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 10),
      stripeCustomerId: null
    });
    (sendResetLink as jest.Mock).mockRejectedValueOnce(new Error('Mail service down'));

    const req = new Request('http://localhost/api/auth/forget-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
      headers: { 'Content-Type': 'application/json', host: 'localhost:3000' }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('Mail service down');
  });
});
