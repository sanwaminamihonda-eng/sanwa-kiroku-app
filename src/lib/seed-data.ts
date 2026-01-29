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
  {
    name: '松本 清',
    nameKana: 'マツモト キヨシ',
    birthDate: new Date('1940-06-20'),
    gender: 'male',
    roomNumber: '111',
    careLevel: 2,
    notes: '高血圧あり',
    isActive: true,
  },
  {
    name: '井上 久美子',
    nameKana: 'イノウエ クミコ',
    birthDate: new Date('1943-03-11'),
    gender: 'female',
    roomNumber: '112',
    careLevel: 3,
    notes: '',
    isActive: true,
  },
  {
    name: '木村 勝',
    nameKana: 'キムラ マサル',
    birthDate: new Date('1938-09-05'),
    gender: 'male',
    roomNumber: '113',
    careLevel: 4,
    notes: '視力低下あり',
    isActive: true,
  },
  {
    name: '林 文子',
    nameKana: 'ハヤシ フミコ',
    birthDate: new Date('1941-12-28'),
    gender: 'female',
    roomNumber: '114',
    careLevel: 2,
    notes: '',
    isActive: true,
  },
  {
    name: '斎藤 博',
    nameKana: 'サイトウ ヒロシ',
    birthDate: new Date('1936-04-17'),
    gender: 'male',
    roomNumber: '115',
    careLevel: 5,
    notes: '経管栄養',
    isActive: true,
  },
  {
    name: '清水 芳江',
    nameKana: 'シミズ ヨシエ',
    birthDate: new Date('1944-08-09'),
    gender: 'female',
    roomNumber: '116',
    careLevel: 1,
    notes: '',
    isActive: true,
  },
  {
    name: '山口 進',
    nameKana: 'ヤマグチ ススム',
    birthDate: new Date('1939-11-23'),
    gender: 'male',
    roomNumber: '117',
    careLevel: 3,
    notes: '難聴あり',
    isActive: true,
  },
  {
    name: '森 たつ子',
    nameKana: 'モリ タツコ',
    birthDate: new Date('1942-02-06'),
    gender: 'female',
    roomNumber: '118',
    careLevel: 2,
    notes: '',
    isActive: true,
  },
  {
    name: '阿部 義雄',
    nameKana: 'アベ ヨシオ',
    birthDate: new Date('1937-07-14'),
    gender: 'male',
    roomNumber: '119',
    careLevel: 4,
    notes: 'パーキンソン病あり',
    isActive: true,
  },
  {
    name: '池田 静子',
    nameKana: 'イケダ シズコ',
    birthDate: new Date('1945-05-31'),
    gender: 'female',
    roomNumber: '120',
    careLevel: 1,
    notes: '',
    isActive: true,
  },
  {
    name: '橋本 修',
    nameKana: 'ハシモト オサム',
    birthDate: new Date('1940-10-02'),
    gender: 'male',
    roomNumber: '121',
    careLevel: 3,
    notes: '骨粗鬆症あり',
    isActive: true,
  },
  {
    name: '石川 千代',
    nameKana: 'イシカワ チヨ',
    birthDate: new Date('1935-01-19'),
    gender: 'female',
    roomNumber: '122',
    careLevel: 5,
    notes: '寝たきり、褥瘡予防',
    isActive: true,
  },
  {
    name: '前田 武',
    nameKana: 'マエダ タケシ',
    birthDate: new Date('1941-06-27'),
    gender: 'male',
    roomNumber: '123',
    careLevel: 2,
    notes: '',
    isActive: true,
  },
  {
    name: '藤田 光子',
    nameKana: 'フジタ ミツコ',
    birthDate: new Date('1943-09-15'),
    gender: 'female',
    roomNumber: '124',
    careLevel: 3,
    notes: 'リウマチあり',
    isActive: true,
  },
  {
    name: '後藤 栄一',
    nameKana: 'ゴトウ エイイチ',
    birthDate: new Date('1938-12-08'),
    gender: 'male',
    roomNumber: '125',
    careLevel: 4,
    notes: '認知症あり',
    isActive: true,
  },
  {
    name: '岡田 敏子',
    nameKana: 'オカダ トシコ',
    birthDate: new Date('1946-03-24'),
    gender: 'female',
    roomNumber: '126',
    careLevel: 1,
    notes: '',
    isActive: true,
  },
  {
    name: '村上 茂',
    nameKana: 'ムラカミ シゲル',
    birthDate: new Date('1939-08-13'),
    gender: 'male',
    roomNumber: '127',
    careLevel: 3,
    notes: '心不全既往',
    isActive: true,
  },
  {
    name: '近藤 富美子',
    nameKana: 'コンドウ フミコ',
    birthDate: new Date('1942-11-30'),
    gender: 'female',
    roomNumber: '128',
    careLevel: 2,
    notes: '',
    isActive: true,
  },
  {
    name: '石井 正',
    nameKana: 'イシイ タダシ',
    birthDate: new Date('1937-04-05'),
    gender: 'male',
    roomNumber: '129',
    careLevel: 4,
    notes: '脳梗塞後遺症',
    isActive: true,
  },
  {
    name: '坂本 秋子',
    nameKana: 'サカモト アキコ',
    birthDate: new Date('1944-07-21'),
    gender: 'female',
    roomNumber: '130',
    careLevel: 2,
    notes: '軽度難聴',
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
 * 過去7日分の日付を取得
 */
export function getRecentDates(days: number = 7): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}
