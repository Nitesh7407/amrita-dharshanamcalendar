import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateSlokhaPdf } from '@/lib/pdfGenerator';

const SLUG_ALIASES: Record<string, string> = {
  'purusha-suktam': 'purusha-suktham',
  'vishnu-sahasranamam': 'sri-vishnu-sahasranama-stotram',
  'vishnu-sahasranama': 'sri-vishnu-sahasranama-stotram',
  'ganesha-pancharatnam': 'mahaganesha-pancharatnam',
  'sri-ganesha-pancharatnam': 'mahaganesha-pancharatnam',
  'lalita-sahasranama': 'sri-lalita-sahasranama-stotram',
  'lalitasahasranama': 'sri-lalita-sahasranama-stotram',
  'lalita-sahasranama-stotram': 'sri-lalita-sahasranama-stotram',
  'sri-guru-stotram': 'guru-stotram',
  'medha-suktam': 'medha-suktham',
  'aikyamathya-suktam': 'aikyamathya-suktham',
  'sri-suktam': 'sri-suktham',
  'sri-mahalakshmi-ashtakam': 'mahalakshmi-ashtakam',
};

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; language: string } }
) {
  try {
    const rawSlug = params.slug.toLowerCase().trim();
    const slug = SLUG_ALIASES[rawSlug] || rawSlug;
    const { language } = params;

    const slokha = await prisma.slokha.findUnique({
      where: { slug },
      include: { versions: true },
    });

    if (!slokha) {
      return NextResponse.json({ error: 'Slokha not found' }, { status: 404 });
    }

    const targetLang = language.toLowerCase();
    const version = slokha.versions.find((v) => v.language.toLowerCase() === targetLang);

    if (!version) {
      return NextResponse.json(
        {
          error: `Language version '${language}' is not available yet for this slokha.`,
          availableLanguages: slokha.versions.map((v) => v.language),
        },
        { status: 404 }
      );
    }

    // Parse verses
    let parsedVerses = [];
    if (version.versesJson) {
      try {
        parsedVerses = JSON.parse(version.versesJson);
      } catch (e) {
        parsedVerses = version.text.split('\n\n').map((txt, i) => ({
          verseNumber: i + 1,
          text: txt,
        }));
      }
    } else {
      parsedVerses = version.text.split('\n\n').map((txt, i) => ({
        verseNumber: i + 1,
        text: txt,
      }));
    }

    const pdfBytes = await generateSlokhaPdf({
      title: slokha.name,
      deity: slokha.deity,
      category: slokha.category,
      language: targetLang as any,
      verses: parsedVerses,
      overallMeaning: slokha.overallMeaning || undefined,
      sourceDocument: version.sourceDocument,
    });

    const filename = `${slug}-${targetLang}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBytes.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    );
  }
}
