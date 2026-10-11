import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';
import { formatINR } from '../../utils/formatters';
import {
  Target,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Pencil,
  Trash2,
  CheckCircle,
  Calendar,
  X,
  Check,
  Palmtree,
  Shield,
  Laptop,
} from 'lucide-react';

export const SavingsGoalsView: React.FC = () => {
  const {
    savingsGoals,
    metrics,
    cycleConfig,
    addSavingsGoal,
    editSavingsGoal,
    deleteSavingsGoal,
    depositToGoal,
    withdrawFromGoal,
    showToast,
  } = useFinance();

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Form states for Create/Edit
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadlineDay, setDeadlineDay] = useState(30);
  const [color, setColor] = useState('#06b6d4');

  // Deposit/Withdraw modal
  const [transactGoal, setTransactGoal] = useState<SavingsGoal | null>(null);
  const [transactType, setTransactType] = useState<'deposit' | 'withdraw'>('deposit');
  const [transactAmount, setTransactAmount] = useState('');

  const openCreateModal = () => {
    setName('');
    setTargetAmount('');
    setDeadlineDay(30);
    setColor('#06b6d4');
    setEditingGoal(null);
    setCreateModalOpen(true);
  };

  const openEditModal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setDeadlineDay(goal.deadlineDay);
    setColor(goal.color);
    setCreateModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    if (!name.trim()) {
      showToast('Please name your savings goal', 'warning');
      return;
    }
    if (isNaN(target) || target <= 0) {
      showToast('Please enter a target amount greater than ₹0', 'warning');
      return;
    }

    if (editingGoal) {
      editSavingsGoal(editingGoal.id, {
        name: name.trim(),
        targetAmount: Math.round(target),
        deadlineDay: Math.max(1, Number(deadlineDay)),
        color,
      });
    } else {
      addSavingsGoal({
        name: name.trim(),
        targetAmount: Math.round(target),
        deadlineDay: Math.max(1, Number(deadlineDay)),
        categoryIcon: 'Target',
        color,
      });
    }

    setCreateModalOpen(false);
  };

  const handleTransactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactGoal) return;
    const amt = parseFloat(transactAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid amount', 'warning');
      return;
    }

    if (transactType === 'deposit') {
      const ok = depositToGoal(transactGoal.id, Math.round(amt));
      if (ok) setTransactGoal(null);
    } else {
      const ok = withdrawFromGoal(transactGoal.id, Math.round(amt));
      if (ok) setTransactGoal(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              Savings Goals & Stashes
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Lock money away from impulsive spending. Every rupee in a goal is protected and deducted from daily allowance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-right">
              <span className="text-slate-400 block">Total Stashed:</span>
              <span className="font-mono font-bold text-indigo-400 text-sm">
                {formatINR(metrics.totalSavedInGoals)}
              </span>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-md shadow-indigo-950/40"
            >
              <Plus className="w-4 h-4" />
              <span>New Goal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savingsGoals.map((goal) => {
          const progressPercent = Math.min(
            100,
            Math.round((goal.currentAmount / goal.targetAmount) * 100)
          );
          const remainingNeeded = Math.max(0, goal.targetAmount - goal.currentAmount);
          const daysToDeadline = Math.max(1, goal.deadlineDay - cycleConfig.currentDay);
          const requiredDailySavings = remainingNeeded > 0 ? remainingNeeded / daysToDeadline : 0;
          const isCompleted = goal.currentAmount >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between group hover:border-slate-700/80 transition-colors"
            >
              <div>
                {/* Header: Title & Actions */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: goal.color }}
                    />
                    <div>
                      <h3 className="font-bold text-white text-sm">{goal.name}</h3>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Target: Day {goal.deadlineDay} ({daysToDeadline} days left)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(goal)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                      title="Edit Goal"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSavingsGoal(goal.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Visual */}
                <div className="space-y-2 my-4">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono font-bold text-white text-sm">
                      {formatINR(goal.currentAmount)}
                    </span>
                    <span className="font-mono text-slate-400 text-xs">
                      target {formatINR(goal.targetAmount)}
                    </span>
                  </div>

                  <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>{progressPercent}% achieved</span>
                    {isCompleted ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Goal Reached!
                      </span>
                    ) : (
                      <span className="font-mono text-slate-300">
                        {formatINR(remainingNeeded)} left to go
                      </span>
                    )}
                  </div>
                </div>

                {/* Required Pace Calculation */}
                {!isCompleted ? (
                  <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-2.5 text-xs text-slate-300 flex items-center justify-between">
                    <span>Required pace:</span>
                    <span className="font-mono font-bold text-indigo-400">
                      ₹{Math.round(requiredDailySavings)}/day
                    </span>
                  </div>
                ) : (
                  <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-2.5 text-xs text-emerald-300 text-center font-medium">
                    Awesome job! You reached this target.
                  </div>
                )}
              </div>

              {/* Deposit / Withdraw Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setTransactGoal(goal);
                    setTransactType('deposit');
                    setTransactAmount('');
                  }}
                  className="py-1.5 px-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-semibold rounded-lg border border-indigo-500/30 transition-colors cursor-pointer text-center"
                >
                  + Deposit ₹
                </button>
                <button
                  onClick={() => {
                    setTransactGoal(goal);
                    setTransactType('withdraw');
                    setTransactAmount('');
                  }}
                  disabled={goal.currentAmount <= 0}
                  className="py-1.5 px-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-medium rounded-lg border border-slate-700/50 disabled:opacity-40 transition-colors cursor-pointer text-center"
                >
                  - Withdraw
                </button>
              </div>
            </div>
          );
        })}

        {savingsGoals.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-3">
            <Target className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-white">No active savings goals</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Setting up even a small ₹500 emergency buffer or trip fund trains solid financial discipline!
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer"
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Goal Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl relative">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-4">
              {editingGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
            </h3>

            <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Goa Trip, New Headphones, Emergency Stash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Amount (₹)</label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  placeholder="e.g. 2500"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Deadline Day</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={deadlineDay}
                  onChange={(e) => setDeadlineDay(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Day in the cycle (e.g. Day 30)
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Accent Theme</label>
                <div className="flex gap-2">
                  {['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full cursor-pointer transition-transform ${
                        color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit / Withdraw Modal */}
      {transactGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 shadow-2xl relative text-xs">
            <button
              onClick={() => setTransactGoal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-2">
              {transactType === 'deposit' ? 'Deposit to' : 'Withdraw from'} {transactGoal.name}
            </h3>
            <p className="text-slate-400 mb-4">
              {transactType === 'deposit'
                ? `Available in wallet: ${formatINR(metrics.currentBalance)}`
                : `Currently saved in goal: ${formatINR(transactGoal.currentAmount)}`}
            </p>

            <form onSubmit={handleTransactSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={
                      transactType === 'deposit'
                        ? metrics.currentBalance
                        : transactGoal.currentAmount
                    }
                    placeholder="e.g. 500"
                    value={transactAmount}
                    onChange={(e) => setTransactAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-base"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTransactGoal(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 font-semibold text-white rounded-lg cursor-pointer ${
                    transactType === 'deposit'
                      ? 'bg-indigo-600 hover:bg-indigo-500'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {transactType === 'deposit' ? 'Deposit' : 'Withdraw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
