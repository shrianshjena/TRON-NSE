'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface SearchResult {
  ticker: string;
  companyName: string;
}

function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const searchStocks = useCallback(async (q: string) => {
    if (q.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/stock/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results ?? data ?? []);
        setIsOpen(true);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setHighlightedIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchStocks(value.trim());
    }, 300);
  };

  const selectResult = (ticker: string) => {
    setQuery('');
    setIsOpen(false);
    setResults([]);
    router.push(`/stock/${ticker}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      selectResult(results[highlightedIndex].ticker);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md" onKeyDown={handleKeyDown}>
      <div className="relative">
        {/* Search icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tron-text-secondary pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <Input
          value={query}
          onChange={handleInputChange}
          placeholder="Search stocks..."
          className="pl-10 pr-4"
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div
              className="w-4 h-4 border-2 border-tron-orange/30 border-t-tron-orange rounded-full animate-spin-ring"
            />
          </div>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 mt-1.5 z-50',
            'bg-tron-bg-card border border-tron-orange/15 rounded-lg',
            'shadow-lg overflow-hidden animate-fade-in',
            'max-h-72 overflow-y-auto'
          )}
          style={{
            boxShadow: '0 0 15px rgba(255,106,0,0.1), 0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {results.map((result, index) => (
            <button
              key={result.ticker}
              onClick={() => selectResult(result.ticker)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left',
                'transition-colors duration-100',
                highlightedIndex === index
                  ? 'bg-tron-orange/10'
                  : 'hover:bg-white/5'
              )}
            >
              <span className="text-sm font-semibold text-tron-orange min-w-[60px]">
                {result.ticker}
              </span>
              <span className="text-sm text-tron-text-secondary truncate">
                {result.companyName}
              </span>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length > 0 && results.length === 0 && !isLoading && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 mt-1.5 z-50',
            'bg-tron-bg-card border border-tron-orange/15 rounded-lg',
            'px-4 py-3 text-sm text-tron-text-secondary animate-fade-in'
          )}
        >
          No results found
        </div>
      )}
    </div>
  );
}

export { SearchBar };
