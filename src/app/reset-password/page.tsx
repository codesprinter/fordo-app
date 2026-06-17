"use client"
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, KeyRound, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-slate-900 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-slate-800 text-center space-y-6">
        <div className="flex flex-col items-center justify-center text-red-500 bg-red-500/10 border border-red-500/30 p-4 rounded-xl">
          <AlertTriangle className="mb-3" size={40} />
          <h3 className="text-lg font-semibold text-slate-100">Invalid Link</h3>
          <p className="text-sm text-slate-400 mt-1">
            This password reset link is missing a validation token. Please request a new link.
          </p>
        </div>
        <div>
          <Link
            href="/forgot-password"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none transition-colors"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-slate-800">
      {success ? (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <CheckCircle2 className="text-emerald-500 mb-3" size={40} />
            <h3 className="text-lg font-semibold text-slate-100 mb-1">Password updated</h3>
            <p className="text-sm text-slate-300">
              Your password has been successfully reset. You can now log in with your new credentials.
            </p>
          </div>
          <div>
            <Link
              href="/login"
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 focus:outline-none transition-colors font-semibold"
            >
              Sign in now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              New Password
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <KeyRound size={18} />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-slate-700 bg-slate-950 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-100 transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">
              Confirm New Password
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <KeyRound size={18} />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-slate-700 bg-slate-950 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-100 transition-colors"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating password...' : 'Update password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-emerald-500">
          <ShoppingCart size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight">
          Create new password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Enter your new password below to reset your account credentials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={
          <div className="bg-slate-900 py-12 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-slate-800 text-center">
            <div className="animate-pulse flex flex-col items-center space-y-4">
              <div className="h-10 w-10 bg-slate-800 rounded-full"></div>
              <div className="h-4 w-3/4 bg-slate-800 rounded"></div>
              <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
            </div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
