import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/formatters';
import { Calendar, RotateCcw, Sliders, ChevronLeft, ChevronRight } from 'lucide-react';

interface CycleStatusBarProps {
  onOpenSettings: () => void;
}

export const CycleStatusBar: React.FC<CycleStatusBarProps> = ({ onOpenSettings }) => {
  const { cycleConfig, setCurrentDay, resetToDemo, metrics } = useFinance();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const progressPercent = Math.min(100, Math.round((cycleConfig.currentDay / cycleConfig.totalDays) * 100));

  const handlePrevDay = () => {
    if (cycleConfig.currentDay > 1) {
      setCurrentDay(cycleConfig.currentDay - 1);
    }
  };

  const handleNextDay = () => {
    if (cycleConfig.currentDay < 30) {
      setCurrentDay(cycleConfig.currentDay + 1);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Cycle Day with stepper */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-800/50 flex items-center justify-center text-blue-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                30-Day Budget Sprint
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono text-blue-400 font-medium">
                Day {cycleConfig.currentDay} of {cycleConfig.totalDays}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {metrics.daysRemaining} days remaining · {formatINR(metrics.safeToSpend)} safe-to-spend pool
            </p>
          </div>
        </div>

        {/* Center: Interactive Day Stepper & Progress */}
        <div className="flex-1 max-w-md flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Cycle Timeline</span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevDay}
                disabled={cycleConfig.currentDay <= 1}
                aria-label="Previous Day"
                className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono tabular-nums text-slate-200 text-xs px-1">
                Day {cycleConfig.currentDay}
              </span>
              <button
                onClick={handleNextDay}
                disabled={cycleConfig.currentDay >= 30}
                aria-label="Next Day"
                className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          {showConfirmReset ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  resetToDemo();
                  setShowConfirmReset(false);
                }}
                className="px-2.5 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/80 border border-rose-800/60 rounded-lg hover:bg-rose-900 transition-colors cursor-pointer"
              >
                Confirm Reset
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-2 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
              title="Reset all data back to realistic initial demo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
