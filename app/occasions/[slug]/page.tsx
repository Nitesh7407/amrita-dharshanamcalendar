import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { PoojaChecklist } from '@/components/PoojaChecklist';
import { Calendar, BookOpen, Download, Sparkles, MapPin, CheckCircle2, ChevronLeft, ArrowRight } from 'lucide-react';
import { LotusIcon, SacredDivider } from '@/components/SacredMotif';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const occasion = await prisma.occasion.findUnique({
    where: { slug: params.slug },
  });
  if (!occasion) return { title: 'Occasion Not Found' };
  return {
    title: `${occasion.name} — Parayanam List, Checklist & Prayers | Amrita Dharma Calendar`,
    description: occasion.description,
  };
}

export default async function OccasionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const occasion = await prisma.occasion.findUnique({
    where: { slug: params.slug },
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
  });

  if (!occasion) {
    notFound();
  }

  // Parse date and weekday
  const dateObj = new Date(occasion.date + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isAmrita =
    occasion.occasionType === 'amrita_darshanam' ||
    occasion.occasionType === 'amrita_institution';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-stone-500 no-print">
        <Link href="/" className="hover:text-amber-900 transition">Home</Link>
        <span>/</span>
        <Link href="/calendar" className="hover:text-amber-900 transition">Calendar</Link>
        <span>/</span>
        <span className="text-[#6E1B24] font-medium truncate">{occasion.name}</span>
      </div>

      {/* Main Occasion Hero Card */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase font-mono">
            <span
              className={`px-2.5 py-1 rounded-md ${
                isAmrita ? 'bg-[#6E1B24] text-white' : 'bg-amber-100 text-amber-900'
              }`}
            >
              {isAmrita ? 'Amrita Darshanam Event' : 'Spiritual Occasion'}
            </span>
            <span>•</span>
            <span className="text-stone-600 font-mono">{formattedDate}</span>
          </div>

          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            ✓ Verified Schedule
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#6E1B24] leading-tight">
          {occasion.name}
        </h1>

        {occasion.institution && (
          <p className="text-sm font-semibold text-amber-900">
            {occasion.institution}
          </p>
        )}

        <p className="text-sm text-stone-700 leading-relaxed max-w-3xl pt-1">
          {occasion.description}
        </p>

        <div className="pt-3 border-t border-[#F2ECE1] flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
          <div>
            <span className="font-semibold text-amber-900">Source:</span>{' '}
            <span className="italic">{occasion.source}</span>
          </div>
          <div>
            <span className="font-semibold text-amber-900">Parayanam Collection:</span>{' '}
            <span>{occasion.occasionSlokhas.length} Slokhas Listed</span>
          </div>
        </div>
      </div>

      {/* Interactive Pooja Checklist */}
      <PoojaChecklist
        id={occasion.id}
        title={occasion.name}
        checklistJson={occasion.poojaChecklist}
      />

      {/* PARAYANAM LIST - The core reference from the Homam document */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E8DEC8]">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-900 uppercase tracking-wider font-mono">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>Official Recitation Sequence</span>
            </div>
            <h2 className="font-serif font-bold text-2xl text-[#6E1B24] mt-0.5">
              Parayanam Slokhas &amp; Stotras ({occasion.occasionSlokhas.length})
            </h2>
          </div>
          <span className="text-xs text-stone-500 italic">
            Preserved in exact document order
          </span>
        </div>

        <div className="space-y-3">
          {occasion.occasionSlokhas.map((item) => {
            const slk = item.slokha;
            const availableLangs = slk.versions.map((v) => v.language.toLowerCase());
            const hasVersions = availableLangs.length > 0;
            const defaultLang = availableLangs.includes('sanskrit')
              ? 'sanskrit'
              : availableLangs[0] || 'english';

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-[#E8DEC8] hover:border-amber-400 bg-[#FAF6EF]/60 hover:bg-[#F4ECE1] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-[#6E1B24] font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 border border-amber-300">
                    {item.sequenceOrder}
                  </div>
                  <div>
                    <Link
                      href={`/slokhas/${slk.slug}`}
                      className="font-serif font-bold text-base text-[#6E1B24] hover:text-[#8C2B36] transition flex items-center space-x-2"
                    >
                      <span>{slk.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 mt-0.5">
                      <span>Deity: {slk.deity}</span>
                      <span>•</span>
                      <span>Category: {slk.category}</span>
                      {item.notes && (
                        <>
                          <span>•</span>
                          <span className="text-amber-800 font-medium italic">
                            Note: {item.notes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Available Languages & PDF Actions */}
                <div className="flex items-center space-x-2.5 shrink-0 self-end sm:self-center">
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
                          title={isAvail ? `${langKey} available` : `${langKey} not available`}
                        >
                          {langKey.slice(0, 3)}
                        </span>
                      );
                    })}
                  </div>

                  {hasVersions ? (
                    <a
                      href={`/api/pdf/${slk.slug}/${defaultLang}`}
                      download
                      className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-[#DACFBB] shadow-xs"
                      title={`Download ${defaultLang.toUpperCase()} PDF`}
                    >
                      <Download className="w-3.5 h-3.5 text-amber-800" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-stone-400 italic">Review</span>
                  )}

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
    </div>
  );
}
