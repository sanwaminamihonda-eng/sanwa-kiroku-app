'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getResidents, getDailyRecord, saveDailyRecord } from '@/lib/firestore';
import { getTodayString, formatTime, generateId, calculateAge } from '@/lib/utils';
import { QuickInputModal } from '@/components/records/QuickInputModal';
import type { Resident, DailyRecord } from '@/types';

type RecordType = 'vital' | 'meal' | 'excretion' | 'hydration';

interface RecordStatus {
  vital: boolean;
  meal: boolean;
  excretion: boolean;
  hydration: boolean;
}

export default function HomePage() {
  const { user } = useAuth();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [recordStatuses, setRecordStatuses] = useState<Record<string, RecordStatus>>({});
  const [loading, setLoading] = useState(true);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [selectedType, setSelectedType] = useState<RecordType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const today = getTodayString();

  // 利用者と記録状況を読み込み
  const loadData = useCallback(async () => {
    try {
      const residentsData = await getResidents();
      setResidents(residentsData);

      // 各利用者の今日の記録状況を取得
      const statuses: Record<string, RecordStatus> = {};
      await Promise.all(
        residentsData.map(async (resident) => {
          const record = await getDailyRecord(resident.id, today);
          statuses[resident.id] = {
            vital: (record?.vitals?.length ?? 0) > 0,
            meal: (record?.meals?.length ?? 0) > 0,
            excretion: (record?.excretions?.length ?? 0) > 0,
            hydration: (record?.hydrations?.length ?? 0) > 0,
          };
        })
      );
      setRecordStatuses(statuses);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 記録タイプ選択
  const handleSelectType = (resident: Resident, type: RecordType) => {
    setSelectedResident(resident);
    setSelectedType(type);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setSelectedResident(null);
    setSelectedType(null);
  };

  // 記録保存後
  const handleSaved = () => {
    handleCloseModal();
    loadData(); // 記録状況を更新
  };

  // 検索フィルタ
  const filteredResidents = residents.filter(
    (r) =>
      r.name.includes(searchQuery) ||
      r.nameKana.includes(searchQuery) ||
      r.roomNumber.includes(searchQuery)
  );

  const recordTypeConfig: Record<RecordType, { label: string; icon: string; color: string }> = {
    vital: { label: 'バイタル', icon: '🌡️', color: 'bg-red-500' },
    meal: { label: '食事', icon: '🍚', color: 'bg-green-500' },
    excretion: { label: '排泄', icon: '🚽', color: 'bg-amber-500' },
    hydration: { label: '水分', icon: '💧', color: 'bg-cyan-500' },
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold text-gray-900">介護記録</h1>
            <span className="text-sm text-gray-500">{user?.name}</span>
          </div>
          <p className="text-sm text-gray-600">
            {new Date().toLocaleDateString('ja-JP', {
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            })}
          </p>
        </div>
        {/* 検索 */}
        <div className="px-4 pb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="名前・部屋番号で検索"
            className="w-full px-4 py-3 bg-gray-100 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>

      {/* 利用者一覧 */}
      <main className="pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : filteredResidents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {residents.length === 0 ? (
              <p>利用者が登録されていません<br />DEMOバッジから「リセット」を実行してください</p>
            ) : (
              <p>該当する利用者がいません</p>
            )}
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {filteredResidents.map((resident) => {
              const status = recordStatuses[resident.id] || {
                vital: false,
                meal: false,
                excretion: false,
                hydration: false,
              };

              return (
                <div
                  key={resident.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  {/* 利用者情報 */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-xl">
                          {resident.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-gray-900">
                            {resident.name}
                          </span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {resident.roomNumber}号室
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {calculateAge(resident.birthDate)}歳 • 要介護{resident.careLevel}
                          {resident.notes && ` • ${resident.notes}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 記録ボタン（大きなタップターゲット） */}
                  <div className="grid grid-cols-4 divide-x divide-gray-100">
                    {(Object.keys(recordTypeConfig) as RecordType[]).map((type) => {
                      const config = recordTypeConfig[type];
                      const recorded = status[type];

                      return (
                        <button
                          key={type}
                          onClick={() => handleSelectType(resident, type)}
                          className={`py-4 flex flex-col items-center gap-1 transition-colors active:bg-gray-100 ${
                            recorded ? 'bg-gray-50' : ''
                          }`}
                        >
                          <span className="text-2xl">{config.icon}</span>
                          <span className={`text-xs font-medium ${recorded ? 'text-green-600' : 'text-gray-600'}`}>
                            {config.label}
                          </span>
                          {recorded && (
                            <span className="text-green-500 text-xs">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* クイック入力モーダル */}
      {selectedResident && selectedType && (
        <QuickInputModal
          resident={selectedResident}
          recordType={selectedType}
          onClose={handleCloseModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
