import { Link } from 'react-router-dom';
import { MessageSquare, Users, BookOpen, Star, Zap, HelpCircle, ArrowRight, TrendingUp, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, type ForumDiscussion } from '../lib/supabase';

const categories = [
  {
    icon: Users,
    title: 'Introduce Yourself',
    desc: 'Tell the community who you are, what you write, and what brought you here. Every great journey starts with a hello.',
    color: 'bg-sky-50 text-sky-600 border-sky-100',
    discussions: 248,
    posts: 1240,
  },
  {
    icon: HelpCircle,
    title: 'Writing Questions',
    desc: 'Ask anything about the craft of writing — plot structure, grammar, dialogue, pacing, point of view, and more.',
    color: 'bg-parchment-100 text-parchment-700 border-parchment-200',
    discussions: 532,
    posts: 3891,
  },
  {
    icon: BookOpen,
    title: 'Share Your Work',
    desc: 'Post a short excerpt, a poem, or a first paragraph. This is a safe space. All feedback here is kind and constructive.',
    color: 'bg-sage-50 text-sage-600 border-sage-100',
    discussions: 987,
    posts: 5203,
  },
  {
    icon: MessageSquare,
    title: 'Feedback Requests',
    desc: 'Specifically request feedback on your excerpt. Tell reviewers what kind of feedback you are looking for.',
    color: 'bg-ember-50 text-ember-600 border-ember-100',
    discussions: 741,
    posts: 4112,
  },
  {
    icon: Star,
    title: 'Publishing Questions',
    desc: 'Ask about self-publishing, traditional publishing, Amazon KDP, agents, query letters, and book formatting.',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    discussions: 328,
    posts: 2045,
  },
  {
    icon: Zap,
    title: 'Weekly Challenges',
    desc: 'Discuss the current weekly writing challenge, share your entries, and celebrate each other\'s creative responses.',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
    discussions: 412,
    posts: 2890,
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

export default function WriterForum() {
  const [discussions, setDiscussions] = useState<ForumDiscussion[]>([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);

  useEffect(() => {
    async function fetchDiscussions() {
      const { data, error } = await supabase
        .from('forum_discussions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      setLoadingDiscussions(false);
      if (!error && data) setDiscussions(data);
    }
    fetchDiscussions();
  }, []);

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
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link to="/join" className="btn-primary">
                Join to Participate
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/community-rules" className="btn-secondary">
                Community Rules
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-white border-y border-parchment-100">
        <div className="section-container">
          <div className="grid grid-cols-4 gap-6 max-w-xl mx-auto text-center">
            {[
              { label: 'Active Members', value: '3,240+' },
              { label: 'Discussions', value: '3,248' },
              { label: 'Posts', value: '19,381' },
              { label: 'Countries', value: '47' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif font-bold text-2xl text-ember-600">{stat.value}</p>
                <p className="text-xs text-ink-400 mt-1">{stat.label}</p>
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
                <p className="text-ink-500 text-sm leading-relaxed mb-5">{cat.desc}</p>
                <div className="flex items-center justify-between text-xs text-ink-400">
                  <span>{cat.discussions.toLocaleString()} discussions</span>
                  <span>{cat.posts.toLocaleString()} posts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Discussions — live from Supabase */}
      <section className="section-padding bg-parchment-50">
        <div className="section-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Recent Discussions</h2>
              <p className="section-subtitle mt-2">The latest conversations happening in the community.</p>
            </div>
            <TrendingUp className="w-6 h-6 text-ember-400 hidden md:block" />
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
                    <span className="text-xs text-ink-400">replies</span>
                  </div>
                  <div className="w-px h-10 bg-parchment-100 hidden sm:block" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`badge text-xs font-semibold px-2.5 py-0.5 rounded-full ${categoryColors[d.category] || 'bg-parchment-100 text-parchment-700'}`}>
                        {d.category}
                      </span>
                      {d.is_hot && (
                        <span className="badge bg-ember-100 text-ember-700 text-xs">🔥 Hot</span>
                      )}
                    </div>
                    <p className="font-medium text-ink-800 text-sm leading-snug truncate">{d.title}</p>
                    <p className="text-xs text-ink-400 mt-1">by {d.author_name} &middot; {timeAgo(d.created_at)}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-300 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/join" className="btn-primary">
              Join to Read All Discussions
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

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
    </div>
  );
}
