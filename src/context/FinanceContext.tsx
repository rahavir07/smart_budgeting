import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  CycleConfig,
  Transaction,
  Bill,
  SavingsGoal,
  CategoryBudget,
  FinancialHealthMetrics,
  DayForecastPoint,
  WhatIfSimulation,
  CategoryId,
} from '../types/finance';
import {
  INITIAL_CYCLE_CONFIG,
  INITIAL_CATEGORY_BUDGETS,
  INITIAL_BILLS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_TRANSACTIONS,
} from '../data/initialData';
import {
  calculateFinancialMetrics,
  calculateCashFlowForecast,
  simulateScenario,
} from '../utils/calculations';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface FinanceContextType {
  cycleConfig: CycleConfig;
  transactions: Transaction[];
  bills: Bill[];
  savingsGoals: SavingsGoal[];
  categoryBudgets: CategoryBudget[];
  activeTab: string;
  activeSimulation: WhatIfSimulation | null;
  metrics: FinancialHealthMetrics;
  forecastPoints: DayForecastPoint[];
  toast: Toast | null;
  
  // Actions
  setActiveTab: (tab: string) => void;
  setCurrentDay: (day: number) => void;
  updateStartingBudget: (amount: number) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addBill: (bill: Omit<Bill, 'id'>) => void;
  editBill: (id: string, updates: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  markBillAsPaid: (billId: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  editSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  depositToGoal: (goalId: string, amount: number) => boolean;
  withdrawFromGoal: (goalId: string, amount: number) => boolean;
  updateCategoryBudget: (categoryId: CategoryId, allocatedAmount: number) => void;
  setActiveSimulation: (sim: WhatIfSimulation | null) => void;
  applySimulation: (sim: WhatIfSimulation) => void;
  resetToDemo: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  hideToast: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CYCLE: 'paisapilot_cycle_v1',
  TRANSACTIONS: 'paisapilot_txs_v1',
  BILLS: 'paisapilot_bills_v1',
  SAVINGS: 'paisapilot_savings_v1',
  BUDGETS: 'paisapilot_budgets_v1',
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from LocalStorage or fall back to demo data
  const [cycleConfig, setCycleConfig] = useState<CycleConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CYCLE);
      return stored ? JSON.parse(stored) : INITIAL_CYCLE_CONFIG;
    } catch {
      return INITIAL_CYCLE_CONFIG;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BILLS);
      return stored ? JSON.parse(stored) : INITIAL_BILLS;
    } catch {
      return INITIAL_BILLS;
    }
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVINGS);
      return stored ? JSON.parse(stored) : INITIAL_SAVINGS_GOALS;
    } catch {
      return INITIAL_SAVINGS_GOALS;
    }
  });

  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      return stored ? JSON.parse(stored) : INITIAL_CATEGORY_BUDGETS;
    } catch {
      return INITIAL_CATEGORY_BUDGETS;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeSimulation, setActiveSimulation] = useState<WhatIfSimulation | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CYCLE, JSON.stringify(cycleConfig));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savingsGoals));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(categoryBudgets));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [cycleConfig, transactions, bills, savingsGoals, categoryBudgets]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  };

  const hideToast = () => setToast(null);

  // Calculate central financial metrics
  const metrics = useMemo(() => {
    return calculateFinancialMetrics(
      cycleConfig,
      transactions,
      bills,
      savingsGoals,
      categoryBudgets
    );
  }, [cycleConfig, transactions, bills, savingsGoals, categoryBudgets]);

  // Calculate 30-day forecast curves
  const forecastPoints = useMemo(() => {
    return calculateCashFlowForecast(
      cycleConfig,
      transactions,
      bills,
      savingsGoals,
      activeSimulation
    );
  }, [cycleConfig, transactions, bills, savingsGoals, activeSimulation]);

  const setCurrentDay = (day: number) => {
    const safeDay = Math.max(1, Math.min(30, Math.round(day)));
    setCycleConfig((prev) => ({ ...prev, currentDay: safeDay }));
    showToast(`Navigated to Day ${safeDay} of 30 cycle`, 'info');
  };

  const updateStartingBudget = (amount: number) => {
    const safeAmount = Math.max(100, Math.round(amount));
    setCycleConfig((prev) => ({ ...prev, startingBudget: safeAmount }));
    showToast(`Starting budget updated to ₹${safeAmount.toLocaleString('en-IN')}`, 'success');
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Added ${tx.type === 'expense' ? 'expense' : 'income'}: "${tx.title}"`, 'success');
  };

  const editTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    showToast('Transaction updated', 'success');
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaction removed', 'info');
  };

  const addBill = (bill: Omit<Bill, 'id'>) => {
    const newBill: Bill = {
      ...bill,
      id: `bill_${Date.now()}`,
    };
    setBills((prev) => [...prev, newBill]);
    showToast(`Bill "${bill.name}" created`, 'success');
  };

  const editBill = (id: string, updates: Partial<Bill>) => {
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    showToast('Bill details updated', 'success');
  };

  const deleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
    showToast('Bill removed from commitments', 'info');
  };

  /**
   * Mark as Paid:
   * Turns bill into paid status AND generates an expense transaction.
   * This cleanly transitions the obligation from "reserved unpaid bill" to "actual balance deduction"
   * with zero double-counting!
   */
  const markBillAsPaid = (billId: string) => {
    const targetBill = bills.find((b) => b.id === billId);
    if (!targetBill) return;

    if (targetBill.isPaid) {
      showToast('This bill is already marked as paid', 'info');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Mark bill as paid
    setBills((prev) =>
      prev.map((b) =>
        b.id === billId ? { ...b, isPaid: true, paidDate: todayStr } : b
      )
    );

    // 2. Add corresponding expense transaction
    const newTx: Transaction = {
      id: `tx_bill_pay_${Date.now()}`,
      title: `Paid: ${targetBill.name}`,
      amount: targetBill.amount,
      type: 'expense',
      categoryId: targetBill.category,
      date: todayStr,
      cycleDay: cycleConfig.currentDay,
      note: `Paid ${targetBill.isSubscription ? 'subscription' : 'commitment'} on Day ${cycleConfig.currentDay}`,
      isRecurringBillPayment: true,
      relatedBillId: targetBill.id,
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Paid ₹${targetBill.amount} for "${targetBill.name}"`, 'success');
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal_${Date.now()}`,
      currentAmount: 0,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
    showToast(`Goal "${goal.name}" launched!`, 'success');
  };

  const editSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
    showToast('Savings goal updated', 'success');
  };

  const deleteSavingsGoal = (id: string) => {
    // If goal has funds, they naturally return to balance!
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    showToast('Savings goal deleted and funds returned to wallet', 'info');
  };

  const depositToGoal = (goalId: string, amount: number): boolean => {
    if (amount <= 0) return false;
    if (amount > metrics.currentBalance) {
      showToast(`Cannot deposit ₹${amount}: only ₹${Math.round(metrics.currentBalance)} available in liquid balance`, 'warning');
      return false;
    }

    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
      )
    );
    showToast(`Deposited ₹${amount} into savings goal!`, 'success');
    return true;
  };

  const withdrawFromGoal = (goalId: string, amount: number): boolean => {
    const target = savingsGoals.find((g) => g.id === goalId);
    if (!target) return false;
    if (amount <= 0 || amount > target.currentAmount) {
      showToast(`Cannot withdraw: goal only has ₹${target.currentAmount}`, 'warning');
      return false;
    }

    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount - amount } : g
      )
    );
    showToast(`Withdrew ₹${amount} from goal back to wallet`, 'info');
    return true;
  };

  const updateCategoryBudget = (categoryId: CategoryId, allocatedAmount: number) => {
    setCategoryBudgets((prev) => {
      const exists = prev.some((b) => b.categoryId === categoryId);
      if (exists) {
        return prev.map((b) =>
          b.categoryId === categoryId ? { ...b, allocatedAmount } : b
        );
      }
      return [...prev, { categoryId, allocatedAmount }];
    });
    showToast('Budget allocation adjusted', 'success');
  };

  /**
   * Apply a What-If scenario to real budget data!
   * Seamlessly turns simulation into permanent ledger entries.
   */
  const applySimulation = (sim: WhatIfSimulation) => {
    if (sim.type === 'purchase' || sim.type === 'unexpected_expense') {
      const todayStr = new Date().toISOString().split('T')[0];
      const newTx: Transaction = {
        id: `tx_sim_${Date.now()}`,
        title: sim.name,
        amount: sim.amount,
        type: 'expense',
        categoryId: sim.categoryId,
        date: todayStr,
        cycleDay: sim.day,
        note: `Applied from What-If simulation: ${sim.type}`,
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast(`Decision applied: "${sim.name}" logged as expense (-₹${sim.amount})`, 'success');
    } else if (sim.type === 'extra_income') {
      const todayStr = new Date().toISOString().split('T')[0];
      const newTx: Transaction = {
        id: `tx_sim_inc_${Date.now()}`,
        title: sim.name,
        amount: sim.amount,
        type: 'income',
        categoryId: sim.categoryId,
        date: todayStr,
        cycleDay: sim.day,
        note: `Applied from What-If simulation: extra income`,
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast(`Extra income (+₹${sim.amount}) credited to balance!`, 'success');
    } else if (sim.type === 'pay_bill') {
      if (sim.billId) {
        markBillAsPaid(sim.billId);
      }
    } else if (sim.type === 'cancel_subscription') {
      if (sim.billId) {
        deleteBill(sim.billId);
        showToast(`Subscription "${sim.name}" cancelled! ₹${sim.amount} saved per cycle.`, 'success');
      }
    }

    // Clear active simulation preview
    setActiveSimulation(null);
  };

  const resetToDemo = () => {
    setCycleConfig(INITIAL_CYCLE_CONFIG);
    setTransactions(INITIAL_TRANSACTIONS);
    setBills(INITIAL_BILLS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setCategoryBudgets(INITIAL_CATEGORY_BUDGETS);
    setActiveSimulation(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.CYCLE);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.BILLS);
      localStorage.removeItem(STORAGE_KEYS.SAVINGS);
      localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    } catch (e) {
      console.warn(e);
    }
    showToast('Reset to original Gen Z ₹10,000 demo data', 'info');
  };

  return (
    <FinanceContext.Provider
      value={{
        cycleConfig,
        transactions,
        bills,
        savingsGoals,
        categoryBudgets,
        activeTab,
        activeSimulation,
        metrics,
        forecastPoints,
        toast,
        setActiveTab,
        setCurrentDay,
        updateStartingBudget,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addBill,
        editBill,
        deleteBill,
        markBillAsPaid,
        addSavingsGoal,
        editSavingsGoal,
        deleteSavingsGoal,
        depositToGoal,
        withdrawFromGoal,
        updateCategoryBudget,
        setActiveSimulation,
        applySimulation,
        resetToDemo,
        showToast,
        hideToast,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
