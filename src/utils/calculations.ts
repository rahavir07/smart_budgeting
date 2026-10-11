import {
  Transaction,
  Bill,
  SavingsGoal,
  CategoryBudget,
  CycleConfig,
  FinancialHealthMetrics,
  DayForecastPoint,
  WhatIfSimulation,
} from '../types/finance';

/**
 * Shared central financial calculation engine.
 * Guarantees zero double-counting across transactions, unpaid bills, and savings.
 */
export function calculateFinancialMetrics(
  config: CycleConfig,
  transactions: Transaction[],
  bills: Bill[],
  savingsGoals: SavingsGoal[],
  categoryBudgets: CategoryBudget[]
): FinancialHealthMetrics {
  const { startingBudget, totalDays, currentDay } = config;

  // 1. Total Income
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // 2. Total Expenses logged so far in transactions
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // 3. Total Money stored in Savings Goals
  const totalSavedInGoals = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

  // 4. Current Liquid Balance in wallet/bank
  // Starting Budget + Income - Expenses - Money deposited in savings goals
  const currentBalance = startingBudget + totalIncome - totalExpenses - totalSavedInGoals;

  // 5. Unpaid Bills (money that MUST be reserved and not spent)
  const unpaidBillsTotal = bills
    .filter((b) => !b.isPaid)
    .reduce((sum, b) => sum + b.amount, 0);

  // 6. Safe to Spend: money you can actually spend on discretionary needs
  const safeToSpend = Math.max(0, currentBalance - unpaidBillsTotal);

  // 7. Days Remaining (inclusive of current day)
  const daysRemaining = Math.max(1, totalDays - currentDay + 1);

  // 8. Daily Allowance for remaining days
  const dailyAllowance = safeToSpend / daysRemaining;

  // 9. Actual Burn Rate per day so far
  const elapsedDays = Math.max(1, currentDay);
  const burnRatePerDay = totalExpenses / elapsedDays;

  // 10. Budgeted expenses total
  const budgetedExpensesTotal = categoryBudgets.reduce((sum, b) => sum + b.allocatedAmount, 0);

  // 11. 30-Day Projected End Balance at current burn rate + future unpaid bills
  const remainingFutureDays = Math.max(0, totalDays - currentDay);
  const projectedFutureDiscretionarySpend = burnRatePerDay * remainingFutureDays;
  const projectedEndBalance = currentBalance - unpaidBillsTotal - projectedFutureDiscretionarySpend;

  // 12. Shortfall detection
  let shortfallDay: number | null = null;
  if (burnRatePerDay > dailyAllowance && burnRatePerDay > 0) {
    const daysUntilZero = Math.floor(safeToSpend / burnRatePerDay);
    const calculatedDay = currentDay + daysUntilZero;
    if (calculatedDay <= totalDays) {
      shortfallDay = calculatedDay;
    }
  }

  // 13. Category budget compliance
  let overspentCategoriesCount = 0;
  categoryBudgets.forEach((catBudget) => {
    const spentInCat = transactions
      .filter((t) => t.type === 'expense' && t.categoryId === catBudget.categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
    if (spentInCat > catBudget.allocatedAmount) {
      overspentCategoriesCount++;
    }
  });

  // 14. Savings Rate
  const totalInflow = startingBudget + totalIncome;
  const savingsRatePercent = totalInflow > 0 ? (totalSavedInGoals / totalInflow) * 100 : 0;
  const budgetUtilizationPercent =
    startingBudget > 0 ? (totalExpenses / startingBudget) * 100 : 0;

  // 15. Financial Health Score (0 - 100)
  // Components:
  // - Bills Coverage (up to 30 pts): Does balance easily cover upcoming unpaid bills?
  // - Burn Rate Pace (up to 30 pts): Is actual daily burn <= daily allowance?
  // - Budget Adherence (up to 25 pts): Are categories within allocated limits?
  // - Savings Progress (up to 15 pts): Are savings goals funded?
  let billsScore = 30;
  if (unpaidBillsTotal > 0) {
    if (currentBalance < unpaidBillsTotal) {
      billsScore = Math.max(0, (currentBalance / unpaidBillsTotal) * 20);
    } else {
      const coverageRatio = (currentBalance - unpaidBillsTotal) / unpaidBillsTotal;
      billsScore = Math.min(30, 20 + coverageRatio * 10);
    }
  }

  let burnScore = 30;
  if (dailyAllowance <= 0) {
    burnScore = 0;
  } else {
    const burnRatio = burnRatePerDay / (dailyAllowance || 1);
    if (burnRatio <= 1.0) {
      burnScore = 30;
    } else if (burnRatio <= 1.3) {
      burnScore = 20;
    } else if (burnRatio <= 1.7) {
      burnScore = 10;
    } else {
      burnScore = 4;
    }
  }

  let budgetScore = 25;
  if (overspentCategoriesCount > 0) {
    budgetScore = Math.max(0, 25 - overspentCategoriesCount * 8);
  }

  let savingsScore = Math.min(15, Math.round((savingsRatePercent / 10) * 15));

  const rawScore = Math.round(billsScore + burnScore + budgetScore + savingsScore);
  const healthScore = Math.max(5, Math.min(100, rawScore));

  // Risk Level determination
  let riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Risk';
  let riskDescription: string;

  if (healthScore >= 75) {
    riskLevel = 'Low Risk';
    riskDescription = 'Strong financial cushion. Spending is disciplined and bills are fully secured.';
  } else if (healthScore >= 55) {
    riskLevel = 'Moderate Risk';
    riskDescription = 'Decent shape, but keep daily discretionary spend under ₹' + Math.round(dailyAllowance) + ' to avoid a mid-month squeeze.';
  } else if (healthScore >= 35) {
    riskLevel = 'High Risk';
    riskDescription = 'Tight margin! At your current spend pace, you may exhaust funds around Day ' + (shortfallDay || 26) + '.';
  } else {
    riskLevel = 'Critical Risk';
    riskDescription = 'Deficit alert! Unpaid commitments exceed safe limits. Immediate spending pause recommended.';
  }

  return {
    startingBudget,
    totalIncome,
    totalExpenses,
    currentBalance,
    unpaidBillsTotal,
    safeToSpend,
    totalSavedInGoals,
    daysRemaining,
    currentDay,
    totalDays,
    dailyAllowance,
    burnRatePerDay,
    budgetedExpensesTotal,
    projectedEndBalance,
    healthScore,
    riskLevel,
    riskDescription,
    shortfallDay,
    savingsRatePercent,
    budgetUtilizationPercent,
  };
}

/**
 * Calculates 30-day forecast curves:
 * - Actual balance curve for days <= currentDay
 * - Projected balance for remaining days
 * - Safe pace curve (ideal steady spend)
 * - Optional simulation curve
 */
export function calculateCashFlowForecast(
  config: CycleConfig,
  transactions: Transaction[],
  bills: Bill[],
  savingsGoals: SavingsGoal[],
  simulation?: WhatIfSimulation | null
): DayForecastPoint[] {
  const { startingBudget, totalDays, currentDay, startDate } = config;
  const baseDate = new Date(startDate);

  // Group transactions by cycleDay
  const expensesByDay = new Map<number, number>();
  const incomeByDay = new Map<number, number>();

  transactions.forEach((t) => {
    if (t.type === 'expense') {
      expensesByDay.set(t.cycleDay, (expensesByDay.get(t.cycleDay) || 0) + t.amount);
    } else {
      incomeByDay.set(t.cycleDay, (incomeByDay.get(t.cycleDay) || 0) + t.amount);
    }
  });

  // Calculate actual daily cumulative balance
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

  // Calculate burn rate based on actual expenses up to currentDay
  const expensesUpToNow = transactions
    .filter((t) => t.type === 'expense' && t.cycleDay <= currentDay)
    .reduce((sum, t) => sum + t.amount, 0);
  const avgDailyBurn = expensesUpToNow / Math.max(1, currentDay);

  // Identify unpaid bills and their due days
  const futureUnpaidBillsByDay = new Map<number, number>();
  bills.forEach((b) => {
    if (!b.isPaid && b.dueDay >= currentDay) {
      futureUnpaidBillsByDay.set(b.dueDay, (futureUnpaidBillsByDay.get(b.dueDay) || 0) + b.amount);
    }
  });

  // Safe pace: from starting budget down to safety buffer over 30 days
  const idealDailySpend = startingBudget / totalDays;

  const points: DayForecastPoint[] = [];

  let runningActualBalance = startingBudget - totalSaved;
  let runningProjectedBalance = startingBudget - totalSaved;
  let runningSimulatedBalance = startingBudget - totalSaved;

  // Simulation adjustments
  let simDeltaIncome = 0;
  let simDeltaExpense = 0;
  let simDay = simulation?.day || currentDay;

  if (simulation) {
    if (simulation.type === 'extra_income') {
      simDeltaIncome = simulation.amount;
    } else if (
      simulation.type === 'purchase' ||
      simulation.type === 'unexpected_expense' ||
      simulation.type === 'pay_bill'
    ) {
      simDeltaExpense = simulation.amount;
    } else if (simulation.type === 'cancel_subscription') {
      // savings of recurring bill
      simDeltaExpense = -simulation.amount;
    }
  }

  for (let day = 1; day <= totalDays; day++) {
    const pointDate = new Date(baseDate);
    pointDate.setDate(baseDate.getDate() + (day - 1));
    const dateStr = pointDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    // Actual day changes
    const dayInc = incomeByDay.get(day) || 0;
    const dayExp = expensesByDay.get(day) || 0;

    if (day <= currentDay) {
      runningActualBalance = runningActualBalance + dayInc - dayExp;
      runningProjectedBalance = runningActualBalance;
    } else {
      // Future projection: deduct average burn rate plus scheduled unpaid bills
      const scheduledBill = futureUnpaidBillsByDay.get(day) || 0;
      runningProjectedBalance = Math.max(
        -2000,
        runningProjectedBalance - avgDailyBurn - scheduledBill
      );
    }

    // Safe pace target line
    const safePaceBalance = Math.max(0, startingBudget - idealDailySpend * day);

    // Simulated trajectory
    if (day < simDay) {
      runningSimulatedBalance = day <= currentDay ? runningActualBalance : runningProjectedBalance;
    } else if (day === simDay) {
      const baseForSim = day <= currentDay ? runningActualBalance : runningProjectedBalance;
      runningSimulatedBalance = baseForSim + simDeltaIncome - simDeltaExpense;
    } else {
      // After simulation day
      const scheduledBill = futureUnpaidBillsByDay.get(day) || 0;
      runningSimulatedBalance = Math.max(
        -2000,
        runningSimulatedBalance - avgDailyBurn - scheduledBill
      );
    }

    // Collect day events (bills, milestones)
    const events: string[] = [];
    bills.forEach((b) => {
      if (b.dueDay === day) {
        events.push(`${b.name} (₹${b.amount})`);
      }
    });

    points.push({
      day,
      dateStr,
      actualBalance: day <= currentDay ? Math.round(runningActualBalance) : undefined,
      projectedBalance: Math.round(runningProjectedBalance),
      safePaceBalance: Math.round(safePaceBalance),
      simulatedBalance: simulation ? Math.round(runningSimulatedBalance) : undefined,
      isPastOrToday: day <= currentDay,
      events: events.length > 0 ? events : undefined,
    });
  }

  return points;
}

/**
 * Simulates a What-If scenario against current state WITHOUT mutating source state.
 * Returns both the 'before' metrics and the 'after' metrics for crystal-clear side-by-side comparison.
 */
export function simulateScenario(
  config: CycleConfig,
  transactions: Transaction[],
  bills: Bill[],
  savingsGoals: SavingsGoal[],
  categoryBudgets: CategoryBudget[],
  scenario: WhatIfSimulation
): {
  before: FinancialHealthMetrics;
  after: FinancialHealthMetrics;
  balanceDelta: number;
  dailyAllowanceDelta: number;
  safeToSpendDelta: number;
  healthScoreDelta: number;
} {
  const before = calculateFinancialMetrics(
    config,
    transactions,
    bills,
    savingsGoals,
    categoryBudgets
  );

  // Clone state for simulation
  let simulatedTransactions = [...transactions];
  let simulatedBills = [...bills];
  let simulatedSavingsGoals = [...savingsGoals];

  if (scenario.type === 'purchase' || scenario.type === 'unexpected_expense') {
    simulatedTransactions.push({
      id: 'sim_purchase',
      title: scenario.name,
      amount: scenario.amount,
      type: 'expense',
      categoryId: scenario.categoryId,
      date: new Date().toISOString().split('T')[0],
      cycleDay: scenario.day,
    });
  } else if (scenario.type === 'extra_income') {
    simulatedTransactions.push({
      id: 'sim_income',
      title: scenario.name,
      amount: scenario.amount,
      type: 'income',
      categoryId: scenario.categoryId,
      date: new Date().toISOString().split('T')[0],
      cycleDay: scenario.day,
    });
  } else if (scenario.type === 'pay_bill') {
    // If user simulates paying an unpaid bill early:
    // It marks the bill as paid (removes from unpaidBillsTotal) AND adds an expense transaction
    simulatedBills = simulatedBills.map((b) =>
      b.id === scenario.billId ? { ...b, isPaid: true } : b
    );
    simulatedTransactions.push({
      id: 'sim_bill_payment',
      title: `Paid: ${scenario.name}`,
      amount: scenario.amount,
      type: 'expense',
      categoryId: scenario.categoryId,
      date: new Date().toISOString().split('T')[0],
      cycleDay: scenario.day,
      relatedBillId: scenario.billId,
    });
  } else if (scenario.type === 'cancel_subscription') {
    // If canceling an unpaid subscription: removes it from unpaid bills!
    simulatedBills = simulatedBills.filter((b) => b.id !== scenario.billId);
  }

  const after = calculateFinancialMetrics(
    config,
    simulatedTransactions,
    simulatedBills,
    simulatedSavingsGoals,
    categoryBudgets
  );

  return {
    before,
    after,
    balanceDelta: after.currentBalance - before.currentBalance,
    dailyAllowanceDelta: after.dailyAllowance - before.dailyAllowance,
    safeToSpendDelta: after.safeToSpend - before.safeToSpend,
    healthScoreDelta: after.healthScore - before.healthScore,
  };
}
