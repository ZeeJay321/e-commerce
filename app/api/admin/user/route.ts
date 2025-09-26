import { NextResponse } from 'next/server';

import Joi from 'joi';
import { getServerSession } from 'next-auth';

import { PrismaClient } from '@/app/generated/prisma';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const schema = Joi.string().uuid().required();
  const { error } = schema.validate(session.user.id);
  if (error) {
    return NextResponse.json({ error: error.details.map((d) => d.message) }, { status: 400 });
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id, role: 'admin' }
  });

  if (!admin) {
    return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
  }

  return NextResponse.json({ fullname: admin.fullname });
}
