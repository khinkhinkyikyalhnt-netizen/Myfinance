
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Calendar, Clock, Tag, FileText, ToggleLeft, ToggleRight, Edit3 } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

interface AddTransactionProps {
  onAdd: (t: Transaction) => void;
}

export const AddTransaction: React.FC<AddTransactionProps> = ({ onAdd }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  
  // Date/Time State
  const [isManualDate, setIsManualDate] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [manualDate, setManualDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [manualTime, setManualTime] = useState(format(new Date(), 'HH:mm'));

  // Sync time automatically only if not manual
  useEffect(() => {
    let timer: any;
    if (!isManualDate) {
      setCurrentTime(new Date()); // Update immediately on switch back
      timer = setInterval(() => setCurrentTime(new Date()), 1000);
    }
    return () => clearInterval(timer);
  }, [isManualDate]);

  // Default category on type switch
  useEffect(() => {
    setCategory(type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    let finalDate: Date;
    if (isManualDate) {
      finalDate = new Date(`${manualDate}T${manualTime}`);
    } else {
      finalDate = new Date();
    }

    const newTransaction: Transaction = {
      id: uuidv4(),
      amount: parseFloat(amount),
      type,
      category,
      description: description || 'General',
      date: finalDate.toISOString()
    };

    onAdd(newTransaction);
    
    // Reset critical fields
    setAmount('');
    setDescription('');
    // Don't reset date mode to keep workflow smooth if adding multiple backdated items
  };

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white transition-all duration-300">
        <div className="flex justify-between items-start mb-2">
           <h2 className="text-xl font-bold">New Entry</h2>
           <button 
             type="button"
             onClick={() => setIsManualDate(!isManualDate)}
             className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors backdrop-blur-sm"
           >
             <Edit3 size={12} />
             {isManualDate ? 'Auto Date' : 'Set Date'}
           </button>
        </div>

        {isManualDate ? (
          <div className="flex gap-2 animate-fade-in">
             <div className="relative flex-1">
                <input 
                  type="date" 
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/50 [color-scheme:dark]"
                />
             </div>
             <div className="relative w-24">
                <input 
                  type="time" 
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/50 [color-scheme:dark]"
                />
             </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 opacity-90 text-sm animate-fade-in h-[34px]">
             <Calendar className="w-4 h-4" />
             <span>{currentTime.toLocaleDateString()}</span>
             <Clock className="w-4 h-4 ml-2" />
             <span>{currentTime.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Type Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
              type === 'expense' 
                ? 'bg-white text-red-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Minus className="w-4 h-4" /> Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
              type === 'income' 
                ? 'bg-white text-green-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plus className="w-4 h-4" /> Income
          </button>
        </div>

        {/* Amount Input */}
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Amount</label>
          <div className="relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm tracking-wider pointer-events-none">AED</span>
             <input
               type="number"
               inputMode="decimal"
               step="0.01"
               value={amount}
               onChange={(e) => setAmount(e.target.value)}
               placeholder="0.00"
               className="w-full pl-14 pr-4 py-4 text-3xl font-bold text-gray-800 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-300"
               autoFocus
               required
             />
          </div>
        </div>

        {/* Category & Description */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Note (Optional)</label>
            <div className="relative">
               <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
               <input
                 type="text"
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 placeholder="What is this for?"
                 className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
               />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 ${
            type === 'expense' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-green-500 hover:bg-green-600 shadow-green-200'
          }`}
        >
          {type === 'expense' ? 'Add Expense' : 'Add Income'}
        </button>
      </form>
    </div>
  );
};
