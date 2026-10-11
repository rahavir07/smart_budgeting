import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Bill, CategoryId } from '../../types/finance';
import { formatINR, CATEGORIES_META } from '../../utils/formatters';
import {
  CalendarCheck,
  Plus,
  CheckCircle,
  Clock,
  Pencil,
  Trash2,
  Tv,
  Zap,
  ShieldAlert,
  X,
  Check,
} from 'lucide-react';

export const BillsSubscriptionsView: React.FC = () => {
  const { bills, cycleConfig, metrics, markBillAsPaid, addBill, editBill, deleteBill, showToast } =
    useFinance();

  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState(cycleConfig.currentDay + 3);
  const [category, setCategory] = useState<CategoryId>('subscriptions');
  const [isSubscription, setIsSubscription] = useState(true);
  const [provider, setProvider] = useState('');

  const unpaidBills = bills.filter((b) => !b.isPaid);
  const paidBills = bills.filter((b) => b.isPaid);

  const displayedBills = bills.filter((b) => {
    if (filter === 'unpaid') return !b.isPaid;
    if (filter === 'paid') return b.isPaid;
    return true;
  });

  const openCreateModal = () => {
    setEditingBill(null);
    setName('');
    setAmount('');
    setDueDay(Math.min(30, cycleConfig.currentDay + 2));
    setCategory('subscriptions');
    setIsSubscription(true);
    setProvider('');
    setModalOpen(true);
  };

  const openEditModal = (bill: Bill) => {
    setEditingBill(bill);
    setName(bill.name);
    setAmount(bill.amount.toString());
    setDueDay(bill.dueDay);
    setCategory(bill.category);
    setIsSubscription(bill.isSubscription);
    setProvider(bill.provider || '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!name.trim()) {
      showToast('Please enter a bill or subscription name', 'warning');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Please enter a valid amount', 'warning');
      return;
    }

    if (editingBill) {
      editBill(editingBill.id, {
        name: name.trim(),
        amount: Math.round(numAmount),
        dueDay: Math.max(1, Math.min(30, Number(dueDay))),
        category,
        isSubscription,
        provider: provider.trim() || undefined,
      });
    } else {
      addBill({
        name: name.trim(),
        amount: Math.round(numAmount),
        dueDay: Math.max(1, Math.min(30, Number(dueDay))),
        category,
        isPaid: false,
        isSubscription,
        provider: provider.trim() || undefined,
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-amber-400" />
              Bills & Subscriptions Tracker
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Never miss a due date. Unpaid bills are automatically reserved and protected from your Safe-to-Spend allowance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-right">
              <span className="text-slate-400 block">Total Unpaid Reserved:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {formatINR(metrics.unpaidBillsTotal)}
              </span>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors cursor-pointer shadow-md shadow-amber-950/40"
            >
              <Plus className="w-4 h-4" />
              <span>Add Commitment</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Commitments ({bills.length})
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filter === 'unpaid'
                ? 'bg-amber-950 text-amber-300 font-semibold border border-amber-800/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending / Reserved ({unpaidBills.length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filter === 'paid'
                ? 'bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Paid ({paidBills.length})
          </button>
        </div>
      </div>

      {/* Bills Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedBills.map((bill) => {
          const isOverdue = !bill.isPaid && bill.dueDay < cycleConfig.currentDay;
          const isDueToday = !bill.isPaid && bill.dueDay === cycleConfig.currentDay;

          return (
            <div
              key={bill.id}
              className={`bg-slate-900/60 border rounded-xl p-5 flex flex-col justify-between group transition-colors ${
                isOverdue
                  ? 'border-rose-700/60 bg-rose-950/10'
                  : isDueToday
                  ? 'border-amber-500/60'
                  : bill.isPaid
                  ? 'border-slate-800/60 opacity-80'
                  : 'border-slate-800/80'
              }`}
            >
              <div>
                {/* Header: Title and Status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        bill.isSubscription ? 'bg-indigo-950 text-indigo-400' : 'bg-amber-950 text-amber-400'
                      }`}
                    >
                      {bill.isSubscription ? <Tv className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm truncate max-w-[170px]">
                        {bill.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {bill.provider || (bill.isSubscription ? 'Subscription' : 'Recurring Bill')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(bill)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBill(bill.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount and Timing */}
                <div className="my-3 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
                      {formatINR(bill.amount)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Due Day {bill.dueDay}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    {bill.isPaid ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Paid {bill.paidDate ? `on ${bill.paidDate}` : 'this sprint'}
                      </span>
                    ) : isOverdue ? (
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Overdue by {cycleConfig.currentDay - bill.dueDay} days
                      </span>
                    ) : isDueToday ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Due Today!
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Due in {bill.dueDay - cycleConfig.currentDay} days
                      </span>
                    )}

                    <span className="text-slate-400">
                      {bill.isSubscription ? 'Monthly Auto' : 'Manual Payment'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                {!bill.isPaid ? (
                  <button
                    onClick={() => markBillAsPaid(bill.id)}
                    className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark as Paid (Records Expense)</span>
                  </button>
                ) : (
                  <div className="w-full py-1.5 text-center text-xs text-slate-500 bg-slate-950 rounded-lg">
                    Payment recorded in Ledger
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {displayedBills.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-3">
            <CalendarCheck className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-white">No bills match filter</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your room WiFi, mobile plan, Netflix, or hostel fees so PaisaPilot locks the funds safely.
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg cursor-pointer"
            >
              Add Your First Commitment
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Bill Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl relative text-xs">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-4">
              {editingBill ? 'Edit Commitment' : 'Add Bill / Subscription'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Bill Name / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jio 5G Recharge, Hostel WiFi, Netflix Screen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 299"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Due Day in Cycle (1-30)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={dueDay}
                    onChange={(e) => setDueDay(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Provider / Platform
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Airtel, Netflix, PG"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isSub"
                  checked={isSubscription}
                  onChange={(e) => setIsSubscription(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isSub" className="text-slate-300 cursor-pointer">
                  This is a recurring monthly subscription (OTT, Mobile, WiFi)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Save Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
