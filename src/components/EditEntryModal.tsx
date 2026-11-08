import React, { useState, useEffect } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { MealCategory } from '../types/nutrition';
import { X, Check, Trash2, Flame } from 'lucide-react';

export const EditEntryModal: React.FC = () => {
  const { editingEntry, setEditingEntry, updateFoodLogEntry, deleteFoodLogEntry, foods } = useNutrition();

  const [servings, setServings] = useState<number>(1);
  const [mealType, setMealType] = useState<MealCategory>('breakfast');

  useEffect(() => {
    if (editingEntry) {
      setServings(editingEntry.servings);
      setMealType(editingEntry.mealType);
    }
  }, [editingEntry]);

  if (!editingEntry) return null;

  const foodItem = foods.find((f) => f.id === editingEntry.foodId);

  const baseCalories = foodItem ? foodItem.calories : (editingEntry.calories / (editingEntry.servings || 1));
  const baseProtein = foodItem ? foodItem.protein : (editingEntry.protein / (editingEntry.servings || 1));
  const baseCarbs = foodItem ? foodItem.carbs : (editingEntry.carbs / (editingEntry.servings || 1));
  const baseFat = foodItem ? foodItem.fat : (editingEntry.fat / (editingEntry.servings || 1));
  const baseFiber = foodItem ? foodItem.fiber : (editingEntry.fiber / (editingEntry.servings || 1));

  const previewCalories = Math.round(baseCalories * servings);
  const previewProtein = Math.round(baseProtein * servings * 10) / 10;
  const previewCarbs = Math.round(baseCarbs * servings * 10) / 10;
  const previewFat = Math.round(baseFat * servings * 10) / 10;
  const previewFiber = Math.round(baseFiber * servings * 10) / 10;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateFoodLogEntry(editingEntry.id, {
      servings,
      mealType,
    });
    setEditingEntry(null);
  };

  const handleDelete = () => {
    deleteFoodLogEntry(editingEntry.id);
    setEditingEntry(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Edit Logged Item
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {editingEntry.foodName}
            </p>
          </div>
          <button
            onClick={() => setEditingEntry(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Meal Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Meal Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealCategory[]).map((meal) => (
                <button
                  key={meal}
                  type="button"
                  onClick={() => setMealType(meal)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
                    mealType === meal
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>

          {/* Servings Stepper */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Number of Servings ({editingEntry.servingSize} {editingEntry.servingUnit} base)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={servings}
                onChange={(e) => setServings(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                className="w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-base font-bold text-center text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-slate-500">
                = {Math.round(editingEntry.servingSize * servings)} {editingEntry.servingUnit} total
              </span>
            </div>
          </div>

          {/* Updated Preview */}
          <div className="grid grid-cols-5 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 text-center">
            <div>
              <div className="text-[10px] text-slate-500">Calories</div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {previewCalories}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Protein</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                {previewProtein}g
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Carbs</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                {previewCarbs}g
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Fat</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                {previewFat}g
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Fiber</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                {previewFiber}g
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Entry</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-colors shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
