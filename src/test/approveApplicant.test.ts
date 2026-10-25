// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

/**
 * Exercises the approve-applicant edge function (a Deno program) in Node by stubbing
 * the Deno globals, the Supabase client and Resend. It checks the decision logic:
 * who may call it, which email each kind of applicant gets, and failure handling.
 */

type Row = Record<string, unknown>;
type FakeUser = { id: string; email: string; last_sign_in_at: string | null; user_metadata: Record<string, unknown> };

let db: Record<string, Row[]>;
let authUsers: FakeUser[];
const createUser = vi.fn();
const generateLink = vi.fn();
const resendFetch = vi.fn();

const ADMIN_ID = 'admin-1';
const TOKENS: Record<string, string> = { 'admin-token': ADMIN_ID, 'member-token': 'member-1' };

vi.mock('jsr:@supabase/functions-js/edge-runtime.d.ts', () => ({}));

vi.mock('npm:@supabase/supabase-js@2', () => ({
  createClient: (_url: string, key: string, opts?: { global?: { headers?: Record<string, string> } }) => {
    function from(table: string) {
      const filters: Row = {};
      let op: 'select' | 'update' = 'select';
      let payload: Row = {};
      const matches = () => (db[table] ?? []).filter((r) => Object.entries(filters).every(([k, v]) => r[k] === v));
      const q: Record<string, unknown> = {
        select: () => q,
        eq: (col: string, val: unknown) => { filters[col] = val; return q; },
        maybeSingle: async () => ({ data: matches()[0] ?? null, error: null }),
        update: (patch: Row) => { op = 'update'; payload = patch; return q; },
        insert: async (row: Row) => {
          (db[table] ??= []).push({ id: `row-${(db[table]?.length ?? 0) + 1}`, ...row });
          return { error: null };
        },
        then: (resolve: (v: unknown) => void) => {
          if (op === 'update') matches().forEach((r) => Object.assign(r, payload));
          resolve({ error: null });
        },
      };
      return q;
    }

    const bearer = opts?.global?.headers?.Authorization?.replace(/^Bearer /i, '') ?? '';
    return {
      from,
      auth: {
        getUser: async () => {
          const id = TOKENS[bearer];
          return id ? { data: { user: { id } }, error: null } : { data: { user: null }, error: { message: 'bad jwt' } };
        },
        admin: key === 'service-key'
          ? {
              createUser,
              generateLink,
              getUserById: async (id: string) => ({ data: { user: authUsers.find((u) => u.id === id) ?? null } }),
              listUsers: async () => ({ data: { users: authUsers }, error: null }),
            }
          : undefined,
      },
    };
  },
}));

let handler: (req: Request) => Promise<Response>;

beforeAll(async () => {
  const env: Record<string, string> = {
    SUPABASE_URL: 'https://proj.supabase.co',
    SUPABASE_ANON_KEY: 'anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'service-key',
    RESEND_API_KEY: 're_test',
  };
  (globalThis as Record<string, unknown>).Deno = {
    env: { get: (k: string) => env[k] },
    serve: (h: typeof handler) => { handler = h; },
  };
  globalThis.fetch = resendFetch as unknown as typeof fetch;
  const modulePath = '../../supabase/functions/approve-applicant/index.ts';
  await import(/* @vite-ignore */ modulePath);
});

const JOIN_ID = '11111111-1111-1111-1111-111111111111';
const REG_ID = '22222222-2222-2222-2222-222222222222';

function call(body: unknown, token: string | null = 'admin-token') {
  return handler(new Request('https://proj.supabase.co/functions/v1/approve-applicant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://writetogetherhub.com', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  }));
}

function sentEmail() {
  const init = resendFetch.mock.calls[0]?.[1] as { body: string } | undefined;
  return init ? JSON.parse(init.body) : null;
}

beforeEach(() => {
  vi.clearAllMocks();
  authUsers = [];
  db = {
    admins: [{ user_id: ADMIN_ID }],
    registrations: [],
    join_requests: [{
      id: JOIN_ID, name: 'Asha Verma', email: 'Asha@Example.com', status: 'pending',
      experience_level: 'beginner', writing_type: 'Short Story', interests: ['Getting feedback on my work'], message: 'Hello', admin_notes: null,
    }],
  };
  resendFetch.mockResolvedValue({ ok: true, text: async () => '' });
  createUser.mockImplementation(async ({ email, user_metadata }: { email: string; user_metadata: Record<string, unknown> }) => {
    const user = { id: 'new-user-1', email, last_sign_in_at: null, user_metadata };
    authUsers.push(user);
    // handle_new_user() trigger mirrors the account into registrations as pending.
    db.registrations.push({ id: 'reg-new', user_id: user.id, email, name: user_metadata.name, status: 'pending', role: 'member' });
    return { data: { user }, error: null };
  });
  generateLink.mockResolvedValue({ data: { properties: { hashed_token: 'hash/with+chars' } }, error: null });
});

