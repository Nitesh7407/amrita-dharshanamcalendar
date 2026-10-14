import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, category, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        name,
        email,
        category: category || 'general',
        message,
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.substring(7);
  const admin = verifyToken(token);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const feedbackList = await prisma.feedback.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(feedbackList);
}
