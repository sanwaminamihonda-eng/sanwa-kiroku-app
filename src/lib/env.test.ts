import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAppMode, isDemo, isProduction, getCollectionName } from './env';

describe('env utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getAppMode', () => {
    it('should return "demo" when NEXT_PUBLIC_APP_MODE is demo', () => {
      process.env.NEXT_PUBLIC_APP_MODE = 'demo';
      expect(getAppMode()).toBe('demo');
    });

    it('should return "production" when NEXT_PUBLIC_APP_MODE is production', () => {
      process.env.NEXT_PUBLIC_APP_MODE = 'production';
      expect(getAppMode()).toBe('production');
    });

    it('should default to "demo" when not set', () => {
      delete process.env.NEXT_PUBLIC_APP_MODE;
      expect(getAppMode()).toBe('demo');
    });
  });

  describe('isDemo', () => {
    it('should return true in demo mode', () => {
      process.env.NEXT_PUBLIC_APP_MODE = 'demo';
      expect(isDemo()).toBe(true);
    });

    it('should return false in production mode', () => {
      process.env.NEXT_PUBLIC_APP_MODE = 'production';
      expect(isDemo()).toBe(false);
    });
  });

  describe('isProduction', () => {
    it('should return true in production mode', () => {
      process.env.NEXT_PUBLIC_APP_MODE = 'production';
      expect(isProduction()).toBe(true);
    });

    it('should return false in demo mode', () => {
      process.env.NEXT_PUBLIC_APP_MODE = 'demo';
      expect(isProduction()).toBe(false);
    });
  });

  describe('getCollectionName', () => {
    it('should prefix with demo_ in demo mode', () => {
      process.env.NEXT_PUBLIC_APP_MODE = 'demo';
      expect(getCollectionName('residents')).toBe('demo_residents');
    });

    it('should not prefix in production mode', () => {
      process.env.NEXT_PUBLIC_APP_MODE = 'production';
      expect(getCollectionName('residents')).toBe('residents');
    });
  });
});
