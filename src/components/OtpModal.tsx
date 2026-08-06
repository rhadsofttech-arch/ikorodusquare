import React, { useState, useEffect } from 'react';
import { Mail, KeyRound, CheckCircle2, ArrowRight, RefreshCw, Lock, ShieldCheck, AlertTriangle } from 'lucide-react';

interface OtpModalProps {
  email: string;
  isOpen: boolean;
  onVerified: () => void;
  onCancel: () => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({ email, isOpen, onVerified, onCancel }) => {
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [timer, setTimer] = useState<number>(60);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [infoMessage, setInfoMessage] = useState<string>('');
  const [devCode, setDevCode] = useState<string | null>(null);

  // Trigger send OTP whenever modal opens with a valid email
  useEffect(() => {
    if (isOpen && email) {
      sendNewOtp();
    }
  }, [isOpen, email]);

  // Countdown timer for resend interval
  useEffect(() => {
    let interval: any = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const sendNewOtp = async () => {
    setIsSending(true);
    setErrorMessage('');
    setInfoMessage('');
    setEnteredOtp('');
    setDevCode(null);

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.retryAfter) {
          setTimer(data.retryAfter);
        }
        setErrorMessage(data.error || 'Failed to send verification email. Please try again.');
      } else {
        setTimer(60); // Reset rate-limit timer
        if (data.devCode) {
          setDevCode(data.devCode);
          setInfoMessage(data.warning || 'OTP sent! (Dev Mode preview code available)');
        } else {
          setInfoMessage(data.message || `Verification code sent to ${email}.`);
        }
      }
    } catch (err: any) {
      console.error('Error requesting OTP:', err);
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setErrorMessage('Please enter the full 6-digit OTP code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: enteredOtp.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'Verification failed. Please check the code and try again.');
      } else {
        onVerified();
      }
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setErrorMessage('Server verification error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAutoFill = () => {
    if (devCode) {
      setEnteredOtp(devCode);
      setErrorMessage('');
    }
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
            Verify Your Email
          </h3>
          <p className="text-xs text-gray-600 max-w-xs mx-auto">
            We sent a 6-digit verification code to <strong className="text-emerald-900">{email}</strong>.
          </p>

          {/* Dev Code / Auto-fill Helper Banner when applicable */}
          {devCode && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center my-3 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center justify-center gap-1.5 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Dev Preview Code</span>
              </div>
              <div className="flex items-center justify-center gap-3 pt-1">
                <span className="text-xl font-mono font-black text-emerald-950 tracking-widest bg-white px-3 py-1 rounded-lg border border-amber-300">
                  {devCode}
                </span>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="px-2.5 py-1 text-[11px] font-bold bg-amber-400 text-emerald-950 rounded-lg hover:bg-amber-500 transition-colors shadow-sm"
                >
                  Auto-fill
                </button>
              </div>
            </div>
          )}

          {infoMessage && !devCode && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 text-left">
                Enter 6-Digit OTP Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 849201"
                  value={enteredOtp}
                  disabled={isSending || isVerifying}
                  onChange={(e) => {
                    setEnteredOtp(e.target.value);
                    setErrorMessage('');
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 text-center font-mono text-xl tracking-widest font-black text-emerald-950 border rounded-xl focus:outline-none focus:ring-2 ${
                    errorMessage
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-emerald-600 focus:ring-emerald-200'
                  }`}
                />
              </div>
              {errorMessage && (
                <p className="text-[11px] text-red-600 font-semibold mt-1 text-left">
                  {errorMessage}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <span>
                Resend code in: <strong className="text-emerald-900 font-mono">{timer}s</strong>
              </span>
              <button
                type="button"
                disabled={timer > 0 || isSending}
                onClick={sendNewOtp}
                className={`font-semibold flex items-center gap-1 ${
                  timer > 0 || isSending
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-emerald-700 hover:underline'
                }`}
              >
                {isSending && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Resend Code</span>
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
                disabled={isSending || isVerifying || enteredOtp.trim().length !== 6}
                className="w-2/3 py-2.5 text-xs font-bold text-emerald-950 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
