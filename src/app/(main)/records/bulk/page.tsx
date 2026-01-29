'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getResidents } from '@/lib/firestore';
import { saveBulkRecords } from '@/lib/firestore';
import { getTodayString, formatTime, generateId } from '@/lib/utils';
import type { Resident, Vital, Meal, Hydration, Excretion } from '@/types';

type RecordType = 'vital' | 'meal' | 'hydration' | 'excretion';

interface QuickVital {
  temperature: number;
  bloodPressureHigh: number;
  bloodPressureLow: number;
  pulse: number;
  spO2: number;
}

interface QuickMeal {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  mainDishAmount: number;
  sideDishAmount: number;
  soupAmount: number;
}

interface QuickHydration {
  amount: number;
  drinkType: string;
}

interface QuickExcretion {
  type: 'urine' | 'feces' | 'both';
  urineAmount?: 'small' | 'medium' | 'large';
  fecesAmount?: 'small' | 'medium' | 'large';
}

export default function BulkRecordPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [recordType, setRecordType] = useState<RecordType>('vital');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 入力値
  const [vital, setVital] = useState<QuickVital>({
    temperature: 36.5,
    bloodPressureHigh: 120,
    bloodPressureLow: 70,
    pulse: 70,
    spO2: 98,
  });

  const [meal, setMeal] = useState<QuickMeal>({
    mealType: 'breakfast',
    mainDishAmount: 100,
    sideDishAmount: 100,
    soupAmount: 100,
  });

  const [hydration, setHydration] = useState<QuickHydration>({
    amount: 150,
    drinkType: 'お茶',
  });

  const [excretion, setExcretion] = useState<QuickExcretion>({
    type: 'urine',
    urineAmount: 'medium',
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await getResidents();
        setResidents(data);
      } catch (error) {
        console.error('Failed to load residents:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === residents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(residents.map((r) => r.id)));
    }
  };

  const handleSave = useCallback(async () => {
    if (selectedIds.size === 0) {
      setMessage({ type: 'error', text: '利用者を選択してください' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const date = getTodayString();
      const time = formatTime(new Date());
      const recordedBy = 'demo-guest-user';
      const recordedAt = new Date();

      const records = Array.from(selectedIds).map((residentId) => {
        let data: Record<string, unknown> = {};

        if (recordType === 'vital') {
          const newVital: Vital = {
            id: generateId(),
            time,
            ...vital,
            note: '',
            recordedBy,
            recordedAt,
          };
          data = { vitals: [newVital] };
        } else if (recordType === 'meal') {
          const newMeal: Meal = {
            id: generateId(),
            ...meal,
            note: '',
            recordedBy,
            recordedAt,
          };
          data = { meals: [newMeal] };
        } else if (recordType === 'hydration') {
          const newHydration: Hydration = {
            id: generateId(),
            time,
            ...hydration,
            note: '',
            recordedBy,
            recordedAt,
          };
          data = { hydrations: [newHydration] };
        } else if (recordType === 'excretion') {
          const newExcretion: Excretion = {
            id: generateId(),
            time,
            ...excretion,
            hasIncontinence: false,
            note: '',
            recordedBy,
            recordedAt,
          };
          data = { excretions: [newExcretion] };
        }

        return { residentId, date, data };
      });

      await saveBulkRecords(records);
      setMessage({ type: 'success', text: `${selectedIds.size}名に記録を保存しました` });
      setSelectedIds(new Set());
    } catch (error) {
      setMessage({ type: 'error', text: '保存に失敗しました' });
      console.error(error);
    } finally {
      setSaving(false);
    }
  }, [selectedIds, recordType, vital, meal, hydration, excretion]);

  const recordTypeLabels: Record<RecordType, string> = {
    vital: 'バイタル',
    meal: '食事',
    hydration: '水分',
    excretion: '排泄',
  };

  const mealTypeLabels = {
    breakfast: '朝食',
    lunch: '昼食',
    dinner: '夕食',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/records" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">一括入力</h1>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-4">
        {/* 記録タイプ選択 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h2 className="text-sm font-semibold text-gray-600 mb-3">記録タイプ</h2>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(recordTypeLabels) as RecordType[]).map((type) => (
              <button
                key={type}
                onClick={() => setRecordType(type)}
                className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                  recordType === type
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {recordTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/* 入力フォーム */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h2 className="text-sm font-semibold text-gray-600 mb-3">
            {recordTypeLabels[recordType]}の値
          </h2>

          {recordType === 'vital' && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-xs text-gray-500">体温</label>
                <input
                  type="number"
                  step="0.1"
                  value={vital.temperature}
                  onChange={(e) => setVital({ ...vital, temperature: parseFloat(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-center text-lg font-medium"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">血圧(上)</label>
                <input
                  type="number"
                  value={vital.bloodPressureHigh}
                  onChange={(e) => setVital({ ...vital, bloodPressureHigh: parseInt(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-center text-lg font-medium"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">血圧(下)</label>
                <input
                  type="number"
                  value={vital.bloodPressureLow}
                  onChange={(e) => setVital({ ...vital, bloodPressureLow: parseInt(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-center text-lg font-medium"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">脈拍</label>
                <input
                  type="number"
                  value={vital.pulse}
                  onChange={(e) => setVital({ ...vital, pulse: parseInt(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-center text-lg font-medium"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">SpO2</label>
                <input
                  type="number"
                  value={vital.spO2}
                  onChange={(e) => setVital({ ...vital, spO2: parseInt(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-center text-lg font-medium"
                />
              </div>
            </div>
          )}

          {recordType === 'meal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(['breakfast', 'lunch', 'dinner'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setMeal({ ...meal, mealType: type })}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      meal.mealType === type
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {mealTypeLabels[type]}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500">主食</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={meal.mainDishAmount}
                      onChange={(e) => setMeal({ ...meal, mainDishAmount: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="w-12 text-right font-medium">{meal.mainDishAmount}%</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">副食</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={meal.sideDishAmount}
                      onChange={(e) => setMeal({ ...meal, sideDishAmount: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="w-12 text-right font-medium">{meal.sideDishAmount}%</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">汁物</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={meal.soupAmount}
                      onChange={(e) => setMeal({ ...meal, soupAmount: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="w-12 text-right font-medium">{meal.soupAmount}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {recordType === 'hydration' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">飲み物</label>
                <select
                  value={hydration.drinkType}
                  onChange={(e) => setHydration({ ...hydration, drinkType: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-lg"
                >
                  <option value="お茶">お茶</option>
                  <option value="水">水</option>
                  <option value="コーヒー">コーヒー</option>
                  <option value="ジュース">ジュース</option>
                  <option value="牛乳">牛乳</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">量 (ml)</label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {[100, 150, 200, 250].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setHydration({ ...hydration, amount })}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        hydration.amount === amount
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {recordType === 'excretion' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(['urine', 'feces', 'both'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setExcretion({ ...excretion, type, urineAmount: type !== 'feces' ? 'medium' : undefined, fecesAmount: type !== 'urine' ? 'medium' : undefined })}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      excretion.type === type
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {type === 'urine' ? '尿' : type === 'feces' ? '便' : '両方'}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {excretion.type !== 'feces' && (
                  <div>
                    <label className="text-xs text-gray-500">尿量</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {(['small', 'medium', 'large'] as const).map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setExcretion({ ...excretion, urineAmount: amount })}
                          className={`py-2 rounded-lg text-xs font-medium transition-all ${
                            excretion.urineAmount === amount
                              ? 'bg-amber-600 text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {amount === 'small' ? '少' : amount === 'medium' ? '中' : '多'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {excretion.type !== 'urine' && (
                  <div>
                    <label className="text-xs text-gray-500">便量</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {(['small', 'medium', 'large'] as const).map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setExcretion({ ...excretion, fecesAmount: amount })}
                          className={`py-2 rounded-lg text-xs font-medium transition-all ${
                            excretion.fecesAmount === amount
                              ? 'bg-amber-600 text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {amount === 'small' ? '少' : amount === 'medium' ? '中' : '多'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 利用者選択 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-600">
              利用者選択 ({selectedIds.size}/{residents.length})
            </h2>
            <button
              onClick={selectAll}
              className="text-sm text-blue-600 font-medium"
            >
              {selectedIds.size === residents.length ? '全解除' : '全選択'}
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {residents.map((resident) => (
                <button
                  key={resident.id}
                  onClick={() => toggleSelect(resident.id)}
                  className={`p-3 rounded-lg text-left transition-all border-2 ${
                    selectedIds.has(resident.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        selectedIds.has(resident.id)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {resident.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {resident.name}
                      </p>
                      <p className="text-xs text-gray-500">{resident.roomNumber}号室</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 固定フッター */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="max-w-screen-xl mx-auto">
          {message && (
            <p
              className={`text-sm text-center mb-2 ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message.text}
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={saving || selectedIds.size === 0}
            className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
              saving || selectedIds.size === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
            }`}
          >
            {saving ? '保存中...' : `${selectedIds.size}名に${recordTypeLabels[recordType]}を記録`}
          </button>
        </div>
      </div>
    </div>
  );
}
