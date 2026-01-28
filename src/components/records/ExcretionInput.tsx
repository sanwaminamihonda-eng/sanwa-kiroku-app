'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { generateId, formatTime } from '@/lib/utils';
import { EXCRETION_AMOUNT_OPTIONS, FECES_CONDITION_OPTIONS } from '@/types';
import type { Excretion } from '@/types';

interface ExcretionInputProps {
  excretions: Excretion[];
  onAdd: (excretion: Excretion) => void;
  onRemove: (id: string) => void;
  recordedBy: string;
}

export function ExcretionInput({ excretions, onAdd, onRemove, recordedBy }: ExcretionInputProps) {
  const [type, setType] = useState<Excretion['type']>('urine');
  const [urineAmount, setUrineAmount] = useState<Excretion['urineAmount']>('medium');
  const [fecesAmount, setFecesAmount] = useState<Excretion['fecesAmount']>('medium');
  const [fecesCondition, setFecesCondition] = useState<Excretion['fecesCondition']>('normal');
  const [hasIncontinence, setHasIncontinence] = useState(false);
  const [note, setNote] = useState('');

  const handleAdd = () => {
    const now = new Date();
    const excretion: Excretion = {
      id: generateId(),
      time: formatTime(now),
      type,
      urineAmount: type !== 'feces' ? urineAmount : undefined,
      fecesAmount: type !== 'urine' ? fecesAmount : undefined,
      fecesCondition: type !== 'urine' ? fecesCondition : undefined,
      hasIncontinence,
      note: note || undefined,
      recordedBy,
      recordedAt: now,
    };
    onAdd(excretion);
    setNote('');
    setHasIncontinence(false);
  };

  return (
    <div className="p-4 space-y-6">
      {/* 種類選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">種類</label>
        <div className="flex gap-2">
          {[
            { value: 'urine', label: '排尿' },
            { value: 'feces', label: '排便' },
            { value: 'both', label: '両方' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setType(option.value as Excretion['type'])}
              className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                type === option.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 排尿量 */}
      {type !== 'feces' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">尿量</label>
          <div className="flex gap-2">
            {EXCRETION_AMOUNT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setUrineAmount(option.value)}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  urineAmount === option.value
                    ? 'bg-yellow-500 text-white border-yellow-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 排便量・状態 */}
      {type !== 'urine' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">便量</label>
            <div className="flex gap-2">
              {EXCRETION_AMOUNT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFecesAmount(option.value)}
                  className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                    fecesAmount === option.value
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">便の状態</label>
            <div className="flex gap-2 flex-wrap">
              {FECES_CONDITION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFecesCondition(option.value)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    fecesCondition === option.value
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 失禁 */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hasIncontinence}
            onChange={(e) => setHasIncontinence(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">失禁あり</span>
        </label>
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
      {excretions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">本日の記録</h3>
          <div className="space-y-2">
            {excretions.map((exc) => (
              <div
                key={exc.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
              >
                <div>
                  <span className="font-medium">{exc.time}</span>
                  <span className="text-sm text-gray-600 ml-3">
                    {exc.type === 'urine' && `排尿(${exc.urineAmount})`}
                    {exc.type === 'feces' && `排便(${exc.fecesAmount}・${exc.fecesCondition})`}
                    {exc.type === 'both' && `両方(尿:${exc.urineAmount}・便:${exc.fecesAmount})`}
                    {exc.hasIncontinence && ' ⚠️失禁'}
                  </span>
                </div>
                <button
                  onClick={() => onRemove(exc.id)}
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
