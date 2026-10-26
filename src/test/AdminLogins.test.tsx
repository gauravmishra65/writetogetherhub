import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminLogins from '../pages/admin/AdminLogins';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

const base = {
  member_status: 'approved',
  member_role: 'member',
  email_confirmed: true,
  has_active_session: false,
  invited_by_admin: false,
  is_admin: false,
  sign_in_count: 0,
};

const ROWS = [
  { ...base, user_id: 'u1', name: 'Asha Verma', email: 'asha@example.com', created_at: hoursAgo(500), last_sign_in_at: hoursAgo(2), sign_in_count: 4, has_active_session: true, is_admin: true },
  { ...base, user_id: 'u2', name: 'Ravi Kumar', email: 'ravi@example.com', created_at: hoursAgo(300), last_sign_in_at: hoursAgo(24 * 60), sign_in_count: '1' },
  { ...base, user_id: 'u3', name: 'Meera Das', email: 'meera@example.com', created_at: hoursAgo(100), last_sign_in_at: null, invited_by_admin: true },
  { ...base, user_id: 'u4', name: 'Tom Hall', email: 'tom@example.com', created_at: hoursAgo(50), last_sign_in_at: null, email_confirmed: false },
];

const EVENTS = [
  { id: 'e1', user_id: 'u1', email: 'asha@example.com', signed_in_at: hoursAgo(2), ip: '203.0.113.7', user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152.0 Safari/537.36', backfilled: false },
  { id: 'e2', user_id: 'u2', email: 'ravi@example.com', signed_in_at: hoursAgo(24 * 60), ip: null, user_agent: null, backfilled: true },
];

let rpcResult: { data: unknown; error: { message: string; code?: string } | null };

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { email: 'admin@example.com' } } }),
      signOut: vi.fn(),
    },
    rpc: () => Promise.resolve(rpcResult),
    from: () => ({
      select: () => ({
        order: () => ({ limit: () => Promise.resolve({ data: EVENTS, error: null }) }),
      }),
    }),
  },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminLogins />
    </MemoryRouter>,
  );
}

describe('AdminLogins page', () => {
  beforeEach(() => {
    rpcResult = { data: ROWS, error: null };
  });

  it('shows a summary of who has and has not signed in', async () => {
    renderPage();
    expect(await screen.findByText('Asha Verma')).toBeInTheDocument();

    // Some labels are also filter buttons; the summary cards come first on the page.
    const card = (label: string) => screen.getAllByText(label)[0].closest('div') as HTMLElement;
    expect(within(card('Members with a login')).getByText('4')).toBeInTheDocument();
    expect(within(card('Signed in (30 days)')).getByText('1')).toBeInTheDocument();
    expect(within(card('Never signed in')).getByText('1')).toBeInTheDocument();
    expect(within(card('Email not confirmed')).getByText('1')).toBeInTheDocument();
  });

  it('labels each member clearly', async () => {
    renderPage();
    const asha = (await screen.findByText('Asha Verma')).closest('li') as HTMLElement;
    expect(within(asha).getByText('Active this week')).toBeInTheDocument();
    expect(within(asha).getByText('Admin')).toBeInTheDocument();
    expect(within(asha).getByText('Signed in now')).toBeInTheDocument();

    const meera = screen.getByText('Meera Das').closest('li') as HTMLElement;
    expect(within(meera).getByText('Never signed in')).toBeInTheDocument();
    expect(within(meera).getByText('Invited by admin')).toBeInTheDocument();

    const tom = screen.getByText('Tom Hall').closest('li') as HTMLElement;
    expect(within(tom).getByText('Email not confirmed')).toBeInTheDocument();
  });

  it('filters to people who never signed in', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Asha Verma');

    await user.click(screen.getByRole('button', { name: /^Never signed in\s*1$/ }));

    expect(screen.getByText('Meera Das')).toBeInTheDocument();
    expect(screen.queryByText('Asha Verma')).not.toBeInTheDocument();
    expect(screen.queryByText('Ravi Kumar')).not.toBeInTheDocument();
  });

  it('searches by name or email', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Asha Verma');

    await user.type(screen.getByLabelText('Search members'), 'ravi@');

    expect(screen.getByText('Ravi Kumar')).toBeInTheDocument();
    expect(screen.queryByText('Asha Verma')).not.toBeInTheDocument();
  });

  it('lists recent sign-ins with device and IP, and marks pre-monitoring ones', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Asha Verma');

    await user.click(screen.getByRole('button', { name: 'Recent sign-ins' }));

    expect(await screen.findByText('Chrome on Windows')).toBeInTheDocument();
    expect(screen.getByText('203.0.113.7')).toBeInTheDocument();
    expect(screen.getByText(/before monitoring started/i)).toBeInTheDocument();
  });

  it('explains the problem when the database update is not applied yet', async () => {
    rpcResult = { data: null, error: { message: 'Could not find the function public.admin_login_overview', code: 'PGRST202' } };
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(/not set up in the database yet/i);
    expect(screen.queryByText('Asha Verma')).not.toBeInTheDocument();
  });

  it('tells non-admins they cannot view it', async () => {
    rpcResult = { data: null, error: { message: 'admins only', code: '42501' } };
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(/only admins/i);
  });
});
