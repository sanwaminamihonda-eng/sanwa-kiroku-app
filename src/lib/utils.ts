import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSSのクラス名を結合
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 日付をYYYY-MM-DD形式に変換
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 時刻をHH:mm形式に変換
 */
export function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

/**
 * 現在の日付をYYYY-MM-DD形式で取得
 */
export function getTodayString(): string {
  return formatDate(new Date());
}

/**
 * 年齢を計算
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * UUIDを生成
 */
export function generateId(): string {
  return crypto.randomUUID();
}
