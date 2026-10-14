'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Calendar, BookOpen, Sparkles, MapPin, Loader2 } from 'lucide-react';
import { LotusIcon } from './SacredMotif';

interface SearchResult {
  festivals: Array<{
    id: string;
    name: string;
    slug: string;
    date: string;
    category: string;
    region: string;
  }>;
  occasions: Array<{
    id: string;
    name: string;
    slug: string;
    date: string;
    occasionType: string;
    institution?: string;
  }>;
  slokhas: Array<{
    id: string;
    name: string;
    slug: string;
    deity: string;
    category: string;
    versions: Array<{ language: string }>;
  }>;
  totalCount: number;
}

export function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent('open-search'));
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#FFFDF9] rounded-xl shadow-2xl border border-[#E8DEC8] overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-[#E8DEC8] bg-[#FAF6EF]">
          <Search className="w-5 h-5 text-amber-700 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search festivals, occasions, prayers, deities, e.g. 'Ganesha', 'Amma', 'Homam'..."
            className="w-full bg-transparent border-none text-[#2D241E] text-base placeholder:text-stone-400 focus:outline-none focus:ring-0"
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-amber-700 mr-2 shrink-0" />}
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-stone-400 hover:text-stone-600 mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-medium text-stone-500 bg-stone-200/70 hover:bg-stone-300 px-2 py-1 rounded"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {!query && (
            <div className="py-8 text-center text-stone-500 space-y-3">
              <LotusIcon className="w-10 h-10 mx-auto text-amber-700/60" />
              <p className="text-sm">Search sacred Hindu festivals, Amrita occasions, and multilingual slokhas.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
                <span className="text-stone-400">Try searching:</span>
                {['Mahaganapathi Homam', 'Amma Birthday', 'Ganesha Pancharatnam', 'Bilvashtakam', 'Diwali', 'Shiva Tandava'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2.5 py-1 bg-[#F4ECE1] text-amber-900 rounded-full hover:bg-amber-200/70 transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results && results.totalCount === 0 && !loading && (
            <div className="py-8 text-center text-stone-500">
              <p className="text-sm">No results found for &ldquo;<span className="font-semibold text-stone-700">{query}</span>&rdquo;</p>
              <p className="text-xs text-stone-400 mt-1">Try another keyword or search by deity name.</p>
            </div>
          )}

          {/* Slokha Results */}
          {results && results.slokhas.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-amber-900 uppercase tracking-wider mb-2.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                <span>Sacred Slokhas ({results.slokhas.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.slokhas.map((slokha) => (
                  <Link
                    key={slokha.id}
                    href={`/slokhas/${slokha.slug}`}
                    onClick={onClose}
                    className="block p-3 rounded-lg hover:bg-[#F7F2E7] transition border border-transparent hover:border-[#E8DEC8]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#6E1B24]">{slokha.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {slokha.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-stone-500 mt-1">
                      <span>Deity: {slokha.deity}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        {slokha.versions.map((v) => (
                          <span
                            key={v.language}
                            className="px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded text-[10px] uppercase font-mono"
                          >
                            {v.language.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Festival Results */}
          {results && results.festivals.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-amber-900 uppercase tracking-wider mb-2.5">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>Hindu Festivals ({results.festivals.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.festivals.map((fest) => (
                  <Link
                    key={fest.id}
                    href={`/festivals/${fest.slug}`}
                    onClick={onClose}
                    className="block p-3 rounded-lg hover:bg-[#F7F2E7] transition border border-transparent hover:border-[#E8DEC8]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#6E1B24]">{fest.name}</span>
                      <span className="text-xs text-stone-500 font-mono">{fest.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-stone-500 mt-1">
                      <span>{fest.category}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-0.5" />
                        {fest.region}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Occasions Results */}
          {results && results.occasions.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-amber-900 uppercase tracking-wider mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Institutional & Special Occasions ({results.occasions.length})</span>
              </div>
              <div className="space-y-1.5">
                {results.occasions.map((occ) => (
                  <Link
                    key={occ.id}
                    href={`/occasions/${occ.slug}`}
                    onClick={onClose}
                    className="block p-3 rounded-lg hover:bg-[#F7F2E7] transition border border-transparent hover:border-[#E8DEC8]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#6E1B24]">{occ.name}</span>
                      <span className="text-xs text-stone-500 font-mono">{occ.date}</span>
                    </div>
                    <div className="text-xs text-stone-500 mt-1">
                      {occ.institution || 'Amrita Darshanam Occasion'}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#FAF6EF] border-t border-[#E8DEC8] text-xs text-stone-500 flex justify-between items-center">
          <span>Amrita Dharma Calendar Global Index</span>
          <span className="text-[11px] text-stone-400">Click any result to view full details</span>
        </div>
      </div>
    </div>
  );
}
