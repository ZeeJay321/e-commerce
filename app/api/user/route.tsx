import { NextRequest, NextResponse } from 'next/server';

// In-memory "database"
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];

export async function GET() {
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    name: body.name,
    email: body.email
  };
  users.push(newUser);

  return NextResponse.json(
    { message: 'User added successfully', user: newUser },
    { status: 201 }
  );
}