describe('approve-applicant access control', () => {
  it('rejects callers who are not signed in', async () => {
    expect((await call({ source: 'join_requests', id: JOIN_ID }, null)).status).toBe(401);
    expect((await call({ source: 'join_requests', id: JOIN_ID }, 'garbage')).status).toBe(401);
    expect(createUser).not.toHaveBeenCalled();
    expect(resendFetch).not.toHaveBeenCalled();
  });

  it('rejects signed-in members who are not admins', async () => {
    const res = await call({ source: 'join_requests', id: JOIN_ID }, 'member-token');
    expect(res.status).toBe(403);
    expect(createUser).not.toHaveBeenCalled();
    expect(resendFetch).not.toHaveBeenCalled();
  });

  it('validates the request body', async () => {
    expect((await call({ source: 'admins', id: JOIN_ID })).status).toBe(400);
    expect((await call({ source: 'join_requests', id: 'nope' })).status).toBe(400);
    expect((await call({ source: 'join_requests', id: '99999999-9999-9999-9999-999999999999' })).status).toBe(404);
  });
});

describe('approve-applicant for a join request (no account yet)', () => {
  it('creates a confirmed passwordless account, approves, and emails a set-password link', async () => {
    const res = await call({ source: 'join_requests', id: JOIN_ID });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, emailSent: true, kind: 'set_password' });

    expect(createUser).toHaveBeenCalledWith({
      email: 'asha@example.com',
      email_confirm: true,
      user_metadata: { name: 'Asha Verma', invited_by_admin: true },
    });
    expect(generateLink).toHaveBeenCalledWith({ type: 'recovery', email: 'asha@example.com' });

    expect(db.join_requests[0].status).toBe('approved');
    const reg = db.registrations[0];
    expect(reg).toMatchObject({ status: 'approved', user_id: 'new-user-1', experience_level: 'beginner', writing_type: 'Short Story', bio: 'Hello' });
    expect(reg.role).toBe('member');

    const mail = sentEmail();
    expect(mail.to).toEqual(['asha@example.com']);
    expect(mail.subject).toMatch(/confirm your email and create your password/i);
    expect(mail.html).toContain('https://writetogetherhub.com/reset-password?token_hash=hash%2Fwith%2Bchars&type=recovery');
    expect(mail.html).toContain('Hi Asha');
  });

  it('does not overwrite what the member already typed, or an admin role', async () => {
    authUsers.push({ id: 'u-existing', email: 'asha@example.com', last_sign_in_at: '2026-07-01', user_metadata: {} });
    db.registrations.push({ id: 'reg-1', user_id: 'u-existing', email: 'asha@example.com', name: 'Asha', status: 'pending', role: 'admin', experience_level: 'advanced', bio: null });

    await call({ source: 'join_requests', id: JOIN_ID });

    expect(db.registrations[0]).toMatchObject({ role: 'admin', experience_level: 'advanced', status: 'approved', bio: 'Hello' });
    expect(createUser).not.toHaveBeenCalled();
  });

  it('escapes HTML in the applicant name', async () => {
    db.join_requests[0].name = '<script>alert(1)</script> Asha';
    await call({ source: 'join_requests', id: JOIN_ID });
    expect(sentEmail().html).not.toContain('<script>');
  });

  it('refuses to approve twice but allows an explicit resend', async () => {
    await call({ source: 'join_requests', id: JOIN_ID });
    expect((await call({ source: 'join_requests', id: JOIN_ID })).status).toBe(409);

    resendFetch.mockClear();
    // They have not set a password yet (password_set not true), so a new link is issued.
    const res = await call({ source: 'join_requests', id: JOIN_ID, resend: true });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ kind: 'set_password' });
    expect(resendFetch).toHaveBeenCalledTimes(1);
  });

  it('sends a plain sign-in email on resend once the member has set their password', async () => {
    await call({ source: 'join_requests', id: JOIN_ID });
    authUsers[0].user_metadata.password_set = true;
    generateLink.mockClear();
    resendFetch.mockClear();

    const res = await call({ source: 'join_requests', id: JOIN_ID, resend: true });
    expect(await res.json()).toMatchObject({ kind: 'signed_up' });
    expect(generateLink).not.toHaveBeenCalled();
    expect(sentEmail().html).not.toContain('token_hash');
  });

  it('reports approval but a failed email so the admin can resend', async () => {
    resendFetch.mockResolvedValue({ ok: false, status: 422, text: async () => 'bad' });
    const res = await call({ source: 'join_requests', id: JOIN_ID });
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({ approved: true, emailSent: false });
    expect(db.join_requests[0].status).toBe('approved');
  });

  it('does not email anyone if the account cannot be created', async () => {
    createUser.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const res = await call({ source: 'join_requests', id: JOIN_ID });
    expect(res.status).toBe(500);
    expect(resendFetch).not.toHaveBeenCalled();
    expect(db.join_requests[0].status).toBe('pending');
  });
});

describe('approve-applicant for a registration (member chose a password at sign-up)', () => {
  beforeEach(() => {
    authUsers.push({ id: 'u-reg', email: 'ravi@example.com', last_sign_in_at: null, user_metadata: { name: 'Ravi' } });
    db.registrations.push({ id: REG_ID, user_id: 'u-reg', email: 'ravi@example.com', name: 'Ravi', status: 'pending', role: 'member' });
  });

  it('marks them approved and sends a sign-in email without creating a password link', async () => {
    const res = await call({ source: 'registrations', id: REG_ID });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ kind: 'signed_up' });

    expect(createUser).not.toHaveBeenCalled();
    expect(generateLink).not.toHaveBeenCalled();
    expect(db.registrations[0].status).toBe('approved');
    const mail = sentEmail();
    expect(mail.to).toEqual(['ravi@example.com']);
    expect(mail.html).toContain('https://writetogetherhub.com/login');
    expect(mail.html).not.toContain('token_hash');
  });
});
