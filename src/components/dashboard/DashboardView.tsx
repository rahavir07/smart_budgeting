import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR, getCategoryMeta } from '../../utils/formatters';
import {
  Wallet,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  CalendarClock,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenQuickAdd: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenQuickAdd }) => {
  const {
    metrics,
    transactions,
    bills,
    savingsGoals,
    setActiveTab,
    cycleConfig,
  } = useFinance();

  // Recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  // Unpaid bills count
  const unpaidBills = bills.filter((b) => !b.isPaid);

  // Health Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';
    if (score >= 55) return 'text-blue-400 border-blue-500/40 bg-blue-950/20';
    if (score >= 35) return 'text-amber-400 border-amber-500/40 bg-amber-950/20';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/20';
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'Low Risk':
        return 'text-emerald-400';
      case 'Moderate Risk':
        return 'text-blue-400';
      case 'High Risk':
        return 'text-amber-400';
      default:
        return 'text-rose-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Alert / Proactive Guidance Banner */}
      <div
        className={`rounded-xl p-4 border transition-colors ${
          metrics.riskLevel === 'Low Risk'
            ? 'bg-emerald-950/20 border-emerald-800/40'
            : metrics.riskLevel === 'Moderate Risk'
            ? 'bg-blue-950/20 border-blue-800/40'
            : metrics.riskLevel === 'High Risk'
            ? 'bg-amber-950/30 border-amber-800/50'
            : 'bg-rose-950/30 border-rose-800/50'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            {metrics.healthScore >= 75 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Sprint Status
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className={`text-xs font-bold ${getRiskBadge(metrics.riskLevel)}`}>
                  {metrics.riskLevel} ({metrics.healthScore}/100)
                </span>
              </div>
              <p className="text-sm text-slate-200 mt-0.5">
                {metrics.riskDescription}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('simulator')}
            className="flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 text-xs font-semibold text-blue-300 hover:text-white bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/50 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Expense</span>
          </button>
        </div>
      </div>

      {/* Main Core 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Safe To Spend (The Primary Star Metric) */}
        <div className="bg-slate-900/80 border border-blue-600/40 rounded-xl p-5 relative overflow-hidden shadow-lg shadow-blue-950/40 group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Safe-to-Spend
            </span>
            <span className="text-[11px] text-blue-300/80 font-mono">Protected</span>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {formatINR(metrics.safeToSpend)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>After {formatINR(metrics.unpaidBillsTotal)} bills reserved</span>
            <span className="text-blue-400 font-mono font-medium">
              ₹{Math.round(metrics.dailyAllowance)}/day
            </span>
          </div>
        </div>

        {/* Card 2: Current Liquid Balance */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              Current Balance
            </span>
            <span className="text-[11px] font-mono text-slate-400">In Wallet</span>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {formatINR(metrics.currentBalance)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Start: {formatINR(cycleConfig.startingBudget)}</span>
            <span className="text-emerald-400 font-mono font-medium">
              +{formatINR(metrics.totalIncome)} earned
            </span>
          </div>
        </div>

        {/* Card 3: Daily Allowance & Pace */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium flex items-center gap-1.5">
              <CalendarClock className="w-4 h-4 text-indigo-400" />
              Daily Allowance
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {metrics.daysRemaining} days left
            </span>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {formatINR(metrics.dailyAllowance)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Avg burn: {formatINR(metrics.burnRatePerDay)}/day</span>
            <span
              className={`font-mono font-medium ${
                metrics.burnRatePerDay <= metrics.dailyAllowance
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {metrics.burnRatePerDay <= metrics.dailyAllowance ? 'Within Pace' : 'Over Pace'}
            </span>
          </div>
        </div>

        {/* Card 4: Total Expenses */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              Expenses Logged
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {metrics.budgetUtilizationPercent.toFixed(0)}% of initial
            </span>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {formatINR(metrics.totalExpenses)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>{transactions.length} transactions</span>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
            >
              View All
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Row: Financial Health Dial + Savings Mini Bar + Unpaid Bills Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Breakdown Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Financial Health Score</h2>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-mono font-semibold ${getScoreColor(metrics.healthScore)}`}>
                {metrics.healthScore}/100
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Burn Rate Discipline</span>
                  <span className="font-mono text-slate-200">
                    {metrics.burnRatePerDay <= metrics.dailyAllowance ? 'High' : 'Watch out'}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      metrics.burnRatePerDay <= metrics.dailyAllowance
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(10, (metrics.dailyAllowance / (metrics.burnRatePerDay || 1)) * 50))}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Upcoming Bills Coverage</span>
                  <span className="font-mono text-slate-200">
                    {metrics.unpaidBillsTotal <= metrics.currentBalance ? '100% Covered' : 'Deficit'}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${
                        metrics.unpaidBillsTotal > 0
                          ? Math.min(100, (metrics.currentBalance / metrics.unpaidBillsTotal) * 100)
                          : 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Goal Savings Allocated</span>
                  <span className="font-mono text-slate-200">
                    {formatINR(metrics.totalSavedInGoals)} ({metrics.savingsRatePercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.min(100, metrics.savingsRatePercent * 3)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Day 30 Projection</span>
            <span className="font-mono font-bold text-white">
              {formatINR(metrics.projectedEndBalance)}
            </span>
          </div>
        </div>

        {/* Unpaid Commitments & Bills Protection */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">Reserved for Bills</h2>
              <button
                onClick={() => setActiveTab('bills')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
              >
                Manage ({unpaidBills.length})
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              This {formatINR(metrics.unpaidBillsTotal)} is locked from your balance so you don't accidentally overspend before due dates.
            </p>

            <div className="space-y-2">
              {unpaidBills.slice(0, 3).map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <div>
                      <p className="font-medium text-slate-200 truncate max-w-[140px]">
                        {bill.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Due Day {bill.dueDay} · {bill.provider || 'Bill'}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-white">
                    {formatINR(bill.amount)}
                  </span>
                </div>
              ))}
              {unpaidBills.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-500">
                  All scheduled cycle bills have been paid!
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Reserved</span>
            <span className="text-xs font-mono font-semibold text-amber-400">
              {formatINR(metrics.unpaidBillsTotal)}
            </span>
          </div>
        </div>

        {/* Savings Goals Mini Progress */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">Active Savings Goals</h2>
              <button
                onClick={() => setActiveTab('goals')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
              >
                View Goals
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Total {formatINR(metrics.totalSavedInGoals)} saved across {savingsGoals.length} goals.
            </p>

            <div className="space-y-2.5">
              {savingsGoals.slice(0, 3).map((goal) => {
                const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                return (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium truncate max-w-[150px]">
                        {goal.name}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">
                        {formatINR(goal.currentAmount)} / {formatINR(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: goal.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Add to Stash</span>
            <button
              onClick={() => setActiveTab('goals')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              Deposit ₹ Funds →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Quick Simulation Promo + Recent Transactions Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* What-If Simulator Teaser Card */}
        <div className="bg-gradient-to-br from-blue-950/40 to-slate-900/60 border border-blue-800/40 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              What-If Decision Simulator
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Thinking of buying that ₹1,800 jacket or going to a weekend party? Preview the impact on your safe-to-spend balance and daily allowance before spending real cash!
            </p>

            <div className="mt-4 space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs flex items-center justify-between">
                <span className="text-slate-300">Concert ticket (₹1,500)</span>
                <span className="text-rose-400 font-mono">-₹79/day</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs flex items-center justify-between">
                <span className="text-slate-300">Cancel Netflix (₹199)</span>
                <span className="text-emerald-400 font-mono">+₹11/day</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('simulator')}
            className="mt-5 w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer text-center shadow-md shadow-blue-600/20"
          >
            Open Simulator Lab →
          </button>
        </div>

        {/* Recent Transactions Ledger snippet */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Latest expenses and income in this 30-day sprint
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenQuickAdd}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg border border-slate-700/60 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
              >
                View All →
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/60">
            {recentTransactions.map((tx) => {
              const catMeta = getCategoryMeta(tx.categoryId);
              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: catMeta.bgColor, color: catMeta.color }}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-200 truncate">{tx.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        Day {tx.cycleDay} · {catMeta.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`font-mono font-semibold tabular-nums ${
                        tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {formatINR(tx.amount, true)}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">{tx.date}</p>
                  </div>
                </div>
              );
            })}

            {recentTransactions.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                No transactions recorded yet. Click 'Add' to record your first spend!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
