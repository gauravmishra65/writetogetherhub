import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { KeyRound, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, Feather } from 'lucide-react';
import { supabase, checkPasswordBreached } from '../lib/supabase';
import { useDocumentTitle } from '../lib/useDocumentTitle';

// A member who was approved by an admin has no password yet. The approval email
// links here with ?token_hash=…; the token is verified in the browser (not by a
// plain GET) so mail scanners that pre-fetch links cannot use it up. The cache
// keeps React StrictMode's double-run of the effect from verifying it twice.
const verifyCache = new Map<string, ReturnType<typeof supabase.auth.verifyOtp>>();

function verifyOnce(tokenHash: string) {
  let pending = verifyCache.get(tokenHash);
  if (!pending) {
    pending = supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
    verifyCache.set(tokenHash, pending);
  }
  return pending;
}

function isFirstPassword(user: User | null | undefined): boolean {
  const meta = user?.user_metadata ?? {};
  return meta.invited_by_admin === true && meta.password_set !== true;
}

export default function ResetPassword() {
  useDocumentTitle('Create or Reset Password | Write Together Hub', 'Create or reset the password for your Write Together Hub account.');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Read once: the token is stripped from the URL after use and must not re-trigger the effect.
  const [tokenHash] = useState(() => searchParams.get('token_hash'));
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [linkError, setLinkError] = useState('');
  const [isWelcome, setIsWelcome] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const ready = (user: User | null | undefined) => {
      if (cancelled) return;
      setIsWelcome(isFirstPassword(user));
      setVerifying(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) ready(session.user);
    });

    (async () => {
      if (tokenHash) {
        const { data, error: verifyErr } = await verifyOnce(tokenHash);
        if (cancelled) return;
        if (verifyErr || !data.session) {
          setLinkError('This link has expired or has already been used.');
          setVerifying(false);
          return;
        }
        // Keep the one-time token out of the address bar and browser history.
        navigate('/reset-password', { replace: true });
        ready(data.user);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (user) {
        ready(user);
      } else if (!window.location.hash.includes('access_token')) {
        setLinkError('This page needs the link from your email.');
        setVerifying(false);
      }
    })();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [tokenHash, navigate]);

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
    const { error: err } = await supabase.auth.updateUser({ password: pwNew, data: { password_set: true } });
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
          <p className="text-sm">Verifying your link…</p>
        </div>
      </div>
    );
  }

  if (linkError) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-b from-parchment-50 to-white py-16 px-4">
        <div className="w-full max-w-md text-center bg-white rounded-2xl shadow-warm border border-parchment-100 p-8">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-600" />
          </div>
          <h1 className="font-serif font-bold text-2xl text-ink-900 mb-2">Link not valid</h1>
          <p className="text-ink-600 text-sm leading-relaxed mb-2">{linkError}</p>
          <p className="text-ink-500 text-sm leading-relaxed mb-6">
            On the sign-in page choose <strong>Forgot password?</strong> and enter your email address — we will send you a fresh link.
          </p>
          <Link to="/login" className="btn-primary inline-flex">
            Go to Sign In
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const heading = isWelcome ? 'Create Your Password' : 'Set New Password';
  const intro = isWelcome
    ? 'Welcome to Write Together Hub! Your email is confirmed — choose a password to finish setting up your account.'
    : 'Choose a strong password for your account.';

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-b from-parchment-50 to-white py-16 px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ember-100 mb-5">
            <KeyRound className="w-7 h-7 text-ember-600" />
          </div>
          <h1 className="font-serif font-bold text-3xl text-ink-900 mb-2">{heading}</h1>
          <p className="text-ink-500">{intro}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-warm border border-parchment-100 p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-sage-600" />
              </div>
              <h3 className="font-serif font-semibold text-ink-900 text-lg mb-2">
                {isWelcome ? 'Password Created' : 'Password Updated'}
              </h3>
              <p className="text-ink-500 text-sm leading-relaxed mb-6">
                {isWelcome
                  ? 'You are all set. Redirecting you to your account…'
                  : 'Your password has been changed successfully. Redirecting you to your account…'}
              </p>
              <Link to="/member" className="text-sm text-ember-600 hover:text-ember-700 font-semibold transition-colors">
                Go to My Account
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="form-label">{isWelcome ? 'Password' : 'New Password'}</label>
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
                <label className="form-label">{isWelcome ? 'Confirm Password' : 'Confirm New Password'}</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pwConfirm}
                    onChange={(e) => setPwConfirm(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
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
                {loading ? 'Saving…' : isWelcome ? 'Create Password' : 'Update Password'}
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
