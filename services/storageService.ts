import { Transaction } from '../types';

const STORAGE_KEY = 'finance_flow_transactions';

export const getTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load transactions", error);
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error("Failed to save transactions", error);
  }
};

export const addTransaction = (transaction: Transaction): Transaction[] => {
  const current = getTransactions();
  const updated = [transaction, ...current];
  saveTransactions(updated);
  return updated;
};

export const updateTransaction = (updatedTx: Transaction): Transaction[] => {
  const current = getTransactions();
  const updated = current.map(tx => tx.id === updatedTx.id ? updatedTx : tx);
  saveTransactions(updated);
  return updated;
};

export const deleteTransaction = (id: string): Transaction[] => {
  const current = getTransactions();
  const updated = current.filter(tx => tx.id !== id);
  saveTransactions(updated);
  return updated;
};
