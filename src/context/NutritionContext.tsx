import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  FoodItem,
  FoodLogEntry,
  DailyLog,
  UserProfile,
  MealCategory,
  ToastMessage,
  ScannedMeal,
  ActiveTab,
} from '../types/nutrition';
import { SEED_FOODS } from '../data/seedFoods';
import { formatDateToISO } from '../utils/dateUtils';
import { useAuth } from './AuthContext';
import {
  fetchUserProfile,
  saveUserProfile,
  saveDailyLog,
  subscribeToDailyLogs,
  saveScannedMealToDb,
  deleteScannedMealFromDb,
  subscribeToScannedMeals,
  fetchCustomFoods,
  saveCustomFoodToDb,
  parseFirestoreErrorMessage,
  sanitizeForFirestore,
} from '../firebase/firestoreService';

export type CloudSyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

export interface NutritionContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  foods: FoodItem[];
  addCustomFood: (foodData: Omit<FoodItem, 'id' | 'isCustom'>) => FoodItem;
  dailyLogs: DailyLog[];
  currentDailyLog: DailyLog;
  isLoadingUserData: boolean;
  syncStatus: CloudSyncStatus;
  lastSyncTime: Date | null;
  syncErrorDetails: string | null;
  retrySyncPending: () => Promise<void>;
  addFoodLogEntry: (data: { foodId: string; mealType: MealCategory; servings: number; loggedAt?: string; imageUrl?: string }) => Promise<void>;
  updateFoodLogEntry: (id: string, updates: { servings?: number; mealType?: MealCategory }) => Promise<void>;
  deleteFoodLogEntry: (id: string) => Promise<void>;
  setWaterGlasses: (count: number) => Promise<void>;
  incrementWater: () => Promise<void>;
  decrementWater: () => Promise<void>;
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  resetToDefaults: () => Promise<void>;
  exportData: () => string;
  importData: (jsonStr: string) => Promise<boolean>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isLogModalOpen: boolean;
  setIsLogModalOpen: (open: boolean) => void;
  targetMealForModal: MealCategory | null;
  setTargetMealForModal: (meal: MealCategory | null) => void;
  editingEntry: FoodLogEntry | null;
  setEditingEntry: (entry: FoodLogEntry | null) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  scannedMeals: ScannedMeal[];
  saveScannedMeal: (mealData: Omit<ScannedMeal, 'id'>) => ScannedMeal;
  deleteScannedMeal: (id: string) => Promise<void>;
  updateScannedMeal: (id: string, updates: Partial<ScannedMeal>) => Promise<void>;
  addBatchFoodLogEntries: (
    items: Array<{
      foodName: string;
      category: any;
      servingSize: number;
      servingUnit: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    }>,
    mealType: MealCategory,
    imageUrl?: string,
    scannedMealId?: string
  ) => Promise<void>;
  signOutAndClear: () => Promise<void>;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

const createDefaultProfileForUser = (user: any): UserProfile => ({
  name: user?.displayName || 'NutriTrack Member',
  email: user?.email || '',
  avatarUrl: user?.photoURL || '/src/assets/images/nutritrack_user_avatar_1793989036331.jpg',
  title: 'Health & Nutrition Tracker',
  dietaryPreference: 'Balanced',
  dietaryRestrictions: ['Whole Foods'],
  preferredMeals: ['breakfast', 'lunch', 'dinner', 'snacks'],
  dailyCalorieTarget: 2100,
  dailyWaterTargetGlasses: 8,
  dailyProteinTarget: 120,
  dailyCarbsTarget: 220,
  dailyFatTarget: 65,
  dailyFiberTarget: 30,
  measurementSystem: 'metric',
});

const DEFAULT_BLANK_PROFILE: UserProfile = {
  name: 'NutriTrack Member',
  email: '',
  avatarUrl: '/src/assets/images/nutritrack_user_avatar_1793989036331.jpg',
  title: 'Health & Nutrition Tracker',
  dietaryPreference: 'Balanced',
  dietaryRestrictions: ['Whole Foods'],
  preferredMeals: ['breakfast', 'lunch', 'dinner', 'snacks'],
  dailyCalorieTarget: 2100,
  dailyWaterTargetGlasses: 8,
  dailyProteinTarget: 120,
  dailyCarbsTarget: 220,
  dailyFatTarget: 65,
  dailyFiberTarget: 30,
  measurementSystem: 'metric',
};

