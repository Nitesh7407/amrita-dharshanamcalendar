import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { SlokhaCard } from '@/components/SlokhaCard';
import { BookOpen, Filter, Search, RotateCcw } from 'lucide-react';
import { LotusIcon } from '@/components/SacredMotif';

export const revalidate = 60;

export default async function SlokhasLibraryPage({
  searchParams,
}: {
  searchParams: { category?: string; lang?: string; q?: string; sort?: string };
}) {
  const { category, lang, q, sort } = searchParams;

  // Build where clause
  const where: any = {};

  if (category) {
    where.category = category;
  }

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { alternativeNames: { contains: q } },
      { deity: { contains: q } },
      { category: { contains: q } },
      { overallMeaning: { contains: q } },
    ];
  }

  if (lang) {
    where.versions = {
      some: {
        language: lang.toLowerCase(),
      },
    };
  }

  // Sorting
  const orderBy: any = sort === 'name' ? { name: 'asc' } : { sequenceOrder: 'asc' };

  const [slokhas, allCategories] = await Promise.all([
    prisma.slokha.findMany({
      where,
      orderBy,
      include: {
        versions: true,
      },
    }),
    prisma.slokha.findMany({
      select: { category: true },
      distinct: ['category'],
    }),
  ]);

  const categories = allCategories.map((c) => c.category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-amber-900 uppercase tracking-wider font-mono">
          <BookOpen className="w-4 h-4 text-amber-700" />
          <span>Multilingual Spiritual Archive</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#6E1B24]">
          Sacred Slokha &amp; Stotram Library
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-3xl leading-relaxed">
          Search and filter classical Sanskrit, Tamil, Telugu, and English prayer texts from the Amrita Darshanam collection. Each prayer is stored faithfully with verse-by-verse presentations and working PDF downloads.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-5 shadow-sm space-y-4">
        {/* Search bar & Sort */}
        <form method="GET" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={q || ''}
              placeholder="Search by slokha title, deity (e.g. Shiva, Ganesha, Amma), or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DACFBB] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
            />
          </div>

          {/* Preserve existing filters in form */}
          {category && <input type="hidden" name="category" value={category} />}
          {lang && <input type="hidden" name="lang" value={lang} />}

          <select
            name="sort"
            defaultValue={sort || 'order'}
            className="px-3 py-2.5 rounded-xl border border-[#DACFBB] bg-white text-xs font-medium text-stone-700 focus:outline-none"
          >
            <option value="order">Parayanam Order</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#6E1B24] hover:bg-[#8C2B36] text-white rounded-xl text-xs font-semibold transition"
          >
            Apply Search
          </button>

          {(category || lang || q || sort) && (
            <Link
              href="/slokhas"
              className="px-4 py-2.5 border border-stone-300 hover:bg-stone-100 rounded-xl text-xs font-medium text-stone-600 flex items-center justify-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Link>
          )}
        </form>

        {/* Category Pills */}
        <div className="space-y-2 pt-2 border-t border-[#F2ECE1]">
          <div className="flex items-center space-x-2 text-xs font-semibold text-stone-500 uppercase font-mono">
            <Filter className="w-3 h-3 text-amber-700" />
            <span>Filter by Category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/slokhas?${new URLSearchParams({ ...(lang ? { lang } : {}), ...(q ? { q } : {}) }).toString()}`}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                !category
                  ? 'bg-[#6E1B24] text-white shadow-xs font-semibold'
                  : 'bg-[#FAF6EF] text-stone-700 hover:bg-[#F2ECE1] border border-[#E8DEC8]'
              }`}
            >
              All Categories
            </Link>
            {categories.map((cat) => {
              const isSelected = category === cat;
              const params = new URLSearchParams({
                category: cat,
                ...(lang ? { lang } : {}),
                ...(q ? { q } : {}),
              });
              return (
                <Link
                  key={cat}
                  href={`/slokhas?${params.toString()}`}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    isSelected
                      ? 'bg-[#6E1B24] text-white shadow-xs font-semibold'
                      : 'bg-[#FAF6EF] text-stone-700 hover:bg-[#F2ECE1] border border-[#E8DEC8]'
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Language Pills */}
        <div className="space-y-2 pt-2 border-t border-[#F2ECE1]">
          <div className="flex items-center space-x-2 text-xs font-semibold text-stone-500 uppercase font-mono">
            <span>Filter by Language:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: '', label: 'All Languages' },
              { key: 'sanskrit', label: 'संस्कृतम् (Sanskrit)' },
              { key: 'tamil', label: 'தமிழ் (Tamil)' },
              { key: 'telugu', label: 'తెలుగు (Telugu)' },
              { key: 'english', label: 'English Transliteration' },
            ].map((l) => {
              const isSelected = (lang || '') === l.key;
              const params = new URLSearchParams({
                ...(category ? { category } : {}),
                ...(l.key ? { lang: l.key } : {}),
                ...(q ? { q } : {}),
              });
              return (
                <Link
                  key={l.key}
                  href={`/slokhas?${params.toString()}`}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    isSelected
                      ? 'bg-[#D4AF37] text-stone-950 shadow-xs font-bold'
                      : 'bg-[#FAF6EF] text-stone-700 hover:bg-[#F2ECE1] border border-[#E8DEC8]'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slokha Cards Grid */}
      {slokhas.length === 0 ? (
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-12 text-center space-y-4">
          <BookOpen className="w-12 h-12 mx-auto text-amber-700/50" />
          <h3 className="font-serif font-bold text-lg text-stone-700">No slokhas match your criteria</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Try adjusting your search keywords, clearing category filters, or switching language selections.
          </p>
          <Link
            href="/slokhas"
            className="inline-block px-4 py-2 bg-[#6E1B24] text-white text-xs font-semibold rounded-xl"
          >
            Clear All Filters
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-stone-500 flex justify-between items-center px-1">
            <span>Showing {slokhas.length} sacred prayers</span>
            <span className="font-mono text-[11px]">Database Source Verified</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slokhas.map((slokha) => (
              <SlokhaCard key={slokha.id} slokha={slokha} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
