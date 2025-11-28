import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { format, endOfMonth, isWithinInterval } from 'date-fns';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

interface SummaryViewProps {
  transactions: Transaction[];
}

export const SummaryView: React.FC<SummaryViewProps> = ({ transactions }) => {
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  const currentMonthEnd = endOfMonth(new Date());

  const monthlyData = useMemo(() => {
    const relevant = transactions.filter(t => 
      isWithinInterval(new Date(t.date), { start: currentMonthStart, end: currentMonthEnd })
    );

    const income = relevant.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = relevant.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    // Category Breakdown
    const expenseByCategory: Record<string, number> = {};
    relevant.filter(t => t.type === 'expense').forEach(t => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });

    const categoryData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

    // Last 6 months trend
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = endOfMonth(start);
      const monthLabel = format(start, 'MMM');
      
      const txsInMonth = transactions.filter(t => 
        isWithinInterval(new Date(t.date), { start, end })
      );
      
      trendData.push({
        name: monthLabel,
        income: txsInMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: txsInMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      });
    }

    return { income, expense, balance: income - expense, categoryData, trendData };
  }, [transactions]);

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
        <h2 className="text-indigo-200 text-xs font-medium uppercase tracking-wide mb-1">
            {format(new Date(), 'MMMM')} Overview
        </h2>
        <div className="text-sm opacity-80 mb-2">Monthly Remaining Balance</div>
        <div className="text-4xl font-bold">AED {monthlyData.balance.toFixed(2)}</div>
        
        <div className="flex mt-6 divide-x divide-indigo-500/30">
          <div className="pr-6">
            <div className="text-indigo-200 text-xs mb-1">Total Income</div>
            <div className="text-xl font-semibold text-green-300">+ {monthlyData.income.toFixed(0)}</div>
          </div>
          <div className="pl-6">
            <div className="text-indigo-200 text-xs mb-1">Total Expense</div>
            <div className="text-xl font-semibold text-red-300">- {monthlyData.expense.toFixed(0)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">6 Month Trend</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData.trendData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f3f4f6' }}
                formatter={(value: number) => [`AED ${value}`, '']}
              />
              <Bar dataKey="income" fill="#4ade80" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {monthlyData.categoryData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Monthly Expenses by Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={monthlyData.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {monthlyData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `AED ${value}`} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};