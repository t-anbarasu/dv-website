'use client';

import React from 'react';
import { TabType } from '@/lib/types';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  return (
    <nav className="nav" aria-label="Main Navigation">
      <button
        onClick={() => onSelectTab('today')}
        className={currentTab === 'today' ? 'on' : ''}
        aria-label="Today"
      >
        <svg className="i" viewBox="0 0 24 24">
          <path d="M3 10.5L12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-6v6H4.5A1.5 1.5 0 0 1 3 19.5z" />
        </svg>
        <span>Today</span>
      </button>

      <button
        onClick={() => onSelectTab('library')}
        className={currentTab === 'library' ? 'on' : ''}
        aria-label="Library"
      >
        <svg className="i" viewBox="0 0 24 24">
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
        <span>Library</span>
      </button>

      <button
        onClick={() => onSelectTab('story')}
        className={currentTab === 'story' ? 'on' : ''}
        aria-label="Story"
      >
        <svg className="i" viewBox="0 0 24 24">
          <path d="M12 21v-8" />
          <path d="M12 13c0-4 3.2-6.5 7-6.5 0 4.2-3.2 6.5-7 6.5z" />
          <path d="M12 13c0-4-3.2-6.5-7-6.5 0 4.2 3.2 6.5 7 6.5z" />
        </svg>
        <span>Story</span>
      </button>
    </nav>
  );
};
