import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Download, BookOpen, CheckCircle, FileText, Sparkles, Filter } from 'lucide-react';
import { LotusIcon, SacredDivider } from '@/components/SacredMotif';

export const revalidate = 60;

export default async function DownloadsPage({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const selectedLang = searchParams.lang?.toLowerCase();

  const slokhas = await prisma.slokha.findMany({
    orderBy: { sequenceOrder: 'asc' },
    include: {
      versions: true,
    },
  });

  // Calculate total downloadable files
  const totalVersions = slokhas.reduce((sum, s) => sum + s.versions.length, 0);

  // Filter if language is selected
  const filteredSlokhas = slokhas.filter((s) => {
    if (!selectedLang) return s.versions.length > 0;
    return s.versions.some((v) => v.language.toLowerCase() === selectedLang);
  });

  const langNames: Record<string, string> = {
    sanskrit: 'संस्कृतम् (Sanskrit)',
    tamil: 'தமிழ் (Tamil)',
    telugu: 'తెలుగు (Telugu)',
    english: 'English Transliteration',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-amber-900 uppercase tracking-wider font-mono">
          <Download className="w-4 h-4 text-amber-700" />
          <span>Multilingual PDF Archive</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#6E1B24]">
          Download Sacred Slokha &amp; Pooja PDFs
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-3xl leading-relaxed">
          Download genuine, printable PDF prayer booklets formatted with sacred borders, verse numbers, and authentic Unicode fonts in Sanskrit (Devanagari), Tamil, Telugu, and English.
        </p>
      </div>

      {/* Language Filter Bar */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-amber-900 mr-1 font-mono uppercase">Language:</span>
          <Link
            href="/downloads"
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              !selectedLang
                ? 'bg-[#6E1B24] text-white shadow-xs font-semibold'
                : 'bg-[#FAF6EF] text-stone-700 hover:bg-[#F2ECE1] border border-[#E8DEC8]'
            }`}
          >
            All Languages ({totalVersions} PDFs)
          </Link>
          {['sanskrit', 'tamil', 'telugu', 'english'].map((langKey) => {
            const isSelected = selectedLang === langKey;
            const count = slokhas.filter((s) =>
              s.versions.some((v) => v.language.toLowerCase() === langKey)
            ).length;
            return (
              <Link
                key={langKey}
                href={`/downloads?lang=${langKey}`}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  isSelected
                    ? 'bg-[#D4AF37] text-stone-950 shadow-xs font-bold'
                    : 'bg-[#FAF6EF] text-stone-700 hover:bg-[#F2ECE1] border border-[#E8DEC8]'
                }`}
              >
                {langNames[langKey]} ({count})
              </Link>
            );
          })}
        </div>

        <div className="text-xs text-stone-500 font-mono">
          <span>{filteredSlokhas.length} Slokha Titles</span>
        </div>
      </div>

      {/* Downloads Table / Grid */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] shadow-sm overflow-hidden">
        <div className="divide-y divide-[#E8DEC8]">
          {filteredSlokhas.map((slk) => {
            const available = slk.versions.map((v) => v.language.toLowerCase());
            return (
              <div
                key={slk.id}
                className="p-5 hover:bg-[#FAF6EF]/60 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-mono text-amber-800 font-bold uppercase text-[11px] bg-amber-100 px-2 py-0.5 rounded">
                      {slk.category}
                    </span>
                    <span className="text-stone-500">Deity: {slk.deity}</span>
                  </div>
                  <Link
                    href={`/slokhas/${slk.slug}`}
                    className="font-serif font-bold text-lg text-[#6E1B24] hover:text-[#8C2B36] transition block"
                  >
                    {slk.name}
                  </Link>
                  <p className="text-xs text-stone-500 line-clamp-1 max-w-xl">
                    {slk.overallMeaning || slk.significance}
                  </p>
                </div>

                {/* PDF Download Buttons for this Slokha */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {['sanskrit', 'tamil', 'telugu', 'english'].map((langKey) => {
                    const isAvail = available.includes(langKey);
                    if (!isAvail) return null;
                    return (
                      <a
                        key={langKey}
                        href={`/api/pdf/${slk.slug}/${langKey}`}
                        download
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#DACFBB] hover:border-amber-500 text-stone-800 hover:text-[#6E1B24] shadow-xs transition group"
                        title={`Download ${langNames[langKey]} PDF`}
                      >
                        <Download className="w-3.5 h-3.5 text-amber-700 group-hover:scale-110 transition-transform" />
                        <span className="uppercase font-mono text-[11px]">{langKey.slice(0, 3)}</span>
                      </a>
                    );
                  })}
                  <Link
                    href={`/slokhas/${slk.slug}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#6E1B24] hover:bg-amber-100/60 transition"
                  >
                    Read Text →
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
