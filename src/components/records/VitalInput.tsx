'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { generateId, formatTime } from '@/lib/utils';
import type { Vital } from '@/types';

interface VitalInputProps {
  vitals: Vital[];
  onAdd: (vital: Vital) => void;
  onRemove: (id: string) => void;
  recordedBy: string;
}

export function VitalInput({ vitals, onAdd, onRemove, recordedBy }: VitalInputProps) {
  const [temperature, setTemperature] = useState('36.5');
  const [bpHigh, setBpHigh] = useState('120');
  const [bpLow, setBpLow] = useState('80');
  const [pulse, setPulse] = useState('70');
  const [spO2, setSpO2] = useState('98');
  const [note, setNote] = useState('');

  const handleAdd = () => {
    const now = new Date();
    const vital: Vital = {
      id: generateId(),
      time: formatTime(now),
      temperature: parseFloat(temperature) || undefined,
      bloodPressureHigh: parseInt(bpHigh) || undefined,
      bloodPressureLow: parseInt(bpLow) || undefined,
      pulse: parseInt(pulse) || undefined,
      spO2: parseInt(spO2) || undefined,
      note: note || undefined,
      recordedBy,
      recordedAt: now,
    };
    onAdd(vital);
    setNote('');
  };

  // 温度のクイック入力ボタン
  const tempButtons = ['36.0', '36.5', '37.0', '37.5', '38.0'];

  return (
    <div className="p-4 space-y-6">
      {/* 体温 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">体温 (℃)</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {tempButtons.map((temp) => (
            <button
              key={temp}
              onClick={() => setTemperature(temp)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                temperature === temp
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {temp}
            </button>
          ))}
        </div>
        <input
          type="number"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 血圧 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">血圧 (mmHg)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="上"
            value={bpHigh}
            onChange={(e) => setBpHigh(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">/</span>
          <input
            type="number"
            placeholder="下"
            value={bpLow}
            onChange={(e) => setBpLow(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 脈拍・SpO2 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">脈拍 (bpm)</label>
          <input
            type="number"
            value={pulse}
            onChange={(e) => setPulse(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SpO2 (%)</label>
          <input
            type="number"
            value={spO2}
            onChange={(e) => setSpO2(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
      {vitals.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">本日の記録</h3>
          <div className="space-y-2">
            {vitals.map((vital) => (
              <div
                key={vital.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
              >
                <div>
                  <span className="font-medium">{vital.time}</span>
                  <span className="text-sm text-gray-600 ml-3">
                    {vital.temperature}℃ / {vital.bloodPressureHigh}/{vital.bloodPressureLow} / {vital.pulse}bpm / {vital.spO2}%
                  </span>
                </div>
                <button
                  onClick={() => onRemove(vital.id)}
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
