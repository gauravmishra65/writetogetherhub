export type LoginRow = {
  user_id: string;
  email: string;
  name: string;
  member_status: string | null;
  member_role: string | null;
  created_at: string;
  email_confirmed: boolean;
  last_sign_in_at: string | null;
  sign_in_count: number;
  has_active_session: boolean;
  invited_by_admin: boolean;
  is_admin: boolean;
};

export type LoginEvent = {
  id: string;
  user_id: string;
  email: string;
  signed_in_at: string;
  ip: string | null;
  user_agent: string | null;
  /** A single row standing in for a sign-in that happened before monitoring began. */
  backfilled: boolean;
};

export type LoginState = 'never' | 'unconfirmed' | 'active7' | 'active30' | 'inactive';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Where a login sits: never signed in, or how recently they last did. */
export function loginState(
  row: Pick<LoginRow, 'last_sign_in_at' | 'email_confirmed'>,
  now: number = Date.now(),
): LoginState {
  if (!row.last_sign_in_at) return row.email_confirmed ? 'never' : 'unconfirmed';
  const age = now - new Date(row.last_sign_in_at).getTime();
  if (age <= 7 * DAY) return 'active7';
  if (age <= 30 * DAY) return 'active30';
  return 'inactive';
}

export function relativeTime(iso: string | null, now: number = Date.now()): string {
  if (!iso) return 'Never';
  const diff = now - new Date(iso).getTime();
  if (diff < 0 || diff < MINUTE) return 'Just now';
  if (diff < HOUR) {
    const m = Math.floor(diff / MINUTE);
    return `${m} minute${m === 1 ? '' : 's'} ago`;
  }
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  if (diff < 30 * DAY) {
    const d = Math.floor(diff / DAY);
    return `${d} day${d === 1 ? '' : 's'} ago`;
  }
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** "Chrome on Windows" from a user-agent string; deliberately simple. */
export function describeDevice(userAgent: string | null): string {
  if (!userAgent) return 'Unknown device';
  const ua = userAgent;

  const browser =
    /Edg\//.test(ua) ? 'Edge'
    : /OPR\/|Opera/.test(ua) ? 'Opera'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Chrome\/|CriOS\//.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari'
    : /curl\//i.test(ua) ? 'curl'
    : null;

  const os =
    /Windows/.test(ua) ? 'Windows'
    : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad|iPod/.test(ua) ? 'iOS'
    : /Mac OS X|Macintosh/.test(ua) ? 'macOS'
    : /Linux/.test(ua) ? 'Linux'
    : null;

  if (browser && os) return `${browser} on ${os}`;
  return browser ?? os ?? 'Unknown device';
}
