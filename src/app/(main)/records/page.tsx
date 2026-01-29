'use client';

import { useEffect, useState, useCallback } from 'react';
import { getResidents, getDailyRecord, saveDailyRecord } from '@/lib/firestore';
import { getTodayString, formatTime, generateId } from '@/lib/utils';
import { BottomNav } from '@/components/navigation/BottomNav';
import type { Resident, DailyRecord, Vital, Meal, Excretion, Hydration } from '@/types';

type RecordTab = 'vital' | 'meal' | 'excretion' | 'hydration';

export default function RecordsInputPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [records, setRecords] = useState<Record<string, DailyRecord | null>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RecordTab>('vital');
  const [savingId, setSavingId] = useState<string | null>(null);

  const today = getTodayString();

  const loadData = useCallback(async () => {
    try {
      const residentsData = await getResidents();
      setResidents(residentsData);

      const recordsMap: Record<string, DailyRecord | null> = {};
      await Promise.all(
        residentsData.map(async (resident) => {
          recordsMap[resident.id] = await getDailyRecord(resident.id, today);
        })
      );
      setRecords(recordsMap);
    } catch (error) {
      console.error('Failed to load:', error);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const tabs: { key: RecordTab; label: string; icon: string }[] = [
    { key: 'vital', label: 'バイタル', icon: '🌡️' },
    { key: 'meal', label: '食事', icon: '🍚' },
    { key: 'excretion', label: '排泄', icon: '🚽' },
    { key: 'hydration', label: '水分', icon: '💧' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">記録入力</h1>
          <p className="text-sm text-gray-500">{today}</p>
        </div>
        {/* タブ */}
        <div className="flex border-t border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="p-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : (
          <div className="space-y-2">
            {activeTab === 'vital' && (
              <VitalInputList
                residents={residents}
                records={records}
                today={today}
                savingId={savingId}
                setSavingId={setSavingId}
                onSaved={loadData}
              />
            )}
            {activeTab === 'meal' && (
              <MealInputList
                residents={residents}
                records={records}
                today={today}
                savingId={savingId}
                setSavingId={setSavingId}
                onSaved={loadData}
              />
            )}
            {activeTab === 'excretion' && (
              <ExcretionInputList
                residents={residents}
                records={records}
                today={today}
                savingId={savingId}
                setSavingId={setSavingId}
                onSaved={loadData}
              />
            )}
            {activeTab === 'hydration' && (
              <HydrationInputList
                residents={residents}
                records={records}
                today={today}
                savingId={savingId}
                setSavingId={setSavingId}
                onSaved={loadData}
              />
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

// ========================================
// バイタル一覧入力
// ========================================
interface InputListProps {
  residents: Resident[];
  records: Record<string, DailyRecord | null>;
  today: string;
  savingId: string | null;
  setSavingId: (id: string | null) => void;
  onSaved: () => void;
}

function VitalInputList({ residents, records, today, savingId, setSavingId, onSaved }: InputListProps) {
  const [inputs, setInputs] = useState<Record<string, { temp: string; bpH: string; bpL: string; pulse: string; spo2: string }>>({});

  const getInput = (id: string) => inputs[id] || { temp: '36.5', bpH: '120', bpL: '70', pulse: '70', spo2: '98' };

  const updateInput = (id: string, field: string, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [id]: { ...getInput(id), [field]: value },
    }));
  };

  const handleSave = async (resident: Resident) => {
    const input = getInput(resident.id);
    setSavingId(resident.id);

    try {
      const existing = records[resident.id];
      const vital: Vital = {
        id: generateId(),
        time: formatTime(new Date()),
        temperature: parseFloat(input.temp) || 36.5,
        bloodPressureHigh: parseInt(input.bpH) || 120,
        bloodPressureLow: parseInt(input.bpL) || 70,
        pulse: parseInt(input.pulse) || 70,
        spO2: parseInt(input.spo2) || 98,
        note: '',
        recordedBy: 'demo-guest-user',
        recordedAt: new Date(),
      };

      await saveDailyRecord(resident.id, today, {
        vitals: [...(existing?.vitals || []), vital],
      });
      onSaved();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSavingId(null);
    }
  };

  const hasRecord = (id: string) => (records[id]?.vitals?.length ?? 0) > 0;

  return (
    <div className="space-y-2">
      {residents.map((resident) => {
        const input = getInput(resident.id);
        const recorded = hasRecord(resident.id);
        const isSaving = savingId === resident.id;

        return (
          <div
            key={resident.id}
            className={`bg-white rounded-xl p-3 shadow-sm ${recorded ? 'border-l-4 border-green-500' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{resident.name}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {resident.roomNumber}
                </span>
                {recorded && <span className="text-green-500 text-xs">✓記録済</span>}
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              <div>
                <label className="text-xs text-gray-500">体温</label>
                <input
                  type="number"
                  step="0.1"
                  value={input.temp}
                  onChange={(e) => updateInput(resident.id, 'temp', e.target.value)}
                  className="w-full px-2 py-2 border rounded-lg text-center text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">血圧↑</label>
                <input
                  type="number"
                  value={input.bpH}
                  onChange={(e) => updateInput(resident.id, 'bpH', e.target.value)}
                  className="w-full px-2 py-2 border rounded-lg text-center text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">血圧↓</label>
                <input
                  type="number"
                  value={input.bpL}
                  onChange={(e) => updateInput(resident.id, 'bpL', e.target.value)}
                  className="w-full px-2 py-2 border rounded-lg text-center text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">脈拍</label>
                <input
                  type="number"
                  value={input.pulse}
                  onChange={(e) => updateInput(resident.id, 'pulse', e.target.value)}
                  className="w-full px-2 py-2 border rounded-lg text-center text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">SpO2</label>
                <input
                  type="number"
                  value={input.spo2}
                  onChange={(e) => updateInput(resident.id, 'spo2', e.target.value)}
                  className="w-full px-2 py-2 border rounded-lg text-center text-sm font-medium"
                />
              </div>
            </div>

            <button
              onClick={() => handleSave(resident)}
              disabled={isSaving}
              className="mt-2 w-full py-2 bg-red-500 text-white text-sm font-medium rounded-lg active:bg-red-600 disabled:opacity-50"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ========================================
// 食事一覧入力
// ========================================
function MealInputList({ residents, records, today, savingId, setSavingId, onSaved }: InputListProps) {
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner'>(() => {
    const hour = new Date().getHours();
    if (hour < 10) return 'breakfast';
    if (hour < 15) return 'lunch';
    return 'dinner';
  });

  const [inputs, setInputs] = useState<Record<string, { main: number; side: number; soup: number }>>({});

  const getInput = (id: string) => inputs[id] || { main: 100, side: 100, soup: 100 };

  const updateInput = (id: string, field: string, value: number) => {
    setInputs((prev) => ({
      ...prev,
      [id]: { ...getInput(id), [field]: value },
    }));
  };

  const handleSave = async (resident: Resident) => {
    const input = getInput(resident.id);
    setSavingId(resident.id);

    try {
      const existing = records[resident.id];
      const meal: Meal = {
        id: generateId(),
        mealType,
        mainDishAmount: input.main,
        sideDishAmount: input.side,
        soupAmount: input.soup,
        note: '',
        recordedBy: 'demo-guest-user',
        recordedAt: new Date(),
      };

      await saveDailyRecord(resident.id, today, {
        meals: [...(existing?.meals || []), meal],
      });
      onSaved();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSavingId(null);
    }
  };

  const hasRecord = (id: string) => (records[id]?.meals?.length ?? 0) > 0;
  const mealLabels = { breakfast: '朝食', lunch: '昼食', dinner: '夕食' };
  const amounts = [0, 50, 70, 100];

  return (
    <div>
      {/* 食事タイプ選択 */}
      <div className="bg-white rounded-xl p-3 shadow-sm mb-2">
        <div className="grid grid-cols-3 gap-2">
          {(['breakfast', 'lunch', 'dinner'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`py-2 rounded-lg text-sm font-medium ${
                mealType === type ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {mealLabels[type]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {residents.map((resident) => {
          const input = getInput(resident.id);
          const recorded = hasRecord(resident.id);
          const isSaving = savingId === resident.id;

          return (
            <div
              key={resident.id}
              className={`bg-white rounded-xl p-3 shadow-sm ${recorded ? 'border-l-4 border-green-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{resident.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {resident.roomNumber}
                  </span>
                  {recorded && <span className="text-green-500 text-xs">✓記録済</span>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-2">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">主食</label>
                  <div className="flex gap-1">
                    {amounts.map((v) => (
                      <button
                        key={v}
                        onClick={() => updateInput(resident.id, 'main', v)}
                        className={`flex-1 py-1 text-xs rounded ${
                          input.main === v ? 'bg-green-500 text-white' : 'bg-gray-100'
                        }`}
                      >
                        {v === 0 ? '×' : v === 100 ? '全' : v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">副食</label>
                  <div className="flex gap-1">
                    {amounts.map((v) => (
                      <button
                        key={v}
                        onClick={() => updateInput(resident.id, 'side', v)}
                        className={`flex-1 py-1 text-xs rounded ${
                          input.side === v ? 'bg-green-500 text-white' : 'bg-gray-100'
                        }`}
                      >
                        {v === 0 ? '×' : v === 100 ? '全' : v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">汁物</label>
                  <div className="flex gap-1">
                    {amounts.map((v) => (
                      <button
                        key={v}
                        onClick={() => updateInput(resident.id, 'soup', v)}
                        className={`flex-1 py-1 text-xs rounded ${
                          input.soup === v ? 'bg-green-500 text-white' : 'bg-gray-100'
                        }`}
                      >
                        {v === 0 ? '×' : v === 100 ? '全' : v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSave(resident)}
                disabled={isSaving}
                className="w-full py-2 bg-green-500 text-white text-sm font-medium rounded-lg active:bg-green-600 disabled:opacity-50"
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========================================
// 排泄一覧入力
// ========================================
function ExcretionInputList({ residents, records, today, savingId, setSavingId, onSaved }: InputListProps) {
  const [inputs, setInputs] = useState<Record<string, { type: 'urine' | 'feces' | 'both'; amount: 'small' | 'medium' | 'large' }>>({});

  const getInput = (id: string) => inputs[id] || { type: 'urine', amount: 'medium' };

  const updateInput = (id: string, field: string, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [id]: { ...getInput(id), [field]: value },
    }));
  };

  const handleSave = async (resident: Resident) => {
    const input = getInput(resident.id);
    setSavingId(resident.id);

    try {
      const existing = records[resident.id];
      const excretion: Excretion = {
        id: generateId(),
        time: formatTime(new Date()),
        type: input.type,
        urineAmount: input.type !== 'feces' ? input.amount : undefined,
        fecesAmount: input.type !== 'urine' ? input.amount : undefined,
        hasIncontinence: false,
        note: '',
        recordedBy: 'demo-guest-user',
        recordedAt: new Date(),
      };

      // undefined除去
      const cleanExcretion = Object.fromEntries(
        Object.entries(excretion).filter(([, v]) => v !== undefined)
      ) as Excretion;

      await saveDailyRecord(resident.id, today, {
        excretions: [...(existing?.excretions || []), cleanExcretion],
      });
      onSaved();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSavingId(null);
    }
  };

  const hasRecord = (id: string) => (records[id]?.excretions?.length ?? 0) > 0;

  return (
    <div className="space-y-2">
      {residents.map((resident) => {
        const input = getInput(resident.id);
        const recorded = hasRecord(resident.id);
        const isSaving = savingId === resident.id;

        return (
          <div
            key={resident.id}
            className={`bg-white rounded-xl p-3 shadow-sm ${recorded ? 'border-l-4 border-green-500' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{resident.name}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {resident.roomNumber}
                </span>
                {recorded && <span className="text-green-500 text-xs">✓記録済</span>}
              </div>
            </div>

            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">種類</label>
                <div className="flex gap-1">
                  {(['urine', 'feces', 'both'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => updateInput(resident.id, 'type', type)}
                      className={`flex-1 py-2 text-xs rounded-lg font-medium ${
                        input.type === type ? 'bg-amber-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      {type === 'urine' ? '尿' : type === 'feces' ? '便' : '両方'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">量</label>
                <div className="flex gap-1">
                  {(['small', 'medium', 'large'] as const).map((amount) => (
                    <button
                      key={amount}
                      onClick={() => updateInput(resident.id, 'amount', amount)}
                      className={`flex-1 py-2 text-xs rounded-lg font-medium ${
                        input.amount === amount ? 'bg-amber-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      {amount === 'small' ? '少' : amount === 'medium' ? '中' : '多'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSave(resident)}
              disabled={isSaving}
              className="w-full py-2 bg-amber-500 text-white text-sm font-medium rounded-lg active:bg-amber-600 disabled:opacity-50"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ========================================
// 水分一覧入力
// ========================================
function HydrationInputList({ residents, records, today, savingId, setSavingId, onSaved }: InputListProps) {
  const [inputs, setInputs] = useState<Record<string, { amount: number; type: string }>>({});

  const getInput = (id: string) => inputs[id] || { amount: 150, type: 'お茶' };

  const updateInput = (id: string, field: string, value: number | string) => {
    setInputs((prev) => ({
      ...prev,
      [id]: { ...getInput(id), [field]: value },
    }));
  };

  const handleSave = async (resident: Resident) => {
    const input = getInput(resident.id);
    setSavingId(resident.id);

    try {
      const existing = records[resident.id];
      const hydration: Hydration = {
        id: generateId(),
        time: formatTime(new Date()),
        amount: input.amount,
        drinkType: input.type,
        note: '',
        recordedBy: 'demo-guest-user',
        recordedAt: new Date(),
      };

      await saveDailyRecord(resident.id, today, {
        hydrations: [...(existing?.hydrations || []), hydration],
      });
      onSaved();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSavingId(null);
    }
  };

  const hasRecord = (id: string) => (records[id]?.hydrations?.length ?? 0) > 0;
  const amounts = [100, 150, 200];
  const types = ['お茶', '水', 'コーヒー'];

  return (
    <div className="space-y-2">
      {residents.map((resident) => {
        const input = getInput(resident.id);
        const recorded = hasRecord(resident.id);
        const isSaving = savingId === resident.id;

        return (
          <div
            key={resident.id}
            className={`bg-white rounded-xl p-3 shadow-sm ${recorded ? 'border-l-4 border-green-500' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{resident.name}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {resident.roomNumber}
                </span>
                {recorded && <span className="text-green-500 text-xs">✓記録済</span>}
              </div>
            </div>

            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">飲み物</label>
                <div className="flex gap-1">
                  {types.map((type) => (
                    <button
                      key={type}
                      onClick={() => updateInput(resident.id, 'type', type)}
                      className={`flex-1 py-2 text-xs rounded-lg font-medium ${
                        input.type === type ? 'bg-cyan-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">量(ml)</label>
                <div className="flex gap-1">
                  {amounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => updateInput(resident.id, 'amount', amount)}
                      className={`flex-1 py-2 text-xs rounded-lg font-medium ${
                        input.amount === amount ? 'bg-cyan-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSave(resident)}
              disabled={isSaving}
              className="w-full py-2 bg-cyan-500 text-white text-sm font-medium rounded-lg active:bg-cyan-600 disabled:opacity-50"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
