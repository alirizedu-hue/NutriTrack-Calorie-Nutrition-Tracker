import React, { useState, useMemo } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { FoodCategory, FoodItem } from '../types/nutrition';
import {
  Search,
  Plus,
  Apple,
  Filter,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  ChevronRight
} from 'lucide-react';

export const FoodDatabaseView: React.FC = () => {
  const { foods, setIsLogModalOpen, setTargetMealForModal, addCustomFood } = useNutrition();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showOnlyCustom, setShowOnlyCustom] = useState(false);

  // New custom food modal within database view
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Proteins');
  const [servingSize, setServingSize] = useState<number>(100);
  const [servingUnit, setServingUnit] = useState<string>('g');
  const [calories, setCalories] = useState<number>(150);
  const [protein, setProtein] = useState<number>(10);
  const [carbs, setCarbs] = useState<number>(15);
  const [fat, setFat] = useState<number>(5);
  const [fiber, setFiber] = useState<number>(2);

  const categories = [
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
    return foods.filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || f.category === selectedCategory;
      const matchesCustom = !showOnlyCustom || f.isCustom;
      return matchesSearch && matchesCategory && matchesCustom;
    });
  }, [foods, search, selectedCategory, showOnlyCustom]);

  const handleOpenLogModal = () => {
    setTargetMealForModal(null);
    setIsLogModalOpen(true);
  };

  const handleCreateFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCustomFood({
      name: name.trim(),
      category,
      servingSize: Number(servingSize) || 100,
      servingUnit: servingUnit.trim() || 'g',
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
    });

    setName('');
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Food & Nutrition Database
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse our standard database of verified whole foods or register your own custom recipes and groceries
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Food</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search eggs, chicken, oats, salmon, broccoli, yogurt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showOnlyCustom}
              onChange={(e) => setShowOnlyCustom(e.target.checked)}
              className="rounded-sm text-emerald-600 focus:ring-emerald-500"
            />
            <span>Custom Only</span>
          </label>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Foods Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFoods.map((food) => (
          <div
            key={food.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {food.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {food.category} · {food.servingSize} {food.servingUnit}
                  </div>
                </div>

                {food.isCustom && (
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md shrink-0">
                    Custom
                  </span>
                )}
              </div>

              {/* Energy Badge */}
              <div className="mt-3 flex items-baseline gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="text-2xl font-extrabold font-mono tabular-nums">
                  {food.calories}
                </span>
                <span className="text-xs font-semibold text-slate-400">kcal / serving</span>
              </div>

              {/* Macronutrient mini tags */}
              <div className="mt-3 grid grid-cols-4 gap-1.5 text-center text-[11px] font-mono">
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 font-sans">Prot</div>
                  <div className="font-bold text-slate-900 dark:text-white">{food.protein}g</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 font-sans">Carb</div>
                  <div className="font-bold text-slate-900 dark:text-white">{food.carbs}g</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 font-sans">Fat</div>
                  <div className="font-bold text-slate-900 dark:text-white">{food.fat}g</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 font-sans">Fiber</div>
                  <div className="font-bold text-slate-900 dark:text-white">{food.fiber}g</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenLogModal}
              className="mt-4 w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log to Diary</span>
            </button>
          </div>
        ))}

        {filteredFoods.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <Apple className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No foods match your criteria
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search query or create a custom item using the button above.
            </p>
          </div>
        )}
      </div>

      {/* Create Custom Food Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Custom Food Item
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Save a custom food or recipe to your local database
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateFood} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Food Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Avocado Toast with Poached Egg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FoodCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
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
                    value={servingSize}
                    onChange={(e) => setServingSize(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Serving Unit
                  </label>
                  <input
                    type="text"
                    value={servingUnit}
                    onChange={(e) => setServingUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
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
                    value={protein}
                    onChange={(e) => setProtein(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
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
                    value={carbs}
                    onChange={(e) => setCarbs(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
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
                    value={fat}
                    onChange={(e) => setFat(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
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
                    value={fiber}
                    onChange={(e) => setFiber(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
