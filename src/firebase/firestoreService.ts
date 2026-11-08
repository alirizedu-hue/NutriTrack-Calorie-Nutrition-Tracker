import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { DailyLog, UserProfile, ScannedMeal, FoodItem } from '../types/nutrition';

/**
 * Recursively cleans objects to remove any `undefined` values,
 * which Firestore strictly rejects with an Unsupported field value exception.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return data;
}

/**
 * Wraps any promise in an operational timeout to prevent indefinite UI hangs
 * in 'syncing' states during network interruptions or proxy hiccups.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms = 8000,
  operationName = 'Firestore operation'
): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Timeout: ${operationName} exceeded ${ms}ms threshold.`));
    }, ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Extracts friendly human-readable error message and detailed code from Firestore errors.
 * Unwraps serialized FirestoreErrorInfo JSON if present.
 */
export function parseFirestoreErrorMessage(error: unknown): { message: string; code?: string } {
  const err = error as any;
  let rawMsg = err?.message || String(error);
  let code = err?.code || '';

  // Attempt to parse structured FirestoreErrorInfo JSON
  if (typeof rawMsg === 'string' && rawMsg.startsWith('{') && rawMsg.endsWith('}')) {
    try {
      const parsed = JSON.parse(rawMsg);
      if (parsed.error) {
        rawMsg = parsed.error;
      }
    } catch {
      // not json, continue with rawMsg
    }
  }

  if (
    code.includes('permission-denied') ||
    rawMsg.includes('permission-denied') ||
    rawMsg.includes('Missing or insufficient permissions')
  ) {
    return {
      code: 'permission-denied',
      message: 'Cloud Firestore access denied by security rules. Ensure you are signed in to the right account.',
    };
  }
  if (
    code.includes('unauthenticated') ||
    rawMsg.includes('unauthenticated')
  ) {
    return {
      code: 'unauthenticated',
      message: 'Authentication session expired. Please sign in with your Google account again.',
    };
  }
  if (
    code.includes('unavailable') ||
    rawMsg.includes('client is offline') ||
    rawMsg.includes('offline') ||
    rawMsg.includes('network-request-failed')
  ) {
    return {
      code: 'unavailable',
      message: 'Network offline. Your changes are preserved locally and will sync once connectivity returns.',
    };
  }
  if (
    code.includes('deadline-exceeded') ||
    rawMsg.includes('Timeout') ||
    rawMsg.includes('exceeded')
  ) {
    return {
      code: 'deadline-exceeded',
      message: 'Cloud request timed out. Saved locally and queued for background sync.',
    };
  }
  return {
    code: code || 'unknown',
    message: rawMsg || 'An unexpected error occurred during cloud synchronization.',
  };
}

