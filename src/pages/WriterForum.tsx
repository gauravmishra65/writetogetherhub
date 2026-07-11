import { Link } from 'react-router-dom';
import { MessageSquare, Users, BookOpen, Star, Zap, HelpCircle, ArrowRight, TrendingUp, Loader2, X, CheckCircle, AlertCircle, Clock, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, type ForumDiscussion, type Registration } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const categories = [
  {
    icon: Users,
    title: 'Introduce Yourself',
    desc: 'Tell the community who you are, what you write, and what brought you here. Every great journey starts with a hello.',
    color: 'bg-sky-50 text-sky-600 border-sky-100',
  },
  {
    icon: HelpCircle,
    title: 'Writing Questions',
    desc: 'Ask anything about the craft of writing — plot structure, grammar, dialogue, pacing, point of view, and more.',
    color: 'bg-parchment-100 text-parchment-700 border-parchment-200',
  },
  {
    icon: BookOpen,
    title: 'Share Your Work',
    desc: 'Post a short excerpt, a poem, or a first paragraph. This is a safe space. All feedback here is kind and constructive.',
    color: 'bg-sage-50 text-sage-600 border-sage-100',
  },
  {
    icon: MessageSquare,
    title: 'Feedback Requests',
    desc: 'Specifically request feedback on your excerpt. Tell reviewers what kind of feedback you are looking for.',
    color: 'bg-ember-50 text-ember-600 border-ember-100',
  },
  {
    icon: Star,
    title: 'Publishing Questions',
    desc: 'Ask about self-publishing, traditional publishing, Amazon KDP, agents, query letters, and book formatting.',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
  },
  {
    icon: Zap,
    title: 'Weekly Challenges',
    desc: 'Discuss the current weekly writing challenge, share your entries, and celebrate each other\'s creative responses.',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
  },
];

