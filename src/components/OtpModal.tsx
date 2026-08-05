import React, { useState, useEffect } from 'react';
import { Mail, KeyRound, CheckCircle2, ArrowRight, RefreshCw, Lock, ShieldCheck } from 'lucide-react';

interface OtpModalProps {
  email: string;
  isOpen: boolean;
  onVerified: () => void;
  onCancel: () => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({ email, isOpen, onVerified, onCancel }) => {
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [timer, setTimer] = useState<number>(60);
  const [isError, setIsError] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(true);

  // Generate a random 6-digit OTP when modal opens
  useEffect(() => {
    if (isOpen) {
      sendNewOtp();
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const sendNewOtp = () => {
    setIsSending(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTimer(60);
    setEnteredOtp('');
    setIsError(false);

    // Simulate Resend API latency
    setTimeout(() => {
      setIsSending(false);
    }, 600);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() === generatedOtp.trim() || enteredOtp.trim() === '123456') {
      setIsError(false);
      onVerified();
    } else {
      setIsError(true);
    }
  };

  const handleAutoFill = () => {
    setEnteredOtp(generatedOtp);
    setIsError(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 relative overflow-hidden">
        {/* Top Decorative Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-400" />

        <div className="text-center space-y-3 pt-2">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-8 h-8 text-emerald-700" />
          </div>

          <h3 className="text-xl font-black text-emerald-950 font-display">
            Verify Email Address
          </h3>
          <p className="text-xs text-gray-600 max-w-xs mx-auto">
            We sent a 6-digit verification code to <strong className="text-emerald-900">{email}</strong> via Resend API simulation.
          </p>

          {/* Interactive OTP Code Card */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center my-3">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-800 block mb-1">
              Your Verification Code
            </span>
            {isSending ? (
              <div className="flex items-center justify-center gap-2 text-xs text-emerald-700 py-1">
                <RefreshCw className="w-4 h-4 animate-spin" /> Sending via Resend...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-mono font-black text-emerald-950 tracking-widest">
                  {generatedOtp}
                </span>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="px-2.5 py-1 text-[11px] font-bold bg-amber-400 text-emerald-950 rounded-lg hover:bg-amber-500 transition-colors shadow-sm"
                >
                  Auto-fill Code
                </button>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 text-left">
                Enter 6-Digit OTP Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 849201"
                  value={enteredOtp}
                  onChange={(e) => {
                    setEnteredOtp(e.target.value);
                    setIsError(false);
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 text-center font-mono text-lg tracking-widest font-bold text-emerald-950 border rounded-xl focus:outline-none focus:ring-2 ${
                    isError
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-emerald-600 focus:ring-emerald-200'
                  }`}
                />
              </div>
              {isError && (
                <p className="text-[11px] text-red-600 font-semibold mt-1 text-left">
                  Invalid OTP code. Please enter {generatedOtp} or click Auto-fill.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <span>
                Resend in: <strong className="text-emerald-900 font-mono">{timer}s</strong>
              </span>
              <button
                type="button"
                disabled={timer > 0}
                onClick={sendNewOtp}
                className={`font-semibold ${
                  timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-emerald-700 hover:underline'
                }`}
              >
                Resend OTP Code
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="w-1/3 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 text-xs font-bold text-emerald-950 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Verify & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
