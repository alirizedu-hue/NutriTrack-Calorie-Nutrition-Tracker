import React from 'react';
import { useNutrition } from '../context/NutritionContext';
import { MealCategory, FoodLogEntry } from '../types/nutrition';
import { formatDisplayDate, getPastNDays, formatDateToISO } from '../utils/dateUtils';
import {
  Flame,
  Plus,
  Droplets,
  Edit2,
  Trash2,
  Sunrise,
  Sun,
  Sunset,
  Cookie,
  Sparkles,
  Camera,
  Bot,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Upload
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentDailyLog,
    dailyLogs,
    userProfile,
    selectedDate,
    setSelectedDate,
    setIsLogModalOpen,
    setTargetMealForModal,
    setEditingEntry,
    deleteFoodLogEntry,
    incrementWater,
    decrementWater,
    setWaterGlasses,
    setActiveTab,
  } = useNutrition();

  const entries = currentDailyLog.entries || [];

  // Totals
  const totalCalories = entries.reduce((acc, e) => acc + e.calories, 0);
  const totalProtein = Math.round(entries.reduce((acc, e) => acc + e.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(entries.reduce((acc, e) => acc + e.carbs, 0) * 10) / 10;
  const totalFat = Math.round(entries.reduce((acc, e) => acc + e.fat, 0) * 10) / 10;
  const totalFiber = Math.round(entries.reduce((acc, e) => acc + e.fiber, 0) * 10) / 10;

  const remainingCalories = Math.max(0, userProfile.dailyCalorieTarget - totalCalories);
  const remainingProtein = Math.max(0, userProfile.dailyProteinTarget - totalProtein);
  const remainingCarbs = Math.max(0, userProfile.dailyCarbsTarget - totalCarbs);
  const remainingFat = Math.max(0, userProfile.dailyFatTarget - totalFat);
  const remainingFiber = Math.max(0, userProfile.dailyFiberTarget - totalFiber);

  // Water Tracker stats
  const waterTarget = userProfile.dailyWaterTargetGlasses || 8;
  const waterGlasses = currentDailyLog.waterGlasses || 0;
  const waterPercent = Math.min(100, Math.round((waterGlasses / waterTarget) * 100));

  // Past 7 Days data for weekly mini chart
  const past7Days = getPastNDays(7);
  const past7DaysData = past7Days.map((d) => {
    const found = dailyLogs.find((l) => l.date === d);
    const cal = found ? found.entries.reduce((s, e) => s + e.calories, 0) : 0;
    return {
      date: d,
      calories: cal,
      shortName: new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'narrow' }),
      isToday: d === selectedDate,
    };
  });

  const maxWeeklyCal = Math.max(userProfile.dailyCalorieTarget * 1.2, ...past7DaysData.map((d) => d.calories), 500);

  // Meal categories list
  const mealCategories: {
    type: MealCategory;
    title: string;
    icon: React.ElementType;
    timeHint: string;
  }[] = [
    { type: 'breakfast', title: 'Breakfast', icon: Sunrise, timeHint: '07:00 - 10:00 AM' },
    { type: 'lunch', title: 'Lunch', icon: Sun, timeHint: '12:00 - 02:30 PM' },
    { type: 'dinner', title: 'Dinner', icon: Sunset, timeHint: '06:30 - 09:00 PM' },
    { type: 'snacks', title: 'Snacks', icon: Cookie, timeHint: 'Throughout day' },
  ];

  const handleOpenAddForMeal = (meal: MealCategory) => {
    setTargetMealForModal(meal);
    setIsLogModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Compact Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-7 shadow-sm border border-emerald-600/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>{formatDisplayDate(selectedDate)}</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-full bg-white/15 text-white text-[11px]">
                {totalCalories} / {userProfile.dailyCalorieTarget} kcal
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Welcome back, {userProfile.name}
            </h1>
            <p className="text-xs text-emerald-100/90 max-w-xl">
              {remainingCalories > 0
                ? `You have ${remainingCalories} kcal and ${remainingProtein}g protein remaining today. Eat mindfully and stay hydrated!`
                : `You've achieved your ${userProfile.dailyCalorieTarget} kcal target for today! Balanced whole-food nutrition.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('scanner')}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 active:bg-emerald-100 text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 group"
            >
              <Camera className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>Scan Your Meal</span>
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600/60 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold border border-white/20 transition-colors flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Decorative subtle ambient ring */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-xl" />
      </div>

      {/* 2. Highlighted AI Food Scanner Primary Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30 border border-emerald-300/60 dark:border-emerald-800/60 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Camera className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>AI Multimodal Vision</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Instant AI Food & Portion Recognition
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Snap a picture of your plate or upload an existing food photo. Gemini Vision identifies every individual ingredient, estimates portion sizes in grams, and calculates exact USDA calories and macros.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('scanner')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span>Open Camera Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('meal-history')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-colors"
          >
            <span>Meal History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Four Macro Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Calories Consumed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {totalCalories}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {userProfile.dailyCalorieTarget} kcal
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {remainingCalories > 0 ? `${remainingCalories} kcal remaining` : 'Target reached'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.round((totalCalories / userProfile.dailyCalorieTarget) * 100))}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{Math.round((totalCalories / userProfile.dailyCalorieTarget) * 100)}% of goal</span>
              <span>{Math.round(totalCalories * 1)} kcal</span>
            </div>
          </div>
        </div>

        {/* Protein Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Protein
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {totalProtein}g
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {userProfile.dailyProteinTarget}g
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {remainingProtein > 0 ? `${remainingProtein}g left for today` : 'Protein goal hit'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.round((totalProtein / userProfile.dailyProteinTarget) * 100))}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{Math.round((totalProtein / userProfile.dailyProteinTarget) * 100)}% met</span>
              <span>{Math.round(totalProtein * 4)} kcal</span>
            </div>
          </div>
        </div>

        {/* Carbs Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Carbohydrates
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sunrise className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {totalCarbs}g
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {userProfile.dailyCarbsTarget}g
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {remainingCarbs > 0 ? `${remainingCarbs}g budget remaining` : 'Carb target reached'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 dark:bg-amber-400 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.round((totalCarbs / userProfile.dailyCarbsTarget) * 100))}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{Math.round((totalCarbs / userProfile.dailyCarbsTarget) * 100)}% met</span>
              <span>{Math.round(totalCarbs * 4)} kcal</span>
            </div>
          </div>
        </div>

        {/* Fat & Fiber Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Healthy Fat & Fiber
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {totalFat}g
              </span>
              <span className="text-xs text-slate-400 font-medium">
                fat · {totalFiber}g fiber
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Target: {userProfile.dailyFatTarget}g fat · {userProfile.dailyFiberTarget}g fiber
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 dark:bg-rose-400 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.round((totalFat / userProfile.dailyFatTarget) * 100))}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{Math.round((totalFat / userProfile.dailyFatTarget) * 100)}% fat</span>
              <span>{Math.round(totalFat * 9)} kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row: Main Content (Diary Breakdown) + Sidebar (Weekly Mini Chart & Water Tracker) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Today's Recorded Meals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Today's Meal Diary
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Breakdown of breakfast, lunch, dinner, and snacks for {formatDisplayDate(selectedDate)}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('diary')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Full Diary View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {mealCategories.map((cat) => {
              const mealEntries = entries.filter((e) => e.mealType === cat.type);
              const mealCal = mealEntries.reduce((acc, e) => acc + e.calories, 0);
              const mealProtein = Math.round(mealEntries.reduce((acc, e) => acc + e.protein, 0) * 10) / 10;
              const mealCarbs = Math.round(mealEntries.reduce((acc, e) => acc + e.carbs, 0) * 10) / 10;
              const mealFat = Math.round(mealEntries.reduce((acc, e) => acc + e.fat, 0) * 10) / 10;
              const Icon = cat.icon;

              return (
                <div
                  key={cat.type}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
                >
                  {/* Category Header */}
                  <div className="p-4 sm:px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {cat.title}
                          </h3>
                          <span className="text-[11px] text-slate-400 hidden sm:inline">
                            • {cat.timeHint}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {mealEntries.length} {mealEntries.length === 1 ? 'item' : 'items'} logged
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                          {mealCal} <span className="text-xs font-normal text-slate-400">kcal</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          P: {mealProtein}g · C: {mealCarbs}g · F: {mealFat}g
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenAddForMeal(cat.type)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Logged Items List */}
                  {mealEntries.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {mealEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                        >
                          <div className="min-w-0 flex-1 flex items-center gap-3">
                            {entry.imageUrl && (
                              <img
                                src={entry.imageUrl}
                                alt={entry.foodName}
                                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                                  {entry.foodName}
                                </span>
                                <span className="text-[11px] text-slate-400 shrink-0">
                                  {entry.loggedAt}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>
                                  {entry.servings}x ({Math.round(entry.servingSize * entry.servings)} {entry.servingUnit})
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                                  {entry.calories} kcal
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="hidden sm:inline font-mono">
                                  P: {entry.protein}g · C: {entry.carbs}g · F: {entry.fat}g
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setEditingEntry(entry)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Portion"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteFoodLogEntry(entry.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-4 text-center bg-white dark:bg-slate-900">
                      <p className="text-xs text-slate-400 italic">
                        No {cat.title.toLowerCase()} items logged for this date.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Weekly Mini Chart, Water Tracker & AI Callout */}
        <div className="space-y-6">
          {/* 4. Weekly Nutrition Mini Summary & Sparkline */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>7-Day Calorie Trend</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Daily intake vs {userProfile.dailyCalorieTarget} kcal target
                </p>
              </div>
              <button
                onClick={() => setActiveTab('nutrition')}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Analytics
              </button>
            </div>

            {/* Mini Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-28 pt-4 px-1 border-b border-slate-100 dark:border-slate-800">
              {past7DaysData.map((d) => {
                const heightPct = Math.min(100, Math.max(d.calories > 0 ? 12 : 4, Math.round((d.calories / maxWeeklyCal) * 100)));
                const isTargetMet = d.calories >= userProfile.dailyCalorieTarget * 0.9 && d.calories <= userProfile.dailyCalorieTarget * 1.1;

                return (
                  <div
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    className="flex-1 flex flex-col items-center cursor-pointer group"
                    title={`${d.date}: ${d.calories} kcal`}
                  >
                    <div className="w-full flex items-end justify-center h-20">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[18px] rounded-t-md transition-all ${
                          d.isToday
                            ? 'bg-emerald-600 ring-2 ring-emerald-400 ring-offset-1 dark:ring-offset-slate-900'
                            : isTargetMet
                            ? 'bg-emerald-500'
                            : d.calories > 0
                            ? 'bg-blue-400 dark:bg-blue-500'
                            : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      />
                    </div>
                    <span className={`text-[10px] mt-1 font-semibold ${
                      d.isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}>
                      {d.shortName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Water Intake Tracker Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>Hydration Tracker</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Target: {waterTarget} glasses ({waterTarget * 250} ml)
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                {waterGlasses * 250} ml
              </span>
            </div>

            {/* Glasses Visual Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 py-1">
              {Array.from({ length: Math.max(waterTarget, 8) }).map((_, idx) => {
                const filled = idx < waterGlasses;
                return (
                  <button
                    key={idx}
                    onClick={() => setWaterGlasses(idx + 1 === waterGlasses ? idx : idx + 1)}
                    className={`h-9 rounded-lg flex items-center justify-center transition-all ${
                      filled
                        ? 'bg-blue-500 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                    }`}
                    title={`Glass ${idx + 1}`}
                  >
                    <Droplets className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={decrementWater}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center justify-center hover:bg-slate-200"
                >
                  -
                </button>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {waterGlasses} / {waterTarget} glasses
                </span>
                <button
                  onClick={incrementWater}
                  className="w-7 h-7 rounded-lg bg-blue-600 text-white text-sm font-bold flex items-center justify-center hover:bg-blue-700"
                >
                  +
                </button>
              </div>

              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                {waterPercent}% fulfilled
              </span>
            </div>
          </div>

          {/* 6. AI Nutrition Assistant Quick Callout */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  AI Nutrition Assistant
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ready to analyze your intake
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              "What should I eat next based on my remaining {remainingCalories} calories and {remainingProtein}g protein?"
            </p>

            <button
              onClick={() => setActiveTab('assistant')}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Ask AI Nutrition Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
