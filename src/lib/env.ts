import type { AppMode } from '@/types';

/**
 * アプリモードを取得
 */
export function getAppMode(): AppMode {
  const mode = process.env.NEXT_PUBLIC_APP_MODE;
  if (mode === 'production') return 'production';
  return 'demo';
}

/**
 * デモモードかどうか
 */
export function isDemo(): boolean {
  return getAppMode() === 'demo';
}

/**
 * 本番モードかどうか
 */
export function isProduction(): boolean {
  return getAppMode() === 'production';
}

/**
 * コレクション名を環境に応じて返す（DRY原則）
 */
export function getCollectionName(baseName: string): string {
  return isDemo() ? `demo_${baseName}` : baseName;
}
