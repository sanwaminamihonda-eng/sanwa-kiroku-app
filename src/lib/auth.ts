import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';
import { isDemo } from './env';
import { createUser, getUser } from './firestore';
import type { User } from '@/types';

// デモ用ゲストユーザーID
export const DEMO_GUEST_UID = 'demo-guest-user';

/**
 * メール/パスワードでログイン
 */
export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  const auth = getFirebaseAuth();
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * ログアウト
 */
export async function signOut(): Promise<void> {
  // デモモードの場合はローカルストレージをクリア
  if (isDemo()) {
    localStorage.removeItem('demo_user');
    return;
  }
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
}

/**
 * デモ用ゲストログイン
 */
export async function signInAsGuest(): Promise<User> {
  const guestUser: User = {
    id: DEMO_GUEST_UID,
    email: 'guest@demo.example.com',
    name: 'ゲストユーザー',
    role: 'staff',
    isActive: true,
    createdAt: new Date(),
  };

  // ローカルストレージに保存
  localStorage.setItem('demo_user', JSON.stringify(guestUser));

  // Firestoreにも保存（存在しない場合のみ）
  const existingUser = await getUser(DEMO_GUEST_UID);
  if (!existingUser) {
    await createUser(DEMO_GUEST_UID, {
      email: guestUser.email,
      name: guestUser.name,
      role: guestUser.role,
      isActive: guestUser.isActive,
    });
  }

  return guestUser;
}

/**
 * 現在のユーザーを取得（デモモード対応）
 */
export function getCurrentDemoUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('demo_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

/**
 * 認証状態の監視
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}
