import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Plus } from 'lucide-react';

interface HeaderProps {
  onOpenQuickAdd: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuickAdd }) => {
  const { activeTab, setActiveTab } = useFinance();

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'budget', label: 'Budget' },
    { id: 'simulator', label: 'What-If' },
    { id: 'goals', label: 'Goals' },
    { id: 'bills', label: 'Bills' },
    { id: 'forecast', label: 'Forecast' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 text-left"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-blue-500/20">
            ₹
          </span>
          <span className="font-extrabold tracking-tight">PaisaPilot</span>
        </button>

        {/* Zone 2: Single-line clean text nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                  isActive
                    ? 'text-blue-400 font-semibold border-b-2 border-blue-500'
                    : 'hover:text-slate-200'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-98 rounded-lg transition-all shadow-md shadow-blue-600/20 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>
    </header>
  );
};
