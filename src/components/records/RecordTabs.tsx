'use client';

import { cn } from '@/lib/utils';
import type { RecordTab } from '@/types';

interface RecordTabsProps {
  activeTab: RecordTab;
  onTabChange: (tab: RecordTab) => void;
}

const TABS: { id: RecordTab; label: string; icon: string }[] = [
  { id: 'vital', label: 'バイタル', icon: '💓' },
  { id: 'excretion', label: '排泄', icon: '🚽' },
  { id: 'meal', label: '食事', icon: '🍚' },
  { id: 'hydration', label: '水分', icon: '💧' },
];

export function RecordTabs({ activeTab, onTabChange }: RecordTabsProps) {
  return (
    <div className="flex border-b border-gray-200 bg-white overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex-1 min-w-[80px] px-4 py-3 text-sm font-medium text-center transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
            activeTab === tab.id
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          <span className="text-lg block mb-0.5">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
