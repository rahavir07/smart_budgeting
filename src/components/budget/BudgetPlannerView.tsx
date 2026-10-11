import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CategoryId } from '../../types/finance';
import { formatINR, getCategoryMeta } from '../../utils/formatters';
import {
  PieChart,
  AlertCircle,
  CheckCircle,
  Sliders,
  AlertTriangle,
  Pencil,
  Check,
  X,
} from 'lucide-react';

export const BudgetPlannerView: React.FC = () => {
  const {
    categoryBudgets,
    transactions,
    cycleConfig,
    metrics,
    updateCategoryBudget,
    showToast,
  } = useFinance();

  const [editingCategoryId, setEditingCategoryId] = useState<CategoryId | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<string>('');

  // Calculate actual expenses per category
  const categorySpending = categoryBudgets.map((budget) => {
    const meta = getCategoryMeta(budget.categoryId);
    const spent = transactions
      .filter((t) => t.type === 'expense' && t.categoryId === budget.categoryId)
      .reduce((sum, t) => sum + t.amount, 0);

    const percentUsed = budget.allocatedAmount > 0 ? (spent / budget.allocatedAmount) * 100 : 0;
    const remaining = budget.allocatedAmount - spent;
    const isOverspent = spent > budget.allocatedAmount;

    // Expected pace based on cycleDay (e.g. at Day 12 of 30, expected pace is 40%)
    const cycleDayRatio = cycleConfig.currentDay / cycleConfig.totalDays;
    const expectedSpendAtThisDay = budget.allocatedAmount * cycleDayRatio;
    const isOverPace = !isOverspent && spent > expectedSpendAtThisDay * 1.15;

    return {
      categoryId: budget.categoryId,
      meta,
      allocatedAmount: budget.allocatedAmount,
      spent,
      percentUsed,
      remaining,
      isOverspent,
      isOverPace,
      expectedSpendAtThisDay,
    };
  });

  const totalAllocated = categoryBudgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalSpentAcrossBudgets = categorySpending.reduce((sum, c) => sum + c.spent, 0);

  const startEdit = (categoryId: CategoryId, currentAmount: number) => {
    setEditingCategoryId(categoryId);
    setEditLimitValue(currentAmount.toString());
  };

  const saveEdit = (categoryId: CategoryId) => {
    const val = parseFloat(editLimitValue);
    if (isNaN(val) || val < 0) {
      showToast('Please enter a valid positive budget amount', 'warning');
      return;
    }
    updateCategoryBudget(categoryId, Math.round(val));
    setEditingCategoryId(null);
  };

  const cancelEdit = () => {
    setEditingCategoryId(null);
    setEditLimitValue('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-400" />
              Category Budget Planner
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Distribute your ₹{cycleConfig.startingBudget.toLocaleString('en-IN')} across core living categories and detect overspending early.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs">
            <div>
              <p className="text-slate-400">Total Budget Allocated</p>
              <p className="text-base font-bold font-mono text-white">
                {formatINR(totalAllocated)}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <p className="text-slate-400">Total Spent So Far</p>
              <p className="text-base font-bold font-mono text-rose-400">
                {formatINR(totalSpentAcrossBudgets)}
              </p>
            </div>
          </div>
        </div>

        {/* Allocation vs Starting Budget Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>
              Budget Allocation:{' '}
              <span className="font-mono text-slate-200">
                {((totalAllocated / cycleConfig.startingBudget) * 100).toFixed(0)}%
              </span>{' '}
              of initial ₹{cycleConfig.startingBudget.toLocaleString('en-IN')}
            </span>
            <span className="font-mono text-slate-400">
              Unallocated: {formatINR(Math.max(0, cycleConfig.startingBudget - totalAllocated))}
            </span>
          </div>
          <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                totalAllocated > cycleConfig.startingBudget
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-500'
              }`}
              style={{
                width: `${Math.min(100, (totalAllocated / cycleConfig.startingBudget) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Category Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categorySpending.map((cat) => {
          const isEditing = editingCategoryId === cat.categoryId;

          return (
            <div
              key={cat.categoryId}
              className={`bg-slate-900/60 border rounded-xl p-5 flex flex-col justify-between transition-all ${
                cat.isOverspent
                  ? 'border-rose-700/60 shadow-md shadow-rose-950/20'
                  : cat.isOverPace
                  ? 'border-amber-700/50'
                  : 'border-slate-800/80'
              }`}
            >
              <div>
                {/* Title & Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.meta.color }}
                    />
                    <h3 className="font-semibold text-slate-100 text-sm truncate">
                      {cat.meta.name}
                    </h3>
                  </div>

                  {cat.isOverspent ? (
                    <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1 shrink-0">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Over Budget
                    </span>
                  ) : cat.isOverPace ? (
                    <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Fast Burn
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" />
                      On Pace
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="font-mono text-white font-medium">
                      {formatINR(cat.spent)}
                    </span>
                    <span className="font-mono text-slate-400">
                      limit {formatINR(cat.allocatedAmount)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        cat.isOverspent
                          ? 'bg-rose-500'
                          : cat.percentUsed > 75
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, cat.percentUsed)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>{cat.percentUsed.toFixed(0)}% utilized</span>
                    <span
                      className={`font-mono font-medium ${
                        cat.remaining < 0 ? 'text-rose-400' : 'text-slate-300'
                      }`}
                    >
                      {cat.remaining >= 0
                        ? `${formatINR(cat.remaining)} left`
                        : `${formatINR(Math.abs(cat.remaining))} over limit`}
                    </span>
                  </div>
                </div>

                {/* Practical Advisory Tip */}
                {cat.isOverspent ? (
                  <p className="text-[11px] text-rose-300/90 bg-rose-950/40 p-2 rounded-lg border border-rose-800/40 mt-2">
                    Warning: You've exceeded this budget by {formatINR(Math.abs(cat.remaining))}. Consider trimming other discretionary spending or raising this cap.
                  </p>
                ) : cat.isOverPace ? (
                  <p className="text-[11px] text-amber-300/90 bg-amber-950/40 p-2 rounded-lg border border-amber-800/40 mt-2">
                    Pace Notice: On Day {cycleConfig.currentDay}, spending is slightly ahead of schedule. Safe pace is ~₹{Math.round(cat.remaining / metrics.daysRemaining)}/day for the remaining days.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-2">
                    Safe remaining daily pace: ~₹{Math.round(cat.remaining / metrics.daysRemaining)}/day
                  </p>
                )}
              </div>

              {/* Edit Limit Controls */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-mono">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={editLimitValue}
                        onChange={(e) => setEditLimitValue(e.target.value)}
                        className="w-full pl-6 pr-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={() => saveEdit(cat.categoryId)}
                      className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded cursor-pointer"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Limit: {formatINR(cat.allocatedAmount)}</span>
                    <button
                      onClick={() => startEdit(cat.categoryId, cat.allocatedAmount)}
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Adjust Cap</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
