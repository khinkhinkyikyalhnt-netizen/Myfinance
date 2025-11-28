import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Transaction, DailyGroup } from '../types';
import { CATEGORY_ICONS } from '../constants';
import { PasswordModal } from './PasswordModal';

interface DailyViewProps {
  transactions: Transaction[];
  onUpdate: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export const DailyView: React.FC<DailyViewProps> = ({ transactions, onUpdate, onDelete }) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete', id: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit form state
  const [editAmount, setEditAmount] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Group transactions by day
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, DailyGroup> = {};
    
    transactions.forEach(tx => {
      const dateKey = format(new Date(tx.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          transactions: [],
          totalIncome: 0,
          totalExpense: 0
        };
      }
      groups[dateKey].transactions.push(tx);
      if (tx.type === 'income') groups[dateKey].totalIncome += tx.amount;
      else groups[dateKey].totalExpense += tx.amount;
    });

    // Sort days descending
    return Object.values(groups).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const handleActionRequest = (type: 'edit' | 'delete', id: string) => {
    setPendingAction({ type, id });
    setAuthModalOpen(true);
  };

  const onAuthSuccess = () => {
    if (!pendingAction) return;
    
    if (pendingAction.type === 'delete') {
      onDelete(pendingAction.id);
    } else if (pendingAction.type === 'edit') {
      const tx = transactions.find(t => t.id === pendingAction.id);
      if (tx) {
        setEditingId(pendingAction.id);
        setEditAmount(tx.amount.toString());
        setEditDesc(tx.description);
      }
    }
    setPendingAction(null);
  };

  const saveEdit = (id: string) => {
    const original = transactions.find(t => t.id === id);
    if (!original) return;
    
    onUpdate({
      ...original,
      amount: parseFloat(editAmount),
      description: editDesc
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 pb-20">
      <PasswordModal 
        isOpen={authModalOpen} 
        onClose={() => { setAuthModalOpen(false); setPendingAction(null); }}
        onSuccess={onAuthSuccess}
      />

      {groupedTransactions.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p>No transactions found.</p>
          <p className="text-sm">Go to "Add" to start tracking.</p>
        </div>
      )}

      {groupedTransactions.map(group => (
        <div key={group.date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-100">
            <h3 className="font-semibold text-gray-700">
              {format(new Date(group.date), 'EEEE, MMM do, yyyy')}
            </h3>
            <div className="flex gap-3 text-sm">
              <span className="text-green-600 font-medium">+AED {group.totalIncome.toFixed(2)}</span>
              <span className="text-red-500 font-medium">-AED {group.totalExpense.toFixed(2)}</span>
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-gray-50">
            {group.transactions.map(tx => {
              const Icon = CATEGORY_ICONS[tx.category] || CATEGORY_ICONS['Other'];
              const isEditing = editingId === tx.id;

              return (
                <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors group">
                  {isEditing ? (
                    <div className="flex flex-col gap-3 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                       <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">AED</span>
                          <input 
                            type="number" 
                            value={editAmount} 
                            onChange={e => setEditAmount(e.target.value)}
                            className="w-full pl-10 p-2 border rounded"
                          />
                       </div>
                       <input 
                         type="text" 
                         value={editDesc} 
                         onChange={e => setEditDesc(e.target.value)}
                         className="p-2 border rounded"
                       />
                       <div className="flex justify-end gap-2">
                         <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs font-bold text-gray-500">Cancel</button>
                         <button onClick={() => saveEdit(tx.id)} className="px-3 py-1 text-xs font-bold bg-indigo-600 text-white rounded">Save</button>
                       </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                           {tx.type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{tx.category}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{format(new Date(tx.date), 'HH:mm')}</span>
                            <span>•</span>
                            <span className="truncate max-w-[150px]">{tx.description}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'income' ? '+' : '-'} AED {tx.amount.toFixed(2)}
                        </span>
                        
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleActionRequest('edit', tx.id)}
                            className="text-gray-400 hover:text-indigo-600"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleActionRequest('delete', tx.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};