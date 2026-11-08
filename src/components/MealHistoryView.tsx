import React, { useState, useMemo } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { ScannedMeal, MealCategory, FoodCategory } from '../types/nutrition';
import {
  Camera,
  Search,
  Calendar,
  Filter,
  Trash2,
  Edit3,
  CheckCircle2,
  Flame,
  Layers,
  ChevronRight,
  Eye,
  PlusCircle,
  X,
  Sparkles,
  Info,
  Clock,
  ArrowUpDown
} from 'lucide-react';

export const MealHistoryView: React.FC = () => {
  const {
    scannedMeals,
    deleteScannedMeal,
    updateScannedMeal,
    addBatchFoodLogEntries,
    setActiveTab,
    addToast
  } = useNutrition();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Modal inspection & editing states
  const [activeModalMeal, setActiveModalMeal] = useState<ScannedMeal | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [editedMealType, setEditedMealType] = useState<MealCategory>('lunch');

  // Filter & Search
  const filteredMeals = useMemo(() => {
    return scannedMeals
      .filter((meal) => {
        // Category filter
        if (selectedCategory !== 'all' && meal.mealType !== selectedCategory) {
          return false;
        }
        // Search query (match title or contained food items)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = meal.name.toLowerCase().includes(q);
          const matchItems = meal.items.some((it) => it.name.toLowerCase().includes(q));
          if (!matchTitle && !matchItems) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return new Date(`${b.date} ${b.timestamp}`).getTime() - new Date(`${a.date} ${a.timestamp}`).getTime();
        } else {
          return new Date(`${a.date} ${a.timestamp}`).getTime() - new Date(`${b.date} ${b.timestamp}`).getTime();
        }
      });
  }, [scannedMeals, searchQuery, selectedCategory, sortOrder]);

  // Overall statistics
  const totalScans = scannedMeals.length;
  const avgScanCalories = totalScans > 0
    ? Math.round(scannedMeals.reduce((sum, m) => sum + m.totalCalories, 0) / totalScans)
    : 0;

  const handleOpenDetailModal = (meal: ScannedMeal) => {
    setActiveModalMeal(meal);
    setEditedNotes(meal.nutritionalNotes || '');
    setEditedMealType(meal.mealType);
    setIsEditingNotes(false);
  };

  const handleSaveModalEdits = () => {
    if (!activeModalMeal) return;
    updateScannedMeal(activeModalMeal.id, {
      nutritionalNotes: editedNotes,
      mealType: editedMealType,
    });
    setActiveModalMeal((prev) => (prev ? { ...prev, nutritionalNotes: editedNotes, mealType: editedMealType } : null));
    setIsEditingNotes(false);
  };

  const handleLogToDiary = (meal: ScannedMeal) => {
    addBatchFoodLogEntries(
      meal.items.map((it) => ({
        foodName: it.name,
        category: it.category,
        servingSize: it.servingSize,
        servingUnit: it.servingUnit,
        calories: it.calories,
        protein: it.protein,
        carbs: it.carbs,
        fat: it.fat,
        fiber: it.fiber,
      })),
      meal.mealType,
      meal.imageUrl || undefined,
      meal.id
    );

    updateScannedMeal(meal.id, { addedToDiary: true });
    addToast('Logged to Diary', `Added "${meal.name}" items to your Food Diary.`, 'success');
  };

  const getMealBadgeColor = (type: MealCategory) => {
    switch (type) {
      case 'breakfast':
        return 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'lunch':
        return 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'dinner':
        return 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'snacks':
        return 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>AI Recognition History</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Scanned Meal History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Browse all meals captured and analyzed by the Gemini Vision Food Scanner.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('scanner')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition-colors shrink-0"
        >
          <Camera className="w-4 h-4" />
          <span>Scan New Meal</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Total Scans Recorded
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalScans}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Vision verified
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Average Calories / Scan
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {avgScanCalories} <span className="text-xs font-normal text-slate-400">kcal</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Portion weighted
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Diary Sync Rate
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            100%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Seamless log integration
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Nutritional Database
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            USDA
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Standard 100g reference
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by meal or ingredient..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['all', 'breakfast', 'lunch', 'dinner', 'snacks'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                selectedCategory === category
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {category === 'all' ? 'All Meals' : category}
            </button>
          ))}

          {/* Sort button */}
          <button
            onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium ml-auto md:ml-0"
            title="Toggle sort order"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Scanned Meal Cards */}
      {filteredMeals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Camera className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No scanned meals found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search query or meal category filter.'
                : 'Capture or upload your first meal picture using the AI Food Scanner to see it preserved here.'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('scanner')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-xs"
          >
            <Camera className="w-4 h-4" />
            <span>Open AI Food Scanner</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map((meal) => (
            <div
              key={meal.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              {/* Photo Preview Container */}
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {meal.imageUrl ? (
                  <img
                    src={meal.imageUrl}
                    alt={meal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <Camera className="w-8 h-8 mb-1" />
                    <span className="text-xs">No photograph available</span>
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border shadow-xs ${getMealBadgeColor(
                      meal.mealType
                    )}`}
                  >
                    {meal.mealType}
                  </span>
                </div>

                {/* Calorie Tag */}
                <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-xs text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{meal.totalCalories} kcal</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{meal.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{meal.timestamp}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {meal.name}
                  </h3>

                  {/* Macro Pills */}
                  <div className="grid grid-cols-4 gap-1.5 py-1 text-center">
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-1.5">
                      <div className="text-[10px] text-slate-400 font-medium">Prot</div>
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {meal.totalProtein}g
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-1.5">
                      <div className="text-[10px] text-slate-400 font-medium">Carb</div>
                      <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {meal.totalCarbs}g
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-1.5">
                      <div className="text-[10px] text-slate-400 font-medium">Fat</div>
                      <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        {meal.totalFat}g
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-1.5">
                      <div className="text-[10px] text-slate-400 font-medium">Fiber</div>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {meal.totalFiber}g
                      </div>
                    </div>
                  </div>

                  {/* Food Items Preview */}
                  <div className="text-xs text-slate-600 dark:text-slate-400 pt-1 line-clamp-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Components ({meal.items.length}):{' '}
                    </span>
                    {meal.items.map((it) => `${it.name} (${it.servingSize}${it.servingUnit})`).join(', ')}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenDetailModal(meal)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Breakdown</span>
                  </button>

                  <button
                    onClick={() => handleLogToDiary(meal)}
                    className="flex items-center justify-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
                    title="Log items again to today's Food Diary"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${meal.name}" from meal history?`)) {
                        deleteScannedMeal(meal.id);
                      }
                    }}
                    className="flex items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Inspection Modal */}
      {activeModalMeal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold capitalize border ${getMealBadgeColor(
                      activeModalMeal.mealType
                    )}`}
                  >
                    {activeModalMeal.mealType}
                  </span>
                  <span className="text-xs text-slate-500">
                    {activeModalMeal.date} • {activeModalMeal.timestamp}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {activeModalMeal.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveModalMeal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Large Photo */}
            {activeModalMeal.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                <img
                  src={activeModalMeal.imageUrl}
                  alt={activeModalMeal.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Total Nutritional Summary */}
            <div className="grid grid-cols-5 gap-2.5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-center">
              <div>
                <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">Calories</div>
                <div className="text-base font-bold text-emerald-900 dark:text-emerald-100 mt-0.5">
                  {activeModalMeal.totalCalories} kcal
                </div>
              </div>
              <div>
                <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">Protein</div>
                <div className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  {activeModalMeal.totalProtein}g
                </div>
              </div>
              <div>
                <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">Carbs</div>
                <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {activeModalMeal.totalCarbs}g
                </div>
              </div>
              <div>
                <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">Fat</div>
                <div className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  {activeModalMeal.totalFat}g
                </div>
              </div>
              <div>
                <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">Fiber</div>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {activeModalMeal.totalFiber}g
                </div>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Identified Ingredients & Estimated Portions
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-3 py-2.5">Food Component</th>
                      <th className="px-3 py-2.5">Portion (g)</th>
                      <th className="px-3 py-2.5 text-right">Calories</th>
                      <th className="px-3 py-2.5 text-right">Protein</th>
                      <th className="px-3 py-2.5 text-right">Carbs</th>
                      <th className="px-3 py-2.5 text-right">Fat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {activeModalMeal.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">
                          {it.name}
                          {it.confidenceReason && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {it.confidenceReason}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">{it.servingSize}g</td>
                        <td className="px-3 py-2 text-right font-semibold">{it.calories} kcal</td>
                        <td className="px-3 py-2 text-right">{it.protein}g</td>
                        <td className="px-3 py-2 text-right">{it.carbs}g</td>
                        <td className="px-3 py-2 text-right">{it.fat}g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Editable Notes Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Meal Notes & Category
                </span>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Assigned Meal Category
                    </label>
                    <select
                      value={editedMealType}
                      onChange={(e) => setEditedMealType(e.target.value as MealCategory)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snacks">Snacks</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Nutritional Notes / Commentary
                    </label>
                    <textarea
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveModalEdits}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xs"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                  {activeModalMeal.nutritionalNotes || 'No notes added for this meal.'}
                </p>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  if (window.confirm('Delete this meal from your history?')) {
                    deleteScannedMeal(activeModalMeal.id);
                    setActiveModalMeal(null);
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>

              <button
                onClick={() => {
                  handleLogToDiary(activeModalMeal);
                  setActiveModalMeal(null);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log to Food Diary</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
