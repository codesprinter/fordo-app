"use client"
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setResetLink('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccess(true);
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-emerald-500">
          <ShoppingCart size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          We will send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-slate-800">
          {success ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <CheckCircle2 className="text-emerald-500 mb-3" size={40} />
                <h3 className="text-lg font-semibold text-slate-100 mb-1">Check your inbox</h3>
                <p className="text-sm text-slate-300">
                  If an account exists for <strong className="text-slate-100">{email}</strong>, you will receive a password reset link shortly.
                </p>
              </div>

              {/* Dev Mode Debug Helper */}
              {resetLink && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-100 text-sm">
                  <p className="font-semibold text-amber-400 mb-1">⚡ Dev Mode Simulator:</p>
                  <p className="text-slate-400 text-xs mb-3 break-all">
                    Since no SMTP client is configured, we've printed this link to the server logs and exposed it here:
                  </p>
                  <Link
                    href={resetLink}
                    className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors font-semibold"
                  >
                    Reset Password Now
                  </Link>
                </div>
              )}

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors gap-2"
                >
                  <ArrowLeft size={16} /> Back to sign in
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
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
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
                  {loading ? 'Sending link...' : 'Send reset link'}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors gap-2"
                >
                  <ArrowLeft size={16} /> Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
