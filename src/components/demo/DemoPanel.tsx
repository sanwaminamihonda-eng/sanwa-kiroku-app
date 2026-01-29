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
  const [isExpanded, setIsExpanded] = useState(false);

  // デモモードでなければ表示しない
  if (!isDemo()) return null;

  const handleSeed = async () => {
    try {
      setLoading('seed');
      setMessage(null);

      const exists = await isSeedDataExists();
      if (exists) {
        setMessage('データは既に存在します');
        return;
      }

      const result = await seedData();
      setMessage(`Seed完了: ${result.residentsCount}名`);
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : '不明'}`);
    } finally {
      setLoading(null);
    }
  };

  const handleReset = async () => {
    if (!confirm('全てのデモデータをリセットしますか？')) {
      return;
    }

    try {
      setLoading('reset');
      setMessage(null);

      await resetDemoData();
      setMessage(`リセット完了`);

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : '不明'}`);
    } finally {
      setLoading(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  // 折りたたみ時：小さなバッジ
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 bg-amber-500 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg hover:bg-amber-600 transition-colors z-50"
      >
        DEMO
      </button>
    );
  }

  // 展開時：コンパクトなパネル
  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-amber-600 font-medium text-sm">デモモード</span>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          ×
        </button>
      </div>

      {message && (
        <p className="text-xs text-gray-600 mb-2">{message}</p>
      )}

      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSeed}
          loading={loading === 'seed'}
          disabled={loading !== null}
          className="w-full text-xs"
        >
          Seed投入
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={handleReset}
          loading={loading === 'reset'}
          disabled={loading !== null}
          className="w-full text-xs"
        >
          リセット
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={loading !== null}
          className="w-full text-xs"
        >
          ログアウト
        </Button>
      </div>
    </div>
  );
}
