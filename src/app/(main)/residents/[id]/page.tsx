'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getResident, getDailyRecord } from '@/lib/firestore';
import { calculateAge, formatDate } from '@/lib/utils';
import { BottomNav } from '@/components/navigation/BottomNav';
import type { Resident, DailyRecord, Vital } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResidentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [resident, setResident] = useState<Resident | null>(null);
  const [recentRecords, setRecentRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 利用者情報を取得
        const residentData = await getResident(id);
        if (!residentData) {
          setError('利用者が見つかりません');
          return;
        }
        setResident(residentData);

        // 過去7日間の記録を取得
        const records: DailyRecord[] = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = formatDate(date);
          const record = await getDailyRecord(id, dateStr);
          if (record) {
            records.push(record);
          }
        }
        setRecentRecords(records);
      } catch (err) {
        console.error('Failed to load resident data:', err);
        setError('データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // バイタルトレンドのサマリーを生成
  const getVitalTrendSummary = () => {
    const allVitals: Vital[] = recentRecords.flatMap((r) => r.vitals || []);
    if (allVitals.length === 0) return null;

    const temperatures = allVitals.filter((v) => v.temperature).map((v) => v.temperature!);
    const bloodPressureHigh = allVitals.filter((v) => v.bloodPressureHigh).map((v) => v.bloodPressureHigh!);
    const bloodPressureLow = allVitals.filter((v) => v.bloodPressureLow).map((v) => v.bloodPressureLow!);
    const pulses = allVitals.filter((v) => v.pulse).map((v) => v.pulse!);
    const spO2s = allVitals.filter((v) => v.spO2).map((v) => v.spO2!);

    const avg = (arr: number[]) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : null;
    const minMax = (arr: number[]) => arr.length ? { min: Math.min(...arr), max: Math.max(...arr) } : null;

    return {
      temperature: temperatures.length ? { avg: avg(temperatures), ...minMax(temperatures)!, count: temperatures.length } : null,
      bloodPressure: bloodPressureHigh.length ? {
        avgHigh: avg(bloodPressureHigh),
        avgLow: avg(bloodPressureLow),
        count: bloodPressureHigh.length,
      } : null,
      pulse: pulses.length ? { avg: avg(pulses), ...minMax(pulses)!, count: pulses.length } : null,
      spO2: spO2s.length ? { avg: avg(spO2s), ...minMax(spO2s)!, count: spO2s.length } : null,
    };
  };

  // 記録サマリーを計算
  const getRecordsSummary = () => {
    const totalVitals = recentRecords.reduce((sum, r) => sum + (r.vitals?.length || 0), 0);
    const totalExcretions = recentRecords.reduce((sum, r) => sum + (r.excretions?.length || 0), 0);
    const totalMeals = recentRecords.reduce((sum, r) => sum + (r.meals?.length || 0), 0);
    const totalHydrations = recentRecords.reduce((sum, r) => sum + (r.hydrations?.length || 0), 0);
    const totalWater = recentRecords.reduce((sum, r) => {
      return sum + (r.hydrations?.reduce((s, h) => s + h.amount, 0) || 0);
    }, 0);

    return { totalVitals, totalExcretions, totalMeals, totalHydrations, totalWater };
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-screen-xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/residents" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">利用者詳細</h1>
            </div>
          </div>
        </header>
        <main className="max-w-screen-xl mx-auto px-4 py-6">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error || !resident) {
    return (
      <div className="min-h-screen pb-20">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-screen-xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/residents" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">利用者詳細</h1>
            </div>
          </div>
        </header>
        <main className="max-w-screen-xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            <p>{error || '利用者が見つかりません'}</p>
            <Link href="/residents" className="text-blue-600 hover:underline mt-4 inline-block">
              利用者一覧に戻る
            </Link>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const vitalTrend = getVitalTrendSummary();
  const recordsSummary = getRecordsSummary();

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/residents" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{resident.name}</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-4">
        {/* プロフィールカード */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-2xl font-bold">
                {resident.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{resident.name}</h2>
              {resident.nameKana && (
                <p className="text-sm text-gray-500">{resident.nameKana}</p>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">居室番号</p>
              <p className="text-lg font-semibold text-gray-900">{resident.roomNumber}号室</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">年齢</p>
              <p className="text-lg font-semibold text-gray-900">{calculateAge(resident.birthDate)}歳</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">生年月日</p>
              <p className="text-lg font-semibold text-gray-900">
                {resident.birthDate.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">性別</p>
              <p className="text-lg font-semibold text-gray-900">
                {resident.gender === 'male' ? '男性' : '女性'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 col-span-2">
              <p className="text-xs text-gray-500">要介護度</p>
              <p className="text-lg font-semibold text-gray-900">要介護{resident.careLevel}</p>
            </div>
          </div>

          {resident.notes && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-700 font-medium mb-1">備考</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{resident.notes}</p>
            </div>
          )}
        </div>

        {/* 直近7日間の記録サマリー */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">直近7日間の記録</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600">バイタル</p>
              <p className="text-2xl font-bold text-blue-700">{recordsSummary.totalVitals}<span className="text-sm font-normal ml-1">件</span></p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-600">排泄</p>
              <p className="text-2xl font-bold text-green-700">{recordsSummary.totalExcretions}<span className="text-sm font-normal ml-1">件</span></p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-xs text-orange-600">食事</p>
              <p className="text-2xl font-bold text-orange-700">{recordsSummary.totalMeals}<span className="text-sm font-normal ml-1">件</span></p>
            </div>
            <div className="bg-cyan-50 rounded-lg p-3">
              <p className="text-xs text-cyan-600">水分</p>
              <p className="text-2xl font-bold text-cyan-700">{recordsSummary.totalWater}<span className="text-sm font-normal ml-1">ml</span></p>
            </div>
          </div>
        </div>

        {/* バイタルトレンド */}
        {vitalTrend && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">バイタルトレンド（7日間）</h3>

            <div className="space-y-3">
              {vitalTrend.temperature && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">体温</p>
                    <p className="text-xs text-gray-500">{vitalTrend.temperature.count}回計測</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      平均 {vitalTrend.temperature.avg}°C
                    </p>
                    <p className="text-xs text-gray-500">
                      {vitalTrend.temperature.min}°C ~ {vitalTrend.temperature.max}°C
                    </p>
                  </div>
                </div>
              )}

              {vitalTrend.bloodPressure && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">血圧</p>
                    <p className="text-xs text-gray-500">{vitalTrend.bloodPressure.count}回計測</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      平均 {vitalTrend.bloodPressure.avgHigh}/{vitalTrend.bloodPressure.avgLow} mmHg
                    </p>
                  </div>
                </div>
              )}

              {vitalTrend.pulse && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">脈拍</p>
                    <p className="text-xs text-gray-500">{vitalTrend.pulse.count}回計測</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      平均 {vitalTrend.pulse.avg} bpm
                    </p>
                    <p className="text-xs text-gray-500">
                      {vitalTrend.pulse.min} ~ {vitalTrend.pulse.max} bpm
                    </p>
                  </div>
                </div>
              )}

              {vitalTrend.spO2 && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">SpO2</p>
                    <p className="text-xs text-gray-500">{vitalTrend.spO2.count}回計測</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      平均 {vitalTrend.spO2.avg}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {vitalTrend.spO2.min}% ~ {vitalTrend.spO2.max}%
                    </p>
                  </div>
                </div>
              )}

              {!vitalTrend.temperature && !vitalTrend.bloodPressure && !vitalTrend.pulse && !vitalTrend.spO2 && (
                <p className="text-center text-gray-500 py-4">バイタル記録がありません</p>
              )}
            </div>
          </div>
        )}

        {/* 記録がない場合 */}
        {recentRecords.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            <p>直近7日間の記録がありません</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
