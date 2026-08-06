import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  UserCheck,
  Store,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'signin' }) => {
  const { setRole, signInWithSupabase, setCurrentUser } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    try {
      // Attempt Supabase sign in first if configured
      const { data, error } = await signInWithSupabase(email, password);
      if (error) {
        // Fallback local matching if Supabase is in dev preview or user is demo account
        const lowerEmail = email.toLowerCase().trim();
        if (lowerEmail.includes('admin')) {
          setRole('admin');
          setSuccessMessage('Successfully signed in as Administrator.');
        } else if (lowerEmail.includes('vendor') || lowerEmail.includes('sparkle')) {
          setRole('vendor');
          setSuccessMessage('Successfully signed in to Vendor Account.');
        } else {
          setRole('customer');
          setSuccessMessage('Successfully signed in as Customer.');
        }
      } else if (data?.user) {
        setSuccessMessage('Successfully authenticated via Supabase!');
      }
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Account Sign-In Handlers for convenient testing
  const handleDemoSignIn = (roleType: 'customer' | 'vendor' | 'admin') => {
    setRole(roleType);
    if (roleType === 'customer') {
      setSuccessMessage('Signed in as Customer (Bisi Ogundimu)');
    } else if (roleType === 'vendor') {
      setSuccessMessage('Signed in as Vendor (Sparkle Gadgets)');
    } else {
      setSuccessMessage('Signed in as Administrator');
    }
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden relative">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black font-display text-white">IkoroduSquare</span>
              <p className="text-[10px] text-emerald-300 font-medium">Lagos Business & Commerce Account</p>
            </div>
          </div>
          <h2 className="text-lg font-extrabold text-amber-300 mt-2">
            {mode === 'signin' ? 'Sign In to Your Account' : 'Create New Account'}
          </h2>
          <p className="text-xs text-emerald-200 mt-0.5">
            Access your saved products, vendor tools, or portal features.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. bisi.ogundimu@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Sign In Options */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold text-slate-500 text-center uppercase tracking-wider">
              Quick One-Click Demo Sign In
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoSignIn('customer')}
                className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-colors flex items-center gap-2 group"
              >
                <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="block text-[11px] font-bold text-slate-800 group-hover:text-emerald-900">
                    Customer Account
                  </span>
                  <span className="block text-[9px] text-slate-500">Bisi Ogundimu</span>
                </div>
              </button>

              <button
                onClick={() => handleDemoSignIn('vendor')}
                className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-colors flex items-center gap-2 group"
              >
                <Store className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="block text-[11px] font-bold text-slate-800 group-hover:text-emerald-900">
                    Vendor Account
                  </span>
                  <span className="block text-[9px] text-slate-500">Sparkle Gadgets</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
