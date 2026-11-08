import React from 'react';
import { useNutrition } from '../context/NutritionContext';
import {
  LayoutGrid,
  UtensilsCrossed,
  PieChart,
  CalendarDays,
  Apple,
  User,
  Sparkles,
  Sun,
  Moon,
  Plus,
  Droplets,
  Bot,
  History,
  Camera,
  HeartPulse,
  X,
  LogOut,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    userProfile,
    setIsLogModalOpen,
    setTargetMealForModal,
    signOutAndClear,
  } = useNutrition();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutGrid,
      desc: 'Daily overview & logs',
    },
    {
      id: 'scanner',
      label: 'AI Food Scanner',
      icon: Camera,
      desc: 'Vision meal recognition',
    },
    {
      id: 'assistant',
      label: 'AI Nutrition Assistant',
      icon: Bot,
      desc: 'Smart dietitian chat',
    },
    {
      id: 'meal-history',
      label: 'Meal History',
      icon: History,
      desc: 'Scanned plate records',
    },
    {
      id: 'diary',
      label: 'Food Diary',
      icon: UtensilsCrossed,
      desc: 'Meal by meal breakdown',
    },
    {
      id: 'nutrition',
      label: 'Nutrition Analytics',
      icon: PieChart,
      desc: 'Weekly & period trends',
    },
    {
      id: 'history',
      label: 'Food History',
      icon: CalendarDays,
      desc: 'Daily diary history',
    },
    {
      id: 'database',
      label: 'Food Database',
      icon: Apple,
      desc: 'Search & custom foods',
    },
    {
      id: 'profile',
      label: 'Profile & Goals',
      icon: User,
      desc: 'Nutritional targets',
    },
    {
      id: 'showcase',
      label: 'Project Overview',
      icon: Sparkles,
      desc: 'NutriTrack 2.0 features',
    },
  ] as const;


  const handleNavClick = (id: typeof activeTab) => {
    setActiveTab(id);
    onClose();
  };

  const handleQuickAdd = () => {
    setTargetMealForModal(null);
    setIsLogModalOpen(true);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-18 px-6 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition-colors">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
                NutriTrack
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Calorie & Nutrition
              </span>
            </div>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden rounded-lg focus:outline-none"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="p-4 pb-2">
          <button
            onClick={handleQuickAdd}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Plus className="w-4 h-4" />
            <span>Log Food Item</span>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-left transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <div className="flex-1 truncate">
                  <div className="truncate">{item.label}</div>
                  <div className="text-[11px] font-normal text-slate-500 dark:text-slate-500 truncate">
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom User Profile, PWA, & Theme Switcher */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* PWA Install Button */}
          <PWAInstallButton variant="sidebar" />

          {/* Theme switcher */}
          <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Interface Theme</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>

          {/* User profile card & Sign Out */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleNavClick('profile')}
              className="flex-1 min-w-0 flex items-center gap-2.5 text-left group p-1"
              title="View Profile & Targets"
            >
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  {userProfile.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {userProfile.email || `${userProfile.dietaryPreference} Focus`}
                </div>
              </div>
            </button>

            <button
              onClick={signOutAndClear}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Sign Out from Google"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
