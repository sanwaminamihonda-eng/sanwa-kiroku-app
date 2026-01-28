// 利用者
export interface Resident {
  id: string;
  name: string;
  nameKana: string;
  birthDate: Date;
  gender: 'male' | 'female';
  roomNumber: string;
  careLevel: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// バイタル記録
export interface Vital {
  id: string;
  time: string; // HH:mm
  temperature?: number;
  bloodPressureHigh?: number;
  bloodPressureLow?: number;
  pulse?: number;
  spO2?: number;
  note?: string;
  recordedBy: string;
  recordedAt: Date;
}

// 排泄記録
export interface Excretion {
  id: string;
  time: string; // HH:mm
  type: 'urine' | 'feces' | 'both';
  urineAmount?: 'small' | 'medium' | 'large';
  fecesAmount?: 'small' | 'medium' | 'large';
  fecesCondition?: 'hard' | 'normal' | 'soft' | 'watery';
  hasIncontinence: boolean;
  note?: string;
  recordedBy: string;
  recordedAt: Date;
}

// 食事記録
export interface Meal {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mainDishAmount: number; // 0-100
  sideDishAmount: number; // 0-100
  soupAmount?: number; // 0-100
  note?: string;
  recordedBy: string;
  recordedAt: Date;
}

// 水分記録
export interface Hydration {
  id: string;
  time: string; // HH:mm
  amount: number; // ml
  drinkType?: string;
  note?: string;
  recordedBy: string;
  recordedAt: Date;
}

// 日別記録
export interface DailyRecord {
  id: string;
  residentId: string;
  date: string; // YYYY-MM-DD
  vitals: Vital[];
  excretions: Excretion[];
  meals: Meal[];
  hydrations: Hydration[];
  createdAt: Date;
  updatedAt: Date;
}

// ユーザー（職員）
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  isActive: boolean;
  createdAt: Date;
}

// アプリモード
export type AppMode = 'demo' | 'production';

// 記録タブ種別
export type RecordTab = 'vital' | 'excretion' | 'meal' | 'hydration';

// 食事摂取量の選択肢
export const MEAL_AMOUNT_OPTIONS = [
  { value: 100, label: '全量' },
  { value: 80, label: '8割' },
  { value: 50, label: '半量' },
  { value: 30, label: '3割' },
  { value: 0, label: '未摂取' },
] as const;

// 排泄量の選択肢
export const EXCRETION_AMOUNT_OPTIONS = [
  { value: 'small', label: '少' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '多' },
] as const;

// 便の状態の選択肢
export const FECES_CONDITION_OPTIONS = [
  { value: 'hard', label: '硬い' },
  { value: 'normal', label: '普通' },
  { value: 'soft', label: '軟便' },
  { value: 'watery', label: '水様' },
] as const;

// 水分量の選択肢（ml）
export const HYDRATION_AMOUNT_OPTIONS = [
  { value: 50, label: '50ml' },
  { value: 100, label: '100ml' },
  { value: 150, label: '150ml' },
  { value: 200, label: '200ml' },
  { value: 250, label: '250ml' },
] as const;
