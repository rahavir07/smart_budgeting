import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { WhatIfSimulation, CategoryId } from '../../types/finance';
import { formatINR, getCategoryMeta, CATEGORIES_META } from '../../utils/formatters';
import { simulateScenario } from '../../utils/calculations';
import {
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Check,
  ShoppingBag,
  Tv,
  Briefcase,
  Wrench,
  Music,
  CreditCard,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const WhatIfSimulatorView: React.FC = () => {
  const {
    cycleConfig,
    transactions,
    bills,
    savingsGoals,
    categoryBudgets,
    activeSimulation,
    setActiveSimulation,
    applySimulation,
    forecastPoints,
  } = useFinance();

  // Active form state for scenario
  const [simType, setSimType] = useState<WhatIfSimulation['type']>('purchase');
  const [name, setName] = useState('New Sneakers Sale');
  const [amount, setAmount] = useState('1200');
  const [categoryId, setCategoryId] = useState<CategoryId>('shopping_thrift');
  const [simDay, setSimDay] = useState(cycleConfig.currentDay);
  const [selectedBillId, setSelectedBillId] = useState<string>('');

  // Unpaid bills for the bill payment or subscription cancellation simulations
  const unpaidBills = bills.filter((b) => !b.isPaid);

  // Active scenario object
  const currentScenario: WhatIfSimulation = useMemo(() => {
    const numAmount = parseFloat(amount) || 0;
    return {
      type: simType,
      name: name || 'Simulated Event',
      amount: numAmount,
      categoryId,
      day: Math.max(1, Math.min(30, Number(simDay))),
      billId: selectedBillId || undefined,
    };
  }, [simType, name, amount, categoryId, simDay, selectedBillId]);

  // Run pure simulation comparison
  const simulationResult = useMemo(() => {
    return simulateScenario(
      cycleConfig,
      transactions,
      bills,
      savingsGoals,
      categoryBudgets,
      currentScenario
    );
  }, [cycleConfig, transactions, bills, savingsGoals, categoryBudgets, currentScenario]);

  // Sync with context's activeSimulation for chart preview
  const handlePreview = () => {
    setActiveSimulation(currentScenario);
  };

  const handleClearPreview = () => {
    setActiveSimulation(null);
  };

  const handleApply = () => {
    applySimulation(currentScenario);
  };

  // Quick Preset Scenarios tailored for Indian Gen Z
  const applyPreset = (preset: {
    type: WhatIfSimulation['type'];
    name: string;
    amount: number;
    categoryId: CategoryId;
    billId?: string;
  }) => {
    setSimType(preset.type);
    setName(preset.name);
    setAmount(preset.amount.toString());
    setCategoryId(preset.categoryId);
    setSimDay(cycleConfig.currentDay);
    if (preset.billId) {
      setSelectedBillId(preset.billId);
    }

    const sim: WhatIfSimulation = {
      type: preset.type,
      name: preset.name,
      amount: preset.amount,
      categoryId: preset.categoryId,
      day: cycleConfig.currentDay,
      billId: preset.billId,
    };
    setActiveSimulation(sim);
  };

  const { before, after, balanceDelta, dailyAllowanceDelta, safeToSpendDelta, healthScoreDelta } =
    simulationResult;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900/60 border border-blue-800/40 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white">
                What-If Financial Simulator
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Test big spends, unexpected emergencies, side gigs, or bill cancellations <strong className="text-white">before</strong> touching your actual money. See exactly how your safe-to-spend allowance and 30-day forecast react.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeSimulation && (
              <button
                onClick={handleClearPreview}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 rounded-lg cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Preview</span>
              </button>
            )}
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md shadow-emerald-950/40 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply to Real Budget</span>
            </button>
          </div>
        </div>

        {/* Quick Gen Z Preset Buttons */}
        <div className="mt-4 pt-4 border-t border-blue-900/40">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Try Quick Scenarios:
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() =>
                applyPreset({
                  type: 'purchase',
                  name: 'Weekend Party & Dinner',
                  amount: 1200,
                  categoryId: 'entertainment',
                })
              }
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-750 cursor-pointer transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-rose-400" />
              <span>Weekend Party (-₹1,200)</span>
            </button>

            <button
              onClick={() =>
                applyPreset({
                  type: 'extra_income',
                  name: 'Freelance Logo Gig',
                  amount: 2500,
                  categoryId: 'freelance_income',
                })
              }
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-750 cursor-pointer transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              <span>Freelance Gig (+₹2,500)</span>
            </button>

            <button
              onClick={() =>
                applyPreset({
                  type: 'unexpected_expense',
                  name: 'Phone Screen Repair',
                  amount: 1800,
                  categoryId: 'other',
                })
              }
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-750 cursor-pointer transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Broken Phone (-₹1,800)</span>
            </button>

            <button
              onClick={() => {
                const sub = bills.find((b) => b.isSubscription && !b.isPaid) || bills[0];
                applyPreset({
                  type: 'cancel_subscription',
                  name: sub ? sub.name : 'Cancel Unused Subscription',
                  amount: sub ? sub.amount : 199,
                  categoryId: 'subscriptions',
                  billId: sub?.id,
                });
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-750 cursor-pointer transition-colors"
            >
              <Tv className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cancel Subscription (+₹199 reserved)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Control & Before-vs-After Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Scenario Builder Form (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            Configure Custom Scenario
          </h3>

          <div className="space-y-3 text-xs">
            {/* Simulation Type Tabs */}
            <div>
              <label className="block text-slate-400 mb-1">Scenario Type</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setSimType('purchase');
                    setCategoryId('shopping_thrift');
                    handlePreview();
                  }}
                  className={`py-1.5 px-2 rounded font-medium transition-colors cursor-pointer ${
                    simType === 'purchase'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Purchase (-)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimType('unexpected_expense');
                    setCategoryId('other');
                    handlePreview();
                  }}
                  className={`py-1.5 px-2 rounded font-medium transition-colors cursor-pointer ${
                    simType === 'unexpected_expense'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Emergency (-)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimType('extra_income');
                    setCategoryId('freelance_income');
                    handlePreview();
                  }}
                  className={`py-1.5 px-2 rounded font-medium transition-colors cursor-pointer ${
                    simType === 'extra_income'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Income (+)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimType('cancel_subscription');
                    setCategoryId('subscriptions');
                    if (unpaidBills.length > 0) {
                      setSelectedBillId(unpaidBills[0].id);
                      setAmount(unpaidBills[0].amount.toString());
                      setName(unpaidBills[0].name);
                    }
                    handlePreview();
                  }}
                  className={`py-1.5 px-2 rounded font-medium transition-colors cursor-pointer ${
                    simType === 'cancel_subscription'
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cancel Sub (+)
                </button>
              </div>
            </div>

            {/* Bill Selector if Cancel Sub or Pay Bill */}
            {simType === 'cancel_subscription' && unpaidBills.length > 0 && (
              <div>
                <label className="block text-slate-400 mb-1">Target Subscription / Bill</label>
                <select
                  value={selectedBillId}
                  onChange={(e) => {
                    setSelectedBillId(e.target.value);
                    const b = bills.find((bill) => bill.id === e.target.value);
                    if (b) {
                      setName(`Cancel: ${b.name}`);
                      setAmount(b.amount.toString());
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  {unpaidBills.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (₹{b.amount})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Title / Description */}
            <div>
              <label className="block text-slate-400 mb-1">Description</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sneaker sale, Trip booking"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>

            {/* Amount (₹) */}
            <div>
              <label className="block text-slate-400 mb-1">Simulated Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-mono">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-base"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-slate-400 mb-1">Category Impact</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value as CategoryId)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              >
                {Object.values(CATEGORIES_META).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Simulated Day */}
            <div>
              <label className="block text-slate-400 mb-1">Occurs On Day (1-30)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={simDay}
                onChange={(e) => setSimDay(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
            </div>

            {/* Preview trigger button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePreview}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate & Update Chart</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Before & After Dual Comparison Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reality (Before) Card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                    Baseline
                  </span>
                  <h4 className="text-base font-bold text-slate-200">Current Reality</h4>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Day {cycleConfig.currentDay}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Liquid Balance:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {formatINR(before.currentBalance)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Safe-to-Spend:</span>
                  <span className="font-mono font-bold text-blue-400 text-sm">
                    {formatINR(before.safeToSpend)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Daily Allowance:</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {formatINR(before.dailyAllowance)}/day
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Health Score:</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {before.healthScore}/100 ({before.riskLevel})
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Day 30 Projection:</span>
                  <span className="font-mono font-semibold text-slate-300">
                    {formatINR(before.projectedEndBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated (After) Card */}
            <div className="bg-slate-900/80 border border-blue-600/40 rounded-xl p-5 space-y-4 shadow-xl shadow-blue-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400">
                    Simulation Preview
                  </span>
                  <h4 className="text-base font-bold text-white">After Decision</h4>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40">
                  Simulated
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Liquid Balance Delta */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Liquid Balance:</span>
                  <div className="text-right flex items-center gap-1.5">
                    <span className="font-mono font-bold text-white text-sm">
                      {formatINR(after.currentBalance)}
                    </span>
                    <span
                      className={`font-mono text-xs ${
                        balanceDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      ({formatINR(balanceDelta, true)})
                    </span>
                  </div>
                </div>

                {/* Safe-to-Spend Delta */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Safe-to-Spend:</span>
                  <div className="text-right flex items-center gap-1.5">
                    <span className="font-mono font-bold text-blue-400 text-sm">
                      {formatINR(after.safeToSpend)}
                    </span>
                    <span
                      className={`font-mono text-xs ${
                        safeToSpendDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      ({formatINR(safeToSpendDelta, true)})
                    </span>
                  </div>
                </div>

                {/* Daily Allowance Delta */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Daily Allowance:</span>
                  <div className="text-right flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-slate-200">
                      {formatINR(after.dailyAllowance)}/day
                    </span>
                    <span
                      className={`font-mono text-xs ${
                        dailyAllowanceDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      ({formatINR(dailyAllowanceDelta, true)})
                    </span>
                  </div>
                </div>

                {/* Health Score Delta */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Health Score:</span>
                  <div className="text-right flex items-center gap-1.5">
                    <span
                      className={`font-mono font-semibold ${
                        after.healthScore >= 75
                          ? 'text-emerald-400'
                          : after.healthScore >= 55
                          ? 'text-blue-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {after.healthScore}/100 ({after.riskLevel})
                    </span>
                    <span
                      className={`font-mono text-xs ${
                        healthScoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      ({healthScoreDelta >= 0 ? `+${healthScoreDelta}` : healthScoreDelta})
                    </span>
                  </div>
                </div>

                {/* Projected Balance */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Day 30 Projection:</span>
                  <span className="font-mono font-semibold text-slate-300">
                    {formatINR(after.projectedEndBalance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Verdict Callout */}
          <div
            className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              after.healthScore < before.healthScore - 10 || after.safeToSpend < 500
                ? 'bg-rose-950/25 border-rose-800/50 text-rose-200'
                : balanceDelta >= 0
                ? 'bg-emerald-950/25 border-emerald-800/50 text-emerald-200'
                : 'bg-blue-950/25 border-blue-800/50 text-blue-200'
            }`}
          >
            {balanceDelta < 0 && after.healthScore < 50 ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-semibold text-sm">
                Simulation Verdict: {name}
              </p>
              <p className="leading-relaxed opacity-90">
                {balanceDelta < 0 ? (
                  <>
                    Spending ₹{amount} drops your daily allowance from{' '}
                    <strong>{formatINR(before.dailyAllowance)}</strong> down to{' '}
                    <strong>{formatINR(after.dailyAllowance)}</strong>/day for the remaining{' '}
                    {before.daysRemaining} days.
                    {after.safeToSpend < 400 && (
                      <span className="block mt-1 font-semibold text-rose-400">
                        Warning: Safe buffer becomes razor thin! Consider delaying this purchase.
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    This inflow expands your safe-to-spend by {formatINR(balanceDelta)}, lifting your daily allowance by {formatINR(dailyAllowanceDelta)}/day!
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Interactive Trajectory Chart */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold text-white">30-Day Trajectory Preview</h4>
                <p className="text-xs text-slate-400">
                  Visualizing cash path: Current Projection vs. Simulated Decision
                </p>
              </div>
            </div>

            <div className="h-56 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="day"
                    stroke="#64748b"
                    tickFormatter={(d) => `D${d}`}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tickFormatter={(v) => `₹${v}`}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                    labelFormatter={(day) => `Day ${day} of Cycle`}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="projectedBalance"
                    name="Current Projection"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="simulatedBalance"
                    name="Simulated Path"
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
