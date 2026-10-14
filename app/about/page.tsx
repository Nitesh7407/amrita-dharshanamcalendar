import React from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, Shield, Award, Users, CheckCircle2, FileText, Heart } from 'lucide-react';
import { LotusIcon, SacredDivider, TempleGopuramIcon } from '@/components/SacredMotif';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#6E1B24] p-2.5 mx-auto flex items-center justify-center border-2 border-[#D4AF37] shadow-md">
          <LotusIcon className="w-9 h-9 text-[#D4AF37]" />
        </div>
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-amber-900 uppercase tracking-widest font-mono">
          <span>About Amrita Darshanam</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#6E1B24] tracking-tight">
          Amrita Dharma Calendar
        </h1>
        <p className="text-base sm:text-lg font-serif italic text-[#8C6D53] max-w-xl mx-auto">
          &ldquo;Discover sacred occasions. Explore ancient wisdom. Celebrate with devotion.&rdquo;
        </p>
      </div>

      <SacredDivider />

      {/* Institutional Mission */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-8 shadow-sm space-y-6">
        <h2 className="font-serif font-bold text-2xl text-[#6E1B24] flex items-center space-x-2.5">
          <TempleGopuramIcon className="w-6 h-6 text-amber-700" />
          <span>Department of Amrita Darshanam</span>
        </h2>
        <p className="text-sm text-stone-700 leading-relaxed">
          Amrita Darshanam (International Centre for Spiritual Studies) is an academic and cultural department within Amrita Vishwa Vidyapeetham, inspired by the visionary leadership of our Chancellor, <strong>Satguru Sri Mata Amritanandamayi Devi (Amma)</strong>.
        </p>
        <p className="text-sm text-stone-700 leading-relaxed">
          The department offers specialized courses in Indian Heritage, Vedic Philosophy, Classical Sanskrit, and Values-Based Education, ensuring that students pursuing degrees in engineering, computing, and technology are also grounded in timeless ethical and spiritual values.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#F2ECE1]">
          <div className="p-4 bg-[#FAF6EF] rounded-xl border border-[#E8DEC8] text-center space-y-1">
            <span className="text-2xl font-bold font-serif text-[#6E1B24]">A++</span>
            <span className="block text-xs text-stone-600 font-medium">NAAC Accredited Grade</span>
          </div>
          <div className="p-4 bg-[#FAF6EF] rounded-xl border border-[#E8DEC8] text-center space-y-1">
            <span className="text-2xl font-bold font-serif text-[#6E1B24]">Top 10</span>
            <span className="block text-xs text-stone-600 font-medium">NIRF Overall University Rank</span>
          </div>
          <div className="p-4 bg-[#FAF6EF] rounded-xl border border-[#E8DEC8] text-center space-y-1">
            <span className="text-2xl font-bold font-serif text-[#6E1B24]">Chennai</span>
            <span className="block text-xs text-stone-600 font-medium">School of Engineering Campus</span>
          </div>
        </div>
      </div>

      {/* Source Documents & Editorial Integrity */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DEC8] p-8 shadow-sm space-y-6">
        <h2 className="font-serif font-bold text-2xl text-[#6E1B24] flex items-center space-x-2.5">
          <BookOpen className="w-6 h-6 text-amber-700" />
          <span>Source Documents &amp; Archival Integrity</span>
        </h2>
        <p className="text-sm text-stone-700 leading-relaxed">
          The Amrita Dharma Calendar is built directly from validated primary documents provided by the Department of Amrita Darshanam:
        </p>

        <div className="space-y-3">
          {[
            {
              doc: 'SRI MAHAGANAPATHI HOMAM JULY.docx',
              desc: 'Official parayanam list for the annual Mahaganapathi Homam conducted on 22/07/2026 at Amrita School of Engineering, Chennai. Lists 30 sacred chanting items in authentic sequence.',
            },
            {
              doc: 'SANSKRIT.docx',
              desc: 'Devanagari Sanskrit prayer archive containing Amma Dhyanam, Ganesha, Shiva, Guru, and Vishnu stotras, including Sri Panchayudha Stotram.',
            },
            {
              doc: 'TAMIL.docx',
              desc: 'Classical Tamil script prayer archive containing Amma Dhyanam, Mahaganapathi Pancharatnam, Ashtalakshmi Stotram, and Tamil Porul explanations.',
            },
            {
              doc: 'TELUGU.docx & TELUGU (1).docx',
              desc: 'Native Telugu script prayer archive containing Amma Dhyana Slokam, Venkateswara Stotram, Govinda Namavali, and Telugu Bhavamu explanations.',
            },
            {
              doc: 'ENGLISH.docx',
              desc: 'Accurate Latin transliteration with diacritical marks and English spiritual explanations for all devotees and international students.',
            },
          ].map((item) => (
            <div key={item.doc} className="p-3.5 bg-[#FAF6EF] rounded-xl border border-[#E8DEC8] text-xs">
              <span className="font-mono font-bold text-[#6E1B24] block">{item.doc}</span>
              <p className="text-stone-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Review & Verification Policy */}
      <div className="bg-[#FAF6EF] rounded-2xl border border-[#E8DEC8] p-6 text-xs text-stone-700 space-y-3">
        <h3 className="font-serif font-bold text-base text-[#6E1B24]">
          Archival Policy on Incomplete or Unverified Texts
        </h3>
        <p className="leading-relaxed">
          In accordance with strict scholarly and spiritual ethics, whenever a prayer text was not present in the source files (such as <em>Sri Lalitasahasranama Stotram</em> or <em>Purusha Suktam</em>), it has been accurately flagged for administrator review rather than synthesized.
        </p>
        <p className="leading-relaxed">
          Similarly, Hindu festival dates are computed based on traditional Chandramana and Souramana Panchanga calendars, distinguishing verified lunar dates from tentative dates.
        </p>
      </div>
    </div>
  );
}