// -------------------------------------------------------------
// USER PROFILE SERVICE
// -------------------------------------------------------------

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await withTimeout(getDoc(docRef), 7000, 'fetchUserProfile');
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error(`[Firestore GET ${path}]`, error);
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(uid: string, profile: UserProfile): Promise<void> {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const payload = sanitizeForFirestore({
      ...profile,
      uid,
      updatedAt: new Date().toISOString(),
    });
    await withTimeout(setDoc(docRef, payload, { merge: true }), 8000, 'saveUserProfile');
    console.log(`[Firestore Sync] Successfully saved profile for user: ${uid}`);
  } catch (error) {
    console.error(`[Firestore WRITE ${path}]`, error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// DAILY LOGS & WATER INTAKE SERVICE
// -------------------------------------------------------------

export async function fetchDailyLog(uid: string, date: string): Promise<DailyLog | null> {
  const path = `users/${uid}/dailyLogs/${date}`;
  try {
    const docRef = doc(db, 'users', uid, 'dailyLogs', date);
    const snap = await withTimeout(getDoc(docRef), 7000, 'fetchDailyLog');
    if (snap.exists()) {
      return snap.data() as DailyLog;
    }
    return null;
  } catch (error) {
    console.error(`[Firestore GET ${path}]`, error);
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveDailyLog(uid: string, log: DailyLog): Promise<void> {
  const path = `users/${uid}/dailyLogs/${log.date}`;
  try {
    const docRef = doc(db, 'users', uid, 'dailyLogs', log.date);
    const payload = sanitizeForFirestore({
      ...log,
      userId: uid,
      updatedAt: new Date().toISOString(),
    });
    await withTimeout(setDoc(docRef, payload, { merge: true }), 8000, 'saveDailyLog');
    console.log(`[Firestore Sync] Successfully persisted daily log for ${log.date} under user: ${uid}`);
  } catch (error) {
    console.error(`[Firestore WRITE ${path}]`, error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchAllDailyLogs(uid: string): Promise<DailyLog[]> {
  const path = `users/${uid}/dailyLogs`;
  try {
    const colRef = collection(db, 'users', uid, 'dailyLogs');
    const snap = await withTimeout(getDocs(colRef), 9000, 'fetchAllDailyLogs');
    const logs: DailyLog[] = [];
    snap.forEach((d) => {
      logs.push(d.data() as DailyLog);
    });
    return logs;
  } catch (error) {
    console.error(`[Firestore LIST ${path}]`, error);
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeToDailyLogs(
  uid: string,
  onLogs: (logs: DailyLog[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `users/${uid}/dailyLogs`;
  const colRef = collection(db, 'users', uid, 'dailyLogs');
  return onSnapshot(
    colRef,
    (snap) => {
      const logs: DailyLog[] = [];
      snap.forEach((d) => {
        logs.push(d.data() as DailyLog);
      });
      onLogs(logs);
    },
    (error) => {
      console.warn(`[Firestore Snapshot Warning ${path}]`, error);
      const errMsg = error?.message || String(error);
      // Only invoke onError on permanent permission/auth rejections
      if (errMsg.includes('permission-denied') || errMsg.includes('unauthenticated')) {
        if (onError) onError(error as Error);
      }
    }
  );
}

// -------------------------------------------------------------
// SCANNED MEALS SERVICE
// -------------------------------------------------------------

export async function fetchScannedMeals(uid: string): Promise<ScannedMeal[]> {
  const path = `users/${uid}/scannedMeals`;
  try {
    const colRef = collection(db, 'users', uid, 'scannedMeals');
    const snap = await withTimeout(getDocs(colRef), 8000, 'fetchScannedMeals');
    const meals: ScannedMeal[] = [];
    snap.forEach((d) => {
      meals.push(d.data() as ScannedMeal);
    });
    return meals.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
  } catch (error) {
    console.error(`[Firestore LIST ${path}]`, error);
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveScannedMealToDb(uid: string, meal: ScannedMeal): Promise<void> {
  const path = `users/${uid}/scannedMeals/${meal.id}`;
  try {
    const docRef = doc(db, 'users', uid, 'scannedMeals', meal.id);
    const payload = sanitizeForFirestore({
      ...meal,
      userId: uid,
      updatedAt: new Date().toISOString(),
    });
    await withTimeout(setDoc(docRef, payload, { merge: true }), 8000, 'saveScannedMealToDb');
    console.log(`[Firestore Sync] Successfully saved scanned meal ${meal.id}`);
  } catch (error) {
    console.error(`[Firestore WRITE ${path}]`, error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteScannedMealFromDb(uid: string, mealId: string): Promise<void> {
  const path = `users/${uid}/scannedMeals/${mealId}`;
  try {
    const docRef = doc(db, 'users', uid, 'scannedMeals', mealId);
    await withTimeout(deleteDoc(docRef), 8000, 'deleteScannedMealFromDb');
    console.log(`[Firestore Sync] Successfully deleted scanned meal ${mealId}`);
  } catch (error) {
    console.error(`[Firestore DELETE ${path}]`, error);
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToScannedMeals(
  uid: string,
  onMeals: (meals: ScannedMeal[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `users/${uid}/scannedMeals`;
  const colRef = collection(db, 'users', uid, 'scannedMeals');
  return onSnapshot(
    colRef,
    (snap) => {
      const meals: ScannedMeal[] = [];
      snap.forEach((d) => {
        meals.push(d.data() as ScannedMeal);
      });
      meals.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
      onMeals(meals);
    },
    (error) => {
      console.warn(`[Firestore Snapshot Warning ${path}]`, error);
      const errMsg = error?.message || String(error);
      if (errMsg.includes('permission-denied') || errMsg.includes('unauthenticated')) {
        if (onError) onError(error as Error);
      }
    }
  );
}

// -------------------------------------------------------------
// CUSTOM FOODS SERVICE
// -------------------------------------------------------------

export async function fetchCustomFoods(uid: string): Promise<FoodItem[]> {
  const path = `users/${uid}/customFoods`;
  try {
    const colRef = collection(db, 'users', uid, 'customFoods');
    const snap = await withTimeout(getDocs(colRef), 8000, 'fetchCustomFoods');
    const items: FoodItem[] = [];
    snap.forEach((d) => {
      items.push(d.data() as FoodItem);
    });
    return items;
  } catch (error) {
    console.error(`[Firestore LIST ${path}]`, error);
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveCustomFoodToDb(uid: string, food: FoodItem): Promise<void> {
  const path = `users/${uid}/customFoods/${food.id}`;
  try {
    const docRef = doc(db, 'users', uid, 'customFoods', food.id);
    const payload = sanitizeForFirestore({
      ...food,
      userId: uid,
      createdAt: new Date().toISOString(),
    });
    await withTimeout(setDoc(docRef, payload, { merge: true }), 8000, 'saveCustomFoodToDb');
    console.log(`[Firestore Sync] Successfully saved custom food ${food.id}`);
  } catch (error) {
    console.error(`[Firestore WRITE ${path}]`, error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
