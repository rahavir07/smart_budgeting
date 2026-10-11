import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { CycleStatusBar } from './components/common/CycleStatusBar';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { BudgetPlannerView } from './components/budget/BudgetPlannerView';
import { WhatIfSimulatorView } from './components/whatif/WhatIfSimulatorView';
import { SavingsGoalsView } from './components/savings/SavingsGoalsView';
import { BillsSubscriptionsView } from './components/bills/BillsSubscriptionsView';
import { ForecastInsightsView } from './components/forecast/ForecastInsightsView';
import { TransactionModal } from './components/transactions/TransactionModal';
import { CycleSettingsModal } from './components/common/CycleSettingsModal';
import { ToastNotification } from './components/common/ToastNotification';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useFinance();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 flex flex-col font-sans pb-20 lg:pb-8">
      {/* 3-Zone Top Navigation Bar */}
      <Header onOpenQuickAdd={() => setQuickAddOpen(true)} />

      {/* Main Viewport Container (1440px max width baseline) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sprint Status & Day Progression Stepper */}
        <CycleStatusBar onOpenSettings={() => setSettingsOpen(true)} />

        {/* Dynamic View Display */}
        {activeTab === 'dashboard' && (
          <DashboardView onOpenQuickAdd={() => setQuickAddOpen(true)} />
        )}
        {activeTab === 'transactions' && <TransactionsView />}
        {activeTab === 'budget' && <BudgetPlannerView />}
        {activeTab === 'simulator' && <WhatIfSimulatorView />}
        {activeTab === 'goals' && <SavingsGoalsView />}
        {activeTab === 'bills' && <BillsSubscriptionsView />}
        {activeTab === 'forecast' && <ForecastInsightsView />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 px-4 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            PaisaPilot · Gen Z 30-Day ₹10,000 Budget Navigator
          </p>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setActiveTab('simulator')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              What-If Simulator
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('forecast')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              30-Day Forecast
            </button>
            <span>·</span>
            <button
              onClick={() => setSettingsOpen(true)}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Cycle Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />

      {/* Sprint / Budget Settings Modal */}
      <CycleSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Global Toast Alerts */}
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
