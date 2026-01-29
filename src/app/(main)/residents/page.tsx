'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getResidents } from '@/lib/firestore';
import { calculateAge } from '@/lib/utils';
import { BottomNav } from '@/components/navigation/BottomNav';
import type { Resident } from '@/types';

export default function ResidentsListPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadResidents = async () => {
      try {
        const data = await getResidents();
        setResidents(data);
      } catch (error) {
        console.error('Failed to load residents:', error);
      } finally {
        setLoading(false);
      }
    };
    loadResidents();
  }, []);

  // Filter residents by name or room number
  const filteredResidents = useMemo(() => {
    if (!searchQuery.trim()) return residents;

    const query = searchQuery.toLowerCase().trim();
    return residents.filter((resident) => {
      const nameMatch = resident.name.toLowerCase().includes(query);
      const kanaMatch = resident.nameKana.toLowerCase().includes(query);
      const roomMatch = resident.roomNumber.toLowerCase().includes(query);
      return nameMatch || kanaMatch || roomMatch;
    });
  }, [residents, searchQuery]);

  // Care level display
  const careLevelLabel = (level: number) => `要介護${level}`;

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">利用者一覧</h1>
          <p className="text-sm text-gray-500">{residents.length}名登録</p>
        </div>

        {/* Search Input */}
        <div className="px-4 pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
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
            </div>
            <input
              type="text"
              placeholder="氏名・居室番号で検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : filteredResidents.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm">
            {searchQuery ? (
              <p>「{searchQuery}」に一致する利用者がいません</p>
            ) : (
              <p>利用者が登録されていません</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredResidents.map((resident) => (
              <Link
                key={resident.id}
                href={`/residents/${resident.id}`}
                className="block"
              >
                <div className="bg-white rounded-xl p-4 shadow-sm active:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">
                        {resident.name.charAt(0)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-base">
                          {resident.name}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {resident.roomNumber}号室
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{calculateAge(resident.birthDate)}歳</span>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                          {careLevelLabel(resident.careLevel)}
                        </span>
                      </div>

                      {resident.notes && (
                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                          {resident.notes}
                        </p>
                      )}
                    </div>

                    {/* Arrow indicator */}
                    <div className="flex-shrink-0 self-center">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
