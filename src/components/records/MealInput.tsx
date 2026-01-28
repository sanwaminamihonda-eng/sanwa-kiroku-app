'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { generateId } from '@/lib/utils';
import { MEAL_AMOUNT_OPTIONS } from '@/types';
import type { Meal } from '@/types';

interface MealInputProps {
  meals: Meal[];
  onAdd: (meal: Meal) => void;
  onRemove: (id: string) => void;
  recordedBy: string;
}

export function MealInput({ meals, onAdd, onRemove, recordedBy }: MealInputProps) {
  const [mealType, setMealType] = useState<Meal['mealType']>('breakfast');
  const [mainDishAmount, setMainDishAmount] = useState(100);
  const [sideDishAmount, setSideDishAmount] = useState(100);
  const [soupAmount, setSoupAmount] = useState(100);
  const [note, setNote] = useState('');

  const handleAdd = () => {
    const now = new Date();
    const meal: Meal = {
      id: generateId(),
      mealType,
      mainDishAmount,
      sideDishAmount,
      soupAmount,
      note: note || undefined,
      recordedBy,
      recordedAt: now,
    };
    onAdd(meal);
    setNote('');
  };

  const mealTypeLabels: Record<Meal['mealType'], string> = {
    breakfast: '朝食',
    lunch: '昼食',
    dinner: '夕食',
    snack: '間食',
  };

  // すでに記録されている食事種別を取得
  const recordedMealTypes = new Set(meals.map((m) => m.mealType));

  return (
    <div className="p-4 space-y-6">
      {/* 食事種別 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">食事種別</label>
        <div className="grid grid-cols-4 gap-2">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`px-3 py-3 rounded-lg border text-sm font-medium transition-colors relative ${
                mealType === type
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {mealTypeLabels[type]}
              {recordedMealTypes.has(type) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 主食 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">主食</label>
        <div className="flex gap-2 flex-wrap">
          {MEAL_AMOUNT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setMainDishAmount(option.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                mainDishAmount === option.value
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 副菜 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">副菜</label>
        <div className="flex gap-2 flex-wrap">
          {MEAL_AMOUNT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSideDishAmount(option.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                sideDishAmount === option.value
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 汁物 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">汁物</label>
        <div className="flex gap-2 flex-wrap">
          {MEAL_AMOUNT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSoupAmount(option.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                soupAmount === option.value
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 備考 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">備考</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="特記事項"
        />
      </div>

      {/* 登録ボタン */}
      <Button variant="primary" className="w-full" onClick={handleAdd}>
        記録を追加
      </Button>

      {/* 記録一覧 */}
      {meals.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">本日の記録</h3>
          <div className="space-y-2">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
              >
                <div>
                  <span className="font-medium">{mealTypeLabels[meal.mealType]}</span>
                  <span className="text-sm text-gray-600 ml-3">
                    主食{meal.mainDishAmount}% / 副菜{meal.sideDishAmount}% / 汁物{meal.soupAmount}%
                  </span>
                </div>
                <button
                  onClick={() => onRemove(meal.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
