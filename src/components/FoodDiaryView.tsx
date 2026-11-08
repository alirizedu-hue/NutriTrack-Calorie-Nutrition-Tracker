import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { MealCategory, FoodLogEntry } from '../types/nutrition';
import { formatDisplayDate, formatDateToISO } from '../utils/dateUtils';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  Flame,
  Search,
  Layers,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Camera,
  Sunrise,
  Sun,
  Sunset,
  Cookie,
  ArrowRight
} from 'lucide-react';

export const FoodDiaryView: React.FC = () => {
  const {
    currentDailyLog,
    selectedDate,
    setSelectedDate,
    userProfile,
    setIsLogModalOpen,
    setTargetMealForModal,
    setEditingEntry,
    deleteFoodLogEntry,
    setActiveTab,
  } = useNutrition();

  const [filterMeal, setFilterMeal] = useState<MealCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const entries = currentDailyLog.entries || [];

  // Date navigation helpers
  const handleShiftDate = (days: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDate(formatDateToISO(d));
  };

  const handleSetToday = () => {
    setSelectedDate(formatDateToISO(new Date()));
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesMeal = filterMeal === 'all' || entry.mealType === filterMeal;
    const matchesSearch =
      entry.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMeal && matchesSearch;
  });

  const totalCalories = filteredEntries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = Math.round(filteredEntries.reduce((sum, e) => sum + e.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(filteredEntries.reduce((sum, e) => sum + e.carbs, 0) * 10) / 10;
  const totalFat = Math.round(filteredEntries.reduce((sum, e) => sum + e.fat, 0) * 10) / 10;
  const totalFiber = Math.round(filteredEntries.reduce((sum, e) => sum + e.fiber, 0) * 10) / 10;

  const handleOpenAdd = (meal: MealCategory) => {
    setTargetMealForModal(meal);
    setIsLogModalOpen(true);
  };

  const mealSections: {
    type: MealCategory;
    title: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    { type: 'breakfast', title: 'Breakfast', icon: Sunrise, color: 'text-amber-500' },
    { type: 'lunch', title: 'Lunch', icon: Sun, color: 'text-emerald-500' },
    { type: 'dinner', title: 'Dinner', icon: Sunset, color: 'text-blue-500' },
    { type: 'snacks', title: 'Snacks', icon: Cookie, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header & Date Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-2">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Interactive Food Diary</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daily Food Diary
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log and review all meal items, portions, USDA macros, and scanned photographs.
          </p>
        </div>

        {/* Date Selector Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
            <button
              onClick={() => handleShiftDate(-1)}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{formatDisplayDate(selectedDate)}</span>
            </div>
            <button
              onClick={() => handleShiftDate(1)}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSetToday}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Today
          </button>

          <button
            onClick={() => handleOpenAdd('lunch')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Food</span>
          </button>
        </div>
      </div>

      {/* Daily Progress Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="text-[11px] text-slate-500 font-medium">Day's Total Energy</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {totalCalories} <span className="text-xs font-normal text-slate-400">/ {userProfile.dailyCalorieTarget} kcal</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            {Math.max(0, userProfile.dailyCalorieTarget - totalCalories)} kcal remaining
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500 font-medium">Protein</div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">
            {totalProtein}g <span className="text-xs font-normal text-slate-400">/ {userProfile.dailyProteinTarget}g</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {Math.round(totalProtein * 4)} kcal
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500 font-medium">Carbohydrates</div>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
            {totalCarbs}g <span className="text-xs font-normal text-slate-400">/ {userProfile.dailyCarbsTarget}g</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {Math.round(totalCarbs * 4)} kcal
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500 font-medium">Total Fat</div>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">
            {totalFat}g <span className="text-xs font-normal text-slate-400">/ {userProfile.dailyFatTarget}g</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {Math.round(totalFat * 9)} kcal
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500 font-medium">Fiber & Water</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {totalFiber}g fiber
          </div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400">
            {currentDailyLog.waterGlasses} glasses water
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'breakfast', 'lunch', 'dinner', 'snacks'] as const).map((meal) => {
            const isSelected = filterMeal === meal;
            return (
              <button
                key={meal}
                onClick={() => setFilterMeal(meal)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {meal === 'all' ? 'All Meals' : meal}
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search logged food items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Categorized Meal Sections */}
      <div className="space-y-6">
        {mealSections
          .filter((section) => filterMeal === 'all' || filterMeal === section.type)
          .map((section) => {
            const sectionEntries = filteredEntries.filter((e) => e.mealType === section.type);
            const sectionCalories = sectionEntries.reduce((sum, e) => sum + e.calories, 0);
            const sectionProtein = Math.round(sectionEntries.reduce((sum, e) => sum + e.protein, 0) * 10) / 10;
            const sectionCarbs = Math.round(sectionEntries.reduce((sum, e) => sum + e.carbs, 0) * 10) / 10;
            const sectionFat = Math.round(sectionEntries.reduce((sum, e) => sum + e.fat, 0) * 10) / 10;
            const sectionFiber = Math.round(sectionEntries.reduce((sum, e) => sum + e.fiber, 0) * 10) / 10;
            const Icon = section.icon;

            return (
              <div
                key={section.type}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
              >
                {/* Section Header */}
                <div className="p-4 sm:px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                      <Icon className={`w-4 h-4 ${section.color}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {section.title}
                      </h3>
                      <span className="text-xs text-slate-500">
                        {sectionEntries.length} {sectionEntries.length === 1 ? 'item' : 'items'} logged
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {sectionCalories} kcal
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        P: {sectionProtein}g · C: {sectionCarbs}g · F: {sectionFat}g · Fib: {sectionFiber}g
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenAdd(section.type)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>

                {/* Section Items Table / List */}
                {sectionEntries.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sectionEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {entry.imageUrl ? (
                            <img
                              src={entry.imageUrl}
                              alt={entry.foodName}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                              <UtensilsCrossed className="w-5 h-5" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {entry.foodName}
                              </span>
                              <span className="text-[11px] text-slate-400 shrink-0">
                                {entry.loggedAt}
                              </span>
                            </div>

                            <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                              <span>
                                {entry.servings}x ({Math.round(entry.servingSize * entry.servings)} {entry.servingUnit})
                              </span>
                              <span>•</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                                {entry.calories} kcal
                              </span>
                              <span>•</span>
                              <span className="font-mono text-slate-600 dark:text-slate-300">
                                P: {entry.protein}g · C: {entry.carbs}g · F: {entry.fat}g · Fib: {entry.fiber}g
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0">
                          <button
                            onClick={() => setEditingEntry(entry)}
                            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit entry"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteFoodLogEntry(entry.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-xs text-slate-400 italic">
                      No items logged for {section.title.toLowerCase()} on this date.
                    </p>
                    <button
                      onClick={() => handleOpenAdd(section.type)}
                      className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log {section.title} Item</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
