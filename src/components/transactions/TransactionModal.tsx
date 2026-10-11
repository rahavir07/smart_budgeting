import React, { useState, useEffect } from 'react';
import { Transaction, CategoryId, TransactionType } from '../../types/finance';
import { CATEGORIES_META } from '../../utils/formatters';
import { useFinance } from '../../context/FinanceContext';
import { X, Check } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialTransaction,
}) => {
  const { cycleConfig, addTransaction, editTransaction } = useFinance();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState<CategoryId>('food_chai');
  const [cycleDay, setCycleDay] = useState(cycleConfig.currentDay);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTransaction) {
      setTitle(initialTransaction.title);
      setAmount(initialTransaction.amount.toString());
      setType(initialTransaction.type);
      setCategoryId(initialTransaction.categoryId);
      setCycleDay(initialTransaction.cycleDay);
      setDate(initialTransaction.date);
      setNote(initialTransaction.note || '');
    } else {
      setTitle('');
      setAmount('');
      setType('expense');
      setCategoryId('food_chai');
      setCycleDay(cycleConfig.currentDay);
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
    }
    setError('');
  }, [initialTransaction, isOpen, cycleConfig.currentDay]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim()) {
      setError('Please provide a title or description');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0');
      return;
    }

    if (initialTransaction) {
      editTransaction(initialTransaction.id, {
        title: title.trim(),
        amount: Math.round(numAmount * 100) / 100,
        type,
        categoryId,
        cycleDay: Math.max(1, Math.min(30, Number(cycleDay))),
        date,
        note: note.trim() || undefined,
      });
    } else {
      addTransaction({
        title: title.trim(),
        amount: Math.round(numAmount * 100) / 100,
        type,
        categoryId,
        cycleDay: Math.max(1, Math.min(30, Number(cycleDay))),
        date,
        note: note.trim() || undefined,
      });
    }

    onClose();
  };

  const availableCategories = Object.values(CATEGORIES_META).filter(
    (c) => c.type === type || c.id === 'other'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-base font-bold text-white mb-4">
          {initialTransaction ? 'Edit Transaction' : 'Record New Transaction'}
        </h2>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Type Toggle: Expense / Income */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategoryId('food_chai');
              }}
              className={`py-2 rounded-md font-semibold transition-colors cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-900/50 text-rose-200 border border-rose-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategoryId('freelance_income');
              }}
              className={`py-2 rounded-md font-semibold transition-colors cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income (+)
            </button>
          </div>

          {/* Amount (₹) */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">₹</span>
              <input
                type="number"
                step="any"
                min="1"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-base focus:outline-none focus:border-blue-500"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Title / Description
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy roll, Rapido ride, Freelance payment..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value as CategoryId)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cycle Day & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Cycle Day (1-30)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={cycleDay}
                onChange={(e) => setCycleDay(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Note / Tag */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Split with Rohan, UPI ref #..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{initialTransaction ? 'Update' : 'Save Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
