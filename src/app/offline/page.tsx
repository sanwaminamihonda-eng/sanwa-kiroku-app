'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">📶</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          オフラインです
        </h1>
        <p className="text-gray-600 mb-6">
          インターネット接続を確認してください
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          再読み込み
        </button>
      </div>
    </div>
  );
}
