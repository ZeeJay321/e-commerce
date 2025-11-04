import { POST } from '@/app/api/auth/signup/route';
import { PrismaClient } from '@/app/generated/prisma';
import { createStripeCustomer } from '@/services/stripe';

const prisma = new PrismaClient();
const mockStripe = createStripeCustomer as jest.MockedFunction<typeof createStripeCustomer>;

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a user successfully', async () => {
    mockStripe.mockResolvedValueOnce('cus_123');
    (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.user.create as jest.Mock).mockResolvedValueOnce({ id: 'user_123' });

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'test@example.com',
        phoneNumber: '+92123456789',
        password: 'abc123',
        confirmPassword: 'abc123'
      })
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.message).toBe('User created successfully');
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
  });

  it('returns 500 if email already exists', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'existing_user' });
    mockStripe.mockResolvedValueOnce('cus_999');

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'duplicate@example.com',
        phoneNumber: '+92123456789',
        password: 'abc123',
        confirmPassword: 'abc123'
      })
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('Email already registered');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('returns 500 if passwords do not match', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);
    mockStripe.mockResolvedValueOnce('cus_888');

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'test2@example.com',
        phoneNumber: '+92123456789',
        password: 'abc123',
        confirmPassword: 'xyz123' // mismatch
      })
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('Passwords do not Match');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('returns 500 if Stripe customer creation fails', async () => {
    mockStripe.mockRejectedValueOnce(new Error('Stripe error'));

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Stripe Fail User',
        email: 'stripefail@example.com',
        phoneNumber: '+92123456789',
        password: 'abc123',
        confirmPassword: 'abc123'
      })
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('Stripe error');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('returns 500 for unexpected error', async () => {
    mockStripe.mockResolvedValueOnce('cus_777');
    (prisma.user.findFirst as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Database connection failed');
    });

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Unexpected Error User',
        email: 'unexpected@example.com',
        phoneNumber: '+92123456789',
        password: 'abc123',
        confirmPassword: 'abc123'
      })
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('Database connection failed');
  });

  it('returns 400 if required fields are missing', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(Array.isArray(data.error)).toBe(true);
    expect(data.error).toEqual(
      expect.arrayContaining([
        '"fullName" is required',
        '"email" is required',
        '"phoneNumber" is required',
        '"password" is required',
        '"confirmPassword" is required'
      ])
    );
  });
});
