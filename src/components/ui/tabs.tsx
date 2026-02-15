'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  const updateUnderline = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeButton = container.querySelector<HTMLButtonElement>(
      `[data-tab-id="${activeTab}"]`
    );
    if (!activeButton) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    setUnderlineStyle({
      left: buttonRect.left - containerRect.left,
      width: buttonRect.width,
    });
  }, [activeTab]);

  useEffect(() => {
    updateUnderline();
  }, [updateUnderline]);

  return (
    <div className={cn('relative', className)}>
      <div
        ref={containerRef}
        className="flex border-b border-tron-orange/10"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors duration-200 relative',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-tron-orange/40',
              activeTab === tab.id
                ? 'text-tron-orange'
                : 'text-tron-text-secondary hover:text-tron-text-primary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Animated neon underline */}
      <div
        className="absolute bottom-0 h-0.5 rounded-full bg-tron-orange"
        style={{
          left: underlineStyle.left,
          width: underlineStyle.width,
          transition: 'left 0.3s ease-out, width 0.3s ease-out',
          boxShadow:
            '0 0 8px rgba(255,106,0,0.6), 0 0 16px rgba(255,106,0,0.3)',
        }}
      />
    </div>
  );
}

export { Tabs };
export type { TabsProps, Tab };
