import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';

  if (!q) {
    return NextResponse.json({
      festivals: [],
      occasions: [],
      slokhas: [],
      totalCount: 0,
    });
  }

  try {
    const [festivals, occasions, slokhas] = await Promise.all([
      prisma.festival.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { category: { contains: q } },
            { deities: { contains: q } },
            { region: { contains: q } },
          ],
        },
        take: 8,
        orderBy: { date: 'asc' },
      }),
      prisma.occasion.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { institution: { contains: q } },
            { occasionType: { contains: q } },
          ],
        },
        take: 8,
        orderBy: { date: 'asc' },
      }),
      prisma.slokha.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { alternativeNames: { contains: q } },
            { deity: { contains: q } },
            { category: { contains: q } },
            { origin: { contains: q } },
            { overallMeaning: { contains: q } },
          ],
        },
        include: {
          versions: {
            select: {
              language: true,
              script: true,
              verificationStatus: true,
            },
          },
        },
        take: 12,
        orderBy: { sequenceOrder: 'asc' },
      }),
    ]);

    const totalCount = festivals.length + occasions.length + slokhas.length;

    return NextResponse.json({
      query: q,
      totalCount,
      festivals,
      occasions,
      slokhas,
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed', details: error.message }, { status: 500 });
  }
}
