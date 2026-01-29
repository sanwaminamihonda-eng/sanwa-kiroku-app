'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getResidents } from '@/lib/firestore';
import { calculateAge } from '@/lib/utils';
import type { Resident } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">介護記録</h1>
            <div className="text-sm text-gray-600">
              {user?.name}
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* 本日の日付 */}
        <div className="mb-6">
          <p className="text-lg font-medium text-gray-700">
            {new Date().toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/records"
            className="bg-blue-500 text-white rounded-xl p-4 text-center hover:bg-blue-600 transition-colors"
          >
            <div className="text-2xl mb-1">📝</div>
            <div className="font-medium">記録入力</div>
          </Link>
          <Link
            href="/history"
            className="bg-green-500 text-white rounded-xl p-4 text-center hover:bg-green-600 transition-colors"
          >
            <div className="text-2xl mb-1">📊</div>
            <div className="font-medium">履歴確認</div>
          </Link>
          <Link
            href="/residents"
            className="bg-purple-500 text-white rounded-xl p-4 text-center hover:bg-purple-600 transition-colors"
          >
            <div className="text-2xl mb-1">👥</div>
            <div className="font-medium">利用者管理</div>
          </Link>
          <Link
            href="/settings"
            className="bg-gray-500 text-white rounded-xl p-4 text-center hover:bg-gray-600 transition-colors"
          >
            <div className="text-2xl mb-1">⚙️</div>
            <div className="font-medium">設定</div>
          </Link>
        </div>

        {/* 利用者一覧 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">利用者一覧</h2>
            <span className="text-sm text-gray-500">{residents.length}名</span>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto" />
            </div>
          ) : residents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
              <p>利用者が登録されていません</p>
              <p className="text-sm mt-2">デモパネルから「Seed投入」を実行してください</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {residents.map((resident) => (
                <Link
                  key={resident.id}
                  href={`/records/${resident.id}`}
                  className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow flex items-center"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">
                      {resident.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{resident.name}</p>
                    <p className="text-sm text-gray-500">
                      {resident.roomNumber}号室 • {calculateAge(resident.birthDate)}歳
                    </p>
                    <p className="text-xs text-gray-400">要介護{resident.careLevel}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
