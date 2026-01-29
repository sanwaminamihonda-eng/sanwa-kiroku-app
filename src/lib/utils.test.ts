import { describe, it, expect } from 'vitest';
import {
  cn,
  formatDate,
  formatTime,
  getTodayString,
  calculateAge,
  generateId,
} from './utils';

describe('cn (classname merge)', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'active', false && 'hidden')).toBe('base active');
  });

  it('should override conflicting tailwind classes', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });
});

describe('formatDate', () => {
  it('should format date as YYYY-MM-DD', () => {
    const date = new Date('2024-03-15T10:30:00');
    expect(formatDate(date)).toBe('2024-03-15');
  });

  it('should handle different months correctly', () => {
    // ローカルタイムゾーンで日付を作成
    const date = new Date(2024, 0, 5); // January 5, 2024
    expect(formatDate(date)).toBe('2024-01-05');
  });
});

describe('formatTime', () => {
  it('should format time as HH:mm', () => {
    const date = new Date('2024-03-15T14:30:00');
    expect(formatTime(date)).toBe('14:30');
  });

  it('should handle midnight', () => {
    const date = new Date('2024-03-15T00:00:00');
    expect(formatTime(date)).toBe('00:00');
  });
});

describe('getTodayString', () => {
  it('should return today in YYYY-MM-DD format', () => {
    const today = getTodayString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('calculateAge', () => {
  it('should calculate age correctly', () => {
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 30);
    expect(calculateAge(birthDate)).toBe(30);
  });

  it('should handle birthday not yet passed this year', () => {
    const today = new Date();
    const birthDate = new Date(
      today.getFullYear() - 30,
      today.getMonth() + 1, // 来月
      today.getDate()
    );
    expect(calculateAge(birthDate)).toBe(29);
  });

  it('should handle elderly age', () => {
    const birthDate = new Date('1940-05-10');
    const age = calculateAge(birthDate);
    expect(age).toBeGreaterThan(80);
  });
});

describe('generateId', () => {
  it('should generate a valid UUID', () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});
