import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Youtube, Mail, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Start Here', path: '/start-here' },
  { label: 'Writer Forum', path: '/writer-forum' },
  { label: 'Feedback Corner', path: '/feedback-corner' },
];

const resourceLinks = [
  { label: 'Publishing Help', path: '/publishing-help' },
  { label: 'Free Resources', path: '/free-resources' },
  { label: 'Weekly Challenges', path: '/weekly-challenges' },
  { label: 'Community Rules', path: '/community-rules' },
  { label: 'Contact', path: '/contact' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    const { error: err } = await supabase
      .from('newsletter_subscribers')
      .insert({ email });
    setLoading(false);
    if (err) {
      if (err.code === '23505') {
        setError('You are already subscribed!');
      } else {
        setError('Something went wrong. Please try again.');
      }
      return;
    }
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-ink-900 text-parchment-100">
      <div className="section-container">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center group mb-4">
              <img
                src="/WriteTogetherHub copy copy.png"
                alt="Write Together Hub"
                className="w-[220px] max-w-full h-auto object-contain"
              />
            </Link>
            <p className="text-ink-300 text-sm leading-relaxed mb-5 italic font-serif">
              "Write. Share. Learn. Publish. Together."
            </p>
            <p className="text-ink-400 text-sm leading-relaxed">
              A free community where new writers learn, share their work, receive kind feedback, and understand publishing.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Twitter, Facebook, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-ink-800 hover:bg-ember-600 flex items-center justify-center text-ink-400 hover:text-white transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-white mb-5">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-ink-400 hover:text-parchment-200 text-sm transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-serif font-semibold text-white mb-5">Resources</h4>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-ink-400 hover:text-parchment-200 text-sm transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif font-semibold text-white mb-2">Newsletter</h4>
            <p className="text-ink-400 text-sm mb-4">Get weekly writing tips, challenges, and community news.</p>
            {subscribed ? (
              <div className="bg-sage-800 rounded-lg p-4 text-sage-200 text-sm">
                Thank you for subscribing! Welcome to the community.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-4 py-2.5 rounded-lg bg-ink-800 border border-ink-700 text-white placeholder-ink-500 text-sm focus:outline-none focus:ring-2 focus:ring-ember-500 focus:border-transparent transition-all"
                  required
                />
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-ember-600 hover:bg-ember-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {loading ? 'Subscribing...' : 'Subscribe Free'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-ink-800 py-6">
          <p className="text-ink-500 text-xs leading-relaxed text-center mb-4">
            <strong className="text-ink-400">Disclaimer:</strong> Write Together Hub offers peer learning and general writing guidance. It does not provide legal, copyright, or professional publishing advice.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-ink-500 text-xs">
              &copy; {new Date().getFullYear()} Write Together Hub &mdash; writetogetherhub.com. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/community-rules" className="text-ink-500 hover:text-parchment-300 text-xs transition-colors">
                Community Rules
              </Link>
              <Link to="/contact" className="text-ink-500 hover:text-parchment-300 text-xs transition-colors">
                Contact
              </Link>
              <Link to="/join" className="text-ink-500 hover:text-parchment-300 text-xs transition-colors">
                Join Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
