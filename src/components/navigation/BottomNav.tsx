'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/records', label: '記録', icon: '📝' },
  { href: '/history', label: '履歴', icon: '📊' },
  { href: '/residents', label: '利用者', icon: '👥' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="grid grid-cols-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center py-3 transition-colors ${
                isActive
                  ? 'text-slate-900'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              {/* アイコン */}
              <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </span>

              {/* ラベル */}
              <span className={`text-xs mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>

              {/* 選択インジケーター（下線） */}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-800 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
