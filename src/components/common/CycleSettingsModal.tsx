import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/formatters';
import { X, Check, RotateCcw, Sliders } from 'lucide-react';

interface CycleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CycleSettingsModal: React.FC<CycleSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    cycleConfig,
    updateStartingBudget,
    setCurrentDay,
    resetToDemo,
    showToast,
  } = useFinance();

  const [budgetVal, setBudgetVal] = useState(cycleConfig.startingBudget.toString());
  const [dayVal, setDayVal] = useState(cycleConfig.currentDay);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseFloat(budgetVal);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      showToast('Starting budget must be greater than ₹0', 'warning');
      return;
    }
    updateStartingBudget(budgetNum);
    setCurrentDay(Number(dayVal));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl relative text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          30-Day Sprint Settings
        </h3>
        <p className="text-slate-400 mb-4">
          Customize your starting allowance baseline or travel forward/backward across the 30-day timeline.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Starting Budget Baseline (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">₹</span>
              <input
                type="number"
                min="500"
                step="500"
                value={budgetVal}
                onChange={(e) => setBudgetVal(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Default for sprint is ₹10,000 for 30 days.
            </span>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Active Cycle Day (1 to 30)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={dayVal}
              onChange={(e) => setDayVal(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
              required
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Simulate Day 1 (fresh start), Day 12 (mid-sprint), or Day 28 (month-end pinch).
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                resetToDemo();
                onClose();
              }}
              className="w-full py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-medium rounded-lg border border-slate-700/60 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Everything to Default Gen Z Demo</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
