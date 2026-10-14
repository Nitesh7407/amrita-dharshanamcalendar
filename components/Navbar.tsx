'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Calendar, BookOpen, Download, Info, MessageSquare, Shield, Menu, X } from 'lucide-react';
import { LotusIcon } from './SacredMotif';
import { GlobalSearchModal } from './GlobalSearchModal';

export function Navbar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener('open-search', handleOpenSearch);
    return () => window.removeEventListener('open-search', handleOpenSearch);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', icon: LotusIcon },
    { href: '/calendar', label: 'Festival Calendar', icon: Calendar },
    { href: '/slokhas', label: 'Slokha Library', icon: BookOpen },
    { href: '/downloads', label: 'Downloads', icon: Download },
    { href: '/about', label: 'About', icon: Info },
    { href: '/feedback', label: 'Feedback', icon: MessageSquare },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF6EF]/95 backdrop-blur-md border-b border-[#E8DEC8] shadow-sm">
        {/* Top Institutional Bar */}
        <div className="bg-[#6E1B24] text-[#FDFCF7] text-xs py-1.5 px-4 tracking-wider uppercase flex justify-between items-center border-b border-[#D4AF37]/30">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            <span className="font-medium tracking-wide">
              Amrita School of Engineering • Department of Amrita Darshanam
            </span>
            <div className="hidden sm:flex items-center space-x-4 text-[11px] text-amber-200">
              <span>।। ॐ अमृतेश्वर्यै नमः ।।</span>
              <span>•</span>
              <span>International Centre for Spiritual Studies</span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Titles */}
            <Link href="/" className="flex items-center space-x-3.5 group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6E1B24] to-[#4A0E15] p-2 flex items-center justify-center shadow-md border border-[#D4AF37]/50 group-hover:scale-105 transition-transform">
                <LotusIcon className="w-7 h-7 text-[#D4AF37]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#6E1B24] group-hover:text-[#8C2B36] transition-colors">
                  Amrita Dharma Calendar
                </span>
                <span className="text-[11px] sm:text-xs text-[#8C6D53] italic font-serif tracking-normal">
                  Discover sacred occasions. Explore ancient wisdom. Celebrate with devotion.
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'text-[#6E1B24] bg-amber-100/70 font-semibold shadow-xs'
                        : 'text-stone-700 hover:text-[#6E1B24] hover:bg-[#F2ECE1]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Action Buttons: Search & Admin */}
            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center space-x-2 px-3 py-1.5 text-xs text-stone-600 bg-[#F4ECE1] hover:bg-[#EDE3D4] border border-[#E8DEC8] rounded-full transition shadow-xs"
                title="Search (⌘K)"
              >
                <Search className="w-3.5 h-3.5 text-amber-800" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] bg-white border border-[#DACFBB] rounded font-mono text-stone-500">
                  ⌘K
                </kbd>
              </button>

              <Link
                href="/admin"
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition ${
                  pathname.startsWith('/admin')
                    ? 'bg-[#6E1B24] text-white border-[#6E1B24]'
                    : 'text-[#6E1B24] border-[#6E1B24]/40 hover:bg-[#6E1B24] hover:text-white'
                }`}
                title="Admin Portal"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Admin</span>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E8DEC8] bg-[#FAF6EF] px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                    isActive ? 'text-[#6E1B24] bg-amber-100 font-semibold' : 'text-stone-700 hover:bg-amber-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-700" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-[#6E1B24] hover:bg-amber-50"
            >
              <Shield className="w-4 h-4 text-[#6E1B24]" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
