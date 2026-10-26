import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, Search, KeyRound, Users, Activity, ShieldCheck, MailWarning, UserX, Monitor, Info,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminHeader from '../../components/AdminHeader';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import {
  describeDevice, formatDateTime, loginState, relativeTime,
  type LoginEvent, type LoginRow, type LoginState,
} from '../../lib/loginMonitor';

type Tab = 'members' | 'activity';
type Filter = 'all' | 'never' | 'recent' | 'inactive' | 'unconfirmed' | 'admins';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'recent', label: 'Signed in (30 days)' },
  { key: 'never', label: 'Never signed in' },
  { key: 'inactive', label: 'Inactive 30+ days' },
  { key: 'unconfirmed', label: 'Email not confirmed' },
  { key: 'admins', label: 'Admins' },
];

function matchesFilter(row: LoginRow, state: LoginState, filter: Filter): boolean {
  switch (filter) {
    case 'all': return true;
    case 'recent': return state === 'active7' || state === 'active30';
    case 'never': return state === 'never';
    case 'inactive': return state === 'inactive';
    case 'unconfirmed': return state === 'unconfirmed';
    case 'admins': return row.is_admin;
  }
}

const STATE_BADGE: Record<LoginState, { label: string; cls: string }> = {
  active7: { label: 'Active this week', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  active30: { label: 'Active this month', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  inactive: { label: 'Inactive', cls: 'bg-parchment-100 text-ink-600 border-parchment-200' },
  never: { label: 'Never signed in', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  unconfirmed: { label: 'Email not confirmed', cls: 'bg-red-50 text-red-700 border-red-200' },
};

function Badge({ children, cls }: { children: React.ReactNode; cls: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${cls}`}>
      {children}
    </span>
  );
}

function friendlyError(message: string, code?: string): string {
  if (code === '42501' || /admins only/i.test(message)) {
    return 'Only admins can view login activity.';
  }
  if (code === 'PGRST202' || code === '42883' || /could not find the function|does not exist/i.test(message)) {
    return 'Login activity is not set up in the database yet. The database update for this page still needs to be applied.';
  }
  return 'Could not load login activity. Please refresh and try again.';
}

export default function AdminLogins() {
  useDocumentTitle('Login Activity | Write Together Hub Admin', 'See who has signed in to Write Together Hub and when.');
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState('');
  const [rows, setRows] = useState<LoginRow[]>([]);
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('members');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate('/admin/login'); return; }
      setAdminEmail(data.user.email ?? '');
    });
  }, [navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [overview, recent] = await Promise.all([
      supabase.rpc('admin_login_overview'),
      supabase.from('login_events').select('*').order('signed_in_at', { ascending: false }).limit(200),
    ]);

    if (overview.error) {
      setError(friendlyError(overview.error.message, overview.error.code));
      setRows([]);
      setEvents([]);
      setLoading(false);
      return;
    }

    setRows(((overview.data ?? []) as LoginRow[]).map((r) => ({ ...r, sign_in_count: Number(r.sign_in_count) })));
    setEvents((recent.data ?? []) as LoginEvent[]);
    setNow(Date.now());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const states = useMemo(() => new Map(rows.map((r) => [r.user_id, loginState(r, now)])), [rows, now]);

  const summary = useMemo(() => {
    const count = (fn: (s: LoginState, r: LoginRow) => boolean) =>
      rows.filter((r) => fn(states.get(r.user_id)!, r)).length;
    return {
      total: rows.length,
      recent: count((s) => s === 'active7' || s === 'active30'),
      week: count((s) => s === 'active7'),
      never: count((s) => s === 'never'),
      unconfirmed: count((s) => s === 'unconfirmed'),
    };
  }, [rows, states]);

  const filterCounts = useMemo(() => {
    const out = {} as Record<Filter, number>;
    FILTERS.forEach((f) => { out[f.key] = rows.filter((r) => matchesFilter(r, states.get(r.user_id)!, f.key)).length; });
    return out;
  }, [rows, states]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (!matchesFilter(r, states.get(r.user_id)!, filter)) return false;
      return !q || r.email.includes(q) || r.name.toLowerCase().includes(q);
    });
  }, [rows, states, filter, query]);

  const byUser = useMemo(() => new Map(rows.map((r) => [r.user_id, r])), [rows]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const cards = [
    { label: 'Members with a login', value: summary.total, icon: Users, color: 'text-ink-700' },
    { label: 'Signed in (30 days)', value: summary.recent, icon: Activity, color: 'text-emerald-600' },
    { label: 'Signed in this week', value: summary.week, icon: ShieldCheck, color: 'text-sky-600' },
    { label: 'Never signed in', value: summary.never, icon: UserX, color: 'text-amber-600' },
    { label: 'Email not confirmed', value: summary.unconfirmed, icon: MailWarning, color: 'text-red-500' },
  ];

  return (
    <div className="min-h-screen bg-parchment-50">
      <AdminHeader adminEmail={adminEmail} totalPending={0} onSignOut={handleSignOut} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <KeyRound className="w-5 h-5 text-ember-500" />
              <h1 className="font-serif font-bold text-ink-900 text-xl">Login Activity</h1>
            </div>
            <p className="text-ink-500 text-sm">See who has signed in, when, and who still needs a nudge.</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-ink-500 hover:text-ink-800 text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:block">Refresh</span>
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!error && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {cards.map((c) => (
                <div key={c.label} className="bg-white rounded-xl border border-parchment-200 p-3 text-center">
                  <p className={`text-2xl font-bold ${c.color}`}>{loading ? '–' : c.value}</p>
                  <p className="text-xs text-ink-500 mt-0.5 flex items-center justify-center gap-1">
                    <c.icon className="w-3 h-3" /> {c.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-white border border-parchment-200 rounded-lg p-1 w-fit mb-4">
              {([['members', 'Members'], ['activity', 'Recent sign-ins']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  aria-pressed={tab === key}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    tab === key ? 'bg-ink-800 text-white' : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === 'members' && (
              <>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-label="Search members"
                      placeholder="Search by name or email"
                      className="w-full rounded-lg border border-parchment-200 bg-white py-2 pl-9 pr-3 text-sm text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-ember-400"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1 bg-white border border-parchment-200 rounded-lg p-1">
                    {FILTERS.map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        aria-pressed={filter === f.key}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                          filter === f.key ? 'bg-ember-50 text-ember-700' : 'text-ink-500 hover:text-ink-800'
                        }`}
                      >
                        {f.label} <span className="text-[10px] opacity-70">{filterCounts[f.key]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <p className="py-16 text-center text-sm text-ink-400">Loading login activity…</p>
                ) : visible.length === 0 ? (
                  <p className="py-16 text-center text-sm text-ink-400">No members match this view.</p>
                ) : (
                  <ul className="space-y-2">
                    {visible.map((r) => {
                      const state = states.get(r.user_id)!;
                      const badge = STATE_BADGE[state];
                      return (
                        <li key={r.user_id} className="rounded-xl border border-parchment-200 bg-white p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-ink-900 text-sm">{r.name}</span>
                                <Badge cls={badge.cls}>{badge.label}</Badge>
                                {r.is_admin && <Badge cls="bg-violet-50 text-violet-700 border-violet-200">Admin</Badge>}
                                {r.invited_by_admin && <Badge cls="bg-parchment-100 text-ink-600 border-parchment-200">Invited by admin</Badge>}
                                {r.has_active_session && <Badge cls="bg-emerald-50 text-emerald-700 border-emerald-200">Signed in now</Badge>}
                                {r.member_status && r.member_status !== 'approved' && (
                                  <Badge cls="bg-orange-50 text-orange-700 border-orange-200">{r.member_status}</Badge>
                                )}
                              </div>
                              <p className="mt-0.5 text-xs text-ink-500">{r.email}</p>
                            </div>
                            <dl className="grid grid-cols-3 gap-x-6 text-right text-xs">
                              <div>
                                <dt className="text-ink-400">Joined</dt>
                                <dd className="font-medium text-ink-800">{relativeTime(r.created_at, now)}</dd>
                              </div>
                              <div>
                                <dt className="text-ink-400">Last sign-in</dt>
                                <dd className="font-medium text-ink-800" title={formatDateTime(r.last_sign_in_at)}>
                                  {relativeTime(r.last_sign_in_at, now)}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-ink-400">Sign-ins</dt>
                                <dd className="font-medium text-ink-800">{r.sign_in_count}</dd>
                              </div>
                            </dl>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}

            {tab === 'activity' && (
              loading ? (
                <p className="py-16 text-center text-sm text-ink-400">Loading login activity…</p>
              ) : events.length === 0 ? (
                <p className="py-16 text-center text-sm text-ink-400">No sign-ins recorded yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-parchment-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-parchment-200 bg-parchment-50 text-ink-500">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">When</th>
                        <th className="px-4 py-2.5 font-semibold">Member</th>
                        <th className="px-4 py-2.5 font-semibold">Device</th>
                        <th className="px-4 py-2.5 font-semibold">IP address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-parchment-100">
                      {events.map((e) => {
                        const who = byUser.get(e.user_id);
                        return (
                          <tr key={e.id}>
                            <td className="px-4 py-2.5 align-top">
                              <div className="font-medium text-ink-800">{relativeTime(e.signed_in_at, now)}</div>
                              <div className="text-ink-400">{formatDateTime(e.signed_in_at)}</div>
                            </td>
                            <td className="px-4 py-2.5 align-top">
                              <div className="font-medium text-ink-800">{who?.name ?? e.email}</div>
                              <div className="text-ink-400">{e.email}</div>
                            </td>
                            <td className="px-4 py-2.5 align-top text-ink-700">
                              {e.backfilled ? (
                                <span className="text-ink-400">Last sign-in before monitoring started</span>
                              ) : (
                                <span className="inline-flex items-center gap-1"><Monitor className="w-3 h-3 text-ink-400" />{describeDevice(e.user_agent)}</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 align-top text-ink-700">{e.ip ?? '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}

            <div className="mt-6 flex items-start gap-2 rounded-xl border border-parchment-200 bg-white px-4 py-3 text-xs text-ink-500">
              <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <p>
                Sign-ins are recorded from the moment this page was added; each member shows their last known
                sign-in from before then. Failed password attempts are not stored here — see Supabase →
                Logs for those. IP addresses are personal data: keep them to admin use only.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
