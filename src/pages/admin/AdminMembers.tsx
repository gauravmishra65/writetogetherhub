import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, UserX, Clock, RefreshCw, Mail, MapPin,
  Search, ChevronDown, ChevronUp, Pen, Calendar, Inbox,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminHeader from '../../components/AdminHeader';
import { useDocumentTitle } from '../../lib/useDocumentTitle';

type Status = 'pending' | 'approved' | 'rejected' | 'flagged';

type Member = {
  id: string;
  source: 'registrations' | 'join_requests';
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
  created_at: string;
};

type ViewTab = 'active' | 'inactive';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const SOURCE_LABEL: Record<Member['source'], string> = {
  registrations: 'Full Registration',
  join_requests: 'Join Request',
};

const SOURCE_COLOR: Record<Member['source'], string> = {
  registrations: 'bg-sky-100 text-sky-700 border-sky-200',
  join_requests: 'bg-violet-100 text-violet-700 border-violet-200',
};

const INACTIVE_STATUS: Record<Exclude<Status, 'approved'>, { label: string; color: string }> = {
  pending:  { label: 'Pending',  color: 'bg-amber-100 text-amber-700 border-amber-200' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200' },
  flagged:  { label: 'Flagged',  color: 'bg-orange-100 text-orange-700 border-orange-200' },
};

function ExperiencePip({ level }: { level: string | null | undefined }) {
  if (!level) return null;
  const map: Record<string, string> = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-amber-100 text-amber-700',
    advanced: 'bg-red-100 text-red-700',
    professional: 'bg-purple-100 text-purple-700',
  };
  const cls = map[level.toLowerCase()] ?? 'bg-parchment-100 text-ink-600';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${cls}`}>
      {level}
    </span>
  );
}

function MemberRow({ member }: { member: Member }) {
  const [expanded, setExpanded] = useState(false);
  const isInactive = member.status !== 'approved';

  return (
    <div className={`rounded-xl border bg-white transition-all duration-200 overflow-hidden ${
      expanded ? 'border-ember-200 shadow-md' : 'border-parchment-200 hover:border-parchment-300'
    }`}>
      <button
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ember-400 to-ember-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-2">
              <span className="font-semibold text-ink-900 text-sm truncate">{member.name}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${SOURCE_COLOR[member.source]}`}>
                {SOURCE_LABEL[member.source]}
              </span>
              <ExperiencePip level={member.experience_level} />
              {isInactive && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${INACTIVE_STATUS[member.status].color}`}>
                  {INACTIVE_STATUS[member.status].label}
                </span>
              )}
            </div>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-500 mt-0.5">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{member.email}</span>
              {(member.city || member.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {[member.city, member.country].filter(Boolean).join(', ')}
                </span>
              )}
              {member.writing_type && (
                <span className="flex items-center gap-1"><Pen className="w-3 h-3" />{member.writing_type}</span>
              )}
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(member.created_at)}</span>
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-ink-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-ink-400 flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-parchment-100 px-4 pb-4 pt-4 space-y-3">
          {(member.genres?.length || member.interests?.length) ? (
            <div className="flex flex-wrap gap-1">
              {(member.genres ?? member.interests ?? []).map((g) => (
                <span key={g} className="text-[10px] bg-parchment-100 text-ink-600 px-2 py-0.5 rounded-full border border-parchment-200">
                  {g}
                </span>
              ))}
            </div>
          ) : null}

          {member.bio && (
            <div className="bg-parchment-50 rounded-lg p-3 border border-parchment-100">
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1.5">Bio</p>
              <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">{member.bio}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminMembers() {
  useDocumentTitle('Members | Write Together Hub Admin', 'View active and inactive community members.');
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewTab>('active');
  const [search, setSearch] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate('/admin/login'); return; }
      setAdminEmail(data.user.email ?? '');
    });
  }, [navigate]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);

    const [regResult, joinResult] = await Promise.all([
      supabase.from('registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('join_requests').select('*').order('created_at', { ascending: false }),
    ]);

    const regs: Member[] = (regResult.data ?? []).map((r) => ({ ...r, source: 'registrations' as const }));
    const joins: Member[] = (joinResult.data ?? []).map((j) => ({ ...j, source: 'join_requests' as const }));

    const combined = [...regs, ...joins].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setMembers(combined);
    setTotalPending(combined.filter((m) => m.status === 'pending').length);
    setLoading(false);
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const activeMembers = members.filter((m) => m.status === 'approved');
  const inactiveMembers = members.filter((m) => m.status !== 'approved');

  const visible = view === 'active' ? activeMembers : inactiveMembers;
  const filtered = search.trim()
    ? visible.filter((m) => {
        const q = search.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.city ?? '').toLowerCase().includes(q) ||
          (m.country ?? '').toLowerCase().includes(q)
        );
      })
    : visible;

  return (
    <div className="min-h-screen bg-parchment-50">
      <AdminHeader adminEmail={adminEmail} totalPending={totalPending} onSignOut={handleSignOut} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-ember-500" />
              <h1 className="font-serif font-bold text-ink-900 text-xl">Members</h1>
            </div>
            <p className="text-ink-500 text-sm">View all active and inactive community members.</p>
          </div>
          <button
            onClick={fetchMembers}
            className="flex items-center gap-1.5 text-ink-500 hover:text-ink-800 text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:block">Refresh</span>
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-parchment-200 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{activeMembers.length}</p>
            <p className="text-xs text-ink-500 mt-0.5 flex items-center justify-center gap-1"><UserCheck className="w-3 h-3" /> Active</p>
          </div>
          <div className="bg-white rounded-xl border border-parchment-200 p-3 text-center">
            <p className="text-2xl font-bold text-ink-600">{inactiveMembers.length}</p>
            <p className="text-xs text-ink-500 mt-0.5 flex items-center justify-center gap-1"><UserX className="w-3 h-3" /> Inactive</p>
          </div>
          <div className="bg-white rounded-xl border border-parchment-200 p-3 text-center">
            <p className="text-2xl font-bold text-ink-800">{members.length}</p>
            <p className="text-xs text-ink-500 mt-0.5 flex items-center justify-center gap-1"><Users className="w-3 h-3" /> Total</p>
          </div>
        </div>

        {/* View tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-1 bg-white border border-parchment-200 rounded-lg p-1">
            {([
              { key: 'active' as const,   label: 'Active',   icon: UserCheck, count: activeMembers.length,   color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
              { key: 'inactive' as const, label: 'Inactive', icon: UserX,     count: inactiveMembers.length, color: 'text-ink-600 bg-parchment-50 border-parchment-200' },
            ]).map((tab) => {
              const Icon = tab.icon;
              const active = view === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setView(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                    active ? tab.color : 'text-ink-400 border-transparent hover:text-ink-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  <span className={`text-[10px] font-bold ml-0.5 ${active ? '' : 'text-ink-400'}`}>{tab.count}</span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, location…"
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-parchment-200 bg-white focus:outline-none focus:ring-2 focus:ring-ember-400 focus:border-transparent w-full sm:w-64 text-ink-800 placeholder-ink-400"
            />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-ink-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Loading members…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-ink-400">
            <Inbox className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium">No {view} members found</p>
            <p className="text-sm mt-1">
              {search.trim() ? 'Try a different search.' : `No ${view} members at the moment.`}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((m) => (
              <MemberRow key={`${m.source}-${m.id}`} member={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
