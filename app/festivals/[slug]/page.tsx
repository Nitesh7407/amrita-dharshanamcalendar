import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { PoojaChecklist } from '@/components/PoojaChecklist';
import { Calendar, BookOpen, Download, Sparkles, MapPin, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react';
import { LotusIcon, SacredDivider, TempleGopuramIcon } from '@/components/SacredMotif';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const festival = await prisma.festival.findUnique({
    where: { slug: params.slug },
  });
  if (!festival) return { title: 'Festival Not Found' };
  return {
    title: `${festival.name} (${festival.year}) — Date, Significance, Pooja & Slokhas | Amrita Dharma Calendar`,
    description: festival.description,
  };
}

export default async function FestivalDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const festival = await prisma.festival.findUnique({
    where: { slug: params.slug },
    include: {
      festivalOccasions: {
        include: {
          occasion: {
            include: {
              occasionSlokhas: {
                orderBy: { sequenceOrder: 'asc' },
                include: {
                  slokha: {
                    include: {
                      versions: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!festival) {
    notFound();
  }

  // Parse date and weekday
  const dateObj = new Date(festival.date + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Extract linked slokhas
  const linkedSlokhas =
    festival.festivalOccasions[0]?.occasion?.occasionSlokhas || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-stone-500 no-print">
        <Link href="/" className="hover:text-amber-900 transition">Home</Link>
        <span>/</span>
        <Link href="/calendar" className="hover:text-amber-900 transition">Festival Calendar</Link>
        <span>/</span>
        <span className="text-[#6E1B24] font-medium truncate">{festival.name}</span>
      </div>

      {/* Main Hero Card */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase font-mono">
            <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900">
              {festival.category}
            </span>
            <span>•</span>
            <span className="text-stone-600 font-mono">{formattedDate}</span>
          </div>

          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            ✓ Confirmed Panchanga Date
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#6E1B24] leading-tight">
          {festival.name} ({festival.year})
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 font-medium">
          {festival.deities && (
            <div className="flex items-center space-x-1.5 text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Deity: {festival.deities}</span>
            </div>
          )}
          {festival.region && (
            <div className="flex items-center space-x-1.5 text-stone-600">
              <MapPin className="w-3.5 h-3.5 text-amber-700" />
              <span>Region: {festival.region}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-stone-700 leading-relaxed pt-1">
          {festival.description}
        </p>

        {festival.significance && (
          <div className="p-4 rounded-xl bg-[#FAF6EF] border border-[#E8DEC8] text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
            <span className="font-semibold text-amber-900 block mb-1 font-mono uppercase text-xs">
              Spiritual &amp; Cultural Significance:
            </span>
            {festival.significance}
          </div>
        )}

        <div className="pt-3 border-t border-[#F2ECE1] flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
          <div>
            <span className="font-semibold text-amber-900">Astronomical Source:</span>{' '}
            <span className="italic">{festival.source}</span>
          </div>
          <div>
            <span className="font-semibold text-amber-900">Pooja Slokhas:</span>{' '}
            <span>{linkedSlokhas.length} Recommended Prayers</span>
          </div>
        </div>
      </div>

      {/* Interactive Pooja Checklist */}
      <PoojaChecklist
        id={festival.id}
        title={festival.name}
        checklistJson={festival.poojaChecklist}
      />

      {/* Associated Slokhas for Festival */}
      {linkedSlokhas.length > 0 && (
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-amber-900 uppercase tracking-wider font-mono">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>Recommended Pooja Prayers</span>
              </div>
              <h2 className="font-serif font-bold text-2xl text-[#6E1B24] mt-0.5">
                Slokhas for {festival.name}
              </h2>
            </div>
            <span className="text-xs text-stone-500 font-mono">
              {linkedSlokhas.length} Slokhas
            </span>
          </div>

          <div className="space-y-3">
            {linkedSlokhas.map((item) => {
              const slk = item.slokha;
              const availableLangs = slk.versions.map((v) => v.language.toLowerCase());
              const defaultLang = availableLangs.includes('sanskrit')
                ? 'sanskrit'
                : availableLangs[0] || 'english';

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-[#E8DEC8] hover:border-amber-400 bg-[#FAF6EF]/60 hover:bg-[#F4ECE1] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div>
                    <Link
                      href={`/slokhas/${slk.slug}`}
                      className="font-serif font-bold text-base text-[#6E1B24] hover:text-[#8C2B36] transition flex items-center space-x-2"
                    >
                      <span>{slk.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <div className="flex items-center space-x-2 text-xs text-stone-500 mt-0.5">
                      <span>Deity: {slk.deity}</span>
                      <span>•</span>
                      <span>Category: {slk.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="flex items-center space-x-1">
                      {['sanskrit', 'tamil', 'telugu', 'english'].map((langKey) => {
                        const isAvail = availableLangs.includes(langKey);
                        return (
                          <span
                            key={langKey}
                            className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                              isAvail
                                ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                                : 'bg-stone-100 text-stone-300 line-through'
                            }`}
                          >
                            {langKey.slice(0, 3)}
                          </span>
                        );
                      })}
                    </div>

                    <a
                      href={`/api/pdf/${slk.slug}/${defaultLang}`}
                      download
                      className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-[#DACFBB] shadow-xs"
                      title={`Download ${defaultLang.toUpperCase()} PDF`}
                    >
                      <Download className="w-3.5 h-3.5 text-amber-800" />
                    </a>

                    <Link
                      href={`/slokhas/${slk.slug}`}
                      className="px-3 py-1.5 bg-[#6E1B24] hover:bg-[#8C2B36] text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                      Read
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
