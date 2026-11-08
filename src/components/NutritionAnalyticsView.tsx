import React, { useState, useMemo } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { DailyLog, FoodLogEntry } from '../types/nutrition';
import { formatDisplayDate, getPastNDays, formatDateToISO } from '../utils/dateUtils';
import {
  PieChart,
  BarChart3,
  Calendar,
  TrendingUp,
  Flame,
  Droplets,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  Apple,
  Award,
  ChevronDown
} from 'lucide-react';

export const NutritionAnalyticsView: React.FC = () => {
  const { dailyLogs, userProfile, selectedDate, setSelectedDate, setActiveTab } = useNutrition();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'custom'>('7d');
  const todayStr = useMemo(() => formatDateToISO(new Date()), []);

  // Custom date picker range
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return formatDateToISO(d);
  });
  const [customEndDate, setCustomEndDate] = useState<string>(todayStr);

  // Day Comparison state
  const [compareDayA, setCompareDayA] = useState<string>(todayStr);
  const [compareDayB, setCompareDayB] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return formatDateToISO(d);
  });

  // Selected bar for detailed day preview in the chart
  const [hoveredOrSelectedDate, setHoveredOrSelectedDate] = useState<string | null>(todayStr);

  // Filter logs for selected time range
  const periodLogs = useMemo(() => {
    let dateList: string[] = [];
    if (timeRange === '7d') {
      dateList = getPastNDays(7);
    } else if (timeRange === '30d') {
      dateList = getPastNDays(30);
    } else {
      // Custom range: build array of dates between start and end
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const cur = new Date(start);
      while (cur <= end) {
        dateList.push(formatDateToISO(new Date(cur)));
        cur.setDate(cur.getDate() + 1);
      }
    }

    return dateList.map((dateStr) => {
      const found = dailyLogs.find((l) => l.date === dateStr);
      return (
        found || {
          date: dateStr,
          entries: [],
          waterGlasses: 0,
        }
      );
    });
  }, [timeRange, customStartDate, customEndDate, dailyLogs]);

  // Compute period metrics
  const logsWithData = periodLogs.filter((l) => l.entries.length > 0);
  const totalDaysInRange = periodLogs.length;
  const recordedDaysCount = logsWithData.length;

  const totalPeriodCalories = logsWithData.reduce(
    (sum, log) => sum + log.entries.reduce((s, e) => s + e.calories, 0),
    0
  );
  const avgPeriodCalories = recordedDaysCount > 0 ? Math.round(totalPeriodCalories / recordedDaysCount) : 0;

  const totalPeriodProtein = logsWithData.reduce(
    (sum, log) => sum + log.entries.reduce((s, e) => s + e.protein, 0),
    0
  );
  const avgPeriodProtein = recordedDaysCount > 0 ? Math.round((totalPeriodProtein / recordedDaysCount) * 10) / 10 : 0;

  const totalPeriodCarbs = logsWithData.reduce(
    (sum, log) => sum + log.entries.reduce((s, e) => s + e.carbs, 0),
    0
  );
  const avgPeriodCarbs = recordedDaysCount > 0 ? Math.round((totalPeriodCarbs / recordedDaysCount) * 10) / 10 : 0;

  const totalPeriodFat = logsWithData.reduce(
    (sum, log) => sum + log.entries.reduce((s, e) => s + e.fat, 0),
    0
  );
  const avgPeriodFat = recordedDaysCount > 0 ? Math.round((totalPeriodFat / recordedDaysCount) * 10) / 10 : 0;

  const totalPeriodFiber = logsWithData.reduce(
    (sum, log) => sum + log.entries.reduce((s, e) => s + e.fiber, 0),
    0
  );
  const avgPeriodFiber = recordedDaysCount > 0 ? Math.round((totalPeriodFiber / recordedDaysCount) * 10) / 10 : 0;

  const totalPeriodWater = periodLogs.reduce((sum, log) => sum + log.waterGlasses, 0);
  const avgPeriodWater = totalDaysInRange > 0 ? Math.round((totalPeriodWater / totalDaysInRange) * 10) / 10 : 0;

  // Macro Energy Ratio
  const pKcal = avgPeriodProtein * 4;
  const cKcal = avgPeriodCarbs * 4;
  const fKcal = avgPeriodFat * 9;
  const sumKcal = Math.max(1, pKcal + cKcal + fKcal);
  const proteinRatioPct = Math.round((pKcal / sumKcal) * 100);
  const carbsRatioPct = Math.round((cKcal / sumKcal) * 100);
  const fatRatioPct = Math.max(0, 100 - proteinRatioPct - carbsRatioPct);

  // SVG Donut metrics
  const donutRadius = 50;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const pStroke = (proteinRatioPct / 100) * donutCircumference;
  const cStroke = (carbsRatioPct / 100) * donutCircumference;
  const fStroke = (fatRatioPct / 100) * donutCircumference;

  // Most consumed food items
  const foodFrequencyMap: Record<string, { count: number; totalCalories: number; name: string }> = {};
  logsWithData.forEach((l) => {
    l.entries.forEach((e) => {
      const key = e.foodName.toLowerCase();
      if (!foodFrequencyMap[key]) {
        foodFrequencyMap[key] = { count: 0, totalCalories: 0, name: e.foodName };
      }
      foodFrequencyMap[key].count += 1;
      foodFrequencyMap[key].totalCalories += e.calories;
    });
  });

  const topConsumedFoods = Object.values(foodFrequencyMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Meal category distribution
  const mealCategoryCalories: Record<string, number> = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 0,
  };
  logsWithData.forEach((l) => {
    l.entries.forEach((e) => {
      if (mealCategoryCalories[e.mealType] !== undefined) {
        mealCategoryCalories[e.mealType] += e.calories;
      }
    });
  });

  const totalMealCategoryCalories = Math.max(
    1,
    Object.values(mealCategoryCalories).reduce((a, b) => a + b, 0)
  );

  // Day Comparison Data
  const logA = dailyLogs.find((l) => l.date === compareDayA) || {
    date: compareDayA,
    entries: [],
    waterGlasses: 0,
  };
  const logB = dailyLogs.find((l) => l.date === compareDayB) || {
    date: compareDayB,
    entries: [],
    waterGlasses: 0,
  };

  const getDayStats = (log: DailyLog) => {
    const calories = log.entries.reduce((s, e) => s + e.calories, 0);
    const protein = Math.round(log.entries.reduce((s, e) => s + e.protein, 0) * 10) / 10;
    const carbs = Math.round(log.entries.reduce((s, e) => s + e.carbs, 0) * 10) / 10;
    const fat = Math.round(log.entries.reduce((s, e) => s + e.fat, 0) * 10) / 10;
    const fiber = Math.round(log.entries.reduce((s, e) => s + e.fiber, 0) * 10) / 10;
    return { calories, protein, carbs, fat, fiber, waterGlasses: log.waterGlasses, itemsCount: log.entries.length };
  };

  const statsA = getDayStats(logA);
  const statsB = getDayStats(logB);

  // Preview data for the selected day in chart
  const activeChartLog = periodLogs.find((l) => l.date === hoveredOrSelectedDate) || periodLogs[periodLogs.length - 1];
  const activeChartCalories = activeChartLog ? activeChartLog.entries.reduce((s, e) => s + e.calories, 0) : 0;
  const activeChartProtein = activeChartLog ? Math.round(activeChartLog.entries.reduce((s, e) => s + e.protein, 0) * 10) / 10 : 0;
  const activeChartCarbs = activeChartLog ? Math.round(activeChartLog.entries.reduce((s, e) => s + e.carbs, 0) * 10) / 10 : 0;
  const activeChartFat = activeChartLog ? Math.round(activeChartLog.entries.reduce((s, e) => s + e.fat, 0) * 10) / 10 : 0;
  const activeChartFiber = activeChartLog ? Math.round(activeChartLog.entries.reduce((s, e) => s + e.fiber, 0) * 10) / 10 : 0;

  // Max calories for scaling chart bars
  const maxCalorieValue = Math.max(
    userProfile.dailyCalorieTarget * 1.25,
    ...periodLogs.map((l) => l.entries.reduce((s, e) => s + e.calories, 0)),
    500
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header & Time Period Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Nutritional Analytics Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Weekly & Period Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real data trends, daily calorie intake, macronutrient balance, and day-to-day comparisons.
          </p>
        </div>

        {/* Period Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeRange === '7d'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeRange === '30d'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange('custom')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeRange === 'custom'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Custom Range
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Range Pickers (if custom selected) */}
      {timeRange === 'custom' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">From:</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">To:</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-400">
            Showing {totalDaysInRange} days in selected span
          </span>
        </div>
      )}

      {/* KPI Overview Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Daily Avg Calories</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {avgPeriodCalories} <span className="text-xs font-normal text-slate-400">kcal</span>
          </div>
          <div className={`text-[10px] mt-1 font-semibold ${
            avgPeriodCalories > userProfile.dailyCalorieTarget ? 'text-amber-500' : 'text-emerald-500'
          }`}>
            Target: {userProfile.dailyCalorieTarget} kcal
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Avg Protein</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {avgPeriodProtein} <span className="text-xs font-normal text-slate-400">g/day</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Goal: {userProfile.dailyProteinTarget}g
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Avg Carbohydrates</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {avgPeriodCarbs} <span className="text-xs font-normal text-slate-400">g/day</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Goal: {userProfile.dailyCarbsTarget}g
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Avg Total Fat</div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {avgPeriodFat} <span className="text-xs font-normal text-slate-400">g/day</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Goal: {userProfile.dailyFatTarget}g
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Avg Dietary Fiber</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {avgPeriodFiber} <span className="text-xs font-normal text-slate-400">g/day</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Target: {userProfile.dailyFiberTarget}g
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Logged Days</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {recordedDaysCount} <span className="text-xs font-normal text-slate-400">/ {totalDaysInRange}</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            {Math.round((recordedDaysCount / totalDaysInRange) * 100)}% Consistency
          </div>
        </div>
      </div>

      {/* Main Interactive Daily Calorie Intake Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Daily Recorded Calorie Intake</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive daily intake bars compared to your daily goal of {userProfile.dailyCalorieTarget} kcal. Click any day to inspect.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400">On Target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-500" />
              <span className="text-slate-600 dark:text-slate-400">Under Target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500" />
              <span className="text-slate-600 dark:text-slate-400">Surplus</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t border-dashed border-rose-500" />
              <span className="text-slate-600 dark:text-slate-400">Target Line</span>
            </div>
          </div>
        </div>

        {/* SVG Calorie Chart with Target Reference Line */}
        <div className="relative pt-6 pb-2">
          {/* Target Line calculation */}
          {(() => {
            const targetY = Math.round((1 - userProfile.dailyCalorieTarget / maxCalorieValue) * 180);
            return (
              <div
                className="absolute left-0 right-0 border-t-2 border-dashed border-rose-400 dark:border-rose-500 pointer-events-none z-10 flex justify-end pr-2"
                style={{ top: `${Math.max(10, Math.min(190, targetY + 24))}px` }}
              >
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-white/90 dark:bg-slate-900/90 px-1.5 rounded-sm">
                  Goal: {userProfile.dailyCalorieTarget} kcal
                </span>
              </div>
            );
          })()}

          {/* Bar Chart Grid */}
          <div className="flex items-end gap-2 sm:gap-3 h-52 w-full overflow-x-auto pb-4 pt-6 px-2 border-b border-slate-200 dark:border-slate-800">
            {periodLogs.map((log) => {
              const dayCalories = log.entries.reduce((sum, e) => sum + e.calories, 0);
              const heightPct = Math.min(100, Math.max(dayCalories > 0 ? 8 : 2, Math.round((dayCalories / maxCalorieValue) * 100)));
              const isSelected = log.date === hoveredOrSelectedDate;
              const isUnder = dayCalories > 0 && dayCalories < userProfile.dailyCalorieTarget * 0.9;
              const isOver = dayCalories > userProfile.dailyCalorieTarget * 1.05;
              const isJustRight = dayCalories > 0 && !isUnder && !isOver;

              const barColor = isJustRight
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : isOver
                ? 'bg-amber-500 hover:bg-amber-600'
                : dayCalories > 0
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-slate-200 dark:bg-slate-800';

              const shortDate = log.date.split('-').slice(1).join('/');

              return (
                <div
                  key={log.date}
                  onClick={() => {
                    setHoveredOrSelectedDate(log.date);
                    setSelectedDate(log.date);
                  }}
                  className="flex-1 min-w-[28px] sm:min-w-[36px] flex flex-col items-center cursor-pointer group"
                >
                  {/* Calorie tooltip label on hover/select */}
                  <div className={`text-[10px] font-bold mb-1 transition-opacity ${
                    isSelected ? 'opacity-100 text-slate-900 dark:text-white' : 'opacity-0 group-hover:opacity-100 text-slate-500'
                  }`}>
                    {dayCalories > 0 ? `${dayCalories}` : '0'}
                  </div>

                  {/* Bar */}
                  <div className="w-full h-40 flex items-end justify-center">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[32px] rounded-t-lg transition-all ${barColor} ${
                        isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 shadow-md' : ''
                      }`}
                    />
                  </div>

                  {/* Date label */}
                  <div className={`text-[11px] mt-2 font-medium transition-colors ${
                    isSelected ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {shortDate}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector Panel */}
        {activeChartLog && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Selected Day: {formatDisplayDate(activeChartLog.date)}</span>
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {activeChartCalories > 0 ? (
                  <>
                    {activeChartCalories} kcal recorded{' '}
                    <span className="text-xs font-normal text-slate-500">
                      ({activeChartCalories >= userProfile.dailyCalorieTarget ? '+' : ''}
                      {activeChartCalories - userProfile.dailyCalorieTarget} kcal vs target)
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 italic font-normal">
                    No food entries recorded on this date
                  </span>
                )}
              </div>
            </div>

            {activeChartCalories > 0 && (
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-900">
                  Protein: {activeChartProtein}g
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-900">
                  Carbs: {activeChartCarbs}g
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-900">
                  Fat: {activeChartFat}g
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-900">
                  Fiber: {activeChartFiber}g
                </span>
                <button
                  onClick={() => {
                    setSelectedDate(activeChartLog.date);
                    setActiveTab('diary');
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium"
                >
                  Open in Diary
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Row 2: Macro Distribution Split & Meal Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Period Macro Split Donut */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Period Macronutrient Energy Split
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Caloric contribution across all recorded days in {timeRange === '7d' ? 'last 7 days' : timeRange === '30d' ? 'last 30 days' : 'custom range'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            {/* Donut SVG */}
            <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={donutRadius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="14"
                  className="text-slate-100 dark:text-slate-800"
                />
                {/* Protein Segment */}
                <circle
                  cx="70"
                  cy="70"
                  r={donutRadius}
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="14"
                  strokeDasharray={`${pStroke} ${donutCircumference - pStroke}`}
                  strokeDashoffset={0}
                  className="transition-all duration-500"
                />
                {/* Carbs Segment */}
                <circle
                  cx="70"
                  cy="70"
                  r={donutRadius}
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="14"
                  strokeDasharray={`${cStroke} ${donutCircumference - cStroke}`}
                  strokeDashoffset={-pStroke}
                  className="transition-all duration-500"
                />
                {/* Fat Segment */}
                <circle
                  cx="70"
                  cy="70"
                  r={donutRadius}
                  fill="transparent"
                  stroke="#f43f5e"
                  strokeWidth="14"
                  strokeDasharray={`${fStroke} ${donutCircumference - fStroke}`}
                  strokeDashoffset={-(pStroke + cStroke)}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {avgPeriodCalories}
                </span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Avg kcal
                </span>
              </div>
            </div>

            {/* Macro Legend Table */}
            <div className="space-y-3 w-full sm:w-auto">
              <div className="flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Protein</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white">{proteinRatioPct}%</span>
                  <span className="text-slate-400 text-[11px] ml-1.5">({avgPeriodProtein}g)</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Carbohydrates</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white">{carbsRatioPct}%</span>
                  <span className="text-slate-400 text-[11px] ml-1.5">({avgPeriodCarbs}g)</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Healthy Fats</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white">{fatRatioPct}%</span>
                  <span className="text-slate-400 text-[11px] ml-1.5">({avgPeriodFat}g)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meal Category Calorie Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Intake by Meal Category
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Where your daily calories are consumed on average
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {[
              { label: 'Breakfast', key: 'breakfast', color: 'bg-amber-500' },
              { label: 'Lunch', key: 'lunch', color: 'bg-emerald-500' },
              { label: 'Dinner', key: 'dinner', color: 'bg-blue-500' },
              { label: 'Snacks', key: 'snacks', color: 'bg-purple-500' },
            ].map(({ label, key, color }) => {
              const kcal = mealCategoryCalories[key] || 0;
              const pct = Math.round((kcal / totalMealCategoryCalories) * 100);
              const avgDayKcal = recordedDaysCount > 0 ? Math.round(kcal / recordedDaysCount) : 0;

              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {label}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {pct}% • ~{avgDayKcal} kcal/day
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full ${color} transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Day-to-Day Comparison Tool (FEATURE 1: Requirement 6) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Comparative Intake Analysis</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Day-to-Day Comparison Tool
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select two dates to compare their exact nutritional intake, macronutrient variances, and meal patterns side-by-side.
            </p>
          </div>

          {/* Date Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Day A:</span>
              <select
                value={compareDayA}
                onChange={(e) => setCompareDayA(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {dailyLogs.map((l) => (
                  <option key={`a-${l.date}`} value={l.date}>
                    {l.date} ({l.entries.length} items)
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs font-bold text-slate-400">vs</span>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Day B:</span>
              <select
                value={compareDayB}
                onChange={(e) => setCompareDayB(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {dailyLogs.map((l) => (
                  <option key={`b-${l.date}`} value={l.date}>
                    {l.date} ({l.entries.length} items)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Metric</th>
                <th className="px-4 py-3">Day A ({compareDayA})</th>
                <th className="px-4 py-3">Day B ({compareDayB})</th>
                <th className="px-4 py-3 text-right">Variance (A vs B)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Total Calories</td>
                <td className="px-4 py-2.5 font-bold">{statsA.calories} kcal</td>
                <td className="px-4 py-2.5 font-bold">{statsB.calories} kcal</td>
                <td className="px-4 py-2.5 text-right font-bold">
                  {statsA.calories - statsB.calories > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400">+{statsA.calories - statsB.calories} kcal</span>
                  ) : statsA.calories - statsB.calories < 0 ? (
                    <span className="text-blue-600 dark:text-blue-400">{statsA.calories - statsB.calories} kcal</span>
                  ) : (
                    <span className="text-slate-400">Equal</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Protein</td>
                <td className="px-4 py-2.5 text-blue-600 dark:text-blue-400 font-semibold">{statsA.protein}g</td>
                <td className="px-4 py-2.5 text-blue-600 dark:text-blue-400 font-semibold">{statsB.protein}g</td>
                <td className="px-4 py-2.5 text-right font-semibold">
                  {Math.round((statsA.protein - statsB.protein) * 10) / 10 >= 0 ? '+' : ''}
                  {Math.round((statsA.protein - statsB.protein) * 10) / 10}g
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Carbohydrates</td>
                <td className="px-4 py-2.5 text-amber-600 dark:text-amber-400 font-semibold">{statsA.carbs}g</td>
                <td className="px-4 py-2.5 text-amber-600 dark:text-amber-400 font-semibold">{statsB.carbs}g</td>
                <td className="px-4 py-2.5 text-right font-semibold">
                  {Math.round((statsA.carbs - statsB.carbs) * 10) / 10 >= 0 ? '+' : ''}
                  {Math.round((statsA.carbs - statsB.carbs) * 10) / 10}g
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Total Fat</td>
                <td className="px-4 py-2.5 text-rose-600 dark:text-rose-400 font-semibold">{statsA.fat}g</td>
                <td className="px-4 py-2.5 text-rose-600 dark:text-rose-400 font-semibold">{statsB.fat}g</td>
                <td className="px-4 py-2.5 text-right font-semibold">
                  {Math.round((statsA.fat - statsB.fat) * 10) / 10 >= 0 ? '+' : ''}
                  {Math.round((statsA.fat - statsB.fat) * 10) / 10}g
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Fiber</td>
                <td className="px-4 py-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">{statsA.fiber}g</td>
                <td className="px-4 py-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">{statsB.fiber}g</td>
                <td className="px-4 py-2.5 text-right font-semibold">
                  {Math.round((statsA.fiber - statsB.fiber) * 10) / 10 >= 0 ? '+' : ''}
                  {Math.round((statsA.fiber - statsB.fiber) * 10) / 10}g
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Hydration</td>
                <td className="px-4 py-2.5">{statsA.waterGlasses} glasses ({statsA.waterGlasses * 250}ml)</td>
                <td className="px-4 py-2.5">{statsB.waterGlasses} glasses ({statsB.waterGlasses * 250}ml)</td>
                <td className="px-4 py-2.5 text-right">
                  {statsA.waterGlasses - statsB.waterGlasses >= 0 ? '+' : ''}
                  {statsA.waterGlasses - statsB.waterGlasses} glasses
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Food Consumption Trends & Evidence Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Frequently Consumed Foods */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Apple className="w-4 h-4 text-emerald-500" />
                <span>Most Consumed Foods in Period</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pillars of your dietary pattern based on logged meals
              </p>
            </div>
          </div>

          {topConsumedFoods.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No food items recorded in this time range.</p>
          ) : (
            <div className="space-y-3">
              {topConsumedFoods.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.count} {item.count === 1 ? 'time' : 'times'}
                    </span>
                    <span className="text-slate-400 text-[11px] block">
                      {item.totalCalories} total kcal
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data-Grounded Nutritionist Evaluation */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Nutritionist Period Highlights</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Objective evaluation derived directly from your diary entries
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Protein Compliance</span>
                You averaged <strong className="underline">{avgPeriodProtein}g</strong> of daily protein vs your target of <strong>{userProfile.dailyProteinTarget}g</strong>.
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 flex items-start gap-3">
              <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Hydration Regularity</span>
                Recorded average of <strong>{avgPeriodWater} glasses</strong> ({Math.round(avgPeriodWater * 250)} ml) per day. Aim for 8 glasses daily for optimal metabolism.
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-start gap-3">
              <Info className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Dietary Fiber Average</span>
                Recorded average of <strong>{avgPeriodFiber}g</strong> of fiber daily. The clinical recommendation is 28–35g for cardiovascular and gut microbiome health.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
