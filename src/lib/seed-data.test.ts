import { describe, it, expect } from 'vitest';
import { SEED_RESIDENTS, generateSeedRecords, getRecentDates } from './seed-data';

describe('SEED_RESIDENTS', () => {
  it('should have 30 residents', () => {
    expect(SEED_RESIDENTS).toHaveLength(30);
  });

  it('should have required fields for each resident', () => {
    SEED_RESIDENTS.forEach((resident) => {
      expect(resident.name).toBeDefined();
      expect(resident.nameKana).toBeDefined();
      expect(resident.birthDate).toBeInstanceOf(Date);
      expect(resident.gender).toMatch(/^(male|female)$/);
      expect(resident.roomNumber).toBeDefined();
      expect(resident.careLevel).toBeGreaterThanOrEqual(1);
      expect(resident.careLevel).toBeLessThanOrEqual(5);
      expect(resident.isActive).toBe(true);
    });
  });

  it('should have unique room numbers', () => {
    const roomNumbers = SEED_RESIDENTS.map((r) => r.roomNumber);
    const uniqueRoomNumbers = new Set(roomNumbers);
    expect(uniqueRoomNumbers.size).toBe(roomNumbers.length);
  });
});

describe('generateSeedRecords', () => {
  it('should generate records for given dates', () => {
    const dates = ['2024-03-15', '2024-03-16'];
    const records = generateSeedRecords('resident-1', dates);

    expect(records).toHaveLength(2);
    expect(records[0].date).toBe('2024-03-15');
    expect(records[1].date).toBe('2024-03-16');
  });

  it('should include all record types', () => {
    const records = generateSeedRecords('resident-1', ['2024-03-15']);
    const record = records[0];

    expect(record.vitals).toBeDefined();
    expect(record.vitals.length).toBeGreaterThan(0);
    expect(record.excretions).toBeDefined();
    expect(record.excretions.length).toBeGreaterThan(0);
    expect(record.meals).toBeDefined();
    expect(record.meals.length).toBeGreaterThan(0);
    expect(record.hydrations).toBeDefined();
    expect(record.hydrations.length).toBeGreaterThan(0);
  });

  it('should generate valid vital records', () => {
    const records = generateSeedRecords('resident-1', ['2024-03-15']);
    const vital = records[0].vitals[0];

    expect(vital.id).toBeDefined();
    expect(vital.time).toMatch(/^\d{2}:\d{2}$/);
    expect(vital.temperature).toBeGreaterThan(35);
    expect(vital.temperature).toBeLessThan(40);
    expect(vital.bloodPressureHigh).toBeGreaterThan(90);
    expect(vital.bloodPressureLow).toBeGreaterThan(50);
    expect(vital.pulse).toBeGreaterThan(50);
    expect(vital.spO2).toBeGreaterThan(90);
  });
});

describe('getRecentDates', () => {
  it('should return 7 dates by default', () => {
    const dates = getRecentDates();
    expect(dates).toHaveLength(7);
  });

  it('should return specified number of dates', () => {
    const dates = getRecentDates(5);
    expect(dates).toHaveLength(5);
  });

  it('should return dates in YYYY-MM-DD format', () => {
    const dates = getRecentDates();
    dates.forEach((date) => {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('should return dates in descending order (most recent first)', () => {
    const dates = getRecentDates();
    const today = new Date().toISOString().split('T')[0];
    expect(dates[0]).toBe(today);
  });
});
