'use client';

import React, { useState } from 'react';
import { Copy, Check, Printer, Download, Type, BookOpen, Share2, Sparkles, AlertCircle } from 'lucide-react';
import { LotusIcon } from './SacredMotif';

interface VersionData {
  id: string;
  language: string;
  script: string;
  contentType: string;
  text: string;
  versesJson?: string | null;
  meaning?: string | null;
  sourceDocument: string;
  verificationStatus: string;
}

interface SlokhaReaderProps {
  slokha: {
    id: string;
    name: string;
    slug: string;
    deity: string;
    category: string;
    overallMeaning?: string | null;
    significance?: string | null;
  };
  versions: VersionData[];
}

export function SlokhaReader({ slokha, versions }: SlokhaReaderProps) {
  // Determine available languages
  const availableLangs = versions.map((v) => v.language.toLowerCase());

  // Default to sanskrit if available, else first available
  const defaultLang = availableLangs.includes('sanskrit')
    ? 'sanskrit'
    : availableLangs[0] || 'english';

  const [selectedLang, setSelectedLang] = useState<string>(defaultLang);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'meaning'>('text');

  const currentVersion = versions.find((v) => v.language.toLowerCase() === selectedLang);

  // Parse verses
  let parsedVerses: Array<{ verseNumber?: number; text: string; meaning?: string }> = [];
  if (currentVersion?.versesJson) {
    try {
      parsedVerses = JSON.parse(currentVersion.versesJson);
    } catch (e) {
      parsedVerses = currentVersion.text.split('\n\n').map((t, idx) => ({
        verseNumber: idx + 1,
        text: t,
      }));
    }
  } else if (currentVersion) {
    parsedVerses = currentVersion.text.split('\n\n').map((t, idx) => ({
      verseNumber: idx + 1,
      text: t,
    }));
  }

  const handleCopy = () => {
    if (!currentVersion) return;
    navigator.clipboard.writeText(currentVersion.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: slokha.name,
        text: `Read ${slokha.name} on Amrita Dharma Calendar`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const fontSizeClasses = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-loose',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose',
  };

  const fontScriptClass = {
    sanskrit: 'font-sanskrit',
    tamil: 'font-tamil',
    telugu: 'font-telugu',
    english: 'font-serif',
  }[selectedLang] || 'font-sans';

  const languageTabs = [
    { key: 'sanskrit', label: 'Sanskrit', native: 'संस्कृतम्', script: 'Devanagari' },
    { key: 'tamil', label: 'Tamil', native: 'தமிழ்', script: 'Tamil Script' },
    { key: 'telugu', label: 'Telugu', native: 'తెలుగు', script: 'Telugu Script' },
    { key: 'english', label: 'English', native: 'English', script: 'Latin Transliteration' },
  ];

  return (
    <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] shadow-sm overflow-hidden print-area">
      {/* Top Controls Toolbar */}
      <div className="bg-[#FAF6EF] border-b border-[#E8DEC8] px-4 py-3 flex flex-wrap items-center justify-between gap-3 no-print">
        {/* Language Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {languageTabs.map((tab) => {
            const isAvailable = availableLangs.includes(tab.key);
            const isSelected = selectedLang === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => isAvailable && setSelectedLang(tab.key)}
                disabled={!isAvailable}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-[#6E1B24] text-white shadow-xs font-semibold'
                    : isAvailable
                    ? 'bg-white text-stone-700 hover:bg-[#F2ECE1] border border-[#E8DEC8]'
                    : 'bg-stone-100 text-stone-400 cursor-not-allowed opacity-60'
                }`}
                title={isAvailable ? `View ${tab.label} text` : `${tab.label} not available yet`}
              >
                <span>{tab.native}</span>
                {!isAvailable && <span className="text-[10px] text-stone-400">(N/A)</span>}
              </button>
            );
          })}
        </div>

        {/* Action Controls: Font size, Copy, Print, Share, PDF */}
        <div className="flex items-center space-x-2">
          {/* Font Size Selector */}
          <div className="flex items-center bg-white border border-[#E8DEC8] rounded-lg p-0.5 text-xs text-stone-600">
            <span className="px-1.5 text-[10px] font-mono text-stone-400">Size</span>
            {(['sm', 'base', 'lg', 'xl'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFontSize(s)}
                className={`px-2 py-0.5 rounded text-xs transition ${
                  fontSize === s ? 'bg-amber-100 font-bold text-amber-900' : 'hover:bg-stone-100'
                }`}
              >
                {s === 'sm' ? 'A-' : s === 'base' ? 'A' : s === 'lg' ? 'A+' : 'A++'}
              </button>
            ))}
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!currentVersion}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-stone-100 text-stone-700 border border-[#E8DEC8] rounded-lg transition"
            title="Copy Slokha text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="p-1.5 text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-[#E8DEC8] rounded-lg transition"
            title="Print-friendly view"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-1.5 text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-[#E8DEC8] rounded-lg transition"
            title="Share slokha"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* PDF Download Direct Link */}
          {currentVersion && (
            <a
              href={`/api/pdf/${slokha.slug}/${selectedLang}`}
              download
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-[#6E1B24] hover:bg-[#8C2B36] text-white rounded-lg shadow-xs transition"
              title={`Download ${selectedLang.toUpperCase()} PDF`}
            >
              <Download className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden md:inline">Download PDF</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-10">
        {/* Script & Verification Info Header */}
        {currentVersion ? (
          <div className="mb-6 pb-4 border-b border-[#F2ECE1] flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-amber-900 uppercase font-mono">
                {currentVersion.language.toUpperCase()}
              </span>
              <span>•</span>
              <span>Script: {currentVersion.script}</span>
              <span>•</span>
              <span className="italic">Source: {currentVersion.sourceDocument}</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ✓ Verified Source Text
            </span>
          </div>
        ) : (
          <div className="p-8 text-center bg-amber-50 rounded-xl border border-amber-200 text-amber-800 space-y-2 mb-6">
            <AlertCircle className="w-8 h-8 mx-auto text-amber-600" />
            <h4 className="font-serif font-bold text-base">Language Version Not Available Yet</h4>
            <p className="text-xs max-w-md mx-auto text-stone-600">
              The prayer text in {selectedLang.toUpperCase()} was not present in the initial uploaded documents. An administrator may upload or verify this version in the Admin Portal.
            </p>
          </div>
        )}

        {/* Verse-by-verse presentation */}
        {currentVersion && parsedVerses.length > 0 && (
          <div className={`space-y-6 ${fontSizeClasses[fontSize]} ${fontScriptClass} text-stone-800`}>
            {parsedVerses.map((verse, index) => (
              <div
                key={index}
                className="p-4 rounded-xl hover:bg-amber-50/40 transition border border-transparent hover:border-amber-200/60"
              >
                {verse.verseNumber && (
                  <div className="text-[11px] font-mono text-amber-700/80 font-bold mb-1 tracking-wider">
                    ॥ {verse.verseNumber} ॥
                  </div>
                )}
                <div className="whitespace-pre-line tracking-wide">
                  {verse.text}
                </div>
                {verse.meaning && (
                  <div className="mt-2.5 pt-2 border-t border-amber-200/40 text-xs italic text-stone-600 font-sans">
                    <span className="font-semibold text-amber-900 not-italic">Meaning:</span> {verse.meaning}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Overall Meaning and Explanation Section */}
        {slokha.overallMeaning && (
          <div className="mt-12 pt-8 border-t-2 border-[#E8DEC8]">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-700" />
              <h3 className="font-serif font-bold text-lg text-[#6E1B24]">
                Meaning & Spiritual Significance
              </h3>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed font-sans bg-[#FBF7EE] p-5 rounded-xl border border-[#E8DEC8]">
              {slokha.overallMeaning}
            </p>
          </div>
        )}

        {/* Download All Available Formats Drawer */}
        <div className="mt-10 p-5 bg-[#FAF6EF] rounded-xl border border-[#E8DEC8] no-print">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-serif font-bold text-sm text-[#6E1B24] flex items-center space-x-2">
              <Download className="w-4 h-4 text-amber-700" />
              <span>Available PDF Downloads for this Slokha:</span>
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {languageTabs.map((t) => {
              const hasVersion = availableLangs.includes(t.key);
              if (!hasVersion) return null;
              return (
                <a
                  key={t.key}
                  href={`/api/pdf/${slokha.slug}/${t.key}`}
                  download
                  className="flex items-center justify-between p-2.5 bg-white border border-[#E8DEC8] hover:border-amber-400 rounded-lg text-xs font-medium text-stone-700 hover:text-[#6E1B24] transition shadow-xs group"
                >
                  <span>{t.label} PDF</span>
                  <Download className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#6E1B24]" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