const categoryColors: Record<string, string> = {
  'Introduce Yourself': 'bg-sky-100 text-sky-700',
  'Writing Questions': 'bg-parchment-100 text-parchment-700',
  'Share Your Work': 'bg-sage-100 text-sage-700',
  'Feedback Requests': 'bg-ember-100 text-ember-700',
  'Publishing Questions': 'bg-rose-100 text-rose-700',
  'Weekly Challenges': 'bg-violet-100 text-violet-700',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function WriterForum() {
  useDocumentTitle('Writer Forum | Write Together Hub', 'Join the Writer Forum to ask questions, share work, give encouragement, and connect with other new writers from around the world.');
  const [discussions, setDiscussions] = useState<ForumDiscussion[]>([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: '', title: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Registration | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [stats, setStats] = useState<{ members: number; discussions: number; posts: number; countries: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: reg } = await supabase
          .from('registrations')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (!cancelled) setProfile(reg as Registration ?? null);
      }
      setAuthLoading(false);
    }
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) { setProfile(null); setAuthLoading(false); }
    });
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  const isMember = !!user && !!profile;

  useEffect(() => {
    if (user) fetchDiscussions();
    else setLoadingDiscussions(false);
  }, [user]);

  useEffect(() => {
    (async () => {
      const [membersRes, discussionsRes, postsRes] = await Promise.all([
        supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('forum_discussions').select('id', { count: 'exact', head: true }),
        supabase.from('forum_posts').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        members: membersRes.count ?? 0,
        discussions: discussionsRes.count ?? 0,
        posts: postsRes.count ?? 0,
        countries: 0,
      });
    })();
  }, []);

  async function fetchDiscussions() {
    const { data, error } = await supabase
      .from('forum_discussions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    setLoadingDiscussions(false);
    if (!error && data) setDiscussions(data);
  }

  async function handleStartDiscussion(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { setFormError('You must be signed in to post.'); return; }
    setSubmitting(true);
    setFormError('');
    const authorName = profile?.name || user.email!.split('@')[0];
    const { error } = await supabase.from('forum_discussions').insert({
      category: form.category,
      title: form.title,
      author_name: authorName,
      user_id: user.id,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) {
      setFormError('Something went wrong. Please try again.');
      return;
    }
    supabase.functions.invoke('notify-new-joiner', {
      body: { source: 'forum_discussion', author_name: authorName, category: form.category, title: form.title },
    });
    setFormSuccess(true);
    const { data } = await supabase.from('forum_discussions').select('*').order('created_at', { ascending: false }).limit(10);
    if (data) setDiscussions(data);
  }

  function closeModal() {
    setShowForm(false);
    setFormSuccess(false);
    setForm({ category: '', title: '' });
    setFormError('');
  }

  return (
    <div>
      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-parchment-50 to-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-parchment-100 text-parchment-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Users className="w-4 h-4" />
              Community Forum
            </div>
            <h1 className="section-title text-5xl mb-6">
              The <em className="text-ember-600">Writer Forum</em>
            </h1>
            <p className="section-subtitle max-w-2xl mx-auto">
              Ask questions, share work, give encouragement, and connect with other new writers from around the world. A friendly community awaits.
            </p>
            {isMember && (
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <button onClick={() => setShowForm(true)} className="btn-primary">
                  Start a Discussion
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link to="/community-rules" className="btn-secondary">
                  Community Rules
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-white border-y border-parchment-100">
        <div className="section-container">
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto text-center">
            {[
              { label: 'Members', value: stats?.members ?? '—' },
              { label: 'Discussions', value: stats?.discussions ?? '—' },
              { label: 'Posts', value: stats?.posts ?? '—' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif font-bold text-2xl text-ember-600">{stat.value}</p>
                <p className="text-xs text-ink-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="mb-10">
            <h2 className="section-title">Forum Categories</h2>
            <p className="section-subtitle">Browse by topic or start a new discussion in any category.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <div key={cat.title} className={`card p-6 border-t-4 ${cat.color.split(' ').pop()}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${cat.color.split(' ').slice(0, 2).join(' ')}`}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-semibold text-ink-900 text-lg mb-2">{cat.title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth gate for discussions */}
      {authLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-ember-400 animate-spin" />
        </div>
      ) : !isMember ? (
        <section className="section-padding bg-parchment-50">
          <div className="section-container">
            <div className="max-w-lg mx-auto text-center card p-10">
              <div className="w-14 h-14 bg-ember-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Lock className="w-7 h-7 text-ember-600" />
              </div>
              <h2 className="font-serif font-bold text-2xl text-ink-900 mb-3">Members Only</h2>
              <p className="text-ink-500 leading-relaxed mb-6">
                Forum discussions are visible only to signed-in members. Sign in or join the community to read and participate.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/login" className="btn-primary">Sign In <ArrowRight className="w-4 h-4" /></Link>
                <Link to="/join" className="btn-secondary">Join Free</Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Recent Discussions — live from Supabase */}
          <section className="section-padding bg-parchment-50">
            <div className="section-container">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="section-title">Recent Discussions</h2>
                  <p className="section-subtitle mt-2">The latest conversations happening in the community.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2.5 hidden md:flex">
                    Start a Discussion
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <TrendingUp className="w-6 h-6 text-ember-400 hidden md:block" />
                </div>
              </div>

              {loadingDiscussions ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-ember-400 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {discussions.map((d) => (
                    <div key={d.id} className="card p-5 flex items-center gap-4">
                      <div className="hidden sm:flex flex-col items-center gap-1 text-center min-w-[52px]">
                        <span className="font-bold text-ink-700 text-lg">{d.replies}</span>
                        <span className="text-xs text-ink-500">replies</span>
                      </div>
                      <div className="w-px h-10 bg-parchment-100 hidden sm:block" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`badge text-xs font-semibold px-2.5 py-0.5 rounded-full ${categoryColors[d.category] || 'bg-parchment-100 text-parchment-700'}`}>
                            {d.category}
                          </span>
                          {d.is_hot && (
                            <span className="badge bg-ember-100 text-ember-700 text-xs">Hot</span>
                          )}
                          {d.status === 'pending' && (
                            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-ink-800 text-sm leading-snug truncate">{d.title}</p>
                        <p className="text-xs text-ink-500 mt-1">by {d.author_name} &middot; {timeAgo(d.created_at)}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-ink-300 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Forum Guidelines */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="max-w-2xl mx-auto bg-parchment-50 rounded-2xl p-8 border border-parchment-100 text-center">
            <h3 className="font-serif font-bold text-2xl text-ink-900 mb-4">Before You Post</h3>
            <p className="text-ink-600 leading-relaxed mb-6">
              Our forum runs on kindness and respect. Read our community rules before participating to understand what makes Write Together Hub a safe space for new writers.
            </p>
            <Link to="/community-rules" className="btn-outline">
              Read Community Rules
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Start a Discussion Modal */}
      {showForm && isMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-parchment-100">
              <div>
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-0.5">Writer Forum</p>
                <h3 className="font-serif font-bold text-ink-900 text-lg">Start a Discussion</h3>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-parchment-100 hover:bg-parchment-200 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-ink-600" />
              </button>
            </div>
            <div className="p-6">
              {formSuccess ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-sage-600" />
                  </div>
                  <h4 className="font-serif font-bold text-xl text-ink-900 mb-2">Discussion Submitted!</h4>
                  <p className="text-ink-500 text-sm mb-5">Your discussion has been submitted and is awaiting review by the community team. Once approved, it will appear in the forum.</p>
                  <button onClick={closeModal} className="btn-primary text-sm py-2.5 px-6">Done</button>
                </div>
              ) : (
                <form onSubmit={handleStartDiscussion} className="space-y-5">
                  {formError && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {formError}
                    </div>
                  )}
                  <p className="text-xs text-ink-500">Posting as <span className="font-semibold text-ink-600">{profile?.name || user?.email}</span></p>
                  <div>
                    <label className="form-label">Category <span className="text-red-400">*</span></label>
                    <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required>
                      <option value="">Select a category...</option>
                      {categories.map(c => <option key={c.title} value={c.title}>{c.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Discussion Title <span className="text-red-400">*</span></label>
                    <input type="text" className="form-input" placeholder="What would you like to discuss?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                  </div>
                  <button type="submit" disabled={submitting} className="btn-primary w-full py-3 disabled:opacity-60">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {submitting ? 'Posting...' : 'Post Discussion'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
