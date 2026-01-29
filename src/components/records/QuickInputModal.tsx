'use client';

import { useState, useEffect } from 'react';
import { getDailyRecord, saveDailyRecord } from '@/lib/firestore';
import { getTodayString, formatTime, generateId } from '@/lib/utils';
import type { Resident, Vital, Meal, Excretion, Hydration, DailyRecord } from '@/types';

type RecordType = 'vital' | 'meal' | 'excretion' | 'hydration';

interface Props {
  resident: Resident;
  recordType: RecordType;
  onClose: () => void;
  onSaved: () => void;
}

export function QuickInputModal({ resident, recordType, onClose, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [existingRecord, setExistingRecord] = useState<DailyRecord | null>(null);

  const today = getTodayString();
  const now = new Date();
  const time = formatTime(now);

  useEffect(() => {
    getDailyRecord(resident.id, today).then(setExistingRecord);
  }, [resident.id, today]);

  const handleSave = async (data: Partial<DailyRecord>) => {
    setSaving(true);
    try {
      // 既存データとマージ
      const mergedData: Partial<DailyRecord> = {};

      if (data.vitals) {
        mergedData.vitals = [...(existingRecord?.vitals || []), ...data.vitals];
      }
      if (data.meals) {
        mergedData.meals = [...(existingRecord?.meals || []), ...data.meals];
      }
      if (data.excretions) {
        mergedData.excretions = [...(existingRecord?.excretions || []), ...data.excretions];
      }
      if (data.hydrations) {
        mergedData.hydrations = [...(existingRecord?.hydrations || []), ...data.hydrations];
      }

      await saveDailyRecord(resident.id, today, mergedData);
      onSaved();
    } catch (error) {
      console.error('Failed to save:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-xl max-h-[90vh] overflow-auto">
        {/* ヘッダー（利用者名を常に表示） */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-bold text-lg text-gray-900">{resident.name}</p>
            <p className="text-sm text-gray-500">{resident.roomNumber}号室</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 入力コンテンツ */}
        <div className="p-4">
          {recordType === 'vital' && (
            <VitalInput onSave={handleSave} saving={saving} time={time} now={now} />
          )}
          {recordType === 'meal' && (
            <MealInput onSave={handleSave} saving={saving} now={now} />
          )}
          {recordType === 'excretion' && (
            <ExcretionInput onSave={handleSave} saving={saving} time={time} now={now} />
          )}
          {recordType === 'hydration' && (
            <HydrationInput onSave={handleSave} saving={saving} time={time} now={now} />
          )}
        </div>
      </div>
    </div>
  );
}

// ========================================
// バイタル入力
// ========================================
function VitalInput({ onSave, saving, time, now }: { onSave: (data: Partial<DailyRecord>) => void; saving: boolean; time: string; now: Date }) {
  const [temperature, setTemperature] = useState(36.5);
  const [bpHigh, setBpHigh] = useState(120);
  const [bpLow, setBpLow] = useState(70);
  const [pulse, setPulse] = useState(70);
  const [spO2, setSpO2] = useState(98);

  const handleSubmit = () => {
    const vital: Vital = {
      id: generateId(),
      time,
      temperature,
      bloodPressureHigh: bpHigh,
      bloodPressureLow: bpLow,
      pulse,
      spO2,
      note: '',
      recordedBy: 'demo-guest-user',
      recordedAt: now,
    };
    onSave({ vitals: [vital] });
  };

  return (
    <div className="space-y-6">
      {/* 体温 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">体温</label>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setTemperature((v) => Math.round((v - 0.1) * 10) / 10)}
            className="w-16 h-16 bg-gray-200 rounded-xl text-2xl font-bold active:bg-gray-300"
          >
            −
          </button>
          <div className="text-4xl font-bold text-gray-900 w-32 text-center">
            {temperature.toFixed(1)}°
          </div>
          <button
            onClick={() => setTemperature((v) => Math.round((v + 0.1) * 10) / 10)}
            className="w-16 h-16 bg-gray-200 rounded-xl text-2xl font-bold active:bg-gray-300"
          >
            +
          </button>
        </div>
        {/* プリセット */}
        <div className="flex justify-center gap-2 mt-3">
          {[36.0, 36.5, 37.0, 37.5].map((v) => (
            <button
              key={v}
              onClick={() => setTemperature(v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                temperature === v ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {v.toFixed(1)}
            </button>
          ))}
        </div>
      </div>

      {/* 血圧 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">血圧</label>
        <div className="flex items-center justify-center gap-2">
          <div className="flex flex-col items-center">
            <button
              onClick={() => setBpHigh((v) => v + 5)}
              className="w-14 h-10 bg-gray-200 rounded-t-xl text-xl active:bg-gray-300"
            >
              +
            </button>
            <div className="text-3xl font-bold text-gray-900 py-2">{bpHigh}</div>
            <button
              onClick={() => setBpHigh((v) => v - 5)}
              className="w-14 h-10 bg-gray-200 rounded-b-xl text-xl active:bg-gray-300"
            >
              −
            </button>
          </div>
          <span className="text-2xl text-gray-400">/</span>
          <div className="flex flex-col items-center">
            <button
              onClick={() => setBpLow((v) => v + 5)}
              className="w-14 h-10 bg-gray-200 rounded-t-xl text-xl active:bg-gray-300"
            >
              +
            </button>
            <div className="text-3xl font-bold text-gray-900 py-2">{bpLow}</div>
            <button
              onClick={() => setBpLow((v) => v - 5)}
              className="w-14 h-10 bg-gray-200 rounded-b-xl text-xl active:bg-gray-300"
            >
              −
            </button>
          </div>
        </div>
      </div>

      {/* 脈拍・SpO2 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">脈拍</label>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPulse((v) => v - 5)}
              className="w-12 h-12 bg-gray-200 rounded-xl text-xl active:bg-gray-300"
            >
              −
            </button>
            <div className="text-2xl font-bold text-gray-900 w-16 text-center">{pulse}</div>
            <button
              onClick={() => setPulse((v) => v + 5)}
              className="w-12 h-12 bg-gray-200 rounded-xl text-xl active:bg-gray-300"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SpO2</label>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setSpO2((v) => v - 1)}
              className="w-12 h-12 bg-gray-200 rounded-xl text-xl active:bg-gray-300"
            >
              −
            </button>
            <div className="text-2xl font-bold text-gray-900 w-16 text-center">{spO2}%</div>
            <button
              onClick={() => setSpO2((v) => v + 1)}
              className="w-12 h-12 bg-gray-200 rounded-xl text-xl active:bg-gray-300"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 保存ボタン */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full py-4 bg-red-500 text-white text-lg font-bold rounded-xl active:bg-red-600 disabled:opacity-50"
      >
        {saving ? '保存中...' : '🌡️ バイタルを記録'}
      </button>
    </div>
  );
}

// ========================================
// 食事入力
// ========================================
function MealInput({ onSave, saving, now }: { onSave: (data: Partial<DailyRecord>) => void; saving: boolean; now: Date }) {
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [mainDish, setMainDish] = useState(100);
  const [sideDish, setSideDish] = useState(100);
  const [soup, setSoup] = useState(100);

  // 現在時刻から食事タイプを自動判定
  useEffect(() => {
    const hour = now.getHours();
    if (hour < 10) setMealType('breakfast');
    else if (hour < 15) setMealType('lunch');
    else setMealType('dinner');
  }, [now]);

  const handleSubmit = () => {
    const meal: Meal = {
      id: generateId(),
      mealType,
      mainDishAmount: mainDish,
      sideDishAmount: sideDish,
      soupAmount: soup,
      note: '',
      recordedBy: 'demo-guest-user',
      recordedAt: now,
    };
    onSave({ meals: [meal] });
  };

  const mealLabels = { breakfast: '朝食', lunch: '昼食', dinner: '夕食' };
  const amounts = [0, 30, 50, 70, 100];

  return (
    <div className="space-y-6">
      {/* 食事タイプ */}
      <div className="grid grid-cols-3 gap-2">
        {(['breakfast', 'lunch', 'dinner'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setMealType(type)}
            className={`py-3 rounded-xl text-base font-medium ${
              mealType === type ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {mealLabels[type]}
          </button>
        ))}
      </div>

      {/* 主食 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">主食（ごはん）</label>
        <div className="flex gap-2">
          {amounts.map((v) => (
            <button
              key={v}
              onClick={() => setMainDish(v)}
              className={`flex-1 py-3 rounded-xl text-base font-medium ${
                mainDish === v ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {v === 0 ? '×' : v === 100 ? '完食' : `${v}%`}
            </button>
          ))}
        </div>
      </div>

      {/* 副食 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">副食（おかず）</label>
        <div className="flex gap-2">
          {amounts.map((v) => (
            <button
              key={v}
              onClick={() => setSideDish(v)}
              className={`flex-1 py-3 rounded-xl text-base font-medium ${
                sideDish === v ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {v === 0 ? '×' : v === 100 ? '完食' : `${v}%`}
            </button>
          ))}
        </div>
      </div>

      {/* 汁物 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">汁物</label>
        <div className="flex gap-2">
          {amounts.map((v) => (
            <button
              key={v}
              onClick={() => setSoup(v)}
              className={`flex-1 py-3 rounded-xl text-base font-medium ${
                soup === v ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {v === 0 ? '×' : v === 100 ? '完食' : `${v}%`}
            </button>
          ))}
        </div>
      </div>

      {/* 保存ボタン */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full py-4 bg-green-500 text-white text-lg font-bold rounded-xl active:bg-green-600 disabled:opacity-50"
      >
        {saving ? '保存中...' : `🍚 ${mealLabels[mealType]}を記録`}
      </button>
    </div>
  );
}

// ========================================
// 排泄入力
// ========================================
function ExcretionInput({ onSave, saving, time, now }: { onSave: (data: Partial<DailyRecord>) => void; saving: boolean; time: string; now: Date }) {
  const [type, setType] = useState<'urine' | 'feces' | 'both'>('urine');
  const [urineAmount, setUrineAmount] = useState<'small' | 'medium' | 'large'>('medium');
  const [fecesAmount, setFecesAmount] = useState<'small' | 'medium' | 'large'>('medium');
  const [hasIncontinence, setHasIncontinence] = useState(false);

  const handleSubmit = () => {
    const excretion: Excretion = {
      id: generateId(),
      time,
      type,
      urineAmount: type !== 'feces' ? urineAmount : undefined,
      fecesAmount: type !== 'urine' ? fecesAmount : undefined,
      hasIncontinence,
      note: '',
      recordedBy: 'demo-guest-user',
      recordedAt: now,
    };
    // undefinedを除去
    const cleanExcretion = Object.fromEntries(
      Object.entries(excretion).filter(([, v]) => v !== undefined)
    ) as Excretion;
    onSave({ excretions: [cleanExcretion] });
  };

  const amountLabels = { small: '少', medium: '中', large: '多' };

  return (
    <div className="space-y-6">
      {/* 排泄タイプ */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setType('urine')}
          className={`py-4 rounded-xl text-lg font-medium ${
            type === 'urine' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          💧 尿
        </button>
        <button
          onClick={() => setType('feces')}
          className={`py-4 rounded-xl text-lg font-medium ${
            type === 'feces' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          💩 便
        </button>
        <button
          onClick={() => setType('both')}
          className={`py-4 rounded-xl text-lg font-medium ${
            type === 'both' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          両方
        </button>
      </div>

      {/* 尿量 */}
      {type !== 'feces' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">尿量</label>
          <div className="grid grid-cols-3 gap-2">
            {(['small', 'medium', 'large'] as const).map((amount) => (
              <button
                key={amount}
                onClick={() => setUrineAmount(amount)}
                className={`py-4 rounded-xl text-lg font-medium ${
                  urineAmount === amount ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {amountLabels[amount]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 便量 */}
      {type !== 'urine' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">便量</label>
          <div className="grid grid-cols-3 gap-2">
            {(['small', 'medium', 'large'] as const).map((amount) => (
              <button
                key={amount}
                onClick={() => setFecesAmount(amount)}
                className={`py-4 rounded-xl text-lg font-medium ${
                  fecesAmount === amount ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {amountLabels[amount]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 失禁 */}
      <button
        onClick={() => setHasIncontinence(!hasIncontinence)}
        className={`w-full py-3 rounded-xl text-base font-medium border-2 ${
          hasIncontinence
            ? 'border-red-500 bg-red-50 text-red-700'
            : 'border-gray-200 bg-white text-gray-700'
        }`}
      >
        {hasIncontinence ? '⚠️ 失禁あり' : '失禁なし'}
      </button>

      {/* 保存ボタン */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full py-4 bg-amber-500 text-white text-lg font-bold rounded-xl active:bg-amber-600 disabled:opacity-50"
      >
        {saving ? '保存中...' : '🚽 排泄を記録'}
      </button>
    </div>
  );
}

// ========================================
// 水分入力
// ========================================
function HydrationInput({ onSave, saving, time, now }: { onSave: (data: Partial<DailyRecord>) => void; saving: boolean; time: string; now: Date }) {
  const [amount, setAmount] = useState(150);
  const [drinkType, setDrinkType] = useState('お茶');

  const handleSubmit = () => {
    const hydration: Hydration = {
      id: generateId(),
      time,
      amount,
      drinkType,
      note: '',
      recordedBy: 'demo-guest-user',
      recordedAt: now,
    };
    onSave({ hydrations: [hydration] });
  };

  const amountPresets = [50, 100, 150, 200];
  const drinkTypes = ['お茶', '水', 'コーヒー', '牛乳', 'ジュース'];

  return (
    <div className="space-y-6">
      {/* 飲み物タイプ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">飲み物</label>
        <div className="flex flex-wrap gap-2">
          {drinkTypes.map((type) => (
            <button
              key={type}
              onClick={() => setDrinkType(type)}
              className={`px-4 py-3 rounded-xl text-base font-medium ${
                drinkType === type ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* 量 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">量</label>
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => setAmount((v) => Math.max(0, v - 50))}
            className="w-16 h-16 bg-gray-200 rounded-xl text-2xl font-bold active:bg-gray-300"
          >
            −
          </button>
          <div className="text-4xl font-bold text-gray-900 w-32 text-center">
            {amount}<span className="text-xl">ml</span>
          </div>
          <button
            onClick={() => setAmount((v) => v + 50)}
            className="w-16 h-16 bg-gray-200 rounded-xl text-2xl font-bold active:bg-gray-300"
          >
            +
          </button>
        </div>
        {/* プリセット */}
        <div className="flex justify-center gap-2">
          {amountPresets.map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                amount === v ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {v}ml
            </button>
          ))}
        </div>
      </div>

      {/* 保存ボタン */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full py-4 bg-cyan-500 text-white text-lg font-bold rounded-xl active:bg-cyan-600 disabled:opacity-50"
      >
        {saving ? '保存中...' : '💧 水分を記録'}
      </button>
    </div>
  );
}
