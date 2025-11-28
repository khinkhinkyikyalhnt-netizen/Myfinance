
import { Coffee, ShoppingCart, Home, Car, Zap, Coins, Briefcase, Heart, PlusCircle, MinusCircle, Banknote, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Housing',
  'Transportation',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Other'
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Gift',
  'Other'
];

export const CATEGORY_ICONS: Record<string, any> = {
  'Food & Dining': Coffee,
  'Shopping': ShoppingCart,
  'Housing': Home,
  'Transportation': Car,
  'Utilities': Zap,
  'Healthcare': Heart,
  'Entertainment': ShoppingCart,
  'Salary': Briefcase,
  'Freelance': Banknote,
  'Investments': Wallet,
  'Gift': Heart,
  'Other': Coins
};
