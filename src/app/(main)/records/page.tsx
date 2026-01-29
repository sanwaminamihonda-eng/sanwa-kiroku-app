'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { getResidents, getDailyRecord, saveDailyRecord } from '@/lib/firestore';
import { getTodayString, formatTime, generateId } from '@/lib/utils';
import { BottomNav } from '@/components/navigation/BottomNav';
import type { Resident, DailyRecord, Vital, Meal, Excretion, Hydration } from '@/types';

type RecordTab = 'vital' | 'meal' | 'excretion' | 'hydration';

// ひらがな → カタカナ変換
function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) + 0x60)
  );
}

// カテゴリカラー（2層システム：背景用パステル + ボタン用濃色）
const categoryStyles = {
  vital: {
    tab: 'text-[#c96567] bg-[#fce7e8] border-[#c96567]',
    button: 'bg-[#c96567] hover:bg-[#b85557] active:bg-[#a74547]',
    selected: 'bg-[#c96567] text-white',
  },
  meal: {
    tab: 'text-[#3d9d68] bg-[#e6f7ed] border-[#3d9d68]',
    button: 'bg-[#3d9d68] hover:bg-[#358a5b] active:bg-[#2d774e]',
    selected: 'bg-[#3d9d68] text-white',
  },
  excretion: {
    tab: 'text-[#c98a3d] bg-[#fef6e6] border-[#c98a3d]',
    button: 'bg-[#c98a3d] hover:bg-[#b87a32] active:bg-[#a76a27]',
    selected: 'bg-[#c98a3d] text-white',
  },
  hydration: {
    tab: 'text-[#3a98c4] bg-[#e6f5fb] border-[#3a98c4]',
    button: 'bg-[#3a98c4] hover:bg-[#3088b4] active:bg-[#2678a4]',
    selected: 'bg-[#3a98c4] text-white',
  },
};

