import React from 'react';
import Link from 'next/link';
import { BookOpen, Download, ChevronRight, Sparkles } from 'lucide-react';
import { LotusIcon } from './SacredMotif';

interface SlokhaCardProps {
  slokha: {
    id: string;
    name: string;
    slug: string;
    alternativeNames?: string | null;
    deity: string;
    category: string;
    overallMeaning?: string | null;
    significance?: string | null;
    versions: Array<{
      id?: string;
      language: string;
      verificationStatus?: string;
    }>;
  };
}

export function SlokhaCard({ slokha }: SlokhaCardProps) {
  const availableLangs = slokha.versions.map((v) => v.language.toLowerCase());

  const langLabels: Record<string, { label: string; script: string; color: string }> = {
    sanskrit: { label: 'Sanskrit', script: 'संस्कृतम्', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    tamil: { label: 'Tamil', script: 'தமிழ்', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    telugu: { label: 'Telugu', script: 'తెలుగు', color: 'bg-orange-100 text-orange-900 border-orange-300' },
    english: { label: 'English', script: 'English', color: 'bg-stone-100 text-stone-800 border-stone-300' },
  };

  const hasMultipleLangs = availableLangs.length > 0;
  const primaryLang = availableLangs[0] || 'sanskrit';

  return (
    <div className="bg-[#FFFDF9] rounded-xl border border-[#E8DEC8] hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      <div className="p-5">
        {/* Category & Deity Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-semibold text-[#6E1B24] uppercase tracking-wider font-mono">
            {slokha.category}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF2E6] text-amber-900 border border-[#DACFBB] font-medium truncate max-w-[150px]">
            {slokha.deity}
          </span>
        </div>

        {/* Slokha Name */}
        <Link href={`/slokhas/${slokha.slug}`} className="block group-hover:text-[#8C2B36] transition-colors">
          <h3 className="font-serif font-bold text-lg text-[#6E1B24] leading-snug">
            {slokha.name}
          </h3>
        </Link>

        {slokha.alternativeNames && (
          <p className="text-[11px] text-stone-500 italic mt-0.5 line-clamp-1">
            Also known as: {slokha.alternativeNames}
          </p>
        )}

        {/* Meaning Excerpt */}
        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mt-2.5">
          {slokha.overallMeaning || slokha.significance || 'Sacred devotional prayer from Amrita Darshanam parayanam collection.'}
        </p>

        {/* Available Languages Pills */}
        <div className="mt-4 pt-3 border-t border-[#F2ECE1]">
          <div className="text-[11px] font-medium text-stone-500 mb-1.5 flex items-center justify-between">
            <span>Available Scripts:</span>
            {availableLangs.length === 0 && (
              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                Text in Review
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['sanskrit', 'tamil', 'telugu', 'english'].map((langKey) => {
              const isAvailable = availableLangs.includes(langKey);
              const info = langLabels[langKey];
              return (
                <span
                  key={langKey}
                  className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                    isAvailable
                      ? info.color
                      : 'bg-stone-50 text-stone-300 border-stone-200 line-through opacity-60'
                  }`}
                  title={isAvailable ? `${info.label} available` : `${info.label} not available yet`}
                >
                  {info.script}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer CTAs */}
      <div className="px-5 py-3 bg-[#FAF6EF] border-t border-[#E8DEC8] flex items-center justify-between text-xs">
        {hasMultipleLangs ? (
          <a
            href={`/api/pdf/${slokha.slug}/${primaryLang}`}
            download
            className="inline-flex items-center space-x-1.5 text-stone-600 hover:text-amber-900 transition font-medium"
            title={`Download ${langLabels[primaryLang]?.label || ''} PDF`}
          >
            <Download className="w-3.5 h-3.5 text-amber-700" />
            <span>PDF</span>
          </a>
        ) : (
          <span className="text-stone-400 text-[11px]">PDF Pending</span>
        )}

        <Link
          href={`/slokhas/${slokha.slug}`}
          className="inline-flex items-center space-x-1 font-semibold text-[#6E1B24] hover:text-[#8C2B36] group-hover:translate-x-0.5 transition"
        >
          <span>Read Prayer</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
