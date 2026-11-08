import React, { useState, useMemo } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { FoodItem, MealCategory, FoodCategory } from '../types/nutrition';
import {
  X,
  Search,
  Plus,
  Flame,
  Check,
  Utensils,
  Sparkles,
  Info,
  Camera
} from 'lucide-react';

export const LogFoodModal: React.FC = () => {
  const {
    isLogModalOpen,
    setIsLogModalOpen,
    targetMealForModal,
    foods,
    addFoodLogEntry,
    addCustomFood,
    setActiveTab,
  } = useNutrition();

  const [activeSubTab, setActiveSubTab] = useState<'search' | 'custom'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState<number>(1);
  const [mealType, setMealType] = useState<MealCategory>(targetMealForModal || 'breakfast');

  // Sync meal type if targetMealForModal changes when opening
  React.useEffect(() => {
    if (targetMealForModal) {
      setMealType(targetMealForModal);
    }
  }, [targetMealForModal]);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isLogModalOpen) {
      if (!selectedFood && foods.length > 0) {
        setSelectedFood(foods[0]);
      }
      setServings(1);
    }
  }, [isLogModalOpen, foods]);

  // Custom Food Form State
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<FoodCategory>('Proteins');
  const [customServingSize, setCustomServingSize] = useState<number>(100);
  const [customServingUnit, setCustomServingUnit] = useState<string>('g');
  const [customCalories, setCustomCalories] = useState<number>(150);
  const [customProtein, setCustomProtein] = useState<number>(10);
  const [customCarbs, setCustomCarbs] = useState<number>(15);
  const [customFat, setCustomFat] = useState<number>(5);
  const [customFiber, setCustomFiber] = useState<number>(2);

  const categories: (string | 'All')[] = [
    'All',
    'Proteins',
    'Grains',
    'Vegetables',
    'Fruits',
    'Dairy',
    'Snacks',
    'Prepared',
    'Beverages',
  ];

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesSearch =
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || food.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [foods, searchQuery, selectedCategory]);

  if (!isLogModalOpen) return null;

  const handleClose = () => {
    setIsLogModalOpen(false);
    setSearchQuery('');
    setActiveSubTab('search');
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) return;

    addFoodLogEntry({
      foodId: selectedFood.id,
      mealType,
      servings: Number(servings) || 1,
    });

    handleClose();
  };

  const handleCreateAndLogCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newFood = addCustomFood({
      name: customName.trim(),
      category: customCategory,
      servingSize: Number(customServingSize) || 100,
      servingUnit: customServingUnit.trim() || 'g',
      calories: Number(customCalories) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
      fiber: Number(customFiber) || 0,
    });

    addFoodLogEntry({
      foodId: newFood.id,
      mealType,
      servings: Number(servings) || 1,
    });

    // Reset custom fields
    setCustomName('');
    handleClose();
  };

  const previewCalories = selectedFood ? Math.round(selectedFood.calories * (Number(servings) || 1)) : 0;
  const previewProtein = selectedFood ? Math.round(selectedFood.protein * (Number(servings) || 1) * 10) / 10 : 0;
  const previewCarbs = selectedFood ? Math.round(selectedFood.carbs * (Number(servings) || 1) * 10) / 10 : 0;
  const previewFat = selectedFood ? Math.round(selectedFood.fat * (Number(servings) || 1) * 10) / 10 : 0;
  const previewFiber = selectedFood ? Math.round(selectedFood.fiber * (Number(servings) || 1) * 10) / 10 : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Log Food Entry
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select or create whole nutritious foods for your daily food diary.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Search Database vs Custom Food */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveSubTab('search')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeSubTab === 'search'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search Foods ({foods.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('custom')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeSubTab === 'custom'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Food</span>
          </button>

          <div className="ml-auto pb-2 flex items-center">
            <button
              type="button"
              onClick={() => {
                handleClose();
                setActiveTab('scanner');
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Meal with AI</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Meal Category Selector (Always visible) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Meal Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealCategory[]).map(
                (meal) => {
                  const isSelected = mealType === meal;
                  return (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => setMealType(meal)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      {meal}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {activeSubTab === 'search' ? (
            <>
              {/* Search & Category Filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search chicken, apple, rice, oatmeal, tofu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500"
                  />
                </div>

                {/* Categories */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food List Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Pick a Food Item ({filteredFoods.length} available)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                  {filteredFoods.map((food) => {
                    const isSelected = selectedFood?.id === food.id;
                    return (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => setSelectedFood(food)}
                        className={`p-3 rounded-lg text-left transition-all flex items-start justify-between gap-2 border ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-slate-900 dark:text-white'
                            : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">
                            {food.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {food.servingSize} {food.servingUnit} ·{' '}
                            <span className="font-mono">{food.calories} kcal</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex gap-2 font-mono">
                            <span>P: {food.protein}g</span>
                            <span>C: {food.carbs}g</span>
                            <span>F: {food.fat}g</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {filteredFoods.length === 0 && (
                    <div className="col-span-2 text-center py-6 text-xs text-slate-500 dark:text-slate-400">
                      No foods found matching "{searchQuery}". You can create it in the "Create Custom Food" tab!
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity & Serving Size Calculator */}
              {selectedFood && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Serving Quantity for {selectedFood.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Base serving: {selectedFood.servingSize} {selectedFood.servingUnit}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        Servings:
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={servings}
                        onChange={(e) => setServings(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                        className="w-20 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-center text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Dynamic nutritional preview */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 grid grid-cols-5 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-500 font-medium">Calories</div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                        {previewCalories}
                      </div>
                      <div className="text-[10px] text-slate-400">kcal</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-500 font-medium">Protein</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                        {previewProtein}g
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-500 font-medium">Carbs</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                        {previewCarbs}g
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-500 font-medium">Fat</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                        {previewFat}g
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-500 font-medium">Fiber</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                        {previewFiber}g
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Custom Food Creation Form */
            <form onSubmit={handleCreateAndLogCustom} className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Custom foods are saved to your local database and will be available for all future food logs.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Food Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Homemade Lentil Soup, Chia Seed Pudding"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as FoodCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Proteins">Proteins</option>
                    <option value="Grains">Grains</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Prepared">Prepared Meal</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Serving Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customServingSize}
                    onChange={(e) => setCustomServingSize(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Serving Unit
                  </label>
                  <input
                    type="text"
                    placeholder="g, cup, slice, bowl"
                    value={customServingUnit}
                    onChange={(e) => setCustomServingUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Nutrients per serving */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Calories (kcal) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={customFat}
                    onChange={(e) => setCustomFat(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fiber (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={customFiber}
                    onChange={(e) => setCustomFiber(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>

          {activeSubTab === 'search' ? (
            <button
              type="button"
              onClick={handleAddLog}
              disabled={!selectedFood}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreateAndLogCustom}
              disabled={!customName.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save & Log Custom Food</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
