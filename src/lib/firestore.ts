import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  type DocumentData,
  Timestamp,
  setDoc,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { getCollectionName } from './env';
import type { Resident, DailyRecord, User } from '@/types';

// Firestore Timestamp を Date に変換
function convertTimestamps<T extends DocumentData>(data: T): T {
  const result = { ...data } as Record<string, unknown>;
  for (const key in result) {
    const value = result[key];
    if (value instanceof Timestamp) {
      result[key] = value.toDate();
    }
  }
  return result as T;
}

// ========================================
// 利用者（Residents）
// ========================================

export async function getResidents(): Promise<Resident[]> {
  const db = getFirebaseDb();
  const colName = getCollectionName('residents');
  const q = query(
    collection(db, colName),
    where('isActive', '==', true),
    orderBy('name')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Resident[];
}

export async function getResident(id: string): Promise<Resident | null> {
  const db = getFirebaseDb();
  const colName = getCollectionName('residents');
  const docRef = doc(db, colName, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return {
    id: snapshot.id,
    ...convertTimestamps(snapshot.data()),
  } as Resident;
}

export async function createResident(data: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = getFirebaseDb();
  const colName = getCollectionName('residents');
  const now = new Date();
  const docRef = await addDoc(collection(db, colName), {
    ...data,
    birthDate: Timestamp.fromDate(data.birthDate),
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  return docRef.id;
}

export async function updateResident(id: string, data: Partial<Resident>): Promise<void> {
  const db = getFirebaseDb();
  const colName = getCollectionName('residents');
  const docRef = doc(db, colName, id);
  const updateData: DocumentData = { ...data, updatedAt: Timestamp.fromDate(new Date()) };
  if (data.birthDate) {
    updateData.birthDate = Timestamp.fromDate(data.birthDate);
  }
  await updateDoc(docRef, updateData);
}

export async function deleteResident(id: string): Promise<void> {
  const db = getFirebaseDb();
  const colName = getCollectionName('residents');
  const docRef = doc(db, colName, id);
  // 論理削除
  await updateDoc(docRef, { isActive: false, updatedAt: Timestamp.fromDate(new Date()) });
}

// ========================================
// 日別記録（DailyRecords）
// ========================================

export async function getDailyRecord(residentId: string, date: string): Promise<DailyRecord | null> {
  const db = getFirebaseDb();
  const colName = getCollectionName('records');
  const docRef = doc(db, colName, residentId, 'daily', date);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return {
    id: snapshot.id,
    ...convertTimestamps(snapshot.data()),
  } as DailyRecord;
}

export async function saveDailyRecord(residentId: string, date: string, data: Partial<DailyRecord>): Promise<void> {
  const db = getFirebaseDb();
  const colName = getCollectionName('records');
  const docRef = doc(db, colName, residentId, 'daily', date);
  const now = new Date();

  const existingDoc = await getDoc(docRef);
  if (existingDoc.exists()) {
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.fromDate(now),
    });
  } else {
    await setDoc(docRef, {
      residentId,
      date,
      vitals: [],
      excretions: [],
      meals: [],
      hydrations: [],
      ...data,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
  }
}

// ========================================
// ユーザー（Users）
// ========================================

export async function getUser(uid: string): Promise<User | null> {
  const db = getFirebaseDb();
  const colName = getCollectionName('users');
  const docRef = doc(db, colName, uid);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return {
    id: snapshot.id,
    ...convertTimestamps(snapshot.data()),
  } as User;
}

export async function createUser(uid: string, data: Omit<User, 'id' | 'createdAt'>): Promise<void> {
  const db = getFirebaseDb();
  const colName = getCollectionName('users');
  const docRef = doc(db, colName, uid);
  await setDoc(docRef, {
    ...data,
    createdAt: Timestamp.fromDate(new Date()),
  });
}

// ========================================
// デモ用: 全データ削除
// ========================================

export async function clearDemoData(): Promise<void> {
  const db = getFirebaseDb();
  const collections = ['demo_residents', 'demo_records', 'demo_users'];

  for (const colName of collections) {
    const snapshot = await getDocs(collection(db, colName));
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }
}

// ========================================
// 一括操作（Bulk Operations）
// ========================================

/**
 * 複数利用者への一括記録保存
 */
export async function saveBulkRecords(
  records: Array<{
    residentId: string;
    date: string;
    data: Partial<DailyRecord>;
  }>
): Promise<void> {
  const promises = records.map(({ residentId, date, data }) =>
    saveDailyRecord(residentId, date, data)
  );
  await Promise.all(promises);
}
