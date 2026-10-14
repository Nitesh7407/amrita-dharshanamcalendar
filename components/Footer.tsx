import React from 'react';
import Link from 'next/link';
import { LotusIcon, SacredDivider } from './SacredMotif';
import { BookOpen, Calendar, Download, Shield, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#4A0E15] text-[#FDFCF7] border-t-2 border-[#D4AF37] mt-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Identity & Motto */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#6E1B24] p-1.5 flex items-center justify-center border border-[#D4AF37]">
                <LotusIcon className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <span className="font-serif text-lg font-bold text-[#FDFCF7]">
                Amrita Dharma Calendar
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-serif italic">
              &ldquo;Discover sacred occasions. Explore ancient wisdom. Celebrate with devotion.&rdquo;
            </p>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              DEPARTMENT OF AMRITA DARSHANAM<br />
              Amrita School of Engineering, Chennai<br />
              Amrita Vishwa Vidyapeetham
            </p>
          </div>

          {/* Col 2: Calendar & Occasions */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider font-mono">
              Festival Calendar
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <Link href="/calendar" className="hover:text-amber-300 transition flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Annual Hindu Calendar</span>
                </Link>
              </li>
              <li>
                <Link href="/occasions/sri-mahaganapathi-homam-2026" className="hover:text-amber-300 transition">
                  Sri Mahaganapathi Homam
                </Link>
              </li>
              <li>
                <Link href="/occasions/amma-birthday-2026" className="hover:text-amber-300 transition">
                  Amma&apos;s Birthday Celebrations
                </Link>
              </li>
              <li>
                <Link href="/festivals/diwali-2026" className="hover:text-amber-300 transition">
                  Diwali / Deepavali
                </Link>
              </li>
              <li>
                <Link href="/festivals/maha-shivaratri-2026" className="hover:text-amber-300 transition">
                  Maha Shivaratri
                </Link>
              </li>
              <li>
                <Link href="/festivals/ganesh-chaturthi-2026" className="hover:text-amber-300 transition">
                  Vinayaka Chaturthi
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Sacred Slokhas */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider font-mono">
              Sacred Slokha Library
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <Link href="/slokhas/amma-dhyanam" className="hover:text-amber-300 transition">
                  Sri Amma Dhyanam
                </Link>
              </li>
              <li>
                <Link href="/slokhas/mahaganesha-pancharatnam" className="hover:text-amber-300 transition">
                  Sri Ganesha Pancharatnam
                </Link>
              </li>
              <li>
                <Link href="/slokhas/guru-stotram" className="hover:text-amber-300 transition">
                  Sri Guru Stotram (Guru Vandanam)
                </Link>
              </li>
              <li>
                <Link href="/slokhas/shiva-tandava-stotram" className="hover:text-amber-300 transition">
                  Sri Shiva Tandava Stotram
                </Link>
              </li>
              <li>
                <Link href="/slokhas/mahalakshmi-ashtakam" className="hover:text-amber-300 transition">
                  Sri Mahalakshmi Ashtakam
                </Link>
              </li>
              <li>
                <Link href="/slokhas/govinda-namavali" className="hover:text-amber-300 transition">
                  Govinda Namavali
                </Link>
              </li>
              <li>
                <Link href="/downloads" className="hover:text-amber-300 transition flex items-center space-x-1.5 pt-1 text-amber-200 font-medium">
                  <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Downloadable PDFs</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Spiritual Heritage & Languages */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider font-mono">
              Multilingual Traditions
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Prayers preserved faithfully in Sanskrit (Devanagari), Tamil, Telugu, and English transliteration, directly derived from official Amrita Darshanam documents.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-[#6E1B24] border border-[#D4AF37]/40 text-amber-200">संस्कृतम्</span>
              <span className="px-2 py-0.5 rounded bg-[#6E1B24] border border-[#D4AF37]/40 text-amber-200">தமிழ்</span>
              <span className="px-2 py-0.5 rounded bg-[#6E1B24] border border-[#D4AF37]/40 text-amber-200">తెలుగు</span>
              <span className="px-2 py-0.5 rounded bg-[#6E1B24] border border-[#D4AF37]/40 text-amber-200">English</span>
            </div>
            <div className="pt-2">
              <Link
                href="/admin"
                className="inline-flex items-center space-x-1.5 text-xs text-amber-300/80 hover:text-amber-200 transition"
              >
                <Shield className="w-3 h-3" />
                <span>Administrator Portal</span>
              </Link>
            </div>
          </div>
        </div>

        <SacredDivider className="my-8 opacity-60" />

        {/* Bottom copyright & disclaimer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 space-y-2 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} Amrita Vishwa Vidyapeetham • Department of Amrita Darshanam
          </div>
          <div className="text-center sm:text-right text-[11px] text-stone-400 max-w-md">
            Religious and spiritual benefits presented according to traditional beliefs. Preserving sacred texts with reverence.
          </div>
        </div>
      </div>
    </footer>
  );
}
