import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Calendar, BookOpen, Download, Sparkles, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import { LotusIcon, SacredDivider, TempleGopuramIcon } from '@/components/SacredMotif';
import { OccasionCard } from '@/components/OccasionCard';
import { SlokhaCard } from '@/components/SlokhaCard';

export const revalidate = 60; // ISR revalidate every 60s

export default async function HomePage() {
  // Query actual database records
  const [upcomingFestivals, upcomingOccasions, featuredSlokhas, totalSlokhas, totalFestivals] =
    await Promise.all([
      prisma.festival.findMany({
        orderBy: { date: 'asc' },
        take: 3,
        include: {
          festivalOccasions: {
            include: {
              occasion: {
                include: {
                  occasionSlokhas: {
                    include: { slokha: true },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.occasion.findMany({
        where: {
          occasionType: { in: ['amrita_darshanam', 'amrita_institution'] },
        },
        orderBy: { date: 'asc' },
        take: 3,
        include: {
          occasionSlokhas: {
            include: { slokha: true },
          },
        },
      }),
      prisma.slokha.findMany({
        where: { isFeatured: true },
        take: 6,
        orderBy: { sequenceOrder: 'asc' },
        include: {
          versions: true,
        },
      }),
      prisma.slokha.count(),
      prisma.festival.count(),
    ]);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF2E6] via-[#FAF6EF] to-[#FAF6EF] border-b border-[#E8DEC8] pt-12 pb-20">
        {/* Subtle decorative radial accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-200/20 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#DACFBB] shadow-xs text-xs font-semibold text-[#6E1B24]">
            <LotusIcon className="w-4 h-4 text-[#D4AF37]" />
            <span>Department of Amrita Darshanam • Amrita Vishwa Vidyapeetham</span>
          </div>

          {/* Main Headings */}
          <div className="space-y-3 max-w-4xl mx-auto">
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#6E1B24] tracking-tight leading-[1.15]">
              Amrita Dharma Calendar <br className="hidden sm:inline" />
              <span className="text-amber-800 font-normal italic font-serif text-2xl sm:text-4xl block mt-2">
                &amp; Multilingual Slokha Library
              </span>
            </h1>
            <p className="text-stone-700 text-base sm:text-lg max-w-2xl mx-auto font-serif italic pt-1 text-[#8C6D53]">
              Discover sacred occasions. Explore ancient wisdom. Celebrate with devotion.
            </p>
          </div>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
            A comprehensive spiritual portal guiding students, faculty, devotees, and families through authentic Hindu festivals, Amrita Darshanam spiritual occasions, and required parayanam slokhas in Sanskrit, Tamil, Telugu, and English.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/calendar"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-[#6E1B24] hover:bg-[#8C2B36] text-white shadow-md hover:shadow-lg transition-all flex items-center space-x-2 group"
            >
              <Calendar className="w-4 h-4 text-amber-200" />
              <span>Explore Calendar</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/slokhas"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-white hover:bg-stone-50 text-[#6E1B24] border border-[#DACFBB] shadow-xs hover:shadow-sm transition-all flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>Browse Slokhas ({totalSlokhas})</span>
            </Link>

            <Link
              href="/downloads"
              className="px-5 py-3.5 rounded-xl font-medium text-xs text-stone-700 hover:text-amber-950 bg-[#F4ECE1] hover:bg-[#EAE0D1] border border-[#DACFBB] transition flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4 text-amber-800" />
              <span>Download PDFs</span>
            </Link>
          </div>

          <SacredDivider className="pt-8" />
        </div>
      </section>

      {/* 2. QUICK ACCESS SHORTCUTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-6 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-amber-900 font-mono mb-4">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>Quick Access Portals</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: "Today's Occasion", href: "/calendar", icon: "🗓️" },
              { label: "This Month's Festivals", href: "/calendar", icon: "✨" },
              { label: "Downloadable PDFs", href: "/downloads", icon: "📜" },
              { label: "Tamil Slokhas", href: "/slokhas?lang=tamil", icon: "தமிழ்" },
              { label: "Sanskrit Slokhas", href: "/slokhas?lang=sanskrit", icon: "संस्कृतम्" },
              { label: "Telugu Slokhas", href: "/slokhas?lang=telugu", icon: "తెలుగు" },
              { label: "English Meanings", href: "/slokhas?lang=english", icon: "ENG" },
            ].map((shortcut) => (
              <Link
                key={shortcut.label}
                href={shortcut.href}
                className="flex flex-col items-center justify-center text-center p-3.5 rounded-xl bg-[#FAF6EF] hover:bg-[#F4ECE1] border border-[#E8DEC8] hover:border-amber-400 transition group"
              >
                <span className="text-xl sm:text-2xl mb-1.5 font-serif font-bold text-[#6E1B24] group-hover:scale-110 transition-transform">
                  {shortcut.icon}
                </span>
                <span className="text-xs font-semibold text-stone-700 group-hover:text-[#6E1B24] transition leading-tight">
                  {shortcut.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. AMRITA DARSHANAM & INSTITUTIONAL OCCASIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-[#E8DEC8]">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-900 uppercase tracking-wider font-mono">
              <LotusIcon className="w-4 h-4 text-amber-700" />
              <span>Spiritual &amp; Campus Observances</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#6E1B24] mt-1">
              Amrita Darshanam Spiritual Occasions
            </h2>
          </div>
          <Link
            href="/calendar"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-[#6E1B24] hover:text-[#8C2B36] group"
          >
            <span>View All Institutional Events</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingOccasions.map((occ) => (
            <OccasionCard key={occ.id} occasion={occ} />
          ))}
        </div>
      </section>

      {/* 4. UPCOMING HINDU FESTIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-[#E8DEC8]">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-900 uppercase tracking-wider font-mono">
              <TempleGopuramIcon className="w-4 h-4 text-amber-700" />
              <span>Vedic &amp; Regional Heritage</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#6E1B24] mt-1">
              Upcoming Hindu Festivals ({totalFestivals})
            </h2>
          </div>
          <Link
            href="/calendar"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-[#6E1B24] hover:text-[#8C2B36] group"
          >
            <span>Open Interactive Calendar</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingFestivals.map((fest) => (
            <OccasionCard key={fest.id} occasion={fest} isFestival={true} />
          ))}
        </div>
      </section>

      {/* 5. FEATURED SLOKHAS FROM THE SACRED ARCHIVE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-[#E8DEC8]">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-900 uppercase tracking-wider font-mono">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>Authentic Prayers &amp; Stotras</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#6E1B24] mt-1">
              Featured Slokhas for Daily &amp; Pooja Recitation
            </h2>
          </div>
          <Link
            href="/slokhas"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-[#6E1B24] hover:text-[#8C2B36] group"
          >
            <span>Explore All {totalSlokhas} Slokhas</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredSlokhas.map((slokha) => (
            <SlokhaCard key={slokha.id} slokha={slokha} />
          ))}
        </div>
      </section>

      {/* 6. AMRITA DARSHANAM SPOTLIGHT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#6E1B24] to-[#4A0E15] rounded-3xl text-white p-8 sm:p-12 shadow-xl border-2 border-[#D4AF37]/50 relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="text-xs uppercase font-mono tracking-widest text-amber-300">
              Department of Amrita Darshanam • Chennai Campus
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#FDFCF7]">
              Preserving Indian Spiritual Wisdom for Modern Education
            </h2>
            <p className="text-stone-200 text-sm sm:text-base leading-relaxed">
              Amrita Darshanam (International Centre for Spiritual Studies) bridges traditional Indian philosophy, classical languages, Vedic literature, and values-based holistic education for students, scholars, and spiritual seekers.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/occasions/sri-mahaganapathi-homam-2026"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#D4AF37] hover:bg-[#E5C76B] text-black shadow-sm transition"
              >
                Read Mahaganapathi Homam Parayanam →
              </Link>
              <Link
                href="/about"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-white/40 hover:bg-white/10 text-white transition"
              >
                About Department Vision
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
