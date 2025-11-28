
import React, { useState, useEffect } from 'react';
import { Lock, Save, AlertTriangle, CheckCircle, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import { changePassword, verifyPassword, isDateLoginEnabled, setDateLoginEnabled } from '../services/authService';

export const SettingsView: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  
  const [dateLogin, setDateLogin] = useState(false);

  useEffect(() => {
    setDateLogin(isDateLoginEnabled());
  }, []);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setStatus({ type: 'error', msg: 'All fields are required' });
      return;
    }

    if (!verifyPassword(currentPassword)) {
      setStatus({ type: 'error', msg: 'Current password is incorrect' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', msg: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 4) {
      setStatus({ type: 'error', msg: 'Password must be at least 4 characters' });
      return;
    }

    changePassword(newPassword);
    setStatus({ type: 'success', msg: 'Password updated successfully!' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const toggleDateLogin = () => {
    const newState = !dateLogin;
    setDateLogin(newState);
    setDateLoginEnabled(newState);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
            <Lock size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Security Settings</h2>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handleUpdate} className="space-y-4 mb-8">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Enter current password"
            />
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Retype new password"
            />
          </div>

          {status && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {status.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              {status.msg}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 mt-2"
          >
            <Save size={18} />
            Update Password
          </button>
        </form>

        {/* Date Login Option */}
        <div className="border-t border-gray-100 pt-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                    <Calendar size={18} />
                 </div>
                 <div>
                   <h3 className="text-sm font-bold text-gray-800">Date Backup Login</h3>
                   <p className="text-xs text-gray-400">Log in using today's date (ddmm)</p>
                 </div>
              </div>
              <button onClick={toggleDateLogin} className="text-indigo-600 transition-colors">
                 {dateLogin ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-gray-300" />}
              </button>
           </div>
           {dateLogin && (
             <p className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded">
               <strong>Active:</strong> You can log in by entering the current day and month (e.g., 2410 for Oct 24th). Useful for password recovery.
             </p>
           )}
        </div>
      </div>
    </div>
  );
};
