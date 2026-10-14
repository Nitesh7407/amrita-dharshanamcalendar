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

  const slokhas = await prisma.slokha.findMany({
    orderBy: { sequenceOrder: 'asc' },
    include: {
      versions: true,
      occasionSlokhas: {
        include: { occasion: true },
      },
    },
  });

  return NextResponse.json(slokhas);
}

export async function POST(req: NextRequest) {
  const admin = checkAuth(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { name, slug, deity, category, origin, significance, overallMeaning, alternativeNames, versions } = data;

    if (!name || !slug || !deity || !category) {
      return NextResponse.json({ error: 'Name, slug, deity, and category are required' }, { status: 400 });
    }

    const slokha = await prisma.slokha.create({
      data: {
        name,
        slug,
        deity,
        category,
        origin,
        significance,
        overallMeaning,
        alternativeNames,
        sourceReference: 'Administrator Entry',
      },
    });

    if (versions && Array.isArray(versions)) {
      for (const v of versions) {
        if (v.language && v.text) {
          await prisma.slokhaVersion.create({
            data: {
              slokhaId: slokha.id,
              language: v.language,
              script: v.script || (v.language === 'sanskrit' ? 'devanagari' : v.language === 'tamil' ? 'tamil' : v.language === 'telugu' ? 'telugu' : 'latin'),
              contentType: v.contentType || 'original_text',
              text: v.text,
              meaning: v.meaning,
              sourceDocument: 'Manual Entry',
              verificationStatus: 'verified',
            },
          });
        }
      }
    }

    return NextResponse.json(slokha, { status: 201 });
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
    const { id, name, slug, deity, category, origin, significance, overallMeaning, alternativeNames, versionUpdate } = data;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updated = await prisma.slokha.update({
      where: { id },
      data: {
        name,
        slug,
        deity,
        category,
        origin,
        significance,
        overallMeaning,
        alternativeNames,
      },
    });

    // If version text update is included
    if (versionUpdate && versionUpdate.language && versionUpdate.text) {
      await prisma.slokhaVersion.upsert({
        where: {
          slokhaId_language: {
            slokhaId: id,
            language: versionUpdate.language,
          },
        },
        create: {
          slokhaId: id,
          language: versionUpdate.language,
          script: versionUpdate.script || 'devanagari',
          contentType: versionUpdate.contentType || 'original_text',
          text: versionUpdate.text,
          meaning: versionUpdate.meaning,
          sourceDocument: 'Admin Edited',
          verificationStatus: 'verified',
        },
        update: {
          text: versionUpdate.text,
          meaning: versionUpdate.meaning,
          verificationStatus: 'verified',
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
