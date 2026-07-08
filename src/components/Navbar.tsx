import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Start Here', path: '/start-here' },
  { label: 'Writer Forum', path: '/writer-forum' },
  { label: 'Feedback Corner', path: '/feedback-corner' },
  { label: 'Publishing Help', path: '/publishing-help' },
  { label: 'Free Resources', path: '/free-resources' },
  { label: 'Challenges', path: '/weekly-challenges' },
  { label: 'Community Rules', path: '/community-rules' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-parchment-100'
          : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="/WriteTogetherHub copy copy.png"
              alt="Write Together Hub"
              className="h-11 w-auto object-contain"
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

          {/* Desktop CTA */}
          <div className="hidden xl:flex items-center gap-3">
            <Link to="/contact" className="text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors">
              Contact
            </Link>
            <Link to="/register" className="btn-outline text-sm py-2 px-5">
              Register
            </Link>
            <Link to="/join" className="btn-primary text-sm py-2 px-5">
              Join Free
            </Link>
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
              <Link to="/register" className="btn-outline w-full text-sm py-3">
                Register as Member
              </Link>
              <Link to="/join" className="btn-primary w-full text-sm py-3">
                Join Free Community
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
