import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useDocumentTitle } from '../../lib/useDocumentTitle';

export default function AdminLogin() {
  useDocumentTitle('Admin Sign In | Write Together Hub', 'Sign in to the Write Together Hub admin portal.');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setLoading(false);
      setError('Invalid email or password. Please try again.');
      return;
    }

    // Verify this user is an admin via the is_admin() SQL function
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');

    setLoading(false);

    if (adminError) {
      await supabase.auth.signOut();
      setError('Could not verify admin access. Please try again.');
      return;
    }

    if (!isAdmin) {
      await supabase.auth.signOut();
      setError('Your account does not have admin access. Contact the site owner.');
      return;
    }

    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-950 via-ink-900 to-ink-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-ember-600 flex items-center justify-center mb-4 shadow-lg shadow-ember-900/40">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-serif font-bold text-white text-2xl">Write Together Hub</h1>
          <p className="text-ink-400 text-sm mt-1">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-ink-800/60 backdrop-blur-sm border border-ink-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-ember-400" />
            <h2 className="font-semibold text-white text-lg">Sign in to continue</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-ink-300 text-sm font-medium mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-ink-900/60 border border-ink-600 rounded-lg text-white placeholder-ink-600 text-sm focus:outline-none focus:ring-2 focus:ring-ember-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-ink-300 text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-ink-900/60 border border-ink-600 rounded-lg text-white placeholder-ink-600 text-sm focus:outline-none focus:ring-2 focus:ring-ember-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2.5 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ember-600 hover:bg-ember-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-ink-600 text-xs mt-6">
          Write Together Hub &mdash; Admin access only
        </p>
      </div>
    </div>
  );
}
