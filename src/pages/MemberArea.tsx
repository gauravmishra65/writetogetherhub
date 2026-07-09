import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, Edit3, MessageCircle, Trophy, FileText, Users,
  LogOut, Clock, CheckCircle, XCircle, Flag, Feather,
  ArrowRight, Mail, MapPin, Pen,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type Status = 'pending' | 'approved' | 'rejected' | 'flagged';

type Profile = {
  name: string;
  email: string;
  city?: string | null;
  country?: string | null;
  experience_level?: string | null;
  writing_type?: string | null;
  genres?: string[] | null;
  interests?: string[] | null;
  bio?: string | null;
  status: Status;
  source: 'registrations' | 'join_requests';
};

const STATUS_CONFIG: Record<Status, { label: string; bg: string; text: string; icon: React.ElementType; desc: string }> = {
  pending: {
    label: 'Pending Review',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    icon: Clock,
    desc: 'Your application is being reviewed. We\'ll be in touch soon.',
  },
  approved: {
    label: 'Approved Member',
    bg: 'bg-sage-50 border-sage-200',
    text: 'text-sage-700',
    icon: CheckCircle,
    desc: 'Welcome! Your membership is active. Explore everything the community has to offer.',
  },
  rejected: {
    label: 'Not Approved',
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    icon: XCircle,
    desc: 'Your application was not approved. Contact us at hello@writetogetherhub.com for more information.',
  },
  flagged: {
    label: 'Under Review',
    bg: 'bg-orange-50 border-orange-200',
    text: 'text-orange-700',
    icon: Flag,
    desc: 'Your application is under additional review. We may reach out with questions.',
  },
};

const communityLinks = [
  { icon: BookOpen, label: 'Start Here', sub: 'Writing guides for beginners', path: '/start-here', color: 'bg-sky-50 text-sky-600' },
  { icon: Edit3, label: 'Writer Forum', sub: 'Share your work', path: '/writer-forum', color: 'bg-sage-50 text-sage-600' },
  { icon: MessageCircle, label: 'Feedback Corner', sub: 'Get kind feedback', path: '/feedback-corner', color: 'bg-ember-50 text-ember-600' },
  { icon: Trophy, label: 'Weekly Challenges', sub: 'Writing prompts', path: '/weekly-challenges', color: 'bg-amber-50 text-amber-600' },
  { icon: FileText, label: 'Free Resources', sub: 'Templates & guides', path: '/free-resources', color: 'bg-violet-50 text-violet-600' },
  { icon: Users, label: 'Publishing Help', sub: 'Understand publishing', path: '/publishing-help', color: 'bg-rose-50 text-rose-600' },
];

export default function MemberArea() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login', { state: { from: '/member' } }); return; }

      setUserEmail(user.email ?? '');

      // Try registrations first, then join_requests
      const { data: reg } = await supabase
        .from('registrations')
        .select('name,email,city,country,experience_level,writing_type,genres,bio,status')
        .ilike('email', user.email!)
        .maybeSingle();

      if (reg) {
        setProfile({ ...reg, source: 'registrations' });
        setLoading(false);
        return;
      }

      const { data: join } = await supabase
        .from('join_requests')
        .select('name,email,experience_level,writing_type,interests,message,status')
        .ilike('email', user.email!)
        .maybeSingle();

      if (join) {
        setProfile({ ...join, source: 'join_requests' });
      }

      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-ink-400">
          <Feather className="w-8 h-8 animate-pulse mx-auto mb-3" />
          <p className="text-sm">Loading your account…</p>
        </div>
      </div>
    );
  }

  const statusCfg = profile ? STATUS_CONFIG[profile.status ?? 'pending'] : null;
  const displayName = profile?.name ?? userEmail;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-parchment-50 to-white">
      <div className="section-container py-10">

        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-parchment-100 shadow-soft p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ember-400 to-ember-600 flex items-center justify-center text-white font-bold text-2xl shadow-md flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif font-bold text-2xl text-ink-900 mb-0.5">
                {profile ? `Hello, ${profile.name.split(' ')[0]}!` : 'Welcome!'}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500 mt-1">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{userEmail}</span>
                {profile?.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {[profile.city, profile.country].filter(Boolean).join(', ')}
                  </span>
                )}
                {profile?.writing_type && (
                  <span className="flex items-center gap-1"><Pen className="w-3.5 h-3.5" />{profile.writing_type}</span>
                )}
              </div>

              {/* Genre / interest tags */}
              {((profile?.genres ?? profile?.interests) ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(profile?.genres ?? profile?.interests ?? []).map((g) => (
                    <span key={g} className="text-xs bg-parchment-100 text-ink-600 border border-parchment-200 px-2.5 py-0.5 rounded-full">
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-ink-500 hover:text-red-600 border border-parchment-200 hover:border-red-200 px-4 py-2 rounded-lg transition-all self-start"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Membership status */}
        {statusCfg && (
          <div className={`rounded-2xl border p-5 mb-6 flex items-start gap-4 ${statusCfg.bg}`}>
            <div className={`mt-0.5 flex-shrink-0 ${statusCfg.text}`}>
              <statusCfg.icon className="w-5 h-5" />
            </div>
            <div>
              <p className={`font-semibold text-sm ${statusCfg.text}`}>{statusCfg.label}</p>
              <p className="text-ink-600 text-sm mt-0.5">{statusCfg.desc}</p>
            </div>
          </div>
        )}

        {!profile && (
          <div className="rounded-2xl border border-parchment-200 bg-parchment-50 p-5 mb-6 flex items-start gap-4">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-amber-700">No registration found</p>
              <p className="text-ink-600 text-sm mt-0.5">
                You're signed in but we couldn't find a registration linked to this email.{' '}
                <Link to="/register" className="text-ember-600 hover:underline font-medium">Complete your registration</Link> to join the community.
              </p>
            </div>
          </div>
        )}

        {/* Bio */}
        {profile?.bio && (
          <div className="bg-white rounded-2xl border border-parchment-100 shadow-soft p-6 mb-6">
            <h2 className="font-serif font-semibold text-ink-900 text-lg mb-3">Your Bio</h2>
            <p className="text-ink-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Community links */}
        <div className="mb-2">
          <h2 className="font-serif font-bold text-ink-900 text-xl mb-4">Explore the Community</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {communityLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group bg-white rounded-xl border border-parchment-100 shadow-soft p-5 flex items-center gap-4 hover:shadow-warm hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900 text-sm group-hover:text-ember-600 transition-colors">{item.label}</p>
                  <p className="text-ink-400 text-xs mt-0.5">{item.sub}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-300 group-hover:text-ember-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
