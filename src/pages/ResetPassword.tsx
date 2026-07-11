import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, Feather } from 'lucide-react';
import { supabase, checkPasswordBreached } from '../lib/supabase';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function ResetPassword() {
  useDocumentTitle('Reset Password | Write Together Hub', 'Set a new password for your Write Together Hub account.');
  const navigate = useNavigate();
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const checkSession = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (cancelled) return;
        if (session) setVerifying(false);
      });
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (user) setVerifying(false);
      return () => subscription.unsubscribe();
    };
    checkSession();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (pwNew.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (pwNew !== pwConfirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const breached = await checkPasswordBreached(pwNew);
    if (breached) {
      setLoading(false);
      setError('This password has appeared in a known data breach. Please choose a different password.');
      return;
    }
    const { error: err } = await supabase.auth.updateUser({ password: pwNew });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess(true);
    setTimeout(() => navigate('/member', { replace: true }), 2500);
  };

  if (verifying) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-b from-parchment-50 to-white py-16 px-4">
        <div className="text-center text-ink-400">
          <Feather className="w-8 h-8 animate-pulse mx-auto mb-3" />
          <p className="text-sm">Verifying your reset link…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-b from-parchment-50 to-white py-16 px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ember-100 mb-5">
            <KeyRound className="w-7 h-7 text-ember-600" />
          </div>
          <h1 className="font-serif font-bold text-3xl text-ink-900 mb-2">Set New Password</h1>
          <p className="text-ink-500">Choose a strong password for your account.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-warm border border-parchment-100 p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-sage-600" />
              </div>
              <h3 className="font-serif font-semibold text-ink-900 text-lg mb-2">Password Updated</h3>
              <p className="text-ink-500 text-sm leading-relaxed mb-6">
                Your password has been changed successfully. Redirecting you to your account…
              </p>
              <Link to="/member" className="text-sm text-ember-600 hover:text-ember-700 font-semibold transition-colors">
                Go to My Account
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="form-label">New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pwNew}
                    onChange={(e) => setPwNew(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className="form-input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label">Confirm New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pwConfirm}
                    onChange={(e) => setPwConfirm(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Re-enter your new password"
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
                {loading ? 'Updating…' : 'Update Password'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-ink-500 hover:text-ink-700 font-medium transition-colors">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
