import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const actions = await prisma.action.findMany({
    where: {
      user: {
        email: session.user.email
      }
    },
    orderBy: [
      { completed: 'asc' },
      { timestamp: 'desc' }
    ]
  });

  return NextResponse.json(actions);
}

export async function POST(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { text } = await request.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const action = await prisma.action.create({
    data: {
      text,
      userId: user.id
    }
  });

  return NextResponse.json(action);
}

export async function PATCH(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, completed } = await request.json();

  const action = await prisma.action.update({
    where: { id },
    data: { completed }
  });

  return NextResponse.json(action);
} 