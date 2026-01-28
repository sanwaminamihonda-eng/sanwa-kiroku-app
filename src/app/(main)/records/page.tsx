'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getResidents } from '@/lib/firestore';
import { calculateAge } from '@/lib/utils';
import type { Resident } from '@/types';

export default function RecordsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadResidents() {
      try {
        const data = await getResidents();
        setResidents(data);
      } catch (error) {
        console.error('Failed to load residents:', error);
      } finally {
        setLoading(false);
      }
    }
    loadResidents();
  }, []);

  const filteredResidents = residents.filter(
    (r) =>
      r.name.includes(searchQuery) ||
      r.nameKana.includes(searchQuery) ||
      r.roomNumber.includes(searchQuery)
  );

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">記録入力</h1>
          </div>
        </div>
      </header>

      {/* 検索 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="利用者名・居室番号で検索"
          className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 利用者一覧 */}
      <main className="max-w-screen-xl mx-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto" />
          </div>
        ) : filteredResidents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {residents.length === 0 ? (
              <p>利用者が登録されていません</p>
            ) : (
              <p>該当する利用者が見つかりません</p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 bg-white">
            {filteredResidents.map((resident) => (
              <li key={resident.id}>
                <Link
                  href={`/records/${resident.id}`}
                  className="flex items-center px-4 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">
                      {resident.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900 text-lg">{resident.name}</p>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {resident.roomNumber}号室
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {calculateAge(resident.birthDate)}歳 • 要介護{resident.careLevel}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 ml-2"
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
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
