import React from 'react';
import { useNutrition } from '../context/NutritionContext';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNutrition();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-200 transform translate-y-0 ${
              isSuccess
                ? 'bg-emerald-900/95 border-emerald-700 text-emerald-100 shadow-emerald-950/20'
                : isError
                ? 'bg-red-900/95 border-red-700 text-red-100 shadow-red-950/20'
                : 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-slate-950/20'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-red-400" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-emerald-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white tracking-tight leading-tight">
                {toast.title}
              </h4>
              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-300 hover:text-white transition-colors p-0.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
