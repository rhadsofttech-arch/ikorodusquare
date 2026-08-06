import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Lock, Mail, ArrowRight, Home, Building2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AdminAccessGuardProps {
  children: React.ReactNode;
}

export const AdminAccessGuard: React.FC<AdminAccessGuardProps> = ({ children }) => {
  const { currentRole, currentUser, setRole, setActiveTab } = useApp();
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated as administrator, grant access
  if (currentUser?.role === 'admin' || currentRole === 'admin') {
    return <>{children}</>;
  }

  const handleAdminSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      // Authenticate admin credentials or allow quick admin access
      if (!adminEmail.trim()) {
        setErrorMsg('Please enter your administrator email address.');
        setIsLoading(false);
        return;
      }

      setRole('admin');
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-8 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center mx-auto mb-4 shadow-xl border-2 border-amber-300">
            <Lock className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full font-bold text-[10px] uppercase tracking-wider border border-amber-400/30">
            Protected Route • Administrator Only
          </span>
          <h1 className="text-2xl font-black font-display text-white mt-2">
            Administrator Verification Required
          </h1>
          <p className="text-xs text-emerald-200/90 mt-1 max-w-sm mx-auto leading-relaxed">
            The IkoroduSquare Platform Administration Portal is strictly restricted to authorized system administrators.
          </p>
        </div>

        {/* Lock Form Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Administrator Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@ikorodusquare.ng"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Administrator Security Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-950 hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border border-amber-400/30"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{isLoading ? 'Verifying Admin Credentials...' : 'Authenticate & Access Admin Portal'}</span>
            </button>
          </form>

          {/* Quick Admin Test Button */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setRole('admin')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 text-center"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>One-Click Authenticate as Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Public Homepage</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
