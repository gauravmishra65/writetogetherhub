import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, Clock, RefreshCw, UserCheck,
  MapPin, Mail, Phone, Pen, BookOpen as BookOpenIcon,
  MessageSquare, Users, ChevronDown, ChevronUp, Flag,
  BadgeCheck, Inbox,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminHeader from '../../components/AdminHeader';
import { useDocumentTitle } from '../../lib/useDocumentTitle';

type Status = 'pending' | 'approved' | 'rejected' | 'flagged';

type MemberApplicant = {
  id: string;
  source: 'registrations' | 'join_requests';
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  experience_level?: string | null;
  writing_type?: string | null;
  genres?: string[] | null;
  interests?: string[] | null;
  bio?: string | null;
  message?: string | null;
  how_heard?: string | null;
  status: Status;
  admin_notes: string | null;
  created_at: string;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const SOURCE_LABEL: Record<MemberApplicant['source'], string> = {
  registrations: 'Full Registration',
  join_requests: 'Join Request',
};

const SOURCE_COLOR: Record<MemberApplicant['source'], string> = {
  registrations: 'bg-sky-100 text-sky-700 border-sky-200',
  join_requests: 'bg-violet-100 text-violet-700 border-violet-200',
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

function ApplicantCard({
  applicant,
  onDecision,
}: {
  applicant: MemberApplicant;
  onDecision: (id: string, source: MemberApplicant['source'], status: Status, notes: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(applicant.admin_notes ?? '');
  const [localStatus, setLocalStatus] = useState<Status>(applicant.status);
  const [acting, setActing] = useState<Status | null>(null);

  const decide = async (newStatus: Status) => {
    setActing(newStatus);
    await onDecision(applicant.id, applicant.source, newStatus, notes);
    setLocalStatus(newStatus);
    setActing(null);
  };

  const isPending = localStatus === 'pending';

  const statusBanner: Record<Exclude<Status, 'pending'>, { bg: string; text: string; icon: React.ElementType }> = {
    approved: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: BadgeCheck },
    rejected: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: XCircle },
    flagged:  { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', icon: Flag },
  };

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
      localStatus !== 'pending'
        ? 'opacity-70 border-parchment-200'
        : expanded
          ? 'border-ember-300 shadow-lg shadow-ember-50'
          : 'border-parchment-200 hover:border-parchment-300 hover:shadow-sm'
    } bg-white`}>

      {/* Decided banner */}
      {localStatus !== 'pending' && (() => {
        const cfg = statusBanner[localStatus];
        const Icon = cfg.icon;
        return (
          <div className={`flex items-center gap-2 px-4 py-2 border-b text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            <Icon className="w-3.5 h-3.5" />
            Marked as {localStatus}
          </div>
        );
      })()}

      {/* Main row */}
      <div className="p-4 flex items-start gap-4">
        {/* Avatar initial */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ember-400 to-ember-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
          {applicant.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-0.5">
            <h3 className="font-semibold text-ink-900 text-sm">{applicant.name}</h3>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${SOURCE_COLOR[applicant.source]}`}>
              {SOURCE_LABEL[applicant.source]}
            </span>
            <ExperiencePip level={applicant.experience_level} />
          </div>

          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-ink-500 mt-0.5">
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{applicant.email}</span>
            {applicant.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{applicant.phone}</span>}
            {(applicant.city || applicant.country) && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {[applicant.city, applicant.country].filter(Boolean).join(', ')}
              </span>
            )}
            {applicant.writing_type && (
              <span className="flex items-center gap-1"><Pen className="w-3 h-3" />{applicant.writing_type}</span>
            )}
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(applicant.created_at)}</span>
          </div>

          {(applicant.genres?.length || applicant.interests?.length) ? (
            <div className="flex flex-wrap gap-1 mt-2">
              {(applicant.genres ?? applicant.interests ?? []).map((g) => (
                <span key={g} className="text-[10px] bg-parchment-100 text-ink-600 px-2 py-0.5 rounded-full border border-parchment-200">
                  {g}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-shrink-0 text-ink-400 hover:text-ink-600 transition-colors mt-0.5"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-parchment-100 px-4 pb-4 pt-4 space-y-4">
          {/* Bio / message */}
          {(applicant.bio || applicant.message) && (
            <div className="bg-parchment-50 rounded-xl p-3 border border-parchment-100">
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1.5">
                {applicant.bio ? 'Bio' : 'Message'}
              </p>
              <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">
                {applicant.bio ?? applicant.message}
              </p>
            </div>
          )}

          {applicant.how_heard && (
            <p className="text-xs text-ink-500">
              <span className="font-semibold">How they heard about us:</span> {applicant.how_heard}
            </p>
          )}

          {/* Admin notes */}
          <div>
            <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5">
              Admin Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes visible only to admins…"
              rows={2}
              className="w-full text-sm px-3 py-2 rounded-lg border border-parchment-200 focus:outline-none focus:ring-2 focus:ring-ember-400 focus:border-transparent resize-none bg-white text-ink-800 placeholder-ink-400"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => decide('approved')}
              disabled={!!acting || localStatus === 'approved'}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {acting === 'approved' ? 'Approving…' : 'Approve'}
            </button>
            <button
              onClick={() => decide('rejected')}
              disabled={!!acting || localStatus === 'rejected'}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              {acting === 'rejected' ? 'Rejecting…' : 'Reject'}
            </button>
            <button
              onClick={() => decide('flagged')}
              disabled={!!acting || localStatus === 'flagged'}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              {acting === 'flagged' ? 'Flagging…' : 'Flag'}
            </button>
            {!isPending && (
              <button
                onClick={() => decide('pending')}
                disabled={!!acting}
                className="flex items-center gap-1.5 bg-white border border-parchment-200 hover:border-parchment-300 text-ink-600 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                Reset to Pending
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick-action bar for pending items (collapsed state) */}
      {!expanded && isPending && (
        <div className="px-4 pb-3 flex gap-2">
          <button
            onClick={() => decide('approved')}
            disabled={!!acting}
            className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-3 h-3" />
            {acting === 'approved' ? '…' : 'Approve'}
          </button>
          <button
            onClick={() => decide('rejected')}
            disabled={!!acting}
            className="flex items-center gap-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <XCircle className="w-3 h-3" />
            {acting === 'rejected' ? '…' : 'Reject'}
          </button>
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-1 bg-parchment-50 hover:bg-parchment-100 border border-parchment-200 text-ink-500 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            Review
          </button>
        </div>
      )}
    </div>
  );
}

type FilterTab = 'pending' | 'approved' | 'rejected' | 'flagged' | 'all';

export default function AdminApprovals() {
  useDocumentTitle('Membership Approvals | Write Together Hub Admin', 'Review and approve membership registrations and join requests.');
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState<MemberApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('pending');
  const [adminEmail, setAdminEmail] = useState('');
  const [totalPending, setTotalPending] = useState(0);
  const [sourceFilter, setSourceFilter] = useState<'all' | MemberApplicant['source']>('all');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate('/admin/login'); return; }
      setAdminEmail(data.user.email ?? '');
    });
  }, [navigate]);

  const fetchApplicants = useCallback(async () => {
    setLoading(true);

    const [regResult, joinResult] = await Promise.all([
      supabase.from('registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('join_requests').select('*').order('created_at', { ascending: false }),
    ]);

    const regs: MemberApplicant[] = (regResult.data ?? []).map((r) => ({ ...r, source: 'registrations' as const }));
    const joins: MemberApplicant[] = (joinResult.data ?? []).map((j) => ({ ...j, source: 'join_requests' as const }));

    const combined = [...regs, ...joins].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setApplicants(combined);
    setTotalPending(combined.filter((a) => a.status === 'pending').length);
    setLoading(false);
  }, []);

  useEffect(() => { fetchApplicants(); }, [fetchApplicants]);

  const handleDecision = async (
    id: string,
    source: MemberApplicant['source'],
    status: Status,
    admin_notes: string
  ) => {
    await supabase.from(source).update({ status, admin_notes }).eq('id', id);
    setApplicants((prev) =>
      prev.map((a) => (a.id === id && a.source === source ? { ...a, status, admin_notes } : a))
    );
    setTotalPending((prev) => {
      const applicant = applicants.find((a) => a.id === id && a.source === source);
      if (!applicant) return prev;
      const wasP = applicant.status === 'pending';
      const isNowP = status === 'pending';
      if (wasP && !isNowP) return prev - 1;
      if (!wasP && isNowP) return prev + 1;
      return prev;
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const filtered = applicants.filter((a) => {
    const matchStatus = filter === 'all' || a.status === filter;
    const matchSource = sourceFilter === 'all' || a.source === sourceFilter;
    return matchStatus && matchSource;
  });

  const counts: Record<FilterTab, number> = {
    pending:  applicants.filter((a) => a.status === 'pending').length,
    approved: applicants.filter((a) => a.status === 'approved').length,
    rejected: applicants.filter((a) => a.status === 'rejected').length,
    flagged:  applicants.filter((a) => a.status === 'flagged').length,
    all:      applicants.length,
  };

  const filterTabs: { key: FilterTab; label: string; color: string }[] = [
    { key: 'pending',  label: 'Pending',  color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { key: 'approved', label: 'Approved', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { key: 'rejected', label: 'Rejected', color: 'text-red-600 bg-red-50 border-red-200' },
    { key: 'flagged',  label: 'Flagged',  color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { key: 'all',      label: 'All',      color: 'text-ink-600 bg-parchment-50 border-parchment-200' },
  ];

  return (
    <div className="min-h-screen bg-parchment-50">
      <AdminHeader adminEmail={adminEmail} totalPending={totalPending} onSignOut={handleSignOut} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-5 h-5 text-ember-500" />
              <h1 className="font-serif font-bold text-ink-900 text-xl">Membership Approvals</h1>
              {totalPending > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalPending}
                </span>
              )}
            </div>
            <p className="text-ink-500 text-sm">Review and approve registrations and join requests.</p>
          </div>
          <button
            onClick={fetchApplicants}
            className="flex items-center gap-1.5 text-ink-500 hover:text-ink-800 text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:block">Refresh</span>
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-parchment-200 p-3 text-center">
            <p className="text-2xl font-bold text-amber-500">{counts.pending}</p>
            <p className="text-xs text-ink-500 mt-0.5 flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> Awaiting review</p>
          </div>
          <div className="bg-white rounded-xl border border-parchment-200 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{counts.approved}</p>
            <p className="text-xs text-ink-500 mt-0.5 flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</p>
          </div>
          <div className="bg-white rounded-xl border border-parchment-200 p-3 text-center">
            <p className="text-2xl font-bold text-red-500">{counts.rejected}</p>
            <p className="text-xs text-ink-500 mt-0.5 flex items-center justify-center gap-1"><XCircle className="w-3 h-3" /> Rejected</p>
          </div>
          <div className="bg-white rounded-xl border border-parchment-200 p-3 text-center">
            <p className="text-2xl font-bold text-ink-700">{counts.all}</p>
            <p className="text-xs text-ink-500 mt-0.5 flex items-center justify-center gap-1"><Users className="w-3 h-3" /> Total</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-1 bg-white border border-parchment-200 rounded-lg p-1">
            {filterTabs.map((ft) => (
              <button
                key={ft.key}
                onClick={() => setFilter(ft.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                  filter === ft.key ? ft.color : 'text-ink-400 border-transparent hover:text-ink-700'
                }`}
              >
                {ft.label}
                <span className={`text-[10px] font-bold ml-0.5 ${filter === ft.key ? '' : 'text-ink-400'}`}>
                  {counts[ft.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-white border border-parchment-200 rounded-lg p-1">
            {[
              { key: 'all' as const, label: 'All types' },
              { key: 'registrations' as const, label: 'Registrations' },
              { key: 'join_requests' as const, label: 'Join Requests' },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSourceFilter(s.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  sourceFilter === s.key
                    ? 'bg-ink-800 text-white'
                    : 'text-ink-400 hover:text-ink-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-ink-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Loading applicants…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-ink-400">
            <Inbox className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium">
              {filter === 'pending' ? 'All caught up!' : `No ${filter} applications`}
            </p>
            <p className="text-sm mt-1">
              {filter === 'pending' ? 'No applications awaiting review.' : 'Try a different filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => (
              <ApplicantCard key={`${a.source}-${a.id}`} applicant={a} onDecision={handleDecision} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
