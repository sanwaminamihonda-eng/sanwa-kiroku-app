import { collection, doc, setDoc, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { SEED_RESIDENTS, generateSeedRecords, getRecentDates } from './seed-data';
import { isDemo } from './env';

/**
 * Seedデータを投入
 */
export async function seedData(): Promise<{ residentsCount: number; recordsCount: number }> {
  if (!isDemo()) {
    throw new Error('Seed機能はデモモードでのみ使用可能です');
  }

  const db = getFirebaseDb();
  const residentsCol = collection(db, 'demo_residents');
  const recordsCol = 'demo_records';
  const dates = getRecentDates(3);

  let residentsCount = 0;
  let recordsCount = 0;

  // 利用者データを投入
  for (const resident of SEED_RESIDENTS) {
    const docRef = doc(residentsCol);
    const now = new Date();
    await setDoc(docRef, {
      ...resident,
      birthDate: Timestamp.fromDate(resident.birthDate),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
    residentsCount++;

    // 各利用者の記録データを投入
    const records = generateSeedRecords(docRef.id, dates);
    for (const record of records) {
      const recordDocRef = doc(db, recordsCol, docRef.id, 'daily', record.date);
      await setDoc(recordDocRef, {
        ...record,
        vitals: record.vitals.map((v) => ({
          ...v,
          recordedAt: Timestamp.fromDate(v.recordedAt),
        })),
        excretions: record.excretions.map((e) => ({
          ...e,
          recordedAt: Timestamp.fromDate(e.recordedAt),
        })),
        meals: record.meals.map((m) => ({
          ...m,
          recordedAt: Timestamp.fromDate(m.recordedAt),
        })),
        hydrations: record.hydrations.map((h) => ({
          ...h,
          recordedAt: Timestamp.fromDate(h.recordedAt),
        })),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });
      recordsCount++;
    }
  }

  return { residentsCount, recordsCount };
}

/**
 * デモデータをリセット（全削除後にSeed投入）
 */
export async function resetDemoData(): Promise<{ residentsCount: number; recordsCount: number }> {
  if (!isDemo()) {
    throw new Error('リセット機能はデモモードでのみ使用可能です');
  }

  const db = getFirebaseDb();

  // demo_residents を削除
  const residentsSnapshot = await getDocs(collection(db, 'demo_residents'));
  for (const docSnap of residentsSnapshot.docs) {
    // サブコレクション（daily records）も削除
    const dailySnapshot = await getDocs(collection(db, 'demo_records', docSnap.id, 'daily'));
    for (const dailyDoc of dailySnapshot.docs) {
      await deleteDoc(dailyDoc.ref);
    }
    await deleteDoc(docSnap.ref);
  }

  // demo_users を削除（ゲストユーザー以外）
  const usersSnapshot = await getDocs(collection(db, 'demo_users'));
  for (const docSnap of usersSnapshot.docs) {
    if (docSnap.id !== 'demo-guest-user') {
      await deleteDoc(docSnap.ref);
    }
  }

  // Seedデータを再投入
  return seedData();
}

/**
 * Seedデータが投入済みかチェック
 */
export async function isSeedDataExists(): Promise<boolean> {
  if (!isDemo()) return false;

  const db = getFirebaseDb();
  const snapshot = await getDocs(collection(db, 'demo_residents'));
  return !snapshot.empty;
}
