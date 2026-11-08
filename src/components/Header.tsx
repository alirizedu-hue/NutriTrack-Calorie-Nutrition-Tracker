import React from 'react';
import { useNutrition } from '../context/NutritionContext';
import { formatDisplayDate, getRelativeDayOffset, formatDateToISO } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight, Calendar, Plus, Menu, Flame, Droplets, Camera, Cloud, CloudOff, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    selectedDate,
    setSelectedDate,
    currentDailyLog,
    userProfile,
    setIsLogModalOpen,
    setTargetMealForModal,
    setActiveTab,
    syncStatus,
    retrySyncPending,
    syncErrorDetails,
  } = useNutrition();

  const totalCalories = currentDailyLog.entries.reduce((sum, e) => sum + e.calories, 0);
  const todayStr = formatDateToISO(new Date());
  const isToday = selectedDate === todayStr;

  const handlePrevDay = () => {
    setSelectedDate(getRelativeDayOffset(selectedDate, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(getRelativeDayOffset(selectedDate, 1));
  };

  const handleGoToday = () => {
    setSelectedDate(todayStr);
  };

  const handleOpenAddFood = () => {
    setTargetMealForModal(null);
    setIsLogModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-30 h-18 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile menu toggle + Date Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Date Stepper */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <button
            onClick={handlePrevDay}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Previous Day"
            aria-label="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(e.target.value);
              }}
              className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 bg-transparent border-none cursor-pointer focus:outline-none"
              aria-label="Select Date"
            />
          </div>

          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Next Day"
            aria-label="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={handleGoToday}
              className="hidden sm:inline-flex px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Center / Right: Informational Stats & Primary Action */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Informational Calories Quick Chip */}
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Estimated Intake:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {totalCalories}
            </span>
            <span className="text-slate-400">/ {userProfile.dailyCalorieTarget} kcal</span>
          </div>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-cyan-500" />
            <span>Water:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {currentDailyLog.waterGlasses}
            </span>
            <span className="text-slate-400">/ {userProfile.dailyWaterTargetGlasses} gl</span>
          </div>
        </div>

        {/* Cloud Sync Status Pill */}
        <div className="flex items-center">
          {syncStatus === 'synced' && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200/80 dark:border-emerald-800/80"
              title="All meal & water records confirmed synced in Cloud Firestore"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Cloud Synced</span>
            </div>
          )}

          {syncStatus === 'syncing' && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200/80 dark:border-blue-800/80"
              title="Saving changes to Cloud Firestore..."
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Syncing...</span>
            </div>
          )}

          {syncStatus === 'offline' && (
            <button
              onClick={() => retrySyncPending()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-medium border border-amber-200/80 dark:border-amber-800/80 hover:bg-amber-100 transition-colors cursor-pointer"
              title="Working offline. Click to test reconnection."
            >
              <CloudOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Offline (Saved Locally)</span>
            </button>
          )}

          {syncStatus === 'error' && (
            <button
              onClick={() => retrySyncPending()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200/80 dark:border-rose-800/80 hover:bg-rose-100 transition-colors cursor-pointer"
              title={syncErrorDetails || 'Failed to sync. Click to retry.'}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Retry Sync</span>
            </button>
          )}
        </div>

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Primary Actions: Scan Meal & Add Food */}
        <button
          onClick={() => setActiveTab('scanner')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold border border-emerald-200 dark:border-emerald-800 transition-colors"
          title="Scan Your Meal with AI Camera"
        >
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">Scan Meal</span>
        </button>

        <button
          onClick={handleOpenAddFood}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Food Entry</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
};
