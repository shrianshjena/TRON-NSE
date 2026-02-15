'use client';

import React from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/layout/search-bar';

function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16"
      style={{
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,106,0,0.1)',
        boxShadow: '0 1px 12px rgba(255,106,0,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <Link href="/" className="flex-shrink-0 group">
          <h1
            className="font-heading text-xl font-bold tracking-wider glow-text transition-all duration-200 group-hover:brightness-125"
          >
            TRON NSE
          </h1>
        </Link>

        {/* Center: Search */}
        <div className="flex-1 flex justify-center max-w-lg mx-4">
          <SearchBar />
        </div>

        {/* Right: Placeholder for future use */}
        <div className="flex-shrink-0 w-[100px]" />
      </div>
    </header>
  );
}

export { Header };
