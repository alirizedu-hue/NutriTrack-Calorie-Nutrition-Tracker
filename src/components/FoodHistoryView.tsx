import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { getPastNDays, formatDisplayDate, parseISODate } from '../utils/dateUtils';
import {
  CalendarDays,
  Calendar,
  ChevronRight,
  Flame,
  Droplets,
  Activity,
  ArrowUpRight,
  Utensils,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

export const FoodHistoryView: React.FC = () => {
  const { dailyLogs, selectedDate, setSelectedDate, setActiveTab, userProfile } = useNutrition();

  const past7Days = getPastNDays(7, selectedDate);
  const [metricMode, setMetricMode] = useState<'calories' | 'protein' | 'water'>('calories');

  // Compute daily summaries for the 7 days
  const historyData = past7Days.map((dateStr) => {
    const log = dailyLogs.find((l) => l.date === dateStr);
    const entries = log?.entries || [];
    const calories = entries.reduce((s, e) => s + e.calories, 0);
    const protein = Math.round(entries.reduce((s, e) => s + e.protein, 0) * 10) / 10;
    const carbs = Math.round(entries.reduce((s, e) => s + e.carbs, 0) * 10) / 10;
    const fat = Math.round(entries.reduce((s, e) => s + e.fat, 0) * 10) / 10;
    const waterGlasses = log?.waterGlasses || 0;

    return {
      date: dateStr,
      displayDate: formatDisplayDate(dateStr),
      dayName: parseISODate(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
      itemCount: entries.length,
      calories,
      protein,
      carbs,
      fat,
      waterGlasses,
      entries,
    };
  });

  // Averages across the 7 days
  const totalDaysWithData = historyData.filter((d) => d.calories > 0).length || 1;
  const avgCalories = Math.round(historyData.reduce((s, d) => s + d.calories, 0) / totalDaysWithData);
  const avgProtein = Math.round((historyData.reduce((s, d) => s + d.protein, 0) / totalDaysWithData) * 10) / 10;
  const avgWater = Math.round((historyData.reduce((s, d) => s + d.waterGlasses, 0) / totalDaysWithData) * 10) / 10;

  // Max value for bar chart scaling
  const maxCal = Math.max(...historyData.map((d) => d.calories), userProfile.dailyCalorieTarget, 2400);
  const maxProtein = Math.max(...historyData.map((d) => d.protein), userProfile.dailyProteinTarget, 120);
  const maxWater = Math.max(...historyData.map((d) => d.waterGlasses), userProfile.dailyWaterTargetGlasses, 10);

  const handleSelectDay = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const handleViewDiaryForDay = (dateStr: string) => {
    setSelectedDate(dateStr);
    setActiveTab('diary');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Food History & Comparative Trends
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review past meals, compare multi-day intake, and explore your nutritional consistency over time
          </p>
        </div>

        {/* Date Jump */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 ml-1.5" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) setSelectedDate(e.target.value);
            }}
            className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-transparent border-none cursor-pointer focus:outline-none"
          />
        </div>
      </div>

      {/* 3 Weekly Average Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            7-Day Average Energy
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {avgCalories} <span className="text-xs font-normal text-slate-400">kcal / day</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Target: {userProfile.dailyCalorieTarget} kcal guideline
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            7-Day Average Protein
          </div>
          <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1 font-mono tabular-nums">
            {avgProtein} <span className="text-xs font-normal text-slate-400">g / day</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Target: {userProfile.dailyProteinTarget}g
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            7-Day Average Hydration
          </div>
          <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1 font-mono tabular-nums">
            {avgWater} <span className="text-xs font-normal text-slate-400">glasses / day ({Math.round(avgWater * 250)} ml)</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Target: {userProfile.dailyWaterTargetGlasses} glasses
          </div>
        </div>
      </div>

      {/* Multi-Day Comparative Bar Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              7-Day Nutritional Comparison
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Select metric to compare daily intake against your targets
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setMetricMode('calories')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                metricMode === 'calories'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Calories
            </button>
            <button
              onClick={() => setMetricMode('protein')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                metricMode === 'protein'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Protein
            </button>
            <button
              onClick={() => setMetricMode('water')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                metricMode === 'water'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Water
            </button>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="pt-6">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-52 pb-4 border-b border-slate-100 dark:border-slate-800">
            {historyData.map((day) => {
              const isCurrentSelected = day.date === selectedDate;
              let currentVal = day.calories;
              let targetVal = userProfile.dailyCalorieTarget;
              let maxVal = maxCal;
              let unit = 'kcal';
              let barColor = isCurrentSelected ? 'bg-emerald-600' : 'bg-emerald-500/80 hover:bg-emerald-600';

              if (metricMode === 'protein') {
                currentVal = day.protein;
                targetVal = userProfile.dailyProteinTarget;
                maxVal = maxProtein;
                unit = 'g';
                barColor = isCurrentSelected ? 'bg-teal-600' : 'bg-teal-500/80 hover:bg-teal-600';
              } else if (metricMode === 'water') {
                currentVal = day.waterGlasses;
                targetVal = userProfile.dailyWaterTargetGlasses;
                maxVal = maxWater;
                unit = 'gl';
                barColor = isCurrentSelected ? 'bg-cyan-600' : 'bg-cyan-500/80 hover:bg-cyan-600';
              }

              const heightPct = Math.max(8, Math.round((currentVal / maxVal) * 100));

              return (
                <button
                  key={day.date}
                  onClick={() => handleSelectDay(day.date)}
                  className="flex flex-col items-center gap-2 h-full justify-end group text-left focus:outline-none"
                >
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white font-mono tabular-nums opacity-80 group-hover:opacity-100">
                    {currentVal}
                    <span className="text-[9px] text-slate-400 ml-0.5">{unit}</span>
                  </span>
                  <div
                    className={`w-full rounded-t-xl h-full flex items-end overflow-hidden p-0.5 ${
                      isCurrentSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-full ${barColor} rounded-t-lg transition-all duration-300`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <span
                      className={`text-[11px] font-semibold block ${
                        isCurrentSelected
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {day.dayName}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">
                      {day.date.slice(5)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day by Day Log Entries List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Recorded Daily Summaries
        </h3>

        <div className="space-y-3">
          {historyData.map((day) => {
            const isSelected = day.date === selectedDate;
            return (
              <div
                key={day.date}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500/60 shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center font-bold text-slate-700 dark:text-slate-300 shrink-0">
                      <span className="text-[10px] uppercase font-mono">{day.dayName}</span>
                      <span className="text-sm font-extrabold">{day.date.slice(8)}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {day.displayDate}
                        </span>
                        {isSelected && (
                          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {day.itemCount} food entries logged · {day.waterGlasses} glasses of water
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                        {day.calories} <span className="text-xs font-normal text-slate-400">kcal</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        P: {day.protein}g · C: {day.carbs}g · F: {day.fat}g
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewDiaryForDay(day.date)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
                    >
                      <span>View Diary</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline mini meal pills */}
                {day.entries.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                    {day.entries.map((e) => (
                      <span
                        key={e.id}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {e.foodName} ({e.calories} kcal)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
