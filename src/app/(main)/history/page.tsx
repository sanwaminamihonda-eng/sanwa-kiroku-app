'use client';

import { useEffect, useState, useCallback } from 'react';
import { getResidents, getDailyRecord, saveDailyRecord } from '@/lib/firestore';
import { getTodayString, formatDate } from '@/lib/utils';
import { BottomNav } from '@/components/navigation/BottomNav';
import type { Resident, DailyRecord, Vital, Meal, Excretion, Hydration } from '@/types';

// カテゴリカラー（records画面と統一）
const categoryColors = {
  vital: { bg: 'bg-[#fce7e8]', text: 'text-[#c97476]', badge: 'bg-[#fce7e8] text-[#c97476]' },
  meal: { bg: 'bg-[#e6f7ed]', text: 'text-[#4da672]', badge: 'bg-[#e6f7ed] text-[#4da672]' },
  excretion: { bg: 'bg-[#fef6e6]', text: 'text-[#c9a44a]', badge: 'bg-[#fef6e6] text-[#c9a44a]' },
  hydration: { bg: 'bg-[#e6f5fb]', text: 'text-[#4a9ebe]', badge: 'bg-[#e6f5fb] text-[#4a9ebe]' },
};

interface ResidentWithRecord {
  resident: Resident;
  record: DailyRecord | null;
}

