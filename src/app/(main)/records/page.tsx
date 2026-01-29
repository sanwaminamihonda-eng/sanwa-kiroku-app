'use client';

import { useEffect, useState, useCallback } from 'react';
import { getResidents, getDailyRecord, saveDailyRecord } from '@/lib/firestore';
import { getTodayString, formatTime, generateId } from '@/lib/utils';
import { BottomNav } from '@/components/navigation/BottomNav';
import type { Resident, DailyRecord, Vital, Meal, Excretion, Hydration } from '@/types';

type RecordTab = 'vital' | 'meal' | 'excretion' | 'hydration';

// カテゴリカラー（同トーンのソフトパステル）
const categoryStyles = {
  vital: {
    tab: 'text-[#c97476] bg-[#fce7e8] border-[#e8a5a7]',
    button: 'bg-[#e8a5a7] hover:bg-[#d99496] active:bg-[#c97476]',
    selected: 'bg-[#e8a5a7] text-white',
  },
  meal: {
    tab: 'text-[#4da672] bg-[#e6f7ed] border-[#86d4a8]',
    button: 'bg-[#86d4a8] hover:bg-[#6bc492] active:bg-[#4da672]',
    selected: 'bg-[#86d4a8] text-white',
  },
  excretion: {
    tab: 'text-[#c9a44a] bg-[#fef6e6] border-[#f5c97a]',
    button: 'bg-[#f5c97a] hover:bg-[#e8b85a] active:bg-[#c9a44a]',
    selected: 'bg-[#f5c97a] text-white',
  },
  hydration: {
    tab: 'text-[#4a9ebe] bg-[#e6f5fb] border-[#7ec8e8]',
    button: 'bg-[#7ec8e8] hover:bg-[#5eb8dc] active:bg-[#4a9ebe]',
    selected: 'bg-[#7ec8e8] text-white',
  },
};

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

  const tabs: { key: RecordTab; label: string }[] = [
    { key: 'vital', label: 'バイタル' },
    { key: 'meal', label: '食事' },
    { key: 'excretion', label: '排泄' },
    { key: 'hydration', label: '水分' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-slate-800">記録入力</h1>
          <p className="text-sm text-slate-500">{today}</p>
        </div>
        {/* タブ */}
        <div className="flex border-t border-slate-100">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const style = categoryStyles[tab.key];
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 text-center text-sm font-medium transition-all ${
                  isActive
                    ? `${style.tab} border-b-2`
                    : 'text-slate-400 hover:bg-slate-50 border-b-2 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="p-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-400" />
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
// 共通コンポーネント
// ========================================
interface InputListProps {
  residents: Resident[];
  records: Record<string, DailyRecord | null>;
  today: string;
  savingId: string | null;
  setSavingId: (id: string | null) => void;
  onSaved: () => void;
}

function ResidentHeader({ resident, recorded }: { resident: Resident; recorded: boolean }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-slate-800">{resident.name}</span>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          {resident.roomNumber}
        </span>
        {recorded && (
          <span className="text-emerald-600 text-xs font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
            ✓済
          </span>
        )}
      </div>
    </div>
  );
}

// ========================================
// バイタル一覧入力
// ========================================
function VitalInputList({ residents, records, today, savingId, setSavingId, onSaved }: InputListProps) {
  const [inputs, setInputs] = useState<Record<string, { temp: string; bpH: string; bpL: string; pulse: string; spo2: string }>>({});
  const style = categoryStyles.vital;

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
            className={`bg-white rounded-xl p-3 shadow-sm border ${
              recorded ? 'border-l-4 border-l-emerald-400 border-t-slate-100 border-r-slate-100 border-b-slate-100' : 'border-slate-100'
            }`}
          >
            <ResidentHeader resident={resident} recorded={recorded} />

            <div className="grid grid-cols-5 gap-2">
              <div>
                <label className="text-xs text-slate-500">体温</label>
                <input
                  type="number"
                  step="0.1"
                  value={input.temp}
                  onChange={(e) => updateInput(resident.id, 'temp', e.target.value)}
                  className="w-full px-2 py-2 border border-slate-200 rounded-lg text-center text-sm font-medium focus:border-slate-400 focus:ring-1 focus:ring-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">血圧↑</label>
                <input
                  type="number"
                  value={input.bpH}
                  onChange={(e) => updateInput(resident.id, 'bpH', e.target.value)}
                  className="w-full px-2 py-2 border border-slate-200 rounded-lg text-center text-sm font-medium focus:border-slate-400 focus:ring-1 focus:ring-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">血圧↓</label>
                <input
                  type="number"
                  value={input.bpL}
                  onChange={(e) => updateInput(resident.id, 'bpL', e.target.value)}
                  className="w-full px-2 py-2 border border-slate-200 rounded-lg text-center text-sm font-medium focus:border-slate-400 focus:ring-1 focus:ring-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">脈拍</label>
                <input
                  type="number"
                  value={input.pulse}
                  onChange={(e) => updateInput(resident.id, 'pulse', e.target.value)}
                  className="w-full px-2 py-2 border border-slate-200 rounded-lg text-center text-sm font-medium focus:border-slate-400 focus:ring-1 focus:ring-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">SpO2</label>
                <input
                  type="number"
                  value={input.spo2}
                  onChange={(e) => updateInput(resident.id, 'spo2', e.target.value)}
                  className="w-full px-2 py-2 border border-slate-200 rounded-lg text-center text-sm font-medium focus:border-slate-400 focus:ring-1 focus:ring-slate-200 outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => handleSave(resident)}
              disabled={isSaving}
              className={`mt-2 w-full py-2.5 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ${style.button}`}
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
  const style = categoryStyles.meal;
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
      <div className="bg-white rounded-xl p-3 shadow-sm mb-2 border border-slate-100">
        <div className="grid grid-cols-3 gap-2">
          {(['breakfast', 'lunch', 'dinner'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                mealType === type ? style.selected : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
              className={`bg-white rounded-xl p-3 shadow-sm border ${
                recorded ? 'border-l-4 border-l-emerald-400 border-t-slate-100 border-r-slate-100 border-b-slate-100' : 'border-slate-100'
              }`}
            >
              <ResidentHeader resident={resident} recorded={recorded} />

              <div className="grid grid-cols-3 gap-3 mb-2">
                {(['main', 'side', 'soup'] as const).map((field) => (
                  <div key={field}>
                    <label className="text-xs text-slate-500 block mb-1">
                      {field === 'main' ? '主食' : field === 'side' ? '副食' : '汁物'}
                    </label>
                    <div className="flex gap-1">
                      {amounts.map((v) => (
                        <button
                          key={v}
                          onClick={() => updateInput(resident.id, field, v)}
                          className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-colors ${
                            input[field] === v ? style.selected : 'bg-slate-100 hover:bg-slate-200'
                          }`}
                        >
                          {v === 0 ? '×' : v === 100 ? '全' : v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSave(resident)}
                disabled={isSaving}
                className={`w-full py-2.5 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ${style.button}`}
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
  const style = categoryStyles.excretion;
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
            className={`bg-white rounded-xl p-3 shadow-sm border ${
              recorded ? 'border-l-4 border-l-emerald-400 border-t-slate-100 border-r-slate-100 border-b-slate-100' : 'border-slate-100'
            }`}
          >
            <ResidentHeader resident={resident} recorded={recorded} />

            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <label className="text-xs text-slate-500 block mb-1">種類</label>
                <div className="flex gap-1">
                  {(['urine', 'feces', 'both'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => updateInput(resident.id, 'type', type)}
                      className={`flex-1 py-2 text-xs rounded-lg font-medium transition-colors ${
                        input.type === type ? style.selected : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {type === 'urine' ? '尿' : type === 'feces' ? '便' : '両方'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500 block mb-1">量</label>
                <div className="flex gap-1">
                  {(['small', 'medium', 'large'] as const).map((amount) => (
                    <button
                      key={amount}
                      onClick={() => updateInput(resident.id, 'amount', amount)}
                      className={`flex-1 py-2 text-xs rounded-lg font-medium transition-colors ${
                        input.amount === amount ? style.selected : 'bg-slate-100 hover:bg-slate-200'
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
              className={`w-full py-2.5 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ${style.button}`}
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
  const style = categoryStyles.hydration;
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
            className={`bg-white rounded-xl p-3 shadow-sm border ${
              recorded ? 'border-l-4 border-l-emerald-400 border-t-slate-100 border-r-slate-100 border-b-slate-100' : 'border-slate-100'
            }`}
          >
            <ResidentHeader resident={resident} recorded={recorded} />

            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <label className="text-xs text-slate-500 block mb-1">飲み物</label>
                <div className="flex gap-1">
                  {types.map((type) => (
                    <button
                      key={type}
                      onClick={() => updateInput(resident.id, 'type', type)}
                      className={`flex-1 py-2 text-xs rounded-lg font-medium transition-colors ${
                        input.type === type ? style.selected : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500 block mb-1">量(ml)</label>
                <div className="flex gap-1">
                  {amounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => updateInput(resident.id, 'amount', amount)}
                      className={`flex-1 py-2 text-xs rounded-lg font-medium transition-colors ${
                        input.amount === amount ? style.selected : 'bg-slate-100 hover:bg-slate-200'
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
              className={`w-full py-2.5 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ${style.button}`}
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
