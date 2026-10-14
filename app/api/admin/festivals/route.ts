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

  const festivals = await prisma.festival.findMany({
    orderBy: { date: 'asc' },
    include: {
      festivalOccasions: {
        include: { occasion: true },
      },
    },
  });

  return NextResponse.json(festivals);
}

export async function POST(req: NextRequest) {
  const admin = checkAuth(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { name, slug, date, year, category, region, description, source, verificationStatus, deities, significance } = data;

    if (!name || !slug || !date) {
      return NextResponse.json({ error: 'Name, slug, and date are required' }, { status: 400 });
    }

    const festival = await prisma.festival.create({
      data: {
        name,
        slug,
        date,
        year: year || parseInt(date.substring(0, 4)),
        category: category || 'Major Hindu Festival',
        region: region || 'Pan-Indian',
        description: description || '',
        source: source || 'Administrator Entry',
        verificationStatus: verificationStatus || 'verified',
        deities,
        significance,
      },
    });

    return NextResponse.json(festival, { status: 201 });
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
    const { id, name, slug, date, year, category, region, description, source, verificationStatus, deities, significance } = data;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updated = await prisma.festival.update({
      where: { id },
      data: {
        name,
        slug,
        date,
        year: year ? parseInt(year) : undefined,
        category,
        region,
        description,
        source,
        verificationStatus,
        deities,
        significance,
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

    await prisma.festival.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Festival deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
