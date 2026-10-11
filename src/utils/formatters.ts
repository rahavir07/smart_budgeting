import { CategoryId, CategoryMeta } from '../types/finance';

/**
 * Format numbers in the Indian numbering system: ₹10,000, ₹1,50,000, etc.
 */
export function formatINR(amount: number, showSign = false): string {
  const rounded = Math.round(amount * 100) / 100;
  const isNegative = rounded < 0;
  const absAmount = Math.abs(rounded);

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: absAmount % 1 === 0 ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(absAmount);

  if (isNegative) {
    return `-${formatted}`;
  }
  if (showSign && rounded > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

export function formatINRCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}₹${abs}`;
}

export const CATEGORIES_META: Record<CategoryId, CategoryMeta> = {
  food_chai: {
    id: 'food_chai',
    name: 'Food, Snacks & Chai',
    icon: 'Utensils',
    type: 'expense',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
  },
  rent_hostel: {
    id: 'rent_hostel',
    name: 'Rent & PG/Hostel',
    icon: 'Home',
    type: 'expense',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
  },
  groceries: {
    id: 'groceries',
    name: 'Blinkit, Zepto & Groceries',
    icon: 'ShoppingBag',
    type: 'expense',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
  commute_metro: {
    id: 'commute_metro',
    name: 'Metro, Uber & Rapido',
    icon: 'Car',
    type: 'expense',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.15)',
  },
  subscriptions: {
    id: 'subscriptions',
    name: 'Spotify, OTT & Subs',
    icon: 'Tv',
    type: 'expense',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
  },
  shopping_thrift: {
    id: 'shopping_thrift',
    name: 'Thrift & Online Shopping',
    icon: 'Sparkles',
    type: 'expense',
    color: '#f43f5e',
    bgColor: 'rgba(244, 63, 94, 0.15)',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Movies, Gaming & Outing',
    icon: 'Gamepad2',
    type: 'expense',
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.15)',
  },
  courses_books: {
    id: 'courses_books',
    name: 'Courses, Books & Certs',
    icon: 'BookOpen',
    type: 'expense',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
  },
  health_personal: {
    id: 'health_personal',
    name: 'Meds, Gym & Self Care',
    icon: 'HeartPulse',
    type: 'expense',
    color: '#14b8a6',
    bgColor: 'rgba(20, 184, 166, 0.15)',
  },
  freelance_income: {
    id: 'freelance_income',
    name: 'Freelance & Side Hustles',
    icon: 'Briefcase',
    type: 'income',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.15)',
  },
  allowance_income: {
    id: 'allowance_income',
    name: 'Monthly Allowance / Stipend',
    icon: 'Wallet',
    type: 'income',
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.15)',
  },
  other: {
    id: 'other',
    name: 'Miscellaneous / Other',
    icon: 'Layers',
    type: 'expense',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.15)',
  },
};

export function getCategoryMeta(id: CategoryId): CategoryMeta {
  return CATEGORIES_META[id] || CATEGORIES_META.other;
}
