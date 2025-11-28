import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { format, endOfWeek, isWithinInterval } from 'date-fns';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, Calendar } from 'lucide-react';

interface WeeklyViewProps {
  transactions: Transaction[];
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({ transactions }) => {
  
  const weeklyData = useMemo(() => {
    // Generate last 4 weeks
    const weeks = [];
    for (let i = 0; i < 4; i++) {
        // Calculate start of week (Monday) and subtract weeks manually
        const d = new Date();
        d.setDate(d.getDate() - (i * 7));
        
        const start = new Date(d);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);

        const end = endOfWeek(d, { weekStartsOn: 1 });
        
        const txsInWeek = transactions.filter(t => 
            isWithinInterval(new Date(t.date), { start, end })
        );

        const expense = txsInWeek.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const income = txsInWeek.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        
        weeks.push({
            label: i === 0 ? 'This Week' : `${format(start, 'd MMM')} - ${format(end, 'd MMM')}`,
            fullDateLabel: `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`,
            expense,
            income,
            balance: income - expense
        });
    }
    return weeks; // Recent first
  }, [transactions]);

  const currentWeek = weeklyData[0];

  return (
    <div className="space-y-6 pb-20">
       {/* This Week Summary */}
       <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
         <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-indigo-600 w-5 h-5" />
            <h2 className="font-bold text-gray-800">This Week</h2>
         </div>
         
         <div className="grid grid-cols-2 gap-4">
             <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                 <div className="text-xs text-red-500 font-semibold uppercase mb-1">Expense</div>
                 <div className="text-xl font-bold text-red-700">AED {currentWeek.expense.toFixed(2)}</div>
             </div>
             <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                 <div className="text-xs text-green-500 font-semibold uppercase mb-1">Income</div>
                 <div className="text-xl font-bold text-green-700">AED {currentWeek.income.toFixed(2)}</div>
             </div>
         </div>
       </div>

       {/* Weekly Chart */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Weekly Spending Trend</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...weeklyData].reverse()}>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} interval={0} />
              <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`AED ${value}`, '']}
              />
              <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

       {/* Last 4 Weeks List */}
       <div className="space-y-3">
          <h3 className="font-bold text-gray-800 px-1">Recent Weeks</h3>
          {weeklyData.map((week, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full text-gray-600">
                          <TrendingDown size={18} />
                      </div>
                      <div>
                          <p className="font-medium text-gray-800">{week.fullDateLabel}</p>
                          <p className="text-xs text-gray-400">{idx === 0 ? 'Current Week' : `${idx} week(s) ago`}</p>
                      </div>
                  </div>
                  <div className="text-right">
                      <p className="font-bold text-gray-800">- AED {week.expense.toFixed(2)}</p>
                      <p className="text-xs text-green-600 font-medium">+ AED {week.income.toFixed(2)}</p>
                  </div>
              </div>
          ))}
       </div>
    </div>
  );
};