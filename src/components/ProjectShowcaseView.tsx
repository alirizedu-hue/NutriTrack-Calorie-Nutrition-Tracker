import React from 'react';
import { useNutrition } from '../context/NutritionContext';
import {
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Activity,
  Droplets,
  CalendarDays,
  Apple,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  PieChart
} from 'lucide-react';

export const ProjectShowcaseView: React.FC = () => {
  const { setActiveTab } = useNutrition();

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-16">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 text-white p-8 sm:p-12 lg:p-16">
        {/* Travertine Bowl Photography Backdrop with Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/nutritrack_hero_bowl_1793989036042.jpg"
            alt="Vibrant Mediterranean whole food bowl with avocado, quinoa, and vegetables"
            className="w-full h-full object-cover object-center opacity-40 dark:opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Academic Capstone Edition · NutriTrack 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white text-balance">
            Balanced Nutrition & Mindful Food Tracking
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            NutriTrack is a modern web application designed to help users track their daily food intake, understand the nutritional value of everyday foods, and cultivate sustainable eating habits through intuitive dashboards and real-time analytics.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
            >
              Browse Food Database
            </button>
          </div>
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Designed for Health, Not Restriction
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Unlike traditional dieting apps that encourage deprivation, NutriTrack emphasizes whole-food diversity, hydration, and nutritional density.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Informational Guidance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Calorie estimates are presented as benchmarks rather than rigid limits. The interface never penalizes or encourages skipping wholesome meals.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hydration Tracking
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Interactive 8-glass water tracker with instant logging, hydration percentage gauges, and volume calculation (250 ml increments).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Macro Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Visual SVG charts for protein, carbohydrates, healthy fats, and fiber balance, grounded in USDA standard nutritional density metrics.
            </p>
          </div>
        </div>
      </div>

      {/* University Development Features Checklist */}
      <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Project Technical Specifications
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verified features implemented for the university web development showcase:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                AI Vision Food Scanner (Gemini Multimodal)
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Live camera & photo analysis decomposing plates into portion weights in grams and verified USDA reference macros.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                AI Nutrition Assistant (Grounded Chatbot)
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Dietitian assistant answering questions based on your actual logged meals, remaining macro targets, and dietary restrictions.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Smart Meal Recognition History
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Dedicated photo archive of all recognized meals with portion breakdowns, search, category filters, and re-logging.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Advanced Period & Day Comparison Analytics
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Interactive charts for 7 days, 30 days, or custom date spans, plus side-by-side Day A vs Day B variance tool.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Custom Profile & Dietary Restrictions
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Editable display name, avatar selector, allergy/restriction tags (Gluten-Free, Low Sodium), and macro presets.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Full Data Persistence & Dark Mode
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Persistent localStorage for all logs, scanned meals, and chats, plus JSON export/import and high-contrast dark theme.
              </span>
            </div>
          </div>
        </div>


        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            Launch Tracker Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
