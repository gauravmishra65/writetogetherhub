import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle, Feather } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/member';

  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError('Incorrect email or password. Please try again.');
      return;
    }
    navigate(from, { replace: true });
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) {
      setError(err.message || 'Could not send reset email. Please check the address and try again.');
      return;
    }
    setResetSent(true);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-b from-parchment-50 to-white py-16 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ember-100 mb-5">
            <Feather className="w-7 h-7 text-ember-600" />
          </div>
          <h1 className="font-serif font-bold text-3xl text-ink-900 mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Reset Password'}
          </h1>
          <p className="text-ink-500">
            {mode === 'login'
              ? 'Sign in to your Write Together Hub account.'
              : 'Enter your email and we\'ll send a reset link.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-warm border border-parchment-100 p-8">

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="form-label">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="your@email.com"
                    className="form-input pl-10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="form-label mb-0">Password</label>
                  <button
                    type="button"
                    onClick={() => { setMode('reset'); setError(''); }}
                    className="text-xs text-ember-600 hover:text-ember-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="form-input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 rounded-lg px-3 py-2.5 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Sign In'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : resetSent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-sage-600" />
              </div>
              <h3 className="font-serif font-semibold text-ink-900 text-lg mb-2">Check your inbox</h3>
              <p className="text-ink-500 text-sm leading-relaxed mb-6">
                We've sent a password reset link to <strong>{email}</strong>. Follow the link to set a new password.
              </p>
              <button
                onClick={() => { setMode('login'); setResetSent(false); }}
                className="text-sm text-ember-600 hover:text-ember-700 font-semibold transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="form-label">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="your@email.com"
                    className="form-input pl-10"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 rounded-lg px-3 py-2.5 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="w-full text-sm text-ink-500 hover:text-ink-700 font-medium transition-colors pt-1"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>

        {/* Footer links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-ink-500 text-sm">
            New to Write Together Hub?{' '}
            <Link to="/register" className="text-ember-600 hover:text-ember-700 font-semibold transition-colors">
              Register as a member
            </Link>
            {' '}or{' '}
            <Link to="/join" className="text-ember-600 hover:text-ember-700 font-semibold transition-colors">
              join for free
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-ink-400">
            <BookOpen className="w-3.5 h-3.5" />
            Write Together Hub — Free community for writers
          </div>
        </div>
      </div>
    </div>
  );
}
