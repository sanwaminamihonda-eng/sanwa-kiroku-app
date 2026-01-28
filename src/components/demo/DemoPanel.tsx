'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { seedData, resetDemoData, isSeedDataExists } from '@/lib/seed';
import { isDemo } from '@/lib/env';

export function DemoPanel() {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState<'seed' | 'reset' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // デモモードでなければ表示しない
  if (!isDemo()) return null;

  const handleSeed = async () => {
    try {
      setLoading('seed');
      setMessage(null);

      const exists = await isSeedDataExists();
      if (exists) {
        setMessage('データは既に存在します。リセットしてください。');
        return;
      }

      const result = await seedData();
      setMessage(`Seed完了: 利用者${result.residentsCount}名、記録${result.recordsCount}件`);
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setLoading(null);
    }
  };

  const handleReset = async () => {
    if (!confirm('全てのデモデータを削除してSeedデータに置き換えます。よろしいですか？')) {
      return;
    }

    try {
      setLoading('reset');
      setMessage(null);

      const result = await resetDemoData();
      setMessage(`リセット完了: 利用者${result.residentsCount}名、記録${result.recordsCount}件`);

      // ページをリロード
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setLoading(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-amber-100 border-t-2 border-amber-400 px-4 py-2 z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-amber-800 font-medium text-sm">デモモード</span>
        </div>

        <div className="flex items-center gap-2">
          {message && (
            <span className="text-sm text-amber-800 mr-2">{message}</span>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSeed}
            loading={loading === 'seed'}
            disabled={loading !== null}
          >
            Seed投入
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleReset}
            loading={loading === 'reset'}
            disabled={loading !== null}
          >
            リセット
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={loading !== null}
          >
            ログアウト
          </Button>
        </div>
      </div>
    </div>
  );
}
