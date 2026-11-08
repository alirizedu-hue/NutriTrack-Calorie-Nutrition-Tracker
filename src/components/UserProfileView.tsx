import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { DietaryPreference, MealCategory } from '../types/nutrition';
import {
  User,
  Mail,
  ShieldCheck,
  Target,
  RefreshCw,
  Download,
  Upload,
  Check,
  Heart,
  Droplets,
  Flame,
  Activity,
  Plus,
  X,
  Sparkles,
  Camera,
  Sliders,
  CheckCircle2,
  LogOut,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PRESET_AVATARS = [
  { label: 'Nutritionist', url: '/src/assets/images/nutritrack_user_avatar_1793989036331.jpg' },
  { label: 'Fresh Bowl', url: '/src/assets/images/nutritrack_hero_bowl_1793989036042.jpg' },
  { label: 'Morning Eggs', url: '/src/assets/images/breakfast_eggs_toast_1793991768672.jpg' },
  { label: 'Protein Plate', url: '/src/assets/images/rice_chicken_plate_1793991751623.jpg' },
];

const STANDARD_RESTRICTIONS = [
  'Low Sodium',
  'Whole Foods',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Shellfish-Free',
  'Soy-Free',
  'Egg-Free',
  'Halal',
  'Kosher',
  'Low Sugar',
];

export const UserProfileView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    resetToDefaults,
    exportData,
    importData,
    addToast,
    signOutAndClear,
  } = useNutrition();
  const { user } = useAuth();

  const [name, setName] = useState(userProfile.name);
  const [title, setTitle] = useState(userProfile.title);
  const [email, setEmail] = useState(userProfile.email);
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl);
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(userProfile.dietaryPreference);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(
    userProfile.dietaryRestrictions || ['Low Sodium', 'Whole Foods']
  );
  const [newRestrictionInput, setNewRestrictionInput] = useState('');
  const [preferredMeals, setPreferredMeals] = useState<MealCategory[]>(
    userProfile.preferredMeals || ['breakfast', 'lunch', 'dinner', 'snacks']
  );

  const [calorieTarget, setCalorieTarget] = useState(userProfile.dailyCalorieTarget);
  const [waterTarget, setWaterTarget] = useState(userProfile.dailyWaterTargetGlasses);
  const [proteinTarget, setProteinTarget] = useState(userProfile.dailyProteinTarget);
  const [carbsTarget, setCarbsTarget] = useState(userProfile.dailyCarbsTarget);
  const [fatTarget, setFatTarget] = useState(userProfile.dailyFatTarget);
  const [fiberTarget, setFiberTarget] = useState(userProfile.dailyFiberTarget);
  const [measurementSystem, setMeasurementSystem] = useState(userProfile.measurementSystem);

  const [importJsonText, setImportJsonText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [isCustomAvatarOpen, setIsCustomAvatarOpen] = useState(false);

  React.useEffect(() => {
    setName(userProfile.name);
    setTitle(userProfile.title);
    setEmail(userProfile.email);
    setAvatarUrl(userProfile.avatarUrl);
    setDietaryPreference(userProfile.dietaryPreference);
    setDietaryRestrictions(userProfile.dietaryRestrictions || ['Whole Foods']);
    setPreferredMeals(userProfile.preferredMeals || ['breakfast', 'lunch', 'dinner', 'snacks']);
    setCalorieTarget(userProfile.dailyCalorieTarget);
    setWaterTarget(userProfile.dailyWaterTargetGlasses);
    setProteinTarget(userProfile.dailyProteinTarget);
    setCarbsTarget(userProfile.dailyCarbsTarget);
    setFatTarget(userProfile.dailyFatTarget);
    setFiberTarget(userProfile.dailyFiberTarget);
    setMeasurementSystem(userProfile.measurementSystem);
  }, [userProfile]);

  // Toggle restriction tag
  const handleToggleRestriction = (tag: string) => {
    setDietaryRestrictions((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomRestriction = () => {
    const trimmed = newRestrictionInput.trim();
    if (!trimmed) return;
    if (!dietaryRestrictions.includes(trimmed)) {
      setDietaryRestrictions((prev) => [...prev, trimmed]);
    }
    setNewRestrictionInput('');
  };

  // Toggle preferred meal
  const handleToggleMeal = (meal: MealCategory) => {
    setPreferredMeals((prev) =>
      prev.includes(meal) ? prev.filter((m) => m !== meal) : [...prev, meal]
    );
  };

  // Macro Preset Calculator
  const applyMacroPreset = (preset: 'balanced' | 'high-protein' | 'low-carb' | 'mediterranean') => {
    const totalCal = Number(calorieTarget) || 2000;
    if (preset === 'balanced') {
      // 45% Carbs, 25% Protein, 30% Fat
      setCarbsTarget(Math.round((totalCal * 0.45) / 4));
      setProteinTarget(Math.round((totalCal * 0.25) / 4));
      setFatTarget(Math.round((totalCal * 0.30) / 9));
      setFiberTarget(30);
      setDietaryPreference('Balanced');
    } else if (preset === 'high-protein') {
      // 35% Carbs, 40% Protein, 25% Fat
      setCarbsTarget(Math.round((totalCal * 0.35) / 4));
      setProteinTarget(Math.round((totalCal * 0.40) / 4));
      setFatTarget(Math.round((totalCal * 0.25) / 9));
      setFiberTarget(32);
      setDietaryPreference('High Protein');
    } else if (preset === 'low-carb') {
      // 15% Carbs, 40% Protein, 45% Fat
      setCarbsTarget(Math.round((totalCal * 0.15) / 4));
      setProteinTarget(Math.round((totalCal * 0.40) / 4));
      setFatTarget(Math.round((totalCal * 0.45) / 9));
      setFiberTarget(28);
      setDietaryPreference('Low Carb');
    } else if (preset === 'mediterranean') {
      // 50% Carbs, 25% Protein, 25% Fat
      setCarbsTarget(Math.round((totalCal * 0.50) / 4));
      setProteinTarget(Math.round((totalCal * 0.25) / 4));
      setFatTarget(Math.round((totalCal * 0.25) / 9));
      setFiberTarget(35);
      setDietaryPreference('Mediterranean');
    }
    addToast('Macro Preset Applied', `Calculated targets for ${preset.toUpperCase()} macro split.`, 'info');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim() || 'User',
      title: title.trim(),
      email: email.trim(),
      avatarUrl,
      dietaryPreference,
      dietaryRestrictions,
      preferredMeals,
      dailyCalorieTarget: Math.max(800, Number(calorieTarget) || 2000),
      dailyWaterTargetGlasses: Math.max(1, Number(waterTarget) || 8),
      dailyProteinTarget: Math.max(10, Number(proteinTarget) || 100),
      dailyCarbsTarget: Math.max(10, Number(carbsTarget) || 220),
      dailyFatTarget: Math.max(10, Number(fatTarget) || 65),
      dailyFiberTarget: Math.max(5, Number(fiberTarget) || 30),
      measurementSystem,
    });
  };

  const handleExport = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutritrack_diary_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Backup Exported', 'NutriTrack diary JSON downloaded to your device.', 'success');
  };

  const handleImportSubmit = async () => {
    if (!importJsonText.trim()) return;
    const success = await importData(importJsonText);
    if (success) {
      setShowImportBox(false);
      setImportJsonText('');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          User Profile & Nutritional Guidelines
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize your name, avatar, dietary preferences, restrictions, and macro targets for NutriTrack 2.0.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Identity Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group shrink-0">
              <img
                src={avatarUrl}
                alt={name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setIsCustomAvatarOpen(!isCustomAvatarOpen)}
                className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-slate-900 text-white shadow-xs hover:bg-emerald-600 transition-colors"
                title="Change Avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {name || 'NutriTrack Member'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {title || 'Health & Wellness Enthusiast'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Google Account Verified</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Private Firestore Storage</span>
                </div>
              </div>
            </div>

            {/* Quick Sign Out Action */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={signOutAndClear}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Connected Google Account Details */}
          {user && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Account: {user.email}</span>
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100/70 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                  Active Session
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span><strong>User UID:</strong> <code className="font-mono text-[10px] bg-slate-200/70 dark:bg-slate-700 px-1 py-0.5 rounded">{user.uid}</code></span>
                <span><strong>Database:</strong> Isolated Firestore collection <code className="font-mono text-[10px] bg-slate-200/70 dark:bg-slate-700 px-1 py-0.5 rounded">users/{user.uid}</code></span>
              </div>
            </div>
          )}

          {/* Preset Avatar Selector */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Profile Avatar
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {PRESET_AVATARS.map((av, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setAvatarUrl(av.url)}
                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition-all ${
                    avatarUrl === av.url
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <img
                    src={av.url}
                    alt={av.label}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <span className="text-xs font-medium">{av.label}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCustomAvatarOpen(!isCustomAvatarOpen)}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold ml-2"
              >
                {isCustomAvatarOpen ? 'Close Custom URL' : 'Use Custom Image URL'}
              </button>
            </div>

            {isCustomAvatarOpen && (
              <div className="pt-2">
                <input
                  type="url"
                  placeholder="Paste direct image URL (https://...)"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* User Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Professional Title or Health Goal
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Marathon Runner / Health Advocate"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Dietary Preference
              </label>
              <select
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value as DietaryPreference)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Balanced">Balanced Whole Foods</option>
                <option value="High Protein">High Protein / Athletic</option>
                <option value="Mediterranean">Mediterranean Heart-Healthy</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Plant-Based">Plant-Based / Vegan</option>
                <option value="Low Carb">Low Carb / Mindful Glycemic</option>
                <option value="Keto">Ketogenic High-Fat</option>
                <option value="Vegan">Strict Vegan</option>
              </select>
            </div>
          </div>

          {/* Dietary Restrictions & Allergies (Multi-Select Tags) */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Dietary Restrictions & Allergies
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                The AI Nutrition Assistant will strictly respect these when recommending meals.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {STANDARD_RESTRICTIONS.map((restriction) => {
                const isActive = dietaryRestrictions.includes(restriction);
                return (
                  <button
                    type="button"
                    key={restriction}
                    onClick={() => handleToggleRestriction(restriction)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isActive ? `✓ ${restriction}` : `+ ${restriction}`}
                  </button>
                );
              })}
            </div>

            {/* Custom restriction input */}
            <div className="flex items-center gap-2 pt-1 max-w-sm">
              <input
                type="text"
                placeholder="Add custom restriction..."
                value={newRestrictionInput}
                onChange={(e) => setNewRestrictionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomRestriction();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddCustomRestriction}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white"
              >
                Add
              </button>
            </div>
          </div>

          {/* Preferred Meal Categories */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Preferred Meal Categories
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealCategory[]).map((meal) => {
                const isSelected = preferredMeals.includes(meal);
                return (
                  <button
                    type="button"
                    key={meal}
                    onClick={() => handleToggleMeal(meal)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{meal}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Nutritional Guidelines Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" />
                <span>Daily Nutritional Reference Targets</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set custom goals or auto-calculate using dietary split presets.
              </p>
            </div>

            {/* Macro Split Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Presets:</span>
              <button
                type="button"
                onClick={() => applyMacroPreset('balanced')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300"
              >
                Balanced
              </button>
              <button
                type="button"
                onClick={() => applyMacroPreset('high-protein')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300"
              >
                High Protein
              </button>
              <button
                type="button"
                onClick={() => applyMacroPreset('low-carb')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-slate-700 dark:text-slate-300"
              >
                Low Carb
              </button>
              <button
                type="button"
                onClick={() => applyMacroPreset('mediterranean')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-300"
              >
                Mediterranean
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                min="800"
                max="6000"
                step="50"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Water (Glasses)
              </label>
              <input
                type="number"
                min="2"
                max="24"
                value={waterTarget}
                onChange={(e) => setWaterTarget(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                min="20"
                max="400"
                value={proteinTarget}
                onChange={(e) => setProteinTarget(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                min="10"
                max="600"
                value={carbsTarget}
                onChange={(e) => setCarbsTarget(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Fats (g)
              </label>
              <input
                type="number"
                min="10"
                max="250"
                value={fatTarget}
                onChange={(e) => setFatTarget(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Fiber (g)
              </label>
              <input
                type="number"
                min="10"
                max="80"
                value={fiberTarget}
                onChange={(e) => setFiberTarget(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Profile & Targets</span>
            </button>
          </div>
        </div>
      </form>

      {/* Backup & Demonstration Tools */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Data Persistence & NutriTrack 2.0 Backup Tools
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your diary records, scanned meals, and custom preferences automatically persist in browser storage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Diary & Scans (JSON)</span>
          </button>

          <button
            onClick={() => setShowImportBox(!showImportBox)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import Diary (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all nutrition logs and custom foods back to initial sample demo data?')) {
                resetToDefaults();
              }
            }}
            className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Sample Data</span>
          </button>
        </div>

        {showImportBox && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Paste Backup JSON Data
            </label>
            <textarea
              rows={4}
              placeholder="Paste exported NutriTrack JSON backup here..."
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportBox(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
              >
                Confirm Import
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