export default function HistoryPage() {
  const [date, setDate] = useState(getTodayString());
  const [residents, setResidents] = useState<Resident[]>([]);
  const [data, setData] = useState<ResidentWithRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResidentId, setSelectedResidentId] = useState<string>('all');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const residentsData = await getResidents();
      setResidents(residentsData);

      const recordPromises = residentsData.map(async (resident) => {
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

  const goToToday = () => {
    setDate(getTodayString());
  };

  const filteredData = selectedResidentId === 'all'
    ? data
    : data.filter((d) => d.resident.id === selectedResidentId);

  const isToday = date === getTodayString();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-slate-800">記録履歴</h1>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200"
            aria-label="前日"
          >
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center flex-1">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-lg font-bold text-slate-800 bg-transparent border-none focus:outline-none text-center cursor-pointer"
            />
            <p className="text-sm text-slate-500">
              {new Date(date).toLocaleDateString('ja-JP', { weekday: 'long' })}
              {isToday && <span className="ml-2 text-slate-600 font-medium">(今日)</span>}
            </p>
          </div>

          <button
            onClick={() => changeDate(1)}
            disabled={isToday}
            className={`p-2 rounded-lg ${
              isToday ? 'text-slate-200' : 'hover:bg-slate-100 active:bg-slate-200 text-slate-500'
            }`}
            aria-label="翌日"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Today Button & Resident Filter */}
        <div className="flex items-center gap-2 px-4 py-2 border-t border-slate-100">
          {!isToday && (
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              今日に戻る
            </button>
          )}
          <select
            value={selectedResidentId}
            onChange={(e) => setSelectedResidentId(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="all">全ての利用者</option>
            {residents.map((resident) => (
              <option key={resident.id} value={resident.id}>
                {resident.name} ({resident.roomNumber})
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-400" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-slate-500 border border-slate-100">
            <p>利用者が登録されていません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredData.map(({ resident, record }) => (
              <ResidentRecordCard
                key={resident.id}
                resident={resident}
                record={record}
                date={date}
                onUpdate={loadData}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

interface ResidentRecordCardProps {
  resident: Resident;
  record: DailyRecord | null;
  date: string;
  onUpdate: () => void;
}

type CategoryType = 'vital' | 'meal' | 'excretion' | 'hydration';

function ResidentRecordCard({ resident, record, date, onUpdate }: ResidentRecordCardProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [editingItem, setEditingItem] = useState<{
    type: 'vital' | 'meal' | 'excretion' | 'hydration';
    item: Vital | Meal | Excretion | Hydration;
  } | null>(null);

  const hasVitals = record && record.vitals.length > 0;
  const hasExcretions = record && record.excretions.length > 0;
  const hasMeals = record && record.meals.length > 0;
  const hasHydrations = record && record.hydrations.length > 0;
  const hasAnyRecord = hasVitals || hasExcretions || hasMeals || hasHydrations;

  const totalHydration = record?.hydrations.reduce((sum, h) => sum + h.amount, 0) || 0;
  const latestVital = record?.vitals[record.vitals.length - 1];

  const handleDelete = async (type: 'vital' | 'meal' | 'excretion' | 'hydration', itemId: string) => {
    if (!record) return;
    if (!confirm('この記録を削除しますか？')) return;

    try {
      const updateData: Partial<DailyRecord> = {};
      if (type === 'vital') {
        updateData.vitals = record.vitals.filter((v) => v.id !== itemId);
      } else if (type === 'meal') {
        updateData.meals = record.meals.filter((m) => m.id !== itemId);
      } else if (type === 'excretion') {
        updateData.excretions = record.excretions.filter((e) => e.id !== itemId);
      } else if (type === 'hydration') {
        updateData.hydrations = record.hydrations.filter((h) => h.id !== itemId);
      }
      await saveDailyRecord(resident.id, date, updateData);
      onUpdate();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        {/* Resident Info Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-slate-600 font-bold text-lg">{resident.name.charAt(0)}</span>
            </div>
            <div>
              <p className="font-bold text-slate-800">{resident.name}</p>
              <p className="text-xs text-slate-500">{resident.roomNumber}号室</p>
            </div>
          </div>
          {!hasAnyRecord && (
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">未記録</span>
          )}
        </div>

        {/* Summary Tabs (Clickable) */}
        {hasAnyRecord && (
          <div className="px-4 pb-3">
            <div className="grid grid-cols-4 gap-2 text-center">
              <button
                onClick={() => setSelectedCategory(selectedCategory === 'vital' ? null : 'vital')}
                className={`p-2 rounded-lg transition-all ${
                  hasVitals ? categoryColors.vital.bg : 'bg-slate-50'
                } ${selectedCategory === 'vital' ? 'ring-2 ring-[#c97476] ring-offset-1' : ''}`}
              >
                <p className="text-xs text-slate-500">バイタル</p>
                {latestVital ? (
                  <p className="text-sm font-medium text-slate-700">
                    {latestVital.temperature?.toFixed(1)}度
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">-</p>
                )}
              </button>
              <button
                onClick={() => setSelectedCategory(selectedCategory === 'excretion' ? null : 'excretion')}
                className={`p-2 rounded-lg transition-all ${
                  hasExcretions ? categoryColors.excretion.bg : 'bg-slate-50'
                } ${selectedCategory === 'excretion' ? 'ring-2 ring-[#c9a44a] ring-offset-1' : ''}`}
              >
                <p className="text-xs text-slate-500">排泄</p>
                <p className="text-sm font-medium text-slate-700">
                  {record?.excretions.length || 0}回
                </p>
              </button>
              <button
                onClick={() => setSelectedCategory(selectedCategory === 'meal' ? null : 'meal')}
                className={`p-2 rounded-lg transition-all ${
                  hasMeals ? categoryColors.meal.bg : 'bg-slate-50'
                } ${selectedCategory === 'meal' ? 'ring-2 ring-[#4da672] ring-offset-1' : ''}`}
              >
                <p className="text-xs text-slate-500">食事</p>
                <p className="text-sm font-medium text-slate-700">
                  {record?.meals.length || 0}食
                </p>
              </button>
              <button
                onClick={() => setSelectedCategory(selectedCategory === 'hydration' ? null : 'hydration')}
                className={`p-2 rounded-lg transition-all ${
                  hasHydrations ? categoryColors.hydration.bg : 'bg-slate-50'
                } ${selectedCategory === 'hydration' ? 'ring-2 ring-[#4a9ebe] ring-offset-1' : ''}`}
              >
                <p className="text-xs text-slate-500">水分</p>
                <p className="text-sm font-medium text-slate-700">
                  {totalHydration}ml
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Category Details (Selected Only) */}
        {selectedCategory && hasAnyRecord && (
          <div className="px-4 pb-4 pt-2 border-t border-slate-100">
            {selectedCategory === 'vital' && hasVitals && (
              <RecordSection title="バイタル" category="vital">
                {record!.vitals.map((vital) => (
                  <VitalItem
                    key={vital.id}
                    vital={vital}
                    onEdit={() => setEditingItem({ type: 'vital', item: vital })}
                    onDelete={() => handleDelete('vital', vital.id)}
                  />
                ))}
              </RecordSection>
            )}

            {selectedCategory === 'meal' && hasMeals && (
              <RecordSection title="食事" category="meal">
                {record!.meals.map((meal) => (
                  <MealItem
                    key={meal.id}
                    meal={meal}
                    onEdit={() => setEditingItem({ type: 'meal', item: meal })}
                    onDelete={() => handleDelete('meal', meal.id)}
                  />
                ))}
              </RecordSection>
            )}

            {selectedCategory === 'excretion' && hasExcretions && (
              <RecordSection title="排泄" category="excretion">
                {record!.excretions.map((excretion) => (
                  <ExcretionItem
                    key={excretion.id}
                    excretion={excretion}
                    onEdit={() => setEditingItem({ type: 'excretion', item: excretion })}
                    onDelete={() => handleDelete('excretion', excretion.id)}
                  />
                ))}
              </RecordSection>
            )}

            {selectedCategory === 'hydration' && hasHydrations && (
              <RecordSection title="水分" category="hydration">
                {record!.hydrations.map((hydration) => (
                  <HydrationItem
                    key={hydration.id}
                    hydration={hydration}
                    onEdit={() => setEditingItem({ type: 'hydration', item: hydration })}
                    onDelete={() => handleDelete('hydration', hydration.id)}
                  />
                ))}
              </RecordSection>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <EditModal
          type={editingItem.type}
          item={editingItem.item}
          record={record!}
          residentId={resident.id}
          date={date}
          onClose={() => setEditingItem(null)}
          onSaved={() => {
            setEditingItem(null);
            onUpdate();
          }}
        />
      )}
    </>
  );
}

interface RecordSectionProps {
  title: string;
  category: 'vital' | 'meal' | 'excretion' | 'hydration';
  children: React.ReactNode;
}

function RecordSection({ title, category, children }: RecordSectionProps) {
  const colors = categoryColors[category];

  return (
    <div>
      <h4 className={`inline-block text-xs font-medium px-2 py-1 rounded-full mb-2 ${colors.badge}`}>
        {title}
      </h4>
      <div className="space-y-2 pl-1">{children}</div>
    </div>
  );
}

interface ItemProps {
  onEdit: () => void;
  onDelete: () => void;
}

function VitalItem({ vital, onEdit, onDelete }: { vital: Vital } & ItemProps) {
  return (
    <div className="bg-slate-50 rounded-lg p-2 text-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-slate-500 text-xs">{vital.time}</span>
        <div className="flex gap-1">
          <button onClick={onEdit} className="text-slate-500 text-xs px-2 py-1 hover:bg-slate-200 rounded">
            編集
          </button>
          <button onClick={onDelete} className="text-red-400 text-xs px-2 py-1 hover:bg-red-50 rounded">
            削除
          </button>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1 text-center">
        {vital.temperature && (
          <div>
            <p className="text-xs text-slate-400">体温</p>
            <p className="font-medium text-slate-700">{vital.temperature.toFixed(1)}</p>
          </div>
        )}
        {vital.bloodPressureHigh && (
          <div>
            <p className="text-xs text-slate-400">血圧</p>
            <p className="font-medium text-slate-700">{vital.bloodPressureHigh}/{vital.bloodPressureLow}</p>
          </div>
        )}
        {vital.pulse && (
          <div>
            <p className="text-xs text-slate-400">脈拍</p>
            <p className="font-medium text-slate-700">{vital.pulse}</p>
          </div>
        )}
        {vital.spO2 && (
          <div>
            <p className="text-xs text-slate-400">SpO2</p>
            <p className="font-medium text-slate-700">{vital.spO2}%</p>
          </div>
        )}
      </div>
      {vital.note && <p className="text-xs text-slate-500 mt-1">{vital.note}</p>}
    </div>
  );
}

function MealItem({ meal, onEdit, onDelete }: { meal: Meal } & ItemProps) {
  const mealTypeLabels: Record<string, string> = {
    breakfast: '朝食',
    lunch: '昼食',
    dinner: '夕食',
    snack: '間食',
  };

  return (
    <div className="bg-slate-50 rounded-lg p-2 text-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-slate-700">{mealTypeLabels[meal.mealType]}</span>
        <div className="flex gap-1">
          <button onClick={onEdit} className="text-slate-500 text-xs px-2 py-1 hover:bg-slate-200 rounded">
            編集
          </button>
          <button onClick={onDelete} className="text-red-400 text-xs px-2 py-1 hover:bg-red-50 rounded">
            削除
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-slate-400">主食</p>
          <p className="font-medium text-slate-700">{meal.mainDishAmount}%</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">副食</p>
          <p className="font-medium text-slate-700">{meal.sideDishAmount}%</p>
        </div>
        {meal.soupAmount !== undefined && (
          <div>
            <p className="text-xs text-slate-400">汁物</p>
            <p className="font-medium text-slate-700">{meal.soupAmount}%</p>
          </div>
        )}
      </div>
      {meal.note && <p className="text-xs text-slate-500 mt-1">{meal.note}</p>}
    </div>
  );
}

function ExcretionItem({ excretion, onEdit, onDelete }: { excretion: Excretion } & ItemProps) {
  const typeLabels: Record<string, string> = {
    urine: '尿',
    feces: '便',
    both: '両方',
  };

  const amountLabels: Record<string, string> = {
    small: '少',
    medium: '中',
    large: '多',
  };

  return (
    <div className="bg-slate-50 rounded-lg p-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-slate-500 text-xs">{excretion.time}</span>
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700">{typeLabels[excretion.type]}</span>
          <button onClick={onEdit} className="text-slate-500 text-xs px-2 py-1 hover:bg-slate-200 rounded">
            編集
          </button>
          <button onClick={onDelete} className="text-red-400 text-xs px-2 py-1 hover:bg-red-50 rounded">
            削除
          </button>
        </div>
      </div>
      <div className="flex gap-4 mt-1">
        {excretion.urineAmount && (
          <span className="text-xs text-slate-600">尿量: {amountLabels[excretion.urineAmount]}</span>
        )}
        {excretion.fecesAmount && (
          <span className="text-xs text-slate-600">便量: {amountLabels[excretion.fecesAmount]}</span>
        )}
        {excretion.hasIncontinence && (
          <span className="text-xs text-orange-500">失禁あり</span>
        )}
      </div>
      {excretion.note && <p className="text-xs text-slate-500 mt-1">{excretion.note}</p>}
    </div>
  );
}

function HydrationItem({ hydration, onEdit, onDelete }: { hydration: Hydration } & ItemProps) {
  return (
    <div className="bg-slate-50 rounded-lg p-2 text-sm flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-xs">{hydration.time}</span>
        {hydration.drinkType && (
          <span className="text-slate-700">{hydration.drinkType}</span>
        )}
        <span className="font-medium text-slate-800">{hydration.amount}ml</span>
      </div>
      <div className="flex gap-1">
        <button onClick={onEdit} className="text-slate-500 text-xs px-2 py-1 hover:bg-slate-200 rounded">
          編集
        </button>
        <button onClick={onDelete} className="text-red-400 text-xs px-2 py-1 hover:bg-red-50 rounded">
          削除
        </button>
      </div>
    </div>
  );
}

// ========================================
// Edit Modal
// ========================================
interface EditModalProps {
  type: 'vital' | 'meal' | 'excretion' | 'hydration';
  item: Vital | Meal | Excretion | Hydration;
  record: DailyRecord;
  residentId: string;
  date: string;
  onClose: () => void;
  onSaved: () => void;
}

function EditModal({ type, item, record, residentId, date, onClose, onSaved }: EditModalProps) {
  const [saving, setSaving] = useState(false);

  const [temp, setTemp] = useState((item as Vital).temperature?.toString() || '36.5');
  const [bpH, setBpH] = useState((item as Vital).bloodPressureHigh?.toString() || '120');
  const [bpL, setBpL] = useState((item as Vital).bloodPressureLow?.toString() || '70');
  const [pulse, setPulse] = useState((item as Vital).pulse?.toString() || '70');
  const [spo2, setSpo2] = useState((item as Vital).spO2?.toString() || '98');

  const [mainDish, setMainDish] = useState((item as Meal).mainDishAmount || 100);
  const [sideDish, setSideDish] = useState((item as Meal).sideDishAmount || 100);
  const [soup, setSoup] = useState((item as Meal).soupAmount || 100);

  const [excType, setExcType] = useState((item as Excretion).type || 'urine');
  const [excAmount, setExcAmount] = useState((item as Excretion).urineAmount || (item as Excretion).fecesAmount || 'medium');

  const [hydAmount, setHydAmount] = useState((item as Hydration).amount || 150);
  const [hydType, setHydType] = useState((item as Hydration).drinkType || 'お茶');

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: Partial<DailyRecord> = {};

      if (type === 'vital') {
        updateData.vitals = record.vitals.map((v) =>
          v.id === item.id
            ? {
                ...v,
                temperature: parseFloat(temp),
                bloodPressureHigh: parseInt(bpH),
                bloodPressureLow: parseInt(bpL),
                pulse: parseInt(pulse),
                spO2: parseInt(spo2),
              }
            : v
        );
      } else if (type === 'meal') {
        updateData.meals = record.meals.map((m) =>
          m.id === item.id
            ? { ...m, mainDishAmount: mainDish, sideDishAmount: sideDish, soupAmount: soup }
            : m
        );
      } else if (type === 'excretion') {
        updateData.excretions = record.excretions.map((e) =>
          e.id === item.id
            ? {
                ...e,
                type: excType as 'urine' | 'feces' | 'both',
                urineAmount: excType !== 'feces' ? excAmount as 'small' | 'medium' | 'large' : undefined,
                fecesAmount: excType !== 'urine' ? excAmount as 'small' | 'medium' | 'large' : undefined,
              }
            : e
        );
      } else if (type === 'hydration') {
        updateData.hydrations = record.hydrations.map((h) =>
          h.id === item.id
            ? { ...h, amount: hydAmount, drinkType: hydType }
            : h
        );
      }

      await saveDailyRecord(residentId, date, updateData);
      onSaved();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const titles = {
    vital: 'バイタル編集',
    meal: '食事編集',
    excretion: '排泄編集',
    hydration: '水分編集',
  };

  const amounts = [0, 50, 70, 100];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-t-2xl p-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">{titles[type]}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {type === 'vital' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500">体温</label>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-slate-400 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">血圧(上)</label>
              <input
                type="number"
                value={bpH}
                onChange={(e) => setBpH(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-slate-400 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">血圧(下)</label>
              <input
                type="number"
                value={bpL}
                onChange={(e) => setBpL(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-slate-400 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">脈拍</label>
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-slate-400 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">SpO2</label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-slate-400 outline-none"
              />
            </div>
          </div>
        )}

        {type === 'meal' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">主食</label>
              <div className="flex gap-2">
                {amounts.map((v) => (
                  <button
                    key={v}
                    onClick={() => setMainDish(v)}
                    className={`flex-1 py-2 rounded-lg text-sm ${
                      mainDish === v ? 'bg-[#3d9d68] text-white' : 'bg-slate-100'
                    }`}
                  >
                    {v === 0 ? '×' : v === 100 ? '全量' : `${v}%`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">副食</label>
              <div className="flex gap-2">
                {amounts.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSideDish(v)}
                    className={`flex-1 py-2 rounded-lg text-sm ${
                      sideDish === v ? 'bg-[#3d9d68] text-white' : 'bg-slate-100'
                    }`}
                  >
                    {v === 0 ? '×' : v === 100 ? '全量' : `${v}%`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">汁物</label>
              <div className="flex gap-2">
                {amounts.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSoup(v)}
                    className={`flex-1 py-2 rounded-lg text-sm ${
                      soup === v ? 'bg-[#3d9d68] text-white' : 'bg-slate-100'
                    }`}
                  >
                    {v === 0 ? '×' : v === 100 ? '全量' : `${v}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {type === 'excretion' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">種類</label>
              <div className="flex gap-2">
                {(['urine', 'feces', 'both'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setExcType(t)}
                    className={`flex-1 py-2 rounded-lg text-sm ${
                      excType === t ? 'bg-[#c98a3d] text-white' : 'bg-slate-100'
                    }`}
                  >
                    {t === 'urine' ? '尿' : t === 'feces' ? '便' : '両方'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">量</label>
              <div className="flex gap-2">
                {(['small', 'medium', 'large'] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setExcAmount(a)}
                    className={`flex-1 py-2 rounded-lg text-sm ${
                      excAmount === a ? 'bg-[#c98a3d] text-white' : 'bg-slate-100'
                    }`}
                  >
                    {a === 'small' ? '少' : a === 'medium' ? '中' : '多'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {type === 'hydration' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">飲み物</label>
              <div className="flex gap-2">
                {['お茶', '水', 'コーヒー', 'ジュース'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setHydType(t)}
                    className={`flex-1 py-2 rounded-lg text-sm ${
                      hydType === t ? 'bg-[#3a98c4] text-white' : 'bg-slate-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">量(ml)</label>
              <div className="flex gap-2">
                {[100, 150, 200, 250].map((a) => (
                  <button
                    key={a}
                    onClick={() => setHydAmount(a)}
                    className={`flex-1 py-2 rounded-lg text-sm ${
                      hydAmount === a ? 'bg-[#3a98c4] text-white' : 'bg-slate-100'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-4 py-3 bg-slate-700 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-slate-800 transition-colors"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
