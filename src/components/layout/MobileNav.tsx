import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Sparkles,
  Target,
  CalendarCheck,
  TrendingUp,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useFinance();

  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'Ledger', icon: ReceiptText },
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'simulator', label: 'What-If', icon: Sparkles },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'bills', label: 'Bills', icon: CalendarCheck },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center p-1.5 min-w-[48px] rounded-lg transition-colors cursor-pointer ${
              isActive ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] tracking-tight whitespace-nowrap">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
