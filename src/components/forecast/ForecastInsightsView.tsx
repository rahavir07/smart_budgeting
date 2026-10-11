import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR, getCategoryMeta } from '../../utils/formatters';
import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Calendar,
  Zap,
  Coffee,
  ShoppingBag,
  Bus,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const ForecastInsightsView: React.FC = () => {
  const { forecastPoints, metrics, cycleConfig, transactions, bills } = useFinance();

  // Top spending categories calculation
  const categorySpendData = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
      });

    return Array.from(map.entries())
      .map(([catId, amount]) => {
        const meta = getCategoryMeta(catId as any);
        return {
          id: catId,
          name: meta.name,
          amount,
          color: meta.color,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Contextual smart Gen Z saving tips
  const savingTips = useMemo(() => {
    const tips = [];

    // Food tip
    const foodSpend = categorySpendData.find((c) => c.id === 'food_chai')?.amount || 0;
    if (foodSpend > 1200) {
      tips.push({
        icon: Coffee,
        title: 'Midnight Delivery vs Tapri Chai & Mess',
        desc: `Food & Snacks account for ${formatINR(foodSpend)}. Skipping just two ₹250 late-night delivery cravings saves ₹500/week!`,
        potentialSaving: '₹1,000/mo',
        category: 'Food',
      });
    }

    // Subscriptions tip
    const unpaidSubs = bills.filter((b) => b.isSubscription && !b.isPaid);
    if (unpaidSubs.length > 0) {
      tips.push({
        icon: Zap,
        title: 'Subscription Sharing Hacks',
        desc: `You have ${unpaidSubs.length} active recurring subs (like ${unpaidSubs[0].name}). Splitting Netflix or Spotify with roommates cuts this by 50-75%.`,
        potentialSaving: '₹350/mo',
        category: 'Subscriptions',
      });
    }

    // Commute tip
    const commuteSpend = categorySpendData.find((c) => c.id === 'commute_metro')?.amount || 0;
    if (commuteSpend > 500) {
      tips.push({
        icon: Bus,
        title: 'Metro Smart Card vs Cab Surges',
        desc: `You spent ${formatINR(commuteSpend)} on travel. Using student metro card auto-topups gives a 10-20% fare discount over daily tokens and ride-hailing cabs.`,
        potentialSaving: '₹400/mo',
        category: 'Commute',
      });
    }

    // Shopping & 24hr rule tip
    tips.push({
      icon: ShoppingBag,
      title: 'The 24-Hour What-If Rule',
      desc: 'Before clicking checkout on clothes or gadgets, test it inside the What-If Simulator and wait 24 hours. Studies show 70% of impulse cart urges disappear.',
      potentialSaving: '₹1,200/mo',
      category: 'Discretionary',
    });

    return tips;
  }, [categorySpendData, bills]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              30-Day Cash Flow Forecast & Predictive Insights
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Projected balance across all 30 days based on your actual daily burn rate and scheduled bills.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs">
            <div>
              <p className="text-slate-400">Day 30 Estimated Balance</p>
              <p
                className={`text-base font-bold font-mono ${
                  metrics.projectedEndBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatINR(metrics.projectedEndBalance)}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <p className="text-slate-400">Daily Spend Pace</p>
              <p className="text-base font-bold font-mono text-white">
                {formatINR(metrics.burnRatePerDay)}/day
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shortfall Alert or Safe Runway Banner */}
      {metrics.shortfallDay ? (
        <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl p-4 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-rose-200 text-sm">
              Predicted Budget Shortfall on Day {metrics.shortfallDay}
            </h3>
            <p className="text-rose-300 mt-0.5 leading-relaxed">
              At your current daily expense rate of {formatINR(metrics.burnRatePerDay)}/day, your available cash will deplete on <strong>Day {metrics.shortfallDay}</strong> ({cycleConfig.totalDays - metrics.shortfallDay} days before the next ₹10,000 cycle starts).
              To reach Day 30 safely, reduce discretionary spending to below <strong>{formatINR(metrics.dailyAllowance)}/day</strong>.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4 flex items-start gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-emerald-200 text-sm">
              Safe Runway: Projected {formatINR(metrics.projectedEndBalance)} Surplus
            </h3>
            <p className="text-emerald-300 mt-0.5 leading-relaxed">
              Your spending discipline is on target. At current pace, all unpaid commitments will be met with healthy cushion remaining at Day 30!
            </p>
          </div>
        </div>
      )}

      {/* Primary Forecast Chart */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              30-Day Liquidity Trajectory Curve
            </h3>
            <p className="text-xs text-slate-400">
              Solid curve = Actual wallet ledger · Blue dotted = Run-rate projection · Grey line = Ideal safe pace
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Actual (D1-D{cycleConfig.currentDay})
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Projected
            </span>
          </div>
        </div>

        <div className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={forecastPoints}
              margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="day"
                stroke="#64748b"
                tickFormatter={(d) => `Day ${d}`}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                stroke="#64748b"
                tickFormatter={(v) => `₹${v}`}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '11px',
                }}
                formatter={(val: any, name: any) => [
                  val !== undefined ? `₹${Number(val).toLocaleString('en-IN')}` : 'N/A',
                  name,
                ]}
                labelFormatter={(day, payload) => {
                  const pt = forecastPoints.find((p) => p.day === Number(day));
                  return `Day ${day} (${pt?.dateStr || ''})${
                    pt?.events ? ` · ${pt.events.join(', ')}` : ''
                  }`;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

              {/* Safe ideal baseline line */}
              <Line
                type="linear"
                dataKey="safePaceBalance"
                name="Safe Linear Pace"
                stroke="#475569"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                dot={false}
              />

              {/* Projected future balance area */}
              <Area
                type="monotone"
                dataKey="projectedBalance"
                name="Projected Balance"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#projectedGradient)"
                dot={false}
              />

              {/* Actual historical balance area */}
              <Line
                type="monotone"
                dataKey="actualBalance"
                name="Actual Balance"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#10b981' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Spending Breakdown + Practical Money Saving Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Donut / List (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Expense Distribution Breakdown
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Where your ₹{metrics.totalExpenses.toLocaleString('en-IN')} has gone so far
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpendData}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {categorySpendData.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-2">
              {categorySpendData.slice(0, 4).map((cat) => {
                const pct =
                  metrics.totalExpenses > 0
                    ? ((cat.amount / metrics.totalExpenses) * 100).toFixed(0)
                    : '0';
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-950/40 border border-slate-800/40"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-slate-200 font-medium truncate max-w-[150px]">
                        {cat.name}
                      </span>
                    </div>
                    <div className="font-mono text-slate-300">
                      {formatINR(cat.amount)} ({pct}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Practical Gen Z Money-Saving Suggestions (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Actionable Money-Saving Hacks
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated from your actual spending habits to preserve your ₹10,000 budget
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {savingTips.map((tip, idx) => {
              const Icon = tip.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3.5 hover:border-slate-700/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-800/30">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-100">{tip.title}</h4>
                      <span className="font-mono text-emerald-400 font-semibold text-[11px]">
                        Save ~{tip.potentialSaving}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
