
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description: string;
  category: string;
  date: string; // ISO String
}

export interface DailyGroup {
  date: string; // YYYY-MM-DD
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
}

export enum AppTab {
  ADD = 'add',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  SUMMARY = 'summary',
  EXPORT = 'export',
  SETTINGS = 'settings'
}
