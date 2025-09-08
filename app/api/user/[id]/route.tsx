import { NextRequest, NextResponse } from 'next/server';

import Joi from 'joi';

const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];

const putUserSchema = Joi.object({
  name: Joi.string().min(3).max(40).required(),
  email: Joi.string().email().required()
});

const patchUserSchema = Joi.object({
  name: Joi.string().min(3).max(40),
  email: Joi.string().email()
}).min(1);

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const deletedUser = users[index];
  users.splice(index, 1);

  return NextResponse.json({
    message: 'User deleted successfully',
    user: deletedUser
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const body = await req.json();

  const { error, value } = putUserSchema.validate(body, { abortEarly: false });
  if (error) {
    return NextResponse.json(
      { message: 'Validation failed', errors: error.details.map((d) => d.message) },
      { status: 400 }
    );
  }

  const index = users.findIndex((u) => u.id === id);
  if (index === -1) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  users[index] = { id, name: body.name, email: body.email };

  return NextResponse.json({
    message: 'User updated successfully (PUT)',
    user: users[index]
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const body = await req.json();

  const { error, value } = patchUserSchema.validate(body, { abortEarly: false });
  if (error) {
    return NextResponse.json(
      { message: 'Validation failed', errors: error.details.map((d) => d.message) },
      { status: 400 }
    );
  }

  const index = users.findIndex((u) => u.id === id);
  if (index === -1) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  users[index] = { ...users[index], ...body };

  return NextResponse.json({
    message: 'User updated successfully (PATCH)',
    user: users[index]
  });
}