export default function RecordsInputPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [records, setRecords] = useState<Record<string, DailyRecord | null>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RecordTab>('vital');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const today = getTodayString();

  // 検索フィルタリング（ひらがな入力 → カタカナで検索）
  const filteredResidents = useMemo(() => {
    if (!searchQuery.trim()) return residents;
    const query = hiraganaToKatakana(searchQuery.trim());
    return residents.filter((r) =>
      r.nameKana?.includes(query) ||
      r.name.includes(searchQuery) ||
      r.roomNumber?.includes(searchQuery)
    );
  }, [residents, searchQuery]);

  // 最近記録した人（上位3名）
  const recentResidents = useMemo(() => {
    return recentIds
      .map((id) => residents.find((r) => r.id === id))
      .filter((r): r is Resident => r !== undefined)
      .slice(0, 3);
  }, [residents, recentIds]);

  // 記録保存時に「最近」リストを更新
  const handleRecordSaved = useCallback((residentId: string) => {
    setRecentIds((prev) => {
      const filtered = prev.filter((id) => id !== residentId);
      return [residentId, ...filtered].slice(0, 10);
    });
  }, []);

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

        {/* 検索バー */}
        <div className="px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 利用者を検索（ひらがな・部屋番号）"
              className="w-full px-4 py-2.5 bg-slate-100 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 最近記録した人（検索中は非表示） */}
        {!searchQuery && recentResidents.length > 0 && (
          <div className="px-4 pb-3">
            <p className="text-xs text-slate-500 mb-2">最近記録した人</p>
            <div className="flex gap-2">
              {recentResidents.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSearchQuery(r.name)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-medium text-slate-700 transition-colors"
                >
                  {r.name.split(' ')[0]} {r.roomNumber}
                </button>
              ))}
            </div>
          </div>
        )}

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
            {/* 検索結果の件数表示 */}
            {searchQuery && (
              <p className="text-xs text-slate-500 px-1">
                {filteredResidents.length}名が見つかりました
              </p>
            )}

            {filteredResidents.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>該当する利用者がいません</p>
              </div>
            ) : (
              <>
                {activeTab === 'vital' && (
                  <VitalInputList
                    residents={filteredResidents}
                    records={records}
                    today={today}
                    savingId={savingId}
                    setSavingId={setSavingId}
                    onSaved={loadData}
                    onRecordSaved={handleRecordSaved}
                  />
                )}
                {activeTab === 'meal' && (
                  <MealInputList
                    residents={filteredResidents}
                    records={records}
                    today={today}
                    savingId={savingId}
                    setSavingId={setSavingId}
                    onSaved={loadData}
                    onRecordSaved={handleRecordSaved}
                  />
                )}
                {activeTab === 'excretion' && (
                  <ExcretionInputList
                    residents={filteredResidents}
                    records={records}
                    today={today}
                    savingId={savingId}
                    setSavingId={setSavingId}
                    onSaved={loadData}
                    onRecordSaved={handleRecordSaved}
                  />
                )}
                {activeTab === 'hydration' && (
                  <HydrationInputList
                    residents={filteredResidents}
                    records={records}
                    today={today}
                    savingId={savingId}
                    setSavingId={setSavingId}
                    onSaved={loadData}
                    onRecordSaved={handleRecordSaved}
                  />
                )}
              </>
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
  onRecordSaved?: (residentId: string) => void;
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
function VitalInputList({ residents, records, today, savingId, setSavingId, onSaved, onRecordSaved }: InputListProps) {
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
      onRecordSaved?.(resident.id);
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
function MealInputList({ residents, records, today, savingId, setSavingId, onSaved, onRecordSaved }: InputListProps) {
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
      onRecordSaved?.(resident.id);
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
function ExcretionInputList({ residents, records, today, savingId, setSavingId, onSaved, onRecordSaved }: InputListProps) {
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
      onRecordSaved?.(resident.id);
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
function HydrationInputList({ residents, records, today, savingId, setSavingId, onSaved, onRecordSaved }: InputListProps) {
  const style = categoryStyles.hydration;
  const [inputs, setInputs] = useState<Record<string, {
    amount: number | 'other';
    type: string;
    customType: string;
    customAmount: string;
  }>>({});

  const getInput = (id: string) => inputs[id] || { amount: 150, type: 'お茶', customType: '', customAmount: '' };

  const updateInput = (id: string, field: string, value: number | string) => {
    setInputs((prev) => ({
      ...prev,
      [id]: { ...getInput(id), [field]: value },
    }));
  };

  const handleSave = async (resident: Resident) => {
    const input = getInput(resident.id);
    setSavingId(resident.id);

    // 「その他」の場合はカスタム値を使用
    const finalType = input.type === 'その他' ? (input.customType || 'その他') : input.type;
    const finalAmount = input.amount === 'other'
      ? (parseInt(input.customAmount) || 0)
      : input.amount;

    try {
      const existing = records[resident.id];
      const hydration: Hydration = {
        id: generateId(),
        time: formatTime(new Date()),
        amount: finalAmount,
        drinkType: finalType,
        note: '',
        recordedBy: 'demo-guest-user',
        recordedAt: new Date(),
      };

      await saveDailyRecord(resident.id, today, {
        hydrations: [...(existing?.hydrations || []), hydration],
      });
      onSaved();
      onRecordSaved?.(resident.id);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSavingId(null);
    }
  };

  const hasRecord = (id: string) => (records[id]?.hydrations?.length ?? 0) > 0;
  const amounts: (number | 'other')[] = [100, 150, 200, 'other'];
  const types = ['お茶', '水', 'その他'];

  return (
    <div className="space-y-2">
      {residents.map((resident) => {
        const input = getInput(resident.id);
        const recorded = hasRecord(resident.id);
        const isSaving = savingId === resident.id;
        const showCustomType = input.type === 'その他';
        const showCustomAmount = input.amount === 'other';

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
                {showCustomType && (
                  <input
                    type="text"
                    value={input.customType}
                    onChange={(e) => updateInput(resident.id, 'customType', e.target.value)}
                    placeholder="飲み物を入力"
                    className="mt-1 w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-[#3a98c4] focus:ring-1 focus:ring-[#3a98c4] outline-none"
                  />
                )}
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
                      {amount === 'other' ? '他' : amount}
                    </button>
                  ))}
                </div>
                {showCustomAmount && (
                  <input
                    type="number"
                    value={input.customAmount}
                    onChange={(e) => updateInput(resident.id, 'customAmount', e.target.value)}
                    placeholder="ml"
                    className="mt-1 w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-[#3a98c4] focus:ring-1 focus:ring-[#3a98c4] outline-none text-center"
                  />
                )}
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
