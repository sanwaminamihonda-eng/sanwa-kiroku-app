'use client';

import { useEffect, useState, useCallback } from 'react';
import { getResidents, getDailyRecord } from '@/lib/firestore';
import { getTodayString, formatDate } from '@/lib/utils';
import { BottomNav } from '@/components/navigation/BottomNav';
import type { Resident, DailyRecord, Vital, Meal, Excretion, Hydration } from '@/types';

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

  // Filter data by selected resident
  const filteredData = selectedResidentId === 'all'
    ? data
    : data.filter((d) => d.resident.id === selectedResidentId);

  const isToday = date === getTodayString();

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">記録履歴</h1>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
            aria-label="前日"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center flex-1">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-lg font-bold text-gray-900 bg-transparent border-none focus:outline-none text-center cursor-pointer"
            />
            <p className="text-sm text-gray-500">
              {new Date(date).toLocaleDateString('ja-JP', { weekday: 'long' })}
              {isToday && <span className="ml-2 text-blue-600 font-medium">(今日)</span>}
            </p>
          </div>

          <button
            onClick={() => changeDate(1)}
            disabled={isToday}
            className={`p-2 rounded-lg ${
              isToday ? 'text-gray-300' : 'hover:bg-gray-100 active:bg-gray-200 text-gray-600'
            }`}
            aria-label="翌日"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Today Button & Resident Filter */}
        <div className="flex items-center gap-2 px-4 py-2 border-t border-gray-100">
          {!isToday && (
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              今日に戻る
            </button>
          )}
          <select
            value={selectedResidentId}
            onChange={(e) => setSelectedResidentId(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            <p>利用者が登録されていません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredData.map(({ resident, record }) => (
              <ResidentRecordCard
                key={resident.id}
                resident={resident}
                record={record}
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
}

function ResidentRecordCard({ resident, record }: ResidentRecordCardProps) {
  const [expanded, setExpanded] = useState(false);

  const hasVitals = record && record.vitals.length > 0;
  const hasExcretions = record && record.excretions.length > 0;
  const hasMeals = record && record.meals.length > 0;
  const hasHydrations = record && record.hydrations.length > 0;
  const hasAnyRecord = hasVitals || hasExcretions || hasMeals || hasHydrations;

  // Total hydration
  const totalHydration = record?.hydrations.reduce((sum, h) => sum + h.amount, 0) || 0;

  // Latest vital
  const latestVital = record?.vitals[record.vitals.length - 1];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Resident Info Header */}
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer active:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-bold text-lg">{resident.name.charAt(0)}</span>
          </div>
          <div>
            <p className="font-bold text-gray-900">{resident.name}</p>
            <p className="text-xs text-gray-500">{resident.roomNumber}号室</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!hasAnyRecord && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">未記録</span>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Summary (Always Visible) */}
      {hasAnyRecord && (
        <div className="px-4 pb-3">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className={`p-2 rounded-lg ${hasVitals ? 'bg-red-50' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500">バイタル</p>
              {latestVital ? (
                <p className="text-sm font-medium text-gray-900">
                  {latestVital.temperature?.toFixed(1)}度
                </p>
              ) : (
                <p className="text-sm text-gray-400">-</p>
              )}
            </div>
            <div className={`p-2 rounded-lg ${hasExcretions ? 'bg-amber-50' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500">排泄</p>
              <p className="text-sm font-medium text-gray-900">
                {record?.excretions.length || 0}回
              </p>
            </div>
            <div className={`p-2 rounded-lg ${hasMeals ? 'bg-green-50' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500">食事</p>
              <p className="text-sm font-medium text-gray-900">
                {record?.meals.length || 0}食
              </p>
            </div>
            <div className={`p-2 rounded-lg ${hasHydrations ? 'bg-cyan-50' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500">水分</p>
              <p className="text-sm font-medium text-gray-900">
                {totalHydration}ml
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Details */}
      {expanded && hasAnyRecord && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-4">
          {/* Vitals Section */}
          {hasVitals && (
            <RecordSection title="バイタル" icon="thermometer" color="red">
              {record!.vitals.map((vital) => (
                <VitalItem key={vital.id} vital={vital} />
              ))}
            </RecordSection>
          )}

          {/* Meals Section */}
          {hasMeals && (
            <RecordSection title="食事" icon="meal" color="green">
              {record!.meals.map((meal) => (
                <MealItem key={meal.id} meal={meal} />
              ))}
            </RecordSection>
          )}

          {/* Excretions Section */}
          {hasExcretions && (
            <RecordSection title="排泄" icon="excretion" color="amber">
              {record!.excretions.map((excretion) => (
                <ExcretionItem key={excretion.id} excretion={excretion} />
              ))}
            </RecordSection>
          )}

          {/* Hydrations Section */}
          {hasHydrations && (
            <RecordSection title="水分" icon="water" color="cyan">
              {record!.hydrations.map((hydration) => (
                <HydrationItem key={hydration.id} hydration={hydration} />
              ))}
            </RecordSection>
          )}
        </div>
      )}
    </div>
  );
}

interface RecordSectionProps {
  title: string;
  icon: string;
  color: 'red' | 'green' | 'amber' | 'cyan';
  children: React.ReactNode;
}

function RecordSection({ title, color, children }: RecordSectionProps) {
  const colorClasses = {
    red: 'bg-red-100 text-red-700',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    cyan: 'bg-cyan-100 text-cyan-700',
  };

  return (
    <div>
      <h4 className={`inline-block text-xs font-medium px-2 py-1 rounded-full mb-2 ${colorClasses[color]}`}>
        {title}
      </h4>
      <div className="space-y-2 pl-1">{children}</div>
    </div>
  );
}

function VitalItem({ vital }: { vital: Vital }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-500 text-xs">{vital.time}</span>
      </div>
      <div className="grid grid-cols-5 gap-1 text-center">
        {vital.temperature && (
          <div>
            <p className="text-xs text-gray-400">体温</p>
            <p className="font-medium">{vital.temperature.toFixed(1)}</p>
          </div>
        )}
        {vital.bloodPressureHigh && (
          <div>
            <p className="text-xs text-gray-400">血圧</p>
            <p className="font-medium">{vital.bloodPressureHigh}/{vital.bloodPressureLow}</p>
          </div>
        )}
        {vital.pulse && (
          <div>
            <p className="text-xs text-gray-400">脈拍</p>
            <p className="font-medium">{vital.pulse}</p>
          </div>
        )}
        {vital.spO2 && (
          <div>
            <p className="text-xs text-gray-400">SpO2</p>
            <p className="font-medium">{vital.spO2}%</p>
          </div>
        )}
      </div>
      {vital.note && <p className="text-xs text-gray-500 mt-1">{vital.note}</p>}
    </div>
  );
}

function MealItem({ meal }: { meal: Meal }) {
  const mealTypeLabels: Record<string, string> = {
    breakfast: '朝食',
    lunch: '昼食',
    dinner: '夕食',
    snack: '間食',
  };

  return (
    <div className="bg-gray-50 rounded-lg p-2 text-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-gray-700">{mealTypeLabels[meal.mealType]}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-gray-400">主食</p>
          <p className="font-medium">{meal.mainDishAmount}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">副食</p>
          <p className="font-medium">{meal.sideDishAmount}%</p>
        </div>
        {meal.soupAmount !== undefined && (
          <div>
            <p className="text-xs text-gray-400">汁物</p>
            <p className="font-medium">{meal.soupAmount}%</p>
          </div>
        )}
      </div>
      {meal.note && <p className="text-xs text-gray-500 mt-1">{meal.note}</p>}
    </div>
  );
}

function ExcretionItem({ excretion }: { excretion: Excretion }) {
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
    <div className="bg-gray-50 rounded-lg p-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-xs">{excretion.time}</span>
        <span className="font-medium text-gray-700">{typeLabels[excretion.type]}</span>
      </div>
      <div className="flex gap-4 mt-1">
        {excretion.urineAmount && (
          <span className="text-xs">尿量: {amountLabels[excretion.urineAmount]}</span>
        )}
        {excretion.fecesAmount && (
          <span className="text-xs">便量: {amountLabels[excretion.fecesAmount]}</span>
        )}
        {excretion.hasIncontinence && (
          <span className="text-xs text-orange-600">失禁あり</span>
        )}
      </div>
      {excretion.note && <p className="text-xs text-gray-500 mt-1">{excretion.note}</p>}
    </div>
  );
}

function HydrationItem({ hydration }: { hydration: Hydration }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-sm flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-xs">{hydration.time}</span>
        {hydration.drinkType && (
          <span className="text-gray-700">{hydration.drinkType}</span>
        )}
      </div>
      <span className="font-medium text-gray-900">{hydration.amount}ml</span>
    </div>
  );
}
