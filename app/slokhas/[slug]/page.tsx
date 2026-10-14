import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { SlokhaReader } from '@/components/SlokhaReader';
import { BookOpen, Calendar, Download, Sparkles, ChevronLeft, MapPin, Tag, Heart } from 'lucide-react';
import { LotusIcon, SacredDivider } from '@/components/SacredMotif';

export const revalidate = 60;

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

function resolveSlokhaSlug(rawSlug: string): string {
  const normalized = rawSlug.toLowerCase().trim();
  return SLUG_ALIASES[normalized] || normalized;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const targetSlug = resolveSlokhaSlug(params.slug);
  const slokha = await prisma.slokha.findUnique({
    where: { slug: targetSlug },
  });
  if (!slokha) return { title: 'Slokha Not Found' };
  return {
    title: `${slokha.name} — Text, Meaning & Multilingual PDFs | Amrita Dharma Calendar`,
    description: slokha.overallMeaning || `Read ${slokha.name} in Sanskrit, Tamil, Telugu, and English with downloadable PDFs.`,
  };
}

export default async function SlokhaDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const targetSlug = resolveSlokhaSlug(params.slug);
  const slokha = await prisma.slokha.findUnique({
    where: { slug: targetSlug },
    include: {
      versions: true,
      occasionSlokhas: {
        include: {
          occasion: true,
        },
      },
    },
  });

  if (!slokha) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-stone-500 no-print">
        <Link href="/" className="hover:text-amber-900 transition">Home</Link>
        <span>/</span>
        <Link href="/slokhas" className="hover:text-amber-900 transition">Slokha Library</Link>
        <span>/</span>
        <span className="text-[#6E1B24] font-medium truncate">{slokha.name}</span>
      </div>

      {/* Header Info Banner */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-900 uppercase font-mono">
            <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900">
              {slokha.category}
            </span>
            <span>•</span>
            <span className="text-stone-600">Deity: {slokha.deity}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-stone-500">Available:</span>
            <div className="flex items-center space-x-1">
              {slokha.versions.map((v) => (
                <span
                  key={v.language}
                  className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#FAF2E6] text-amber-900 border border-[#DACFBB]"
                >
                  {v.language}
                </span>
              ))}
            </div>
          </div>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#6E1B24] leading-tight">
          {slokha.name}
        </h1>

        {slokha.alternativeNames && (
          <p className="text-xs sm:text-sm text-stone-600 italic font-serif">
            Alternative Titles: <span className="text-stone-800 font-normal">{slokha.alternativeNames}</span>
          </p>
        )}

        {/* Origin & Traditional Background */}
        <div className="pt-3 border-t border-[#F2ECE1] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600">
          <div>
            <span className="font-semibold text-amber-900">Traditional Origin &amp; Composer:</span>
            <p className="mt-0.5">{slokha.origin || 'Traditional Vedic / Puranic Lineage'}</p>
          </div>
          <div>
            <span className="font-semibold text-amber-900">Archival Source Reference:</span>
            <p className="mt-0.5">{slokha.sourceReference || 'Amrita Darshanam Parayanam Collection'}</p>
          </div>
        </div>
      </div>

      {/* Spiritual Significance Box */}
      {slokha.significance && (
        <div className="bg-[#FAF6EF] rounded-2xl border border-[#E8DEC8] p-6 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-900 uppercase tracking-wider font-mono">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>Traditional Spiritual Significance</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            {slokha.significance}
          </p>
        </div>
      )}

      {/* Main Slokha Reader Component */}
      <SlokhaReader slokha={slokha} versions={slokha.versions} />

      {/* Associated Festivals & Occasions */}
      {slokha.occasionSlokhas.length > 0 && (
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-6 shadow-sm space-y-4 no-print">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-900 uppercase tracking-wider font-mono">
            <Calendar className="w-4 h-4 text-amber-700" />
            <span>Recited During These Festivals &amp; Occasions ({slokha.occasionSlokhas.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {slokha.occasionSlokhas.map((os) => (
              <Link
                key={os.occasion.id}
                href={
                  os.occasion.occasionType === 'traditional_festival'
                    ? `/festivals/${os.occasion.slug}`
                    : `/occasions/${os.occasion.slug}`
                }
                className="p-3 rounded-xl border border-[#E8DEC8] hover:border-amber-400 bg-[#FAF6EF] hover:bg-[#F4ECE1] transition flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-[#6E1B24] block">
                    {os.occasion.name}
                  </span>
                  <span className="text-[11px] text-stone-500 font-mono">
                    {os.occasion.date}
                  </span>
                </div>
                <span className="text-amber-800 font-medium text-[11px]">
                  View Occasion →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
