import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, CategoryId, TransactionType } from '../../types/finance';
import { formatINR, getCategoryMeta, CATEGORIES_META } from '../../utils/formatters';
import { TransactionModal } from './TransactionModal';
import {
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Pencil,
  Trash2,
  SlidersHorizontal,
  Calendar,
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const { transactions, deleteTransaction } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | CategoryId>('all');
  const [sortBy, setSortBy] = useState<'day_desc' | 'day_asc' | 'amount_desc' | 'amount_asc'>('day_desc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Type filter
        if (selectedType !== 'all' && t.type !== selectedType) return false;
        // Category filter
        if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchNote = t.note?.toLowerCase().includes(q);
          const matchCategory = getCategoryMeta(t.categoryId).name.toLowerCase().includes(q);
          if (!matchTitle && !matchNote && !matchCategory) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'day_desc') {
          return b.cycleDay - a.cycleDay || b.id.localeCompare(a.id);
        }
        if (sortBy === 'day_asc') {
          return a.cycleDay - b.cycleDay || a.id.localeCompare(b.id);
        }
        if (sortBy === 'amount_desc') {
          return b.amount - a.amount;
        }
        return a.amount - b.amount;
      });
  }, [transactions, selectedType, selectedCategory, searchQuery, sortBy]);

  // Aggregates for filtered view
  const filteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Filter Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">Transactions Ledger</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track, categorize and manage all money movements in your ₹10,000 sprint
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Search & Select Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, category, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Type selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setSelectedType('all')}
              className={`flex-1 py-1 rounded text-center transition-colors cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`flex-1 py-1 rounded text-center transition-colors cursor-pointer ${
                selectedType === 'expense'
                  ? 'bg-rose-950 text-rose-300 font-medium border border-rose-800/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`flex-1 py-1 rounded text-center transition-colors cursor-pointer ${
                selectedType === 'income'
                  ? 'bg-emerald-950 text-emerald-300 font-medium border border-emerald-800/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          {/* Category dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.values(CATEGORIES_META).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="day_desc">Cycle Day (Newest first)</option>
              <option value="day_asc">Cycle Day (Oldest first)</option>
              <option value="amount_desc">Amount (Highest first)</option>
              <option value="amount_asc">Amount (Lowest first)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80 text-xs">
          <div className="text-slate-400">
            Showing <span className="font-mono text-white font-semibold">{filteredTransactions.length}</span> records
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="text-emerald-400">
              Inflow: {formatINR(filteredIncome)}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-rose-400">
              Outflow: {formatINR(filteredExpense)}
            </span>
            <span className="text-slate-600">|</span>
            <span className={filteredIncome - filteredExpense >= 0 ? 'text-blue-400' : 'text-amber-400'}>
              Net: {formatINR(filteredIncome - filteredExpense, true)}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions List / Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-slate-800/60">
            {filteredTransactions.map((tx) => {
              const catMeta = getCategoryMeta(tx.categoryId);
              return (
                <div
                  key={tx.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors group text-xs"
                >
                  {/* Left: Category Icon & Title */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-white/5"
                      style={{ backgroundColor: catMeta.bgColor, color: catMeta.color }}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-100 truncate text-sm">
                          {tx.title}
                        </p>
                        {tx.isRecurringBillPayment && (
                          <span className="text-[10px] text-blue-400 font-mono">
                            [Bill Paid]
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs mt-0.5">
                        <span style={{ color: catMeta.color }}>{catMeta.name}</span>
                        <span>·</span>
                        <span className="font-mono text-slate-300">Day {tx.cycleDay}</span>
                        <span>·</span>
                        <span className="font-mono">{tx.date}</span>
                        {tx.note && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[180px] text-slate-400 italic">
                              "{tx.note}"
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Action Buttons */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div
                        className={`font-mono font-bold text-sm tabular-nums ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {formatINR(tx.amount, true)}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase">
                        {tx.type}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(tx)}
                        className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Edit transaction"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTransactionToDelete(tx.id)}
                        className="p-1.5 rounded-md hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No transactions match your filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search query, selecting "All Categories", or clear the filter to view your full ledger.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedCategory('all');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-slate-800/80 rounded-lg cursor-pointer transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 text-xs">
            <h3 className="text-base font-bold text-white mb-2">Delete Transaction?</h3>
            <p className="text-slate-300 mb-4">
              This will remove the transaction and update your current balance and daily allowance. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setTransactionToDelete(null)}
                className="px-3 py-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteTransaction(transactionToDelete);
                  setTransactionToDelete(null);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Add / Edit */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTransaction={editingTransaction}
      />
    </div>
  );
};
