import React from 'react';
import prisma from '@/lib/prisma';
import { CalendarView } from '@/components/CalendarView';
import { LotusIcon, SacredDivider } from '@/components/SacredMotif';

export const revalidate = 60;

export default async function CalendarPage() {
  const [occasions, festivals] = await Promise.all([
    prisma.occasion.findMany({
      orderBy: { date: 'asc' },
      include: {
        occasionSlokhas: {
          orderBy: { sequenceOrder: 'asc' },
          include: {
            slokha: {
              include: {
                versions: {
                  select: { language: true },
                },
              },
            },
          },
        },
      },
    }),
    prisma.festival.findMany({
      orderBy: { date: 'asc' },
      include: {
        festivalOccasions: {
          include: {
            occasion: {
              include: {
                occasionSlokhas: {
                  include: {
                    slokha: {
                      include: {
                        versions: {
                          select: { language: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  // Combine occasions and festivals into uniform structure
  const formattedOccasions = [
    ...occasions.map((occ) => ({
      id: occ.id,
      name: occ.name,
      slug: occ.slug,
      date: occ.date,
      year: occ.year,
      occasionType: occ.occasionType,
      category:
        occ.occasionType === 'amrita_darshanam'
          ? 'Amrita Darshanam'
          : occ.occasionType === 'amrita_institution'
          ? 'Amrita Institution'
          : 'Traditional Observance',
      institution: occ.institution,
      description: occ.description,
      verificationStatus: occ.verificationStatus,
      poojaChecklist: occ.poojaChecklist,
      source: occ.source,
      occasionSlokhas: occ.occasionSlokhas.map((os) => ({
        sequenceOrder: os.sequenceOrder,
        slokha: {
          id: os.slokha.id,
          name: os.slokha.name,
          slug: os.slokha.slug,
          deity: os.slokha.deity,
          category: os.slokha.category,
          versions: os.slokha.versions,
        },
      })),
    })),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-amber-900 uppercase tracking-wider font-mono">
          <LotusIcon className="w-4 h-4 text-amber-700" />
          <span>Sacred Hindu &amp; Amrita Darshanam Observances</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#6E1B24]">
          Interactive Festival &amp; Parayanam Calendar
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-3xl leading-relaxed">
          Explore annual Hindu festivals, regional traditions, and official Amrita Darshanam campus spiritual occasions. Click any date or occasion to view recommended parayanam slokhas, checklists, and working PDF downloads.
        </p>
      </div>

      {/* Calendar Interactive Component */}
      <CalendarView
        initialYear={2026}
        initialMonth={7} // Centers on July 2026 (Month of Sri Mahaganapathi Homam)
        occasions={formattedOccasions}
      />
    </div>
  );
}
