'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getResident, getDailyRecord, saveDailyRecord } from '@/lib/firestore';
import { getTodayString, calculateAge } from '@/lib/utils';
import { RecordTabs } from '@/components/records/RecordTabs';
import { VitalInput } from '@/components/records/VitalInput';
import { ExcretionInput } from '@/components/records/ExcretionInput';
import { MealInput } from '@/components/records/MealInput';
import { HydrationInput } from '@/components/records/HydrationInput';
import type { Resident, DailyRecord, RecordTab, Vital, Excretion, Meal, Hydration } from '@/types';

export default function ResidentRecordPage() {
  const params = useParams();
  const residentId = params.id as string;
  const { user } = useAuth();

  const [resident, setResident] = useState<Resident | null>(null);
  const [dailyRecord, setDailyRecord] = useState<DailyRecord | null>(null);
  const [activeTab, setActiveTab] = useState<RecordTab>('vital');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const today = getTodayString();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [residentData, recordData] = await Promise.all([
        getResident(residentId),
        getDailyRecord(residentId, today),
      ]);
      setResident(residentData);
      setDailyRecord(
        recordData || {
          id: '',
          residentId,
          date: today,
          vitals: [],
          excretions: [],
          meals: [],
          hydrations: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [residentId, today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveRecord = async (updates: Partial<DailyRecord>) => {
    if (!dailyRecord) return;

    try {
      setSaving(true);
      const updatedRecord = { ...dailyRecord, ...updates };
      await saveDailyRecord(residentId, today, updates);
      setDailyRecord(updatedRecord);
    } catch (error) {
      console.error('Failed to save record:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  // バイタル追加/削除
  const handleAddVital = (vital: Vital) => {
    if (!dailyRecord) return;
    const vitals = [...dailyRecord.vitals, vital];
    saveRecord({ vitals });
  };

  const handleRemoveVital = (id: string) => {
    if (!dailyRecord) return;
    const vitals = dailyRecord.vitals.filter((v) => v.id !== id);
    saveRecord({ vitals });
  };

  // 排泄追加/削除
  const handleAddExcretion = (excretion: Excretion) => {
    if (!dailyRecord) return;
    const excretions = [...dailyRecord.excretions, excretion];
    saveRecord({ excretions });
  };

  const handleRemoveExcretion = (id: string) => {
    if (!dailyRecord) return;
    const excretions = dailyRecord.excretions.filter((e) => e.id !== id);
    saveRecord({ excretions });
  };

  // 食事追加/削除
  const handleAddMeal = (meal: Meal) => {
    if (!dailyRecord) return;
    const meals = [...dailyRecord.meals, meal];
    saveRecord({ meals });
  };

  const handleRemoveMeal = (id: string) => {
    if (!dailyRecord) return;
    const meals = dailyRecord.meals.filter((m) => m.id !== id);
    saveRecord({ meals });
  };

  // 水分追加/削除
  const handleAddHydration = (hydration: Hydration) => {
    if (!dailyRecord) return;
    const hydrations = [...dailyRecord.hydrations, hydration];
    saveRecord({ hydrations });
  };

  const handleRemoveHydration = (id: string) => {
    if (!dailyRecord) return;
    const hydrations = dailyRecord.hydrations.filter((h) => h.id !== id);
    saveRecord({ hydrations });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">利用者が見つかりません</p>
          <Link href="/records" className="text-blue-600 hover:underline">
            一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/records" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{resident.name}</h1>
                <p className="text-xs text-gray-500">
                  {resident.roomNumber}号室 • {calculateAge(resident.birthDate)}歳
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {new Date(today).toLocaleDateString('ja-JP', {
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              {saving && (
                <span className="text-xs text-blue-600">保存中...</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* タブ */}
      <RecordTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 記録入力フォーム */}
      <main className="max-w-screen-xl mx-auto bg-white min-h-[calc(100vh-180px)]">
        {activeTab === 'vital' && dailyRecord && (
          <VitalInput
            vitals={dailyRecord.vitals}
            onAdd={handleAddVital}
            onRemove={handleRemoveVital}
            recordedBy={user?.id || ''}
          />
        )}
        {activeTab === 'excretion' && dailyRecord && (
          <ExcretionInput
            excretions={dailyRecord.excretions}
            onAdd={handleAddExcretion}
            onRemove={handleRemoveExcretion}
            recordedBy={user?.id || ''}
          />
        )}
        {activeTab === 'meal' && dailyRecord && (
          <MealInput
            meals={dailyRecord.meals}
            onAdd={handleAddMeal}
            onRemove={handleRemoveMeal}
            recordedBy={user?.id || ''}
          />
        )}
        {activeTab === 'hydration' && dailyRecord && (
          <HydrationInput
            hydrations={dailyRecord.hydrations}
            onAdd={handleAddHydration}
            onRemove={handleRemoveHydration}
            recordedBy={user?.id || ''}
          />
        )}
      </main>
    </div>
  );
}
