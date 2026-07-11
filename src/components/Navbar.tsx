import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Start Here', path: '/start-here' },
  { label: 'Writer Forum', path: '/writer-forum' },
  { label: 'Feedback Corner', path: '/feedback-corner' },
  { label: 'Publishing Help', path: '/publishing-help' },
  { label: 'Free Resources', path: '/free-resources' },
  { label: 'Weekly Challenges', path: '/weekly-challenges' },
  { label: 'Community Rules', path: '/community-rules' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? '?';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-white shadow-md border-b border-parchment-200'
          : 'bg-white/95 backdrop-blur-md shadow-sm'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="/WriteTogetherHub.png"
              alt="Write Together Hub"
              style={{ height: '96px', width: 'auto', display: 'block' }}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.slice(0, 8).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-ember-600 bg-ember-50'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-parchment-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA / Auth */}
          <div className="hidden xl:flex items-center gap-3">
            <Link to="/contact" className="text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors">
              Contact
            </Link>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 bg-parchment-100 hover:bg-parchment-200 border border-parchment-200 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-ember-600 flex items-center justify-center text-white text-xs font-bold">
                    {userInitial}
                  </div>
                  <span className="text-sm font-medium text-ink-700 max-w-[140px] truncate">
                    {user.email}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-ink-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-parchment-200 shadow-warm overflow-hidden z-50">
                    <Link
                      to="/member"
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-ink-700 hover:bg-parchment-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-ink-400" />
                      My Account
                    </Link>
                    <div className="border-t border-parchment-100" />
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-ink-600 hover:text-ember-600 transition-colors whitespace-nowrap">
                  Sign In
                </Link>
                <Link to="/register" className="btn-outline text-sm py-2 px-5">
                  Register
                </Link>
                <Link to="/join" className="btn-primary text-sm py-2 px-5">
                  Join Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="xl:hidden p-2 rounded-lg text-ink-600 hover:bg-parchment-100 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="xl:hidden bg-white border-t border-parchment-100 shadow-lg">
          <nav className="section-container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-ember-600 bg-ember-50'
                    : 'text-ink-700 hover:text-ink-900 hover:bg-parchment-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-parchment-100 flex flex-col gap-2">
              {user ? (
                <>
                  <Link to="/member" className="btn-secondary w-full text-sm py-3">
                    <User className="w-4 h-4" />
                    My Account
                  </Link>
                  <button onClick={handleSignOut} className="inline-flex items-center justify-center gap-2 w-full text-sm py-3 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-semibold">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary w-full text-sm py-3">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-outline w-full text-sm py-3">
                    Register as Member
                  </Link>
                  <Link to="/join" className="btn-primary w-full text-sm py-3">
                    Join Free
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
