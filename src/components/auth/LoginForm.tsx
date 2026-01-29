'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { signIn } from '@/lib/auth';
import { isDemo } from '@/lib/env';

export function LoginForm() {
  const router = useRouter();
  const { signInAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<'email' | 'guest' | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    try {
      setLoading('email');
      setError(null);
      await signIn(email, password);
      router.push('/');
    } catch {
      setError('ログインに失敗しました。認証情報を確認してください。');
    } finally {
      setLoading(null);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setLoading('guest');
      setError(null);
      await signInAsGuest();
      router.push('/');
    } catch {
      setError('ゲストログインに失敗しました');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">介護記録アプリ</h1>
          <p className="mt-2 text-gray-600">施設サービス記録システム</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {isDemo() && (
            <div className="mb-6">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleGuestLogin}
                loading={loading === 'guest'}
                disabled={loading !== null}
              >
                ゲストとしてログイン
              </Button>
              <p className="mt-2 text-sm text-gray-500 text-center">
                デモモード: すぐにお試しいただけます
              </p>
            </div>
          )}

          {isDemo() && (
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">または</span>
              </div>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="example@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <Button
              type="submit"
              variant={isDemo() ? 'secondary' : 'primary'}
              size="lg"
              className="w-full"
              loading={loading === 'email'}
              disabled={loading !== null}
            >
              ログイン
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
