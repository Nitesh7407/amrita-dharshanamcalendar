'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
  MapPin,
  BookOpen,
  Download,
  Filter,
  CheckCircle,
  X,
  List,
  Grid3X3,
  Columns
} from 'lucide-react';
import { LotusIcon } from './SacredMotif';

interface CalendarOccasion {
  id: string;
  name: string;
  slug: string;
  date: string; // YYYY-MM-DD
  year: number;
  occasionType: string;
  category?: string;
  institution?: string | null;
  region?: string | null;
  description: string;
  verificationStatus: string;
  deities?: string | null;
  significance?: string | null;
  poojaChecklist?: string | null;
  source: string;
  occasionSlokhas?: Array<{
    sequenceOrder: number;
    slokha: {
      id: string;
      name: string;
      slug: string;
      deity: string;
      category: string;
      versions: Array<{ language: string }>;
    };
  }>;
}

interface CalendarViewProps {
  initialYear?: number;
  initialMonth?: number; // 1-12
  occasions: CalendarOccasion[];
}

export function CalendarView({
  initialYear = 2026,
  initialMonth = 7, // July 2026 (Month of Mahaganapathi Homam)
  occasions,
}: CalendarViewProps) {
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth); // 1-indexed (1 = Jan)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [selectedOccasion, setSelectedOccasion] = useState<CalendarOccasion | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'amrita' | 'hindu'>('all');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Navigate months
  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    // Default to current year or 2026
    setCurrentYear(2026);
    setCurrentMonth(7);
  };

  // Filter occasions by type
  const filteredOccasions = useMemo(() => {
    return occasions.filter((occ) => {
      if (filterType === 'amrita') {
        return occ.occasionType === 'amrita_darshanam' || occ.occasionType === 'amrita_institution';
      }
      if (filterType === 'hindu') {
        return occ.occasionType === 'traditional_festival' || occ.category?.includes('Hindu');
      }
      return true;
    });
  }, [occasions, filterType]);

  // Map occasions by date string YYYY-MM-DD
  const occasionsByDate = useMemo(() => {
    const map = new Map<string, CalendarOccasion[]>();
    filteredOccasions.forEach((occ) => {
      const list = map.get(occ.date) || [];
      list.push(occ);
      map.set(occ.date, list);
    });
    return map;
  }, [filteredOccasions]);

  // Days in month calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = Sun
  const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();

  // Grid cells for month view (total 35 or 42 cells)
  const calendarDays = useMemo(() => {
    const cells = [];
    // Previous month filler days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevY = currentMonth === 1 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        occasions: occasionsByDate.get(dateStr) || [],
      });
    }
    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        occasions: occasionsByDate.get(dateStr) || [],
      });
    }
    // Next month filler days to complete grid (42 cells = 6 rows)
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextY = currentMonth === 12 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        occasions: occasionsByDate.get(dateStr) || [],
      });
    }
    return cells;
  }, [currentYear, currentMonth, firstDayOfMonth, daysInCurrentMonth, daysInPrevMonth, occasionsByDate]);

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Month & Year Navigation */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-[#F4ECE1] border border-[#DACFBB] rounded-xl p-1">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-white text-stone-700 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-white text-stone-700 transition"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <h2 className="font-serif font-bold text-2xl text-[#6E1B24] tracking-tight min-w-[200px]">
            {monthNames[currentMonth - 1]} {currentYear}
          </h2>

          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-[#F4ECE1] hover:bg-[#EAE0D1] border border-[#DACFBB] rounded-lg transition"
          >
            Today / July &apos;26
          </button>
        </div>

        {/* Filters & View Switchers */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter Type */}
          <div className="flex items-center bg-[#F4ECE1] border border-[#DACFBB] rounded-xl p-1 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                filterType === 'all' ? 'bg-[#6E1B24] text-white shadow-xs font-semibold' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              All Occasions
            </button>
            <button
              onClick={() => setFilterType('hindu')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                filterType === 'hindu' ? 'bg-[#6E1B24] text-white shadow-xs font-semibold' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Hindu Festivals
            </button>
            <button
              onClick={() => setFilterType('amrita')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                filterType === 'amrita' ? 'bg-[#6E1B24] text-white shadow-xs font-semibold' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Amrita Darshanam
            </button>
          </div>

          {/* View Mode */}
          <div className="flex items-center bg-[#F4ECE1] border border-[#DACFBB] rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'month' ? 'bg-white text-[#6E1B24] shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Month View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list' ? 'bg-white text-[#6E1B24] shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Agenda List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW: MONTH GRID */}
      {viewMode === 'month' && (
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] shadow-sm overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-[#E8DEC8] bg-[#FAF6EF] text-center text-xs font-semibold text-amber-950 uppercase tracking-wider py-2.5">
            <div className="text-rose-800">Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div className="text-amber-800">Sat</div>
          </div>

          {/* 7 Columns Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#E8DEC8]">
            {calendarDays.map((cell, idx) => {
              const hasOccasions = cell.occasions.length > 0;
              return (
                <div
                  key={idx}
                  className={`min-h-[105px] sm:min-h-[125px] p-1.5 sm:p-2 transition flex flex-col justify-between ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-[#FAF7F2] opacity-50'
                  } ${hasOccasions ? 'hover:bg-amber-50/50 cursor-pointer' : ''}`}
                  onClick={() => {
                    if (hasOccasions) setSelectedOccasion(cell.occasions[0]);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-mono rounded-full w-6 h-6 flex items-center justify-center ${
                        cell.isCurrentMonth ? 'text-stone-800' : 'text-stone-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {hasOccasions && (
                      <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                    )}
                  </div>

                  {/* Occasions in this day */}
                  <div className="space-y-1 mt-1 flex-1">
                    {cell.occasions.map((occ) => {
                      const isAmrita =
                        occ.occasionType === 'amrita_darshanam' ||
                        occ.occasionType === 'amrita_institution';
                      return (
                        <button
                          key={occ.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOccasion(occ);
                          }}
                          className={`w-full text-left px-1.5 py-1 rounded text-[11px] leading-tight font-medium truncate border block transition ${
                            isAmrita
                              ? 'bg-[#6E1B24] text-white border-[#6E1B24] hover:bg-[#8C2B36]'
                              : 'bg-amber-100/90 text-amber-950 border-amber-300 hover:bg-amber-200'
                          }`}
                        >
                          <span className="truncate block">
                            {isAmrita ? '★ ' : '✦ '}
                            {occ.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: AGENDA / LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
            <h3 className="font-serif font-bold text-lg text-[#6E1B24]">
              Chronological Occasion Agenda ({filteredOccasions.length} Occasions)
            </h3>
            <span className="text-xs text-stone-500 font-mono">Sorted by Date</span>
          </div>

          <div className="space-y-3">
            {filteredOccasions.map((occ) => {
              const isAmrita =
                occ.occasionType === 'amrita_darshanam' ||
                occ.occasionType === 'amrita_institution';
              const dateObj = new Date(occ.date + 'T00:00:00');
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <div
                  key={occ.id}
                  onClick={() => setSelectedOccasion(occ)}
                  className="p-4 rounded-xl border border-[#E8DEC8] hover:border-amber-400 bg-white hover:bg-amber-50/40 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                          isAmrita
                            ? 'bg-[#6E1B24] text-white'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {isAmrita ? 'Amrita Darshanam' : occ.category || 'Hindu Festival'}
                      </span>
                      <span className="text-xs text-stone-500 font-mono">
                        {formattedDate}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-base text-[#6E1B24] group-hover:text-[#8C2B36] transition">
                      {occ.name}
                    </h4>
                    <p className="text-xs text-stone-600 line-clamp-1 max-w-2xl">
                      {occ.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {occ.occasionSlokhas && occ.occasionSlokhas.length > 0 && (
                      <span className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md flex items-center space-x-1">
                        <BookOpen className="w-3 h-3" />
                        <span>{occ.occasionSlokhas.length} Slokhas</span>
                      </span>
                    )}
                    <button className="px-3 py-1.5 text-xs font-semibold bg-[#FAF2E6] hover:bg-[#F2ECE1] text-[#6E1B24] border border-[#DACFBB] rounded-lg">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAIL SLIDE-OVER MODAL / DRAWER */}
      {selectedOccasion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="bg-[#6E1B24] text-white p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 text-xs text-amber-200 uppercase font-mono mb-1">
                  <span>
                    {selectedOccasion.occasionType === 'amrita_darshanam' ||
                    selectedOccasion.occasionType === 'amrita_institution'
                      ? 'Amrita Institutional Occasion'
                      : selectedOccasion.category || 'Sacred Festival'}
                  </span>
                  <span>•</span>
                  <span>{selectedOccasion.date}</span>
                </div>
                <h3 className="font-serif font-bold text-2xl text-[#FDFCF7]">
                  {selectedOccasion.name}
                </h3>
                {selectedOccasion.institution && (
                  <p className="text-xs text-amber-200/90 mt-1">
                    {selectedOccasion.institution}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedOccasion(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Significance & Description */}
              <div>
                <h4 className="text-xs font-semibold text-amber-900 uppercase tracking-wider mb-2 font-mono">
                  Significance & Cultural Background
                </h4>
                <p className="text-sm text-stone-700 leading-relaxed bg-[#FAF6EF] p-4 rounded-xl border border-[#E8DEC8]">
                  {selectedOccasion.description}
                </p>
              </div>

              {/* Deities & Traditions */}
              {selectedOccasion.deities && (
                <div className="text-xs flex items-center space-x-2 text-stone-600">
                  <span className="font-semibold text-amber-900">Associated Deity / Tradition:</span>
                  <span>{selectedOccasion.deities}</span>
                </div>
              )}

              {/* Suggested Pooja & Parayanam Materials */}
              {selectedOccasion.occasionSlokhas && selectedOccasion.occasionSlokhas.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-amber-900 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                      <span>
                        Parayanam Prayers & Slokhas ({selectedOccasion.occasionSlokhas.length})
                      </span>
                    </h4>
                    <span className="text-[11px] text-stone-500">Official Sequence</span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedOccasion.occasionSlokhas.map((item) => (
                      <div
                        key={item.sequenceOrder}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-[#E8DEC8] hover:border-amber-400 bg-white text-xs transition"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                            {item.sequenceOrder}
                          </span>
                          <span className="font-medium text-[#6E1B24]">
                            {item.slokha.name}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {item.slokha.versions.map((v) => (
                              <span
                                key={v.language}
                                className="text-[9px] uppercase px-1 py-0.2 bg-stone-100 text-stone-600 rounded font-mono"
                              >
                                {v.language.slice(0, 3)}
                              </span>
                            ))}
                          </div>
                          <Link
                            href={`/slokhas/${item.slokha.slug}`}
                            className="text-amber-800 hover:text-[#6E1B24] font-medium"
                          >
                            Read →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* References & Verification */}
              <div className="p-3 bg-[#FAF6EF] rounded-xl border border-[#E8DEC8] text-xs text-stone-600 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-amber-900">Source:</span>{' '}
                  <span className="italic">{selectedOccasion.source}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium text-[11px]">
                  ✓ Verified Calendar Record
                </span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-[#FAF6EF] border-t border-[#E8DEC8] flex items-center justify-between">
              <Link
                href={
                  selectedOccasion.occasionType === 'traditional_festival'
                    ? `/festivals/${selectedOccasion.slug}`
                    : `/occasions/${selectedOccasion.slug}`
                }
                className="px-4 py-2 bg-[#6E1B24] hover:bg-[#8C2B36] text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                Open Full Dedicated Page →
              </Link>
              <button
                onClick={() => setSelectedOccasion(null)}
                className="px-4 py-2 border border-[#DACFBB] text-stone-700 hover:bg-stone-200/50 rounded-xl text-xs font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
