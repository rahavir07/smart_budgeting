import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toast, hideToast } = useFinance();

  if (!toast) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-6 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-xs font-medium ${
          toast.type === 'success'
            ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-200'
            : toast.type === 'warning'
            ? 'bg-slate-900/95 border-amber-500/40 text-amber-200'
            : 'bg-slate-900/95 border-blue-500/40 text-blue-200'
        }`}
      >
        {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
        {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}

        <span className="max-w-xs">{toast.message}</span>

        <button
          onClick={hideToast}
          className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
