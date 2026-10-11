export type TransactionType = 'expense' | 'income';

export type CategoryId =
  | 'food_chai'
  | 'rent_hostel'
  | 'groceries'
  | 'commute_metro'
  | 'subscriptions'
  | 'shopping_thrift'
  | 'entertainment'
  | 'courses_books'
  | 'health_personal'
  | 'freelance_income'
  | 'allowance_income'
  | 'other';

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  icon: string;
  type: TransactionType;
  color: string; // Tailwind hex color
  bgColor: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: CategoryId;
  date: string; // ISO date 'YYYY-MM-DD'
  cycleDay: number; // 1 to 30
  note?: string;
  isRecurringBillPayment?: boolean;
  relatedBillId?: string;
}

export interface CategoryBudget {
  categoryId: CategoryId;
  allocatedAmount: number;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1 to 30 in the cycle
  category: CategoryId;
  isPaid: boolean;
  paidDate?: string;
  isSubscription: boolean;
  provider?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadlineDay: number; // day 1 to 30 or beyond
  categoryIcon: string;
  color: string;
}

export interface CycleConfig {
  startingBudget: number; // default ₹10,000
  totalDays: number; // 30
  currentDay: number; // 1 to 30
  startDate: string; // ISO date string
}

export interface WhatIfSimulation {
  type: 'purchase' | 'unexpected_expense' | 'extra_income' | 'pay_bill' | 'cancel_subscription';
  name: string;
  amount: number;
  categoryId: CategoryId;
  day: number;
  billId?: string;
}

export interface FinancialHealthMetrics {
  startingBudget: number;
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  unpaidBillsTotal: number;
  safeToSpend: number;
  totalSavedInGoals: number;
  daysRemaining: number;
  currentDay: number;
  totalDays: number;
  dailyAllowance: number;
  burnRatePerDay: number;
  budgetedExpensesTotal: number;
  projectedEndBalance: number;
  healthScore: number; // 0 - 100
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Risk';
  riskDescription: string;
  shortfallDay: number | null; // e.g. Day 24 if balance projected to run out, else null
  savingsRatePercent: number;
  budgetUtilizationPercent: number;
}

export interface DayForecastPoint {
  day: number;
  dateStr: string;
  actualBalance?: number;
  projectedBalance: number;
  safePaceBalance: number;
  simulatedBalance?: number;
  isPastOrToday: boolean;
  events?: string[];
}
