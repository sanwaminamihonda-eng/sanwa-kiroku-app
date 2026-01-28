'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getResidents, createResident, updateResident, deleteResident } from '@/lib/firestore';
import { calculateAge } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { Resident } from '@/types';

export default function ResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

  const loadResidents = async () => {
    try {
      setLoading(true);
      const data = await getResidents();
      setResidents(data);
    } catch (error) {
      console.error('Failed to load residents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResidents();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name}さんを削除してもよろしいですか？`)) return;

    try {
      await deleteResident(id);
      await loadResidents();
    } catch (error) {
      console.error('Failed to delete resident:', error);
      alert('削除に失敗しました');
    }
  };

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">利用者管理</h1>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingResident(null);
                setShowForm(true);
              }}
            >
              新規登録
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto" />
          </div>
        ) : residents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            <p>利用者が登録されていません</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {residents.map((resident) => (
                <li key={resident.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {resident.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{resident.name}</p>
                        <p className="text-sm text-gray-500">
                          {resident.roomNumber}号室 • {calculateAge(resident.birthDate)}歳 • 要介護{resident.careLevel}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingResident(resident);
                          setShowForm(true);
                        }}
                      >
                        編集
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(resident.id, resident.name)}
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      {/* 登録/編集フォームモーダル */}
      {showForm && (
        <ResidentFormModal
          resident={editingResident}
          onClose={() => {
            setShowForm(false);
            setEditingResident(null);
          }}
          onSave={async () => {
            setShowForm(false);
            setEditingResident(null);
            await loadResidents();
          }}
        />
      )}
    </div>
  );
}

interface ResidentFormModalProps {
  resident: Resident | null;
  onClose: () => void;
  onSave: () => void;
}

function ResidentFormModal({ resident, onClose, onSave }: ResidentFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: resident?.name || '',
    nameKana: resident?.nameKana || '',
    birthDate: resident?.birthDate ? resident.birthDate.toISOString().split('T')[0] : '',
    gender: resident?.gender || 'male' as const,
    roomNumber: resident?.roomNumber || '',
    careLevel: resident?.careLevel || 1 as const,
    notes: resident?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.birthDate || !formData.roomNumber) {
      alert('必須項目を入力してください');
      return;
    }

    try {
      setLoading(true);

      const data = {
        name: formData.name,
        nameKana: formData.nameKana,
        birthDate: new Date(formData.birthDate),
        gender: formData.gender as 'male' | 'female',
        roomNumber: formData.roomNumber,
        careLevel: formData.careLevel as 1 | 2 | 3 | 4 | 5,
        notes: formData.notes,
        isActive: true,
      };

      if (resident) {
        await updateResident(resident.id, data);
      } else {
        await createResident(data);
      }

      onSave();
    } catch (error) {
      console.error('Failed to save resident:', error);
      alert('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {resident ? '利用者編集' : '新規利用者登録'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              氏名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="山田 太郎"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              フリガナ
            </label>
            <input
              type="text"
              value={formData.nameKana}
              onChange={(e) => setFormData({ ...formData, nameKana: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ヤマダ タロウ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              生年月日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              性別
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={() => setFormData({ ...formData, gender: 'male' })}
                  className="mr-2"
                />
                男性
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={() => setFormData({ ...formData, gender: 'female' })}
                  className="mr-2"
                />
                女性
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              居室番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="101"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              要介護度
            </label>
            <select
              value={formData.careLevel}
              onChange={(e) => setFormData({ ...formData, careLevel: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5].map((level) => (
                <option key={level} value={level}>
                  要介護{level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              備考
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="特記事項があれば入力"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={loading}
            >
              {resident ? '更新' : '登録'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
