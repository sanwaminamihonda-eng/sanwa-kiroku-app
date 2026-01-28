'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { generateId, formatTime } from '@/lib/utils';
import { HYDRATION_AMOUNT_OPTIONS } from '@/types';
import type { Hydration } from '@/types';

interface HydrationInputProps {
  hydrations: Hydration[];
  onAdd: (hydration: Hydration) => void;
  onRemove: (id: string) => void;
  recordedBy: string;
}

export function HydrationInput({ hydrations, onAdd, onRemove, recordedBy }: HydrationInputProps) {
  const [amount, setAmount] = useState(150);
  const [drinkType, setDrinkType] = useState('お茶');
  const [note, setNote] = useState('');

  const handleAdd = () => {
    const now = new Date();
    const hydration: Hydration = {
      id: generateId(),
      time: formatTime(now),
      amount,
      drinkType,
      note: note || undefined,
      recordedBy,
      recordedAt: now,
    };
    onAdd(hydration);
    setNote('');
  };

  const drinkTypes = ['お茶', '水', 'コーヒー', 'ジュース', '牛乳', 'その他'];

  // 本日の合計水分量
  const totalAmount = hydrations.reduce((sum, h) => sum + h.amount, 0);

  return (
    <div className="p-4 space-y-6">
      {/* 合計表示 */}
      <div className="bg-blue-50 rounded-xl p-4 text-center">
        <p className="text-sm text-blue-600 mb-1">本日の合計</p>
        <p className="text-3xl font-bold text-blue-700">{totalAmount}ml</p>
      </div>

      {/* 水分量 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">水分量</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {HYDRATION_AMOUNT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setAmount(option.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                amount === option.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="ml"
        />
      </div>

      {/* 飲み物種類 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">種類</label>
        <div className="flex gap-2 flex-wrap">
          {drinkTypes.map((type) => (
            <button
              key={type}
              onClick={() => setDrinkType(type)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                drinkType === type
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {type}
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
      {hydrations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">本日の記録</h3>
          <div className="space-y-2">
            {hydrations.map((hyd) => (
              <div
                key={hyd.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
              >
                <div>
                  <span className="font-medium">{hyd.time}</span>
                  <span className="text-sm text-gray-600 ml-3">
                    {hyd.drinkType} {hyd.amount}ml
                  </span>
                </div>
                <button
                  onClick={() => onRemove(hyd.id)}
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
