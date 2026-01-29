'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// /records は /dashboard にリダイレクト
export default function RecordsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null;
}
