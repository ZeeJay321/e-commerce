import bcrypt from 'bcrypt';

import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export const findUserByEmail = async (email: string) => {
  const emailLower = email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: emailLower }
  });

  if (user && (user.role === 'admin' || user.role === 'user')) {
    return user;
  }

  return null;
};

export const validateUserPassword = async (
  user: { password: string },
  password: string
) => bcrypt.compare(password, user.password);