export const NutritionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOutUser } = useAuth();
  const todayStr = useMemo(() => formatDateToISO(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  // Cloud Synchronization state
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncErrorDetails, setSyncErrorDetails] = useState<string | null>(null);

  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [targetMealForModal, setTargetMealForModal] = useState<MealCategory | null>(null);
  const [editingEntry, setEditingEntry] = useState<FoodLogEntry | null>(null);

  // User Dynamic Data (strictly isolated by user.uid)
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_BLANK_PROFILE);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [scannedMeals, setScannedMeals] = useState<ScannedMeal[]>([]);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nutritrack_theme_v2');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('nutritrack_theme_v2', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'error' = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper: Deduplicate food entries by unique entry.id to guarantee idempotency
  const deduplicateEntries = useCallback((entries: FoodLogEntry[]): FoodLogEntry[] => {
    if (!Array.isArray(entries)) return [];
    const map = new Map<string, FoodLogEntry>();
    for (const entry of entries) {
      if (entry && entry.id) {
        map.set(entry.id, entry);
      }
    }
    return Array.from(map.values());
  }, []);

  // -------------------------------------------------------------
  // STRUCTURED OFFLINE QUEUE WITH UNIQUE OP-IDS & IDEMPOTENCY
  // -------------------------------------------------------------
  interface QueuedOperation {
    opId: string;
    type: 'save_daily_log' | 'save_profile' | 'save_scanned_meal' | 'delete_scanned_meal' | 'save_custom_food';
    timestamp: string;
    dateKey?: string;
    payload: any;
    retryCount: number;
  }

  const getQueueStorageKey = useCallback((uid: string) => `nutritrack_sync_queue_v2_${uid}`, []);

  const getQueuedOperations = useCallback((uid: string): QueuedOperation[] => {
    try {
      const raw = localStorage.getItem(getQueueStorageKey(uid));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [getQueueStorageKey]);

  const saveQueuedOperations = useCallback((uid: string, ops: QueuedOperation[]) => {
    try {
      localStorage.setItem(getQueueStorageKey(uid), JSON.stringify(ops));
    } catch {
      // ignore localStorage quota errors
    }
  }, [getQueueStorageKey]);

  const enqueueOperation = useCallback((
    uid: string,
    newOp: Omit<QueuedOperation, 'opId' | 'timestamp' | 'retryCount'> & { opId?: string }
  ) => {
    const ops = getQueuedOperations(uid);
    const opId = newOp.opId || `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fullOp: QueuedOperation = {
      ...newOp,
      opId,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    // If saving a daily log for the same date, merge entries idempotently
    if (fullOp.type === 'save_daily_log' && fullOp.dateKey) {
      const existingIdx = ops.findIndex((o) => o.type === 'save_daily_log' && o.dateKey === fullOp.dateKey);
      if (existingIdx >= 0) {
        const existing = ops[existingIdx];
        const mergedEntries = deduplicateEntries([...(existing.payload?.entries || []), ...(fullOp.payload?.entries || [])]);
        ops[existingIdx] = {
          ...fullOp,
          payload: {
            ...fullOp.payload,
            entries: mergedEntries,
            waterGlasses: Math.max(existing.payload?.waterGlasses || 0, fullOp.payload?.waterGlasses || 0),
          },
        };
        saveQueuedOperations(uid, ops);
        return opId;
      }
    }

    ops.push(fullOp);
    saveQueuedOperations(uid, ops);
    return opId;
  }, [getQueuedOperations, saveQueuedOperations, deduplicateEntries]);

  const removeQueuedOperation = useCallback((uid: string, opId: string) => {
    const ops = getQueuedOperations(uid);
    const filtered = ops.filter((o) => o.opId !== opId);
    saveQueuedOperations(uid, filtered);
  }, [getQueuedOperations, saveQueuedOperations]);

  // Flush pending offline queue once connectivity is reestablished
  const isFlushingQueueRef = React.useRef(false);

  const retrySyncPending = useCallback(async () => {
    if (!user?.uid || !navigator.onLine || isFlushingQueueRef.current) return;
    isFlushingQueueRef.current = true;

    try {
      // Backwards-compatible check for legacy queue
      const legacyKey = `nutritrack_pending_logs_${user.uid}`;
      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw) {
        try {
          const legacyQueue: Record<string, DailyLog> = JSON.parse(legacyRaw);
          for (const [date, log] of Object.entries(legacyQueue)) {
            enqueueOperation(user.uid, {
              type: 'save_daily_log',
              dateKey: date,
              payload: log,
            });
          }
          localStorage.removeItem(legacyKey);
        } catch {
          // ignore
        }
      }

      const ops = getQueuedOperations(user.uid);
      if (ops.length === 0) {
        setSyncStatus('synced');
        setSyncErrorDetails(null);
        return;
      }

      setSyncStatus('syncing');
      console.log(`[Cloud Sync Engine] Flushing ${ops.length} queued operations for user: ${user.uid}`);

      let lastErrorMessage = '';

      for (const op of ops) {
        try {
          if (op.type === 'save_daily_log') {
            await saveDailyLog(user.uid, op.payload);
          } else if (op.type === 'save_profile') {
            await saveUserProfile(user.uid, op.payload);
          } else if (op.type === 'save_scanned_meal') {
            await saveScannedMealToDb(user.uid, op.payload);
          } else if (op.type === 'delete_scanned_meal') {
            await deleteScannedMealFromDb(user.uid, op.payload.id);
          } else if (op.type === 'save_custom_food') {
            await saveCustomFoodToDb(user.uid, op.payload);
          }
          removeQueuedOperation(user.uid, op.opId);
        } catch (err) {
          const parsed = parseFirestoreErrorMessage(err);
          lastErrorMessage = parsed.message;
          console.warn(`[Cloud Sync Engine] Op ${op.opId} failed, will retry:`, err);
        }
      }

      const remaining = getQueuedOperations(user.uid);
      if (remaining.length === 0) {
        setSyncStatus('synced');
        setLastSyncTime(new Date());
        setSyncErrorDetails(null);
        addToast('Cloud Sync Complete', 'All offline entries were successfully synchronized.', 'success');
      } else {
        setSyncStatus('error');
        setSyncErrorDetails(lastErrorMessage || `${remaining.length} items remaining to sync.`);
      }
    } catch (globalErr) {
      console.error('[Cloud Sync Engine] Error during flush:', globalErr);
      const parsed = parseFirestoreErrorMessage(globalErr);
      setSyncStatus('error');
      setSyncErrorDetails(parsed.message);
    } finally {
      isFlushingQueueRef.current = false;
    }
  }, [user, getQueuedOperations, removeQueuedOperation, enqueueOperation]);

  // Listen to network online/offline events for auto-sync
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus('syncing');
      retrySyncPending();
    };
    const handleOffline = () => {
      setSyncStatus('offline');
      setSyncErrorDetails('Working offline. Changes are saved locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [retrySyncPending]);

  // -------------------------------------------------------------
  // USER AUTH LIFECYCLE: LOAD OR CLEAR ISOLATED DATA
  // -------------------------------------------------------------
  useEffect(() => {
    if (!user) {
      setUserProfile(DEFAULT_BLANK_PROFILE);
      setDailyLogs([]);
      setScannedMeals([]);
      setCustomFoods([]);
      setIsLoadingUserData(false);
      setSyncStatus('synced');
      setSyncErrorDetails(null);
      return;
    }

    let isMounted = true;
    setIsLoadingUserData(true);

    const initUserData = async () => {
      try {
        setSyncStatus('syncing');

        // 1. Fetch or initialize User Profile in Firestore
        let existingProfile: UserProfile | null = null;
        try {
          existingProfile = await fetchUserProfile(user.uid);
        } catch (fetchErr) {
          console.warn('[Init Profile Note] Using default or cached profile:', fetchErr);
        }

        if (!isMounted) return;

        if (existingProfile) {
          setUserProfile({
            ...existingProfile,
            email: user.email || existingProfile.email,
            avatarUrl: existingProfile.avatarUrl || user.photoURL || DEFAULT_BLANK_PROFILE.avatarUrl,
          });
        } else {
          // New User: Create fresh profile initialized from Google credentials
          const newProfile = createDefaultProfileForUser(user);
          setUserProfile(newProfile);
          saveUserProfile(user.uid, newProfile).catch((e) =>
            console.warn('[Background save profile note]:', e)
          );
        }

        // 2. Fetch custom foods created by this user
        try {
          const userCustomFoods = await fetchCustomFoods(user.uid);
          if (isMounted && userCustomFoods) {
            setCustomFoods(userCustomFoods);
          }
        } catch (e) {
          console.warn('[Background fetch custom foods note]:', e);
        }

        // 3. Complete init and flush any pending queue
        if (isMounted) {
          setSyncStatus('synced');
          setLastSyncTime(new Date());
          setSyncErrorDetails(null);
          retrySyncPending();
        }
      } catch (err) {
        console.error('[Init User Data Error]', err);
        const parsed = parseFirestoreErrorMessage(err);
        if (isMounted) {
          setSyncStatus('error');
          setSyncErrorDetails(parsed.message);
          addToast('Sync Notice', parsed.message, 'info');
        }
      } finally {
        if (isMounted) {
          setIsLoadingUserData(false);
        }
      }
    };

    initUserData();

    // 3. Realtime listener for Daily Logs (meals and water)
    const unsubDailyLogs = subscribeToDailyLogs(
      user.uid,
      (incomingLogs) => {
        if (isMounted) {
          setDailyLogs((prev) => {
            const mergedMap = new Map<string, DailyLog>();
            for (const r of incomingLogs) {
              mergedMap.set(r.date, { ...r, entries: deduplicateEntries(r.entries || []) });
            }
            // Preserve any pending local modifications
            for (const l of prev) {
              const existing = mergedMap.get(l.date);
              if (!existing) {
                mergedMap.set(l.date, l);
              } else {
                const combinedEntries = deduplicateEntries([...(existing.entries || []), ...(l.entries || [])]);
                mergedMap.set(l.date, {
                  ...existing,
                  waterGlasses: Math.max(existing.waterGlasses || 0, l.waterGlasses || 0),
                  entries: combinedEntries,
                });
              }
            }
            return Array.from(mergedMap.values());
          });
          setSyncStatus('synced');
          setLastSyncTime(new Date());
        }
      },
      (err) => {
        console.warn('[Daily Logs Subscription Warning]', err);
        const parsed = parseFirestoreErrorMessage(err);
        if (isMounted) {
          setSyncStatus('error');
          setSyncErrorDetails(parsed.message);
        }
      }
    );

    // 4. Realtime listener for Scanned Meals
    const unsubScannedMeals = subscribeToScannedMeals(
      user.uid,
      (meals) => {
        if (isMounted) {
          setScannedMeals(meals);
        }
      },
      (err) => {
        console.warn('[Scanned Meals Subscription Warning]', err);
      }
    );

    return () => {
      isMounted = false;
      unsubDailyLogs();
      unsubScannedMeals();
    };
  }, [user, retrySyncPending, deduplicateEntries]);

  // Combined food catalogue: shared USDA reference foods + user's own custom foods
  const foods = useMemo(() => {
    return [...SEED_FOODS, ...customFoods];
  }, [customFoods]);

  // Current Daily Log for selectedDate
  const currentDailyLog = useMemo(() => {
    const found = dailyLogs.find((l) => l.date === selectedDate);
    if (found) return found;
    return {
      date: selectedDate,
      entries: [],
      waterGlasses: 0,
    };
  }, [dailyLogs, selectedDate]);

  // -------------------------------------------------------------
  // CENTRALIZED CLOUD PERSISTENCE ENGINE
  // -------------------------------------------------------------

  /**
   * Persists daily log entries & water intake to Firestore.
   * Confirms write to the cloud before displaying synced status.
   * Never gets stuck on 'Syncing...' by utilizing strict operational timeouts
   * and automatic offline enqueueing.
   */
  const persistDailyLog = async (log: DailyLog, successMessage?: string): Promise<boolean> => {
    // 1. Deduplicate entries by ID
    const sanitizedLog: DailyLog = {
      ...log,
      entries: deduplicateEntries(log.entries || []),
    };

    // 2. Optimistic local state update for zero UI lag
    setDailyLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === sanitizedLog.date);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = sanitizedLog;
        return next;
      }
      return [...prev, sanitizedLog];
    });

    if (!user?.uid) {
      return true;
    }

    // 3. Offline check
    if (!navigator.onLine) {
      enqueueOperation(user.uid, {
        type: 'save_daily_log',
        dateKey: sanitizedLog.date,
        payload: sanitizedLog,
      });
      setSyncStatus('offline');
      setSyncErrorDetails('Saved locally. Will sync to cloud once connected.');
      addToast('Saved Locally (Offline)', 'Changes will sync to Cloud Firestore once reconnected.', 'info');
      return true;
    }

    // 4. Online: Send write with timeout
    setSyncStatus('syncing');
    try {
      await saveDailyLog(user.uid, sanitizedLog);
      setSyncStatus('synced');
      setLastSyncTime(new Date());
      setSyncErrorDetails(null);

      if (successMessage) {
        addToast('Synced to cloud', successMessage, 'success');
      } else {
        addToast('Synced to cloud', 'Updated meal and water records in Cloud Firestore.', 'success');
      }
      return true;
    } catch (err) {
      console.error('[Cloud Sync Failure] saveDailyLog:', err);
      enqueueOperation(user.uid, {
        type: 'save_daily_log',
        dateKey: sanitizedLog.date,
        payload: sanitizedLog,
      });
      const parsed = parseFirestoreErrorMessage(err);
      setSyncStatus('error');
      setSyncErrorDetails(parsed.message);
      addToast('Saved Locally', `${parsed.message} (Record preserved locally)`, 'info');
      return false;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...updates };
    setUserProfile(updated);

    if (user?.uid) {
      if (!navigator.onLine) {
        enqueueOperation(user.uid, {
          type: 'save_profile',
          payload: updated,
        });
        setSyncStatus('offline');
        addToast('Saved Locally (Offline)', 'Profile updates saved locally. Will sync when reconnected.', 'info');
        return;
      }

      setSyncStatus('syncing');
      try {
        await saveUserProfile(user.uid, updated);
        setSyncStatus('synced');
        setLastSyncTime(new Date());
        setSyncErrorDetails(null);
        addToast('Synced to cloud', 'Nutrition profile and targets saved to Firestore.', 'success');
      } catch (err) {
        console.error('[Cloud Sync Failure] updateUserProfile:', err);
        enqueueOperation(user.uid, {
          type: 'save_profile',
          payload: updated,
        });
        const parsed = parseFirestoreErrorMessage(err);
        setSyncStatus('error');
        setSyncErrorDetails(parsed.message);
        addToast('Saved Locally', `${parsed.message} (Profile preserved locally)`, 'info');
      }
    }
  };

  const addCustomFood = (foodData: Omit<FoodItem, 'id' | 'isCustom'>): FoodItem => {
    const newFood: FoodItem = {
      ...foodData,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isCustom: true,
    };

    setCustomFoods((prev) => [...prev, newFood]);

    if (user?.uid) {
      if (!navigator.onLine) {
        enqueueOperation(user.uid, {
          type: 'save_custom_food',
          payload: newFood,
        });
        setSyncStatus('offline');
        addToast('Saved Locally (Offline)', `Food "${newFood.name}" saved locally. Will sync when reconnected.`, 'info');
        return newFood;
      }

      setSyncStatus('syncing');
      saveCustomFoodToDb(user.uid, newFood)
        .then(() => {
          setSyncStatus('synced');
          setLastSyncTime(new Date());
          setSyncErrorDetails(null);
          addToast('Synced to cloud', `Saved "${newFood.name}" to your private food catalog.`, 'success');
        })
        .catch((err) => {
          console.error('[Cloud Sync Failure] saveCustomFoodToDb:', err);
          enqueueOperation(user.uid, {
            type: 'save_custom_food',
            payload: newFood,
          });
          const parsed = parseFirestoreErrorMessage(err);
          setSyncStatus('error');
          setSyncErrorDetails(parsed.message);
          addToast('Saved Locally', `${parsed.message} (Food item preserved locally)`, 'info');
        });
    }
    return newFood;
  };

  const addFoodLogEntry = async (data: {
    foodId: string;
    mealType: MealCategory;
    servings: number;
    loggedAt?: string;
    imageUrl?: string;
  }) => {
    const food = foods.find((f) => f.id === data.foodId);
    if (!food) {
      addToast('Error', 'Food item could not be found.', 'error');
      return;
    }

    const now = new Date();
    const timeString =
      data.loggedAt ||
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const servings = Math.max(0.1, Number(data.servings) || 1);

    const newEntry: FoodLogEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      foodId: food.id,
      foodName: food.name,
      category: food.category,
      mealType: data.mealType,
      servings,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      calories: Math.round(food.calories * servings),
      protein: Math.round(food.protein * servings * 10) / 10,
      carbs: Math.round(food.carbs * servings * 10) / 10,
      fat: Math.round(food.fat * servings * 10) / 10,
      fiber: Math.round(food.fiber * servings * 10) / 10,
      loggedAt: timeString,
      date: selectedDate,
      imageUrl: data.imageUrl || '',
    };

    const existingDay = dailyLogs.find((l) => l.date === selectedDate);
    const updatedDay: DailyLog = existingDay
      ? { ...existingDay, entries: [...existingDay.entries, newEntry] }
      : { date: selectedDate, waterGlasses: 0, entries: [newEntry] };

    const mealLabel = data.mealType.charAt(0).toUpperCase() + data.mealType.slice(1);
    await persistDailyLog(
      updatedDay,
      `Logged ${servings}x ${food.name} to ${mealLabel} (${newEntry.calories} kcal).`
    );
  };

  const addBatchFoodLogEntries = async (
    items: Array<{
      foodName: string;
      category: any;
      servingSize: number;
      servingUnit: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    }>,
    mealType: MealCategory,
    imageUrl?: string,
    scannedMealId?: string
  ) => {
    if (!items || items.length === 0) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newEntries: FoodLogEntry[] = items.map((item, idx) => {
      const existingFood = foods.find(
        (f) => f.name.toLowerCase() === item.foodName.toLowerCase()
      );
      const foodId = existingFood ? existingFood.id : `scanned-${Date.now()}-${idx}`;

      return {
        id: `entry-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        foodId,
        foodName: item.foodName,
        category: item.category || 'Prepared',
        mealType,
        servings: 1,
        servingSize: item.servingSize || 100,
        servingUnit: item.servingUnit || 'g',
        calories: Math.round(item.calories),
        protein: Math.round(item.protein * 10) / 10,
        carbs: Math.round(item.carbs * 10) / 10,
        fat: Math.round(item.fat * 10) / 10,
        fiber: Math.round(item.fiber * 10) / 10,
        loggedAt: timeString,
        date: selectedDate,
        imageUrl: imageUrl || '',
        scannedMealId: scannedMealId || '',
      };
    });

    const existingDay = dailyLogs.find((l) => l.date === selectedDate);
    const updatedDay: DailyLog = existingDay
      ? { ...existingDay, entries: [...existingDay.entries, ...newEntries] }
      : { date: selectedDate, waterGlasses: 0, entries: newEntries };

    const totalKcal = newEntries.reduce((sum, e) => sum + e.calories, 0);
    const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);
    await persistDailyLog(
      updatedDay,
      `Saved ${newEntries.length} scanned items to ${mealLabel} (${totalKcal} kcal).`
    );
  };

  const updateFoodLogEntry = async (
    id: string,
    updates: { servings?: number; mealType?: MealCategory }
  ) => {
    let updatedName = '';
    const day = dailyLogs.find((d) => d.entries.some((e) => e.id === id));
    if (!day) return;

    const entryIndex = day.entries.findIndex((e) => e.id === id);
    if (entryIndex === -1) return;

    const entry = day.entries[entryIndex];
    updatedName = entry.foodName;
    const food = foods.find((f) => f.id === entry.foodId);

    const newServings = updates.servings !== undefined ? Math.max(0.1, Number(updates.servings)) : entry.servings;
    const newMeal = updates.mealType || entry.mealType;

    let calories = entry.calories;
    let protein = entry.protein;
    let carbs = entry.carbs;
    let fat = entry.fat;
    let fiber = entry.fiber;

    if (food) {
      calories = Math.round(food.calories * newServings);
      protein = Math.round(food.protein * newServings * 10) / 10;
      carbs = Math.round(food.carbs * newServings * 10) / 10;
      fat = Math.round(food.fat * newServings * 10) / 10;
      fiber = Math.round(food.fiber * newServings * 10) / 10;
    }

    const newEntries = [...day.entries];
    newEntries[entryIndex] = {
      ...entry,
      servings: newServings,
      mealType: newMeal,
      calories,
      protein,
      carbs,
      fat,
      fiber,
    };

    const updatedDay: DailyLog = { ...day, entries: newEntries };
    await persistDailyLog(updatedDay, `Updated "${updatedName}" entry.`);
  };

  const deleteFoodLogEntry = async (id: string) => {
    let deletedName = '';
    const day = dailyLogs.find((d) => d.entries.some((e) => e.id === id));
    if (!day) return;

    const found = day.entries.find((e) => e.id === id);
    if (found) deletedName = found.foodName;

    const updatedDay: DailyLog = {
      ...day,
      entries: day.entries.filter((e) => e.id !== id),
    };

    await persistDailyLog(updatedDay, `Removed "${deletedName || 'item'}" from your diary.`);
  };

  // Water Tracker (saved to users/{user.uid}/dailyLogs/{date})
  const setWaterGlasses = async (count: number) => {
    const safeCount = Math.max(0, Math.min(24, count));
    const existingDay = dailyLogs.find((l) => l.date === selectedDate);
    const updatedDay: DailyLog = existingDay
      ? { ...existingDay, waterGlasses: safeCount }
      : { date: selectedDate, waterGlasses: safeCount, entries: [] };

    await persistDailyLog(updatedDay, `Water intake set to ${safeCount} glasses.`);
  };

  const incrementWater = async () => {
    await setWaterGlasses(currentDailyLog.waterGlasses + 1);
  };

  const decrementWater = async () => {
    await setWaterGlasses(Math.max(0, currentDailyLog.waterGlasses - 1));
  };

  // Scanned Meals Management
  const saveScannedMeal = (mealData: Omit<ScannedMeal, 'id'>): ScannedMeal => {
    const newMeal: ScannedMeal = {
      ...mealData,
      id: `scanned-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    setScannedMeals((prev) => [newMeal, ...prev]);

    if (user?.uid) {
      if (!navigator.onLine) {
        enqueueOperation(user.uid, {
          type: 'save_scanned_meal',
          payload: newMeal,
        });
        setSyncStatus('offline');
        addToast('Saved Locally (Offline)', `Meal scan "${newMeal.name}" saved locally.`, 'info');
        return newMeal;
      }

      setSyncStatus('syncing');
      saveScannedMealToDb(user.uid, newMeal)
        .then(() => {
          setSyncStatus('synced');
          setLastSyncTime(new Date());
          setSyncErrorDetails(null);
          addToast('Synced to cloud', `Saved meal scan "${newMeal.name}".`, 'success');
        })
        .catch((err) => {
          console.error('[Cloud Sync Failure] saveScannedMealToDb:', err);
          enqueueOperation(user.uid, {
            type: 'save_scanned_meal',
            payload: newMeal,
          });
          const parsed = parseFirestoreErrorMessage(err);
          setSyncStatus('error');
          setSyncErrorDetails(parsed.message);
          addToast('Saved Locally', `${parsed.message} (Meal scan preserved locally)`, 'info');
        });
    }
    return newMeal;
  };

  const deleteScannedMeal = async (id: string): Promise<void> => {
    setScannedMeals((prev) => prev.filter((m) => m.id !== id));
    if (user?.uid) {
      if (!navigator.onLine) {
        enqueueOperation(user.uid, {
          type: 'delete_scanned_meal',
          payload: { id },
        });
        setSyncStatus('offline');
        addToast('Saved Locally (Offline)', 'Deleted meal from local history.', 'info');
        return;
      }

      setSyncStatus('syncing');
      try {
        await deleteScannedMealFromDb(user.uid, id);
        setSyncStatus('synced');
        setLastSyncTime(new Date());
        setSyncErrorDetails(null);
        addToast('Synced to cloud', 'Removed scanned meal from cloud history.', 'info');
      } catch (err) {
        console.error('[Cloud Sync Failure] deleteScannedMealFromDb:', err);
        enqueueOperation(user.uid, {
          type: 'delete_scanned_meal',
          payload: { id },
        });
        const parsed = parseFirestoreErrorMessage(err);
        setSyncStatus('error');
        setSyncErrorDetails(parsed.message);
        addToast('Saved Locally', `${parsed.message} (Will sync deletion when connected)`, 'info');
      }
    }
  };

  const updateScannedMeal = async (id: string, updates: Partial<ScannedMeal>): Promise<void> => {
    const existing = scannedMeals.find((m) => m.id === id);
    if (!existing) return;

    const updated = { ...existing, ...updates };
    setScannedMeals((prev) => prev.map((m) => (m.id === id ? updated : m)));

    if (user?.uid) {
      if (!navigator.onLine) {
        enqueueOperation(user.uid, {
          type: 'save_scanned_meal',
          payload: updated,
        });
        setSyncStatus('offline');
        return;
      }

      setSyncStatus('syncing');
      try {
        await saveScannedMealToDb(user.uid, updated);
        setSyncStatus('synced');
        setLastSyncTime(new Date());
        setSyncErrorDetails(null);
        addToast('Synced to cloud', 'Updated meal history details.', 'success');
      } catch (err) {
        console.error('[Cloud Sync Failure] updateScannedMeal:', err);
        enqueueOperation(user.uid, {
          type: 'save_scanned_meal',
          payload: updated,
        });
        const parsed = parseFirestoreErrorMessage(err);
        setSyncStatus('error');
        setSyncErrorDetails(parsed.message);
        addToast('Saved Locally', `${parsed.message} (Meal history preserved locally)`, 'info');
      }
    }
  };

  // Reset & Clear
  const resetToDefaults = async () => {
    if (!user?.uid) return;
    const cleanProfile = createDefaultProfileForUser(user);
    setUserProfile(cleanProfile);
    setDailyLogs([]);
    setScannedMeals([]);
    setSelectedDate(todayStr);

    try {
      setSyncStatus('syncing');
      await saveUserProfile(user.uid, cleanProfile);
      setSyncStatus('synced');
      setLastSyncTime(new Date());
      addToast('Synced to cloud', 'Reset personal diary to a fresh clean state.', 'info');
    } catch (err) {
      console.error('[Reset Error]', err);
      const parsed = parseFirestoreErrorMessage(err);
      setSyncStatus('error');
      setSyncErrorDetails(parsed.message);
    }
  };

  const exportData = (): string => {
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      userProfile,
      customFoods,
      scannedMeals,
      dailyLogs,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importData = async (jsonStr: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || !Array.isArray(data.dailyLogs)) {
        throw new Error('Invalid format: missing dailyLogs array');
      }
      setSyncStatus('syncing');
      if (data.userProfile && user?.uid) {
        await updateUserProfile(data.userProfile);
      }
      if (Array.isArray(data.dailyLogs) && user?.uid) {
        for (const log of data.dailyLogs) {
          await saveDailyLog(user.uid, log);
        }
      }
      if (Array.isArray(data.scannedMeals) && user?.uid) {
        for (const meal of data.scannedMeals) {
          await saveScannedMealToDb(user.uid, meal);
        }
      }
      setSyncStatus('synced');
      setLastSyncTime(new Date());
      addToast('Synced to cloud', 'Your nutrition diary was loaded and synced.', 'success');
      return true;
    } catch (err) {
      console.error('[Import Error]', err);
      addToast('Import Failed', 'The file does not match NutriTrack backup format.', 'error');
      return false;
    }
  };

  const signOutAndClear = async () => {
    setUserProfile(DEFAULT_BLANK_PROFILE);
    setDailyLogs([]);
    setScannedMeals([]);
    setCustomFoods([]);
    setSyncStatus('synced');
    setSyncErrorDetails(null);
    await signOutUser();
    addToast('Signed Out', 'You have been safely signed out.', 'info');
  };

  return (
    <NutritionContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        userProfile,
        updateUserProfile,
        foods,
        addCustomFood,
        dailyLogs,
        currentDailyLog,
        isLoadingUserData,
        syncStatus,
        lastSyncTime,
        syncErrorDetails,
        retrySyncPending,
        addFoodLogEntry,
        updateFoodLogEntry,
        deleteFoodLogEntry,
        setWaterGlasses,
        incrementWater,
        decrementWater,
        toasts,
        addToast,
        removeToast,
        resetToDefaults,
        exportData,
        importData,
        theme,
        toggleTheme,
        isLogModalOpen,
        setIsLogModalOpen,
        targetMealForModal,
        setTargetMealForModal,
        editingEntry,
        setEditingEntry,
        activeTab,
        setActiveTab,
        addBatchFoodLogEntries,
        scannedMeals,
        saveScannedMeal,
        deleteScannedMeal,
        updateScannedMeal,
        signOutAndClear,
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = (): NutritionContextType => {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
};
