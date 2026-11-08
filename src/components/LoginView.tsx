import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  HeartPulse,
  Camera,
  Flame,
  Droplets,
  ShieldCheck,
  Sparkles,
  PieChart,
  Lock,
  ArrowRight,
  AlertCircle,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export const LoginView: React.FC = () => {
  const { signInWithGoogle, isSigningIn, authError, clearAuthError } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-slate-50 to-emerald-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Navbar Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              NutriTrack
            </span>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block mt-0.5">
              Calorie & Nutrition Tracker
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PWAInstallButton />
        </div>
      </header>

      {/* Main Hero & Auth Card */}
      <main className="max-w-5xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Value Proposition & Feature Highlights */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Multi-User Cloud Sync & AI Nutrition</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Track Your Meals, Macros & Hydration with <span className="text-emerald-600 dark:text-emerald-400">Total Privacy</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Sign in with your Google account to access your personal nutrition diary. Your logged meals, AI food scans, hydration logs, and daily targets are securely saved to your private Cloud Firestore account.
          </p>

          {/* Value Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2.5 mb-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <Camera className="w-4 h-4" />
                <span>AI Meal Scanner</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Snap or upload photos of your plates for automatic multi-item calorie and macro estimation.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2.5 mb-1.5 text-cyan-600 dark:text-cyan-400 font-bold text-xs">
                <Droplets className="w-4 h-4" />
                <span>Hydration Tracker</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Log daily water glasses with persistence and historical hydration statistics.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2.5 mb-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                <PieChart className="w-4 h-4" />
                <span>Macro & Calorie Goals</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Personalized targets for protein, carbohydrates, fats, and fiber with weekly trends.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2.5 mb-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <Lock className="w-4 h-4" />
                <span>Isolated User Data</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Protected by Firebase Firestore rules. No other user can ever view or edit your diary.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Google Sign-In Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Welcome to NutriTrack
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sign in with your Google account to access your personal dashboard
              </p>
            </div>

            {/* Error Notification */}
            {authError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Sign-In Notice</p>
                  <p className="mt-0.5">{authError}</p>
                  <button
                    onClick={clearAuthError}
                    className="mt-1 text-[11px] underline font-medium hover:text-rose-900 dark:hover:text-rose-100"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Google Sign-In Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={isSigningIn}
                className="w-full relative flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-100 font-semibold text-sm border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {/* Official Google G SVG */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>

                <span>
                  {isSigningIn ? 'Connecting to Google...' : 'Continue with Google'}
                </span>
                <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>

              <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400 justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Automatic account setup on first sign-in</span>
              </div>
            </div>

            {/* Multi-Account Isolation Guarantee Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Separate Data for Every Account</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                When you sign in, your meals and water logs are linked exclusively to your Google account ID. If another person signs in with their account on this device, they will only see their own data.
              </p>
            </div>

            <div className="text-center">
              <p className="text-[11px] text-slate-400">
                NutriTrack 2.0 &bull; Private &bull; Cloud Synchronized &bull; Installable PWA
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-4 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} NutriTrack. Personal Health, Nutrition & Calorie Tracking.
      </footer>
    </div>
  );
};
