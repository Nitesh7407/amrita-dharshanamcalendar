import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Sparkles, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import { LotusIcon } from './SacredMotif';

interface OccasionCardProps {
  occasion: {
    id: string;
    name: string;
    slug: string;
    date: string;
    occasionType?: string;
    category?: string;
    institution?: string | null;
    region?: string | null;
    description: string;
    verificationStatus?: string;
    deities?: string | null;
    occasionSlokhas?: Array<{ id: string; slokha: { id: string; name: string } }>;
  };
  isFestival?: boolean;
}

export function OccasionCard({ occasion, isFestival = false }: OccasionCardProps) {
  // Parse date and weekday
  const dateObj = new Date(occasion.date + 'T00:00:00');
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const dayNum = dateObj.getDate();
  const year = dateObj.getFullYear();

  const isAmrita = occasion.occasionType === 'amrita_darshanam' || occasion.occasionType === 'amrita_institution';
  const detailUrl = isFestival ? `/festivals/${occasion.slug}` : `/occasions/${occasion.slug}`;

  return (
    <div className="bg-[#FFFDF9] rounded-xl border border-[#E8DEC8] hover:border-amber-400/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Top Banner / Badge */}
      <div className={`px-4 py-2 text-xs flex items-center justify-between font-medium ${
        isAmrita
          ? 'bg-[#6E1B24] text-amber-100'
          : 'bg-[#FAF2E6] text-amber-900 border-b border-[#E8DEC8]'
      }`}>
        <div className="flex items-center space-x-1.5">
          {isAmrita ? (
            <LotusIcon className="w-4 h-4 text-[#D4AF37]" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          )}
          <span className="truncate">
            {isAmrita ? (occasion.institution || 'Amrita Darshanam Occasion') : (occasion.category || 'Sacred Festival')}
          </span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
          {occasion.verificationStatus === 'verified' ? '✓ Confirmed' : 'Tentative'}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Date and Title */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div>
              <Link href={detailUrl} className="group-hover:text-[#8C2B36] transition-colors">
                <h3 className="font-serif font-bold text-lg text-[#6E1B24] leading-snug">
                  {occasion.name}
                </h3>
              </Link>
              {occasion.deities && (
                <p className="text-xs text-amber-800/80 mt-0.5 font-medium">
                  Deity: {occasion.deities}
                </p>
              )}
            </div>

            {/* Date Badge */}
            <div className="shrink-0 bg-[#F4ECE1] border border-[#DACFBB] rounded-lg px-2.5 py-1.5 text-center min-w-[54px]">
              <span className="block text-[10px] font-semibold text-amber-800 uppercase tracking-wider">{monthName}</span>
              <span className="block text-xl font-bold font-serif text-[#6E1B24] leading-none my-0.5">{dayNum}</span>
              <span className="block text-[10px] text-stone-500 font-medium">{dayName}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
            {occasion.description}
          </p>
        </div>

        {/* Footer Meta and CTA */}
        <div className="pt-3 border-t border-[#F2ECE1] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-stone-500">
            {occasion.occasionSlokhas && occasion.occasionSlokhas.length > 0 ? (
              <span className="flex items-center text-amber-900 font-medium">
                <BookOpen className="w-3.5 h-3.5 mr-1 text-amber-700" />
                {occasion.occasionSlokhas.length} Parayanam {occasion.occasionSlokhas.length === 1 ? 'Slokha' : 'Slokhas'}
              </span>
            ) : occasion.region ? (
              <span className="flex items-center text-stone-500">
                <MapPin className="w-3 h-3 mr-1" />
                {occasion.region}
              </span>
            ) : (
              <span className="text-stone-400">Sacred Rituals</span>
            )}
          </div>

          <Link
            href={detailUrl}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-[#6E1B24] hover:text-[#8C2B36] group-hover:translate-x-0.5 transition"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
