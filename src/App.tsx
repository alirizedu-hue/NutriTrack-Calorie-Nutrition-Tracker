/**
 * NutriTrack – Calorie & Nutrition Tracker
 * A modern, responsive web application for balanced nutritional logging,
 * hydration tracking, and dietary health analytics with Google Sign-In & Firestore cloud sync.
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NutritionProvider, useNutrition } from './context/NutritionContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { FoodDiaryView } from './components/FoodDiaryView';
import { NutritionAnalyticsView } from './components/NutritionAnalyticsView';
import { FoodHistoryView } from './components/FoodHistoryView';
import { FoodDatabaseView } from './components/FoodDatabaseView';
import { UserProfileView } from './components/UserProfileView';
import { ProjectShowcaseView } from './components/ProjectShowcaseView';
import { LogFoodModal } from './components/LogFoodModal';
import { EditEntryModal } from './components/EditEntryModal';
import { ToastContainer } from './components/ToastContainer';
import { AIFoodScannerView } from './components/AIFoodScannerView';
import { AINutritionAssistantView } from './components/AINutritionAssistantView';
import { MealHistoryView } from './components/MealHistoryView';
import { LoginView } from './components/LoginView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { HeartPulse, Loader2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, isLoadingUserData } = useNutrition();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 relative">
      {/* Loading Overlay while retrieving user's private Firestore data */}
      {isLoadingUserData && (
        <div className="fixed inset-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 animate-pulse">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Loading Your Personal Diary...</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Syncing with Cloud Firestore</p>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area (Offset by Sidebar on Desktop) */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* View Content Port */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'scanner' && <AIFoodScannerView />}
          {activeTab === 'assistant' && <AINutritionAssistantView />}
          {activeTab === 'meal-history' && <MealHistoryView />}
          {activeTab === 'diary' && <FoodDiaryView />}
          {activeTab === 'nutrition' && <NutritionAnalyticsView />}
          {activeTab === 'history' && <FoodHistoryView />}
          {activeTab === 'database' && <FoodDatabaseView />}
          {activeTab === 'profile' && <UserProfileView />}
          {activeTab === 'showcase' && <ProjectShowcaseView />}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <LogFoodModal />
      <EditEntryModal />
      <ToastContainer />
      <OfflineIndicator />
    </div>
  );
};

const AuthRouter: React.FC = () => {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-3xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 animate-bounce">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">NutriTrack</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Starting secure nutrition session...</p>
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600 mt-2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginView />
        <OfflineIndicator />
      </>
    );
  }

  return (
    <NutritionProvider>
      <MainLayout />
    </NutritionProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AuthRouter />
    </AuthProvider>
  );
}
