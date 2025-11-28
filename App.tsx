
import React, { useState, useEffect } from 'react';
import { 
  Banknote, 
  PlusCircle, 
  List, 
  Download, 
  Smartphone,
  CalendarRange,
  Settings
} from 'lucide-react';
import { Transaction, AppTab } from './types';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from './services/storageService';
import { SummaryView } from './components/SummaryView';
import { AddTransaction } from './components/AddTransaction';
import { DailyView } from './components/DailyView';
import { WeeklyView } from './components/WeeklyView';
import { ExportView } from './components/ExportView';
import { LoginScreen } from './components/LoginScreen';
import { SettingsView } from './components/SettingsView';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.ADD);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    setTransactions(getTransactions());

    // Listen for PWA install prompt
    const handleInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt as any);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleAdd = (t: Transaction) => {
    const updated = addTransaction(t);
    setTransactions(updated);
    setActiveTab(AppTab.DAILY); // Redirect to list to see entry
  };

  const handleUpdate = (t: Transaction) => {
    const updated = updateTransaction(t);
    setTransactions(updated);
  };

  const handleDelete = (id: string) => {
    const updated = deleteTransaction(id);
    setTransactions(updated);
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.ADD:
        return <AddTransaction onAdd={handleAdd} />;
      case AppTab.SUMMARY:
        return <SummaryView transactions={transactions} />;
      case AppTab.WEEKLY:
        return <WeeklyView transactions={transactions} />;
      case AppTab.DAILY:
        return <DailyView transactions={transactions} onUpdate={handleUpdate} onDelete={handleDelete} />;
      case AppTab.EXPORT:
        return <ExportView transactions={transactions} />;
      case AppTab.SETTINGS:
        return <SettingsView />;
      default:
        return <SummaryView transactions={transactions} />;
    }
  };

  const NavButton = ({ tab, icon: Icon, label }: { tab: AppTab; icon: any; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col items-center justify-center py-2 px-1 transition-colors min-w-[3.5rem] ${
        activeTab === tab ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <Icon className={`w-6 h-6 mb-1 ${activeTab === tab ? 'stroke-[2.5px]' : ''}`} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col max-w-lg mx-auto shadow-2xl overflow-hidden relative">
      {/* Header with Safe Area Top Padding */}
      <header className="bg-white px-6 py-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-2">
           <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
             <Banknote size={20} />
           </div>
           <h1 className="text-xl font-bold text-gray-800 tracking-tight">Myfinance</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {installPrompt && (
            <button 
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md shadow-indigo-200 animate-pulse active:scale-95 transition-transform"
            >
              <Smartphone size={14} />
              Install
            </button>
          )}
          
          <button 
             onClick={() => setActiveTab(AppTab.EXPORT)}
             className={`p-2 rounded-full transition-colors ${activeTab === AppTab.EXPORT ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`}
             title="Export Data"
          >
             <Download size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        {renderContent()}
      </main>

      {/* Bottom Navigation with Safe Area Bottom Padding */}
      <nav className="bg-white border-t border-gray-100 flex justify-between items-center px-4 pb-[calc(env(safe-area-inset-bottom))] sticky bottom-0 z-40">
        <NavButton tab={AppTab.SUMMARY} icon={Banknote} label="Summary" />
        <NavButton tab={AppTab.WEEKLY} icon={CalendarRange} label="Weekly" />
        
        {/* Floating Add Button */}
        <div className="-mt-8 pb-[calc(env(safe-area-inset-bottom))]">
          <button
            onClick={() => setActiveTab(AppTab.ADD)}
            className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${
               activeTab === AppTab.ADD 
               ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
               : 'bg-white text-indigo-600 border border-gray-100'
            }`}
          >
            <PlusCircle className="w-8 h-8" />
          </button>
        </div>

        <NavButton tab={AppTab.DAILY} icon={List} label="Daily" />
        <NavButton tab={AppTab.SETTINGS} icon={Settings} label="Settings" />
      </nav>
    </div>
  );
};

export default App;
