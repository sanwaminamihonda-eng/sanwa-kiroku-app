'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { isDemo } from '@/lib/env';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">設定</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {/* ユーザー情報 */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-medium text-gray-500 mb-3">アカウント</h2>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">
                {user?.name?.charAt(0) || 'G'}
              </span>
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">{user?.name || 'ゲスト'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* アプリ情報 */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-medium text-gray-500 mb-3">アプリ情報</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">バージョン</span>
              <span className="text-gray-900">0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">モード</span>
              <span className={isDemo() ? 'text-amber-600' : 'text-green-600'}>
                {isDemo() ? 'デモ' : '本番'}
              </span>
            </div>
          </div>
        </div>

        {/* 操作 */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-medium text-gray-500 mb-3">操作</h2>
          <div className="space-y-3">
            <Link
              href="/residents"
              className="flex items-center justify-between py-2 text-gray-900 hover:text-blue-600"
            >
              <span>利用者管理</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ログアウト */}
        <div className="pt-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleSignOut}
          >
            ログアウト
          </Button>
        </div>
      </main>
    </div>
  );
}
