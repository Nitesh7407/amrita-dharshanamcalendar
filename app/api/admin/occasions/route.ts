import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function checkAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  const admin = checkAuth(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const occasions = await prisma.occasion.findMany({
    orderBy: { date: 'asc' },
    include: {
      occasionSlokhas: {
        include: { slokha: true },
        orderBy: { sequenceOrder: 'asc' },
      },
    },
  });

  return NextResponse.json(occasions);
}

export async function POST(req: NextRequest) {
  const admin = checkAuth(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { name, slug, date, year, occasionType, description, institution, source, verificationStatus } = data;

    if (!name || !slug || !date) {
      return NextResponse.json({ error: 'Name, slug, and date are required' }, { status: 400 });
    }

    const occasion = await prisma.occasion.create({
      data: {
        name,
        slug,
        date,
        year: year || parseInt(date.substring(0, 4)),
        occasionType: occasionType || 'amrita_darshanam',
        description: description || '',
        institution: institution || 'Amrita Vishwa Vidyapeetham',
        source: source || 'Administrator Entry',
        verificationStatus: verificationStatus || 'verified',
      },
    });

    return NextResponse.json(occasion, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = checkAuth(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { id, name, slug, date, year, occasionType, description, institution, source, verificationStatus } = data;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updated = await prisma.occasion.update({
      where: { id },
      data: {
        name,
        slug,
        date,
        year: year ? parseInt(year) : undefined,
        occasionType,
        description,
        institution,
        source,
        verificationStatus,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = checkAuth(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.occasion.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Occasion deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
