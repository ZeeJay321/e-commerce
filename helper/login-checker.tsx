import bcrypt from 'bcrypt';

import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export const findUserByEmailAndRole = async (email: string, role: string) => {
  const emailLower = email.toLowerCase();
  return prisma.user.findFirst({
    where: { email: emailLower, role }
  });
};

export const validateUserPassword = async (
  user: { password: string },
  password: string
) => bcrypt.compare(password, user.password);
