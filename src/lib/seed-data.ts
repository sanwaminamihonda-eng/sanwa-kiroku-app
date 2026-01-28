import type { Resident, Vital, Excretion, Meal, Hydration, DailyRecord } from '@/types';
import { generateId } from './utils';

// サンプル利用者データ
export const SEED_RESIDENTS: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '山田 太郎',
    nameKana: 'ヤマダ タロウ',
    birthDate: new Date('1940-03-15'),
    gender: 'male',
    roomNumber: '101',
    careLevel: 3,
    notes: '歩行に杖が必要',
    isActive: true,
  },
  {
    name: '鈴木 花子',
    nameKana: 'スズキ ハナコ',
    birthDate: new Date('1938-07-22'),
    gender: 'female',
    roomNumber: '102',
    careLevel: 2,
    notes: '',
    isActive: true,
  },
  {
    name: '佐藤 一郎',
    nameKana: 'サトウ イチロウ',
    birthDate: new Date('1942-11-08'),
    gender: 'male',
    roomNumber: '103',
    careLevel: 4,
    notes: '車椅子使用',
    isActive: true,
  },
  {
    name: '田中 美智子',
    nameKana: 'タナカ ミチコ',
    birthDate: new Date('1945-01-30'),
    gender: 'female',
    roomNumber: '104',
    careLevel: 2,
    notes: '',
    isActive: true,
  },
  {
    name: '高橋 健二',
    nameKana: 'タカハシ ケンジ',
    birthDate: new Date('1939-05-12'),
    gender: 'male',
    roomNumber: '105',
    careLevel: 3,
    notes: '糖尿病あり',
    isActive: true,
  },
  {
    name: '伊藤 節子',
    nameKana: 'イトウ セツコ',
    birthDate: new Date('1941-09-25'),
    gender: 'female',
    roomNumber: '106',
    careLevel: 1,
    notes: '',
    isActive: true,
  },
  {
    name: '渡辺 正夫',
    nameKana: 'ワタナベ マサオ',
    birthDate: new Date('1937-12-03'),
    gender: 'male',
    roomNumber: '107',
    careLevel: 5,
    notes: '寝たきり',
    isActive: true,
  },
  {
    name: '中村 和子',
    nameKana: 'ナカムラ カズコ',
    birthDate: new Date('1944-04-18'),
    gender: 'female',
    roomNumber: '108',
    careLevel: 2,
    notes: '',
    isActive: true,
  },
  {
    name: '小林 義男',
    nameKana: 'コバヤシ ヨシオ',
    birthDate: new Date('1943-08-07'),
    gender: 'male',
    roomNumber: '109',
    careLevel: 3,
    notes: '認知症あり',
    isActive: true,
  },
  {
    name: '加藤 幸子',
    nameKana: 'カトウ サチコ',
    birthDate: new Date('1946-02-14'),
    gender: 'female',
    roomNumber: '110',
    careLevel: 1,
    notes: '',
    isActive: true,
  },
];

// 記録生成用のヘルパー関数
function generateVitals(date: string, recordedBy: string): Vital[] {
  const times = ['06:00', '12:00', '18:00'];
  return times.map((time) => ({
    id: generateId(),
    time,
    temperature: 36.0 + Math.random() * 1.0,
    bloodPressureHigh: 110 + Math.floor(Math.random() * 40),
    bloodPressureLow: 60 + Math.floor(Math.random() * 30),
    pulse: 60 + Math.floor(Math.random() * 30),
    spO2: 95 + Math.floor(Math.random() * 5),
    note: '',
    recordedBy,
    recordedAt: new Date(`${date}T${time}:00`),
  }));
}

function generateExcretions(date: string, recordedBy: string): Excretion[] {
  const times = ['07:00', '10:00', '13:00', '16:00', '19:00'];
  const types: Excretion['type'][] = ['urine', 'urine', 'both', 'urine', 'urine'];
  const amounts: Excretion['urineAmount'][] = ['medium', 'small', 'large', 'medium', 'small'];

  return times.map((time, i) => ({
    id: generateId(),
    time,
    type: types[i],
    urineAmount: amounts[i],
    fecesAmount: types[i] === 'both' ? 'medium' : undefined,
    fecesCondition: types[i] === 'both' ? 'normal' : undefined,
    hasIncontinence: false,
    note: '',
    recordedBy,
    recordedAt: new Date(`${date}T${time}:00`),
  }));
}

function generateMeals(date: string, recordedBy: string): Meal[] {
  const mealTypes: Meal['mealType'][] = ['breakfast', 'lunch', 'dinner'];
  const amounts = [100, 80, 100];

  return mealTypes.map((mealType, i) => ({
    id: generateId(),
    mealType,
    mainDishAmount: amounts[i],
    sideDishAmount: amounts[i] - 10,
    soupAmount: amounts[i],
    note: '',
    recordedBy,
    recordedAt: new Date(`${date}T${mealType === 'breakfast' ? '08:00' : mealType === 'lunch' ? '12:30' : '18:30'}:00`),
  }));
}

function generateHydrations(date: string, recordedBy: string): Hydration[] {
  const times = ['09:00', '11:00', '14:00', '16:00', '20:00'];
  const amounts = [150, 100, 200, 100, 150];
  const drinkTypes = ['お茶', 'お茶', '水', 'コーヒー', 'お茶'];

  return times.map((time, i) => ({
    id: generateId(),
    time,
    amount: amounts[i],
    drinkType: drinkTypes[i],
    note: '',
    recordedBy,
    recordedAt: new Date(`${date}T${time}:00`),
  }));
}

/**
 * 利用者ごとのサンプル記録を生成
 */
export function generateSeedRecords(residentId: string, dates: string[]): Omit<DailyRecord, 'id' | 'createdAt' | 'updatedAt'>[] {
  const recordedBy = 'demo-guest-user';

  return dates.map((date) => ({
    residentId,
    date,
    vitals: generateVitals(date, recordedBy),
    excretions: generateExcretions(date, recordedBy),
    meals: generateMeals(date, recordedBy),
    hydrations: generateHydrations(date, recordedBy),
  }));
}

/**
 * 過去3日分の日付を取得
 */
export function getRecentDates(days: number = 3): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}
