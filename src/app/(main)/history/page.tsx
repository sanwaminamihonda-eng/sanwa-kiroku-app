'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getResidents, getDailyRecord } from '@/lib/firestore';
import { calculateAge, formatDate } from '@/lib/utils';
import type { Resident, DailyRecord } from '@/types';

interface ResidentWithRecord {
  resident: Resident;
  record: DailyRecord | null;
}

export default function HistoryPage() {
  const [date, setDate] = useState(formatDate(new Date()));
  const [data, setData] = useState<ResidentWithRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const residents = await getResidents();

      const recordPromises = residents.map(async (resident) => {
        const record = await getDailyRecord(resident.id, date);
        return { resident, record };
      });

      const results = await Promise.all(recordPromises);
      setData(results);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const changeDate = (days: number) => {
    const current = new Date(date);
    current.setDate(current.getDate() + days);
    setDate(formatDate(current));
  };

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
            <h1 className="text-xl font-bold text-gray-900">記録履歴</h1>
          </div>
        </div>
      </header>

      {/* 日付選択 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-lg font-medium bg-transparent border-none focus:outline-none text-center"
            />
            <p className="text-sm text-gray-500">
              {new Date(date).toLocaleDateString('ja-JP', { weekday: 'long' })}
            </p>
          </div>

          <button
            onClick={() => changeDate(1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={date === formatDate(new Date())}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 記録一覧 */}
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto" />
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            <p>利用者が登録されていません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map(({ resident, record }) => (
              <ResidentRecordCard
                key={resident.id}
                resident={resident}
                record={record}
                date={date}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

interface ResidentRecordCardProps {
  resident: Resident;
  record: DailyRecord | null;
  date: string;
}

function ResidentRecordCard({ resident, record, date }: ResidentRecordCardProps) {
  const hasVitals = record && record.vitals.length > 0;
  const hasExcretions = record && record.excretions.length > 0;
  const hasMeals = record && record.meals.length > 0;
  const hasHydrations = record && record.hydrations.length > 0;
  const hasAnyRecord = hasVitals || hasExcretions || hasMeals || hasHydrations;

  // 合計水分量
  const totalHydration = record?.hydrations.reduce((sum, h) => sum + h.amount, 0) || 0;

  // 最新のバイタル
  const latestVital = record?.vitals[record.vitals.length - 1];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* 利用者情報 */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold">{resident.name.charAt(0)}</span>
          </div>
          <div className="ml-3">
            <p className="font-bold text-gray-900">{resident.name}</p>
            <p className="text-xs text-gray-500">
              {resident.roomNumber}号室 • {calculateAge(resident.birthDate)}歳
            </p>
          </div>
        </div>
        {!hasAnyRecord && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">未記録</span>
        )}
      </div>

      {/* 記録サマリー */}
      {hasAnyRecord && (
        <div className="px-4 py-3">
          <div className="grid grid-cols-4 gap-2 text-center">
            {/* バイタル */}
            <div className={`p-2 rounded-lg ${hasVitals ? 'bg-red-50' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500">バイタル</p>
              {latestVital ? (
                <p className="text-sm font-medium text-gray-900">
                  {latestVital.temperature?.toFixed(1)}℃
                </p>
              ) : (
                <p className="text-sm text-gray-400">-</p>
              )}
            </div>

            {/* 排泄 */}
            <div className={`p-2 rounded-lg ${hasExcretions ? 'bg-yellow-50' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500">排泄</p>
              <p className="text-sm font-medium text-gray-900">
                {record?.excretions.length || 0}回
              </p>
            </div>

            {/* 食事 */}
            <div className={`p-2 rounded-lg ${hasMeals ? 'bg-green-50' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500">食事</p>
              <p className="text-sm font-medium text-gray-900">
                {record?.meals.length || 0}食
              </p>
            </div>

            {/* 水分 */}
            <div className={`p-2 rounded-lg ${hasHydrations ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500">水分</p>
              <p className="text-sm font-medium text-gray-900">
                {totalHydration}ml
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
