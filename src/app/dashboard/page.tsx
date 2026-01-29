'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ダッシュボードは記録入力画面にリダイレクト
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/records');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
    </div>
  );
}
