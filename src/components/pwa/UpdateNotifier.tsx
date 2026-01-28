'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

export function UpdateNotifier() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const handleUpdate = () => {
      navigator.serviceWorker.ready.then((registration) => {
        // 新しいService Workerが待機中かチェック
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowUpdate(true);
        }

        // updatefoundイベントを監視
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowUpdate(true);
              }
            });
          }
        });
      });
    };

    // controllerchangeイベントを監視（新しいSWがアクティブになったらリロード）
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    handleUpdate();

    // 定期的にアップデートをチェック（30秒ごと）
    const interval = setInterval(() => {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      // 新しいService WorkerにskipWaitingを指示
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50 animate-slide-down">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🔄</div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">
            アップデートがあります
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            新しいバージョンが利用可能です。更新してください。
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpdate}
            >
              今すぐ更新
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
            >
              後で
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
