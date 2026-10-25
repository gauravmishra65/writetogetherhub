import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, MessageSquare, FileText,
  Trophy, BookMarked, Mail, CheckCircle, XCircle,
  Flag, Clock, ChevronDown, ChevronUp, Save, RefreshCw,
  BarChart3, MessagesSquare,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { approveApplicant, isApplicantTable, type DecisionResult } from '../../lib/approveApplicant';
import AdminHeader from '../../components/AdminHeader';
import { useDocumentTitle } from '../../lib/useDocumentTitle';

type Status = 'pending' | 'approved' | 'rejected' | 'flagged';

type Entry = Record<string, unknown> & {
  id: string;
  created_at: string;
  status: Status;
  admin_notes: string | null;
};

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: React.ElementType }> = {
  pending:  { label: 'Pending',  color: 'bg-amber-100 text-amber-800 border-amber-200',   icon: Clock },
  approved: { label: 'Approved', color: 'bg-sage-100 text-sage-800 border-sage-200',       icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200',           icon: XCircle },
  flagged:  { label: 'Flagged',  color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Flag },
};

const TABS = [
  { key: 'registrations',        label: 'Registrations',    icon: Users,           table: 'registrations' },
  { key: 'join_requests',        label: 'Join Requests',    icon: BookMarked,      table: 'join_requests' },
  { key: 'contact_messages',     label: 'Contact Messages', icon: Mail,            table: 'contact_messages' },
  { key: 'feedback_submissions', label: 'Feedback',         icon: MessageSquare,   table: 'feedback_submissions' },
  { key: 'feedback_replies',     label: 'Replies',          icon: MessagesSquare,  table: 'feedback_replies' },
  { key: 'challenge_entries',    label: 'Challenges',       icon: Trophy,          table: 'challenge_entries' },
  { key: 'forum_discussions',    label: 'Forum Posts',      icon: FileText,        table: 'forum_discussions' },
] as const;

type TabKey = typeof TABS[number]['key'];

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function entryTitle(tab: TabKey, entry: Entry): string {
  switch (tab) {
    case 'registrations':      return `${entry.name as string} — ${entry.email as string}`;
    case 'join_requests':      return `${entry.name as string} — ${entry.email as string}`;
    case 'contact_messages':   return `${(entry.subject as string) || 'No subject'} — ${entry.name as string}`;
    case 'feedback_submissions': return `${entry.title as string} by ${entry.author_name as string}`;
    case 'feedback_replies':     return `Reply by ${entry.author_name as string}`;
    case 'challenge_entries':  return `${entry.challenge_title as string} — ${entry.author_name as string}`;
    case 'forum_discussions':  return `${entry.title as string} — ${entry.author_name as string}`;
    default: return entry.id;
  }
}

function EntryDetail({ tab, entry }: { tab: TabKey; entry: Entry }) {
  const fields: [string, unknown][] = Object.entries(entry).filter(
    ([k]) => !['id', 'status', 'admin_notes', 'created_at'].includes(k)
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
      {fields.map(([key, val]) => {
        const display = Array.isArray(val)
          ? (val as string[]).join(', ')
          : val == null ? '—' : String(val);
        return (
          <div key={key}>
            <span className="text-ink-400 capitalize">{key.replace(/_/g, ' ')}: </span>
            <span className="text-ink-800 font-medium break-words">{display || '—'}</span>
          </div>
        );
      })}
      <div>
        <span className="text-ink-400">Submitted: </span>
        <span className="text-ink-800 font-medium">{formatDate(entry.created_at)}</span>
      </div>
    </div>
  );
}

function EntryCard({
  tab,
  entry,
  onUpdate,
}: {
  tab: TabKey;
  entry: Entry;
  onUpdate: (id: string, status: Status, notes: string) => Promise<boolean>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<Status>(entry.status ?? 'pending');
  const [notes, setNotes] = useState(entry.admin_notes ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDirty = status !== (entry.status ?? 'pending') || notes !== (entry.admin_notes ?? '');

  const save = async () => {
    setSaving(true);
    const ok = await onUpdate(entry.id, status, notes);
    setSaving(false);
    if (!ok) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={`border rounded-xl transition-all duration-200 ${expanded ? 'border-ember-200 shadow-md' : 'border-parchment-200 hover:border-parchment-300'} bg-white`}>
      {/* Header row */}
      <button
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <StatusBadge status={status} />
          <span className="text-ink-800 font-medium text-sm truncate">{entryTitle(tab, entry)}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-ink-400 text-xs hidden sm:block">{formatDate(entry.created_at)}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-ink-400" /> : <ChevronDown className="w-4 h-4 text-ink-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-parchment-100 pt-4 space-y-4">
          {/* Detail */}
          <EntryDetail tab={tab} entry={entry} />

          {/* Evaluation controls */}
          <div className="bg-parchment-50 rounded-lg p-4 space-y-3 border border-parchment-100">
            <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide">Evaluation</p>

            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_CONFIG) as Status[]).map((s) => {
                const cfg = STATUS_CONFIG[s];
                const Icon = cfg.icon;
                const active = status === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      active
                        ? `${cfg.color} border-current shadow-sm`
                        : 'bg-white text-ink-500 border-parchment-200 hover:border-parchment-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add admin notes (optional)…"
              rows={3}
              className="w-full text-sm px-3 py-2 rounded-lg border border-parchment-200 focus:outline-none focus:ring-2 focus:ring-ember-400 focus:border-transparent resize-none bg-white text-ink-800 placeholder-ink-400"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={save}
                disabled={saving || !isDirty}
                className="flex items-center gap-1.5 bg-ember-600 hover:bg-ember-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
              </button>
              {saved && <span className="text-sage-600 text-xs flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Saved</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  useDocumentTitle('Admin Dashboard | Write Together Hub', 'Manage community submissions, feedback, forum posts, and challenges from the admin dashboard.');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('registrations');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [notice, setNotice] = useState<DecisionResult | null>(null);
  const [counts, setCounts] = useState<Record<TabKey, number>>({} as Record<TabKey, number>);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate('/admin/login'); return; }
      setAdminEmail(data.user.email ?? '');
    });
  }, [navigate]);

  const fetchCounts = useCallback(async () => {
    const results = await Promise.all(
      TABS.map(async (t) => {
        const { count } = await supabase.from(t.table).select('id', { count: 'exact', head: true }).eq('status', 'pending');
        return [t.key, count ?? 0] as [TabKey, number];
      })
    );
    setCounts(Object.fromEntries(results) as Record<TabKey, number>);
  }, []);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const tab = TABS.find((t) => t.key === activeTab)!;
    let q = supabase.from(tab.table).select('*').order('created_at', { ascending: false });
    if (filterStatus !== 'all') q = q.eq('status', filterStatus);
    const { data } = await q;
    setEntries((data as Entry[]) ?? []);
    setLoading(false);
  }, [activeTab, filterStatus]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);
  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const handleUpdate = async (id: string, status: Status, admin_notes: string): Promise<boolean> => {
    const tab = TABS.find((t) => t.key === activeTab)!;
    const previous = entries.find((e) => e.id === id);
    let result: DecisionResult = { ok: true };

    if (status === 'approved' && previous?.status !== 'approved' && isApplicantTable(tab.table)) {
      // Approving a person must create their login and email them — never a bare status update.
      result = await approveApplicant(tab.table, id, { admin_notes });
    } else {
      const { error } = await supabase.from(tab.table).update({ status, admin_notes }).eq('id', id);
      if (error) result = { ok: false, message: 'Could not save this change. Please try again.' };
    }

    if (result.message) setNotice(result);
    if (!result.ok) return false;
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, status, admin_notes } : e));
    fetchCounts();
    return true;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const totalPending = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-parchment-50">
      <AdminHeader
        adminEmail={adminEmail}
        totalPending={totalPending}
        onSignOut={handleSignOut}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {notice?.message && (
          <div
            role="status"
            className={`sticky top-2 z-10 mb-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${
              !notice.ok ? 'bg-red-50 border-red-200 text-red-700'
                : notice.warn ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <span>{notice.message}</span>
            <button onClick={() => setNotice(null)} aria-label="Dismiss" className="text-xs font-semibold opacity-70 hover:opacity-100">
              Dismiss
            </button>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const pending = counts[tab.key] ?? 0;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setFilterStatus('all'); }}
                className={`rounded-xl p-3 text-left transition-all border ${
                  active
                    ? 'bg-ember-600 border-ember-700 text-white shadow-md'
                    : 'bg-white border-parchment-200 hover:border-parchment-300 text-ink-700'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1.5 ${active ? 'text-white' : 'text-ember-500'}`} />
                <p className={`text-xs font-semibold leading-tight ${active ? 'text-white' : 'text-ink-800'}`}>{tab.label}</p>
                {pending > 0 && (
                  <p className={`text-xs mt-0.5 ${active ? 'text-ember-200' : 'text-amber-600'}`}>{pending} pending</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter + refresh bar */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-1 bg-white border border-parchment-200 rounded-lg p-1">
            {(['all', ...Object.keys(STATUS_CONFIG)] as (Status | 'all')[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  filterStatus === s
                    ? 'bg-ember-600 text-white'
                    : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchEntries}
            className="flex items-center gap-1.5 text-ink-500 hover:text-ink-800 text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:block">Refresh</span>
          </button>
        </div>

        {/* Entry list */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-ink-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Loading entries…
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-ink-400">
            <BarChart3 className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium">No entries found</p>
            <p className="text-sm mt-1">
              {filterStatus !== 'all' ? `No ${filterStatus} entries in this category` : 'Nothing submitted yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <EntryCard key={entry.id} tab={activeTab} entry={entry} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
