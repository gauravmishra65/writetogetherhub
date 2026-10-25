import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminApprovals from '../pages/admin/AdminApprovals';

const mockInvoke = vi.fn();
const mockUpdateEq = vi.fn();
const mockUpdate = vi.fn((values: unknown) => { void values; return { eq: mockUpdateEq }; });

const joinRequest = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Asha Verma',
  email: 'asha@example.com',
  experience_level: 'beginner',
  writing_type: 'Short Story',
  interests: ['Getting feedback on my work'],
  message: 'Hello',
  status: 'pending',
  admin_notes: null,
  created_at: '2026-07-01T10:00:00Z',
};

type Row = Record<string, unknown>;
let joinRows: Row[] = [];
let regRows: Row[] = [];

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
    functions: { invoke: (...args: unknown[]) => mockInvoke(...args) },
    from: (table: string) => ({
      select: () => ({
        order: () => Promise.resolve({ data: table === 'join_requests' ? joinRows : regRows, error: null }),
      }),
      update: (values: unknown) => mockUpdate(values),
    }),
  },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminApprovals />
    </MemoryRouter>,
  );
}

describe('AdminApprovals approve flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    joinRows = [joinRequest];
    regRows = [];
    mockUpdateEq.mockResolvedValue({ error: null });
  });

  it('approving a join request calls the approve-applicant function', async () => {
    mockInvoke.mockResolvedValue({ data: { ok: true, emailSent: true }, error: null });
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Approve' }));

    await waitFor(() =>
      expect(mockInvoke).toHaveBeenCalledWith('approve-applicant', {
        body: { source: 'join_requests', id: joinRequest.id, admin_notes: '' },
      }),
    );
    expect(await screen.findByText(/an email with a link to create their password has been sent/i)).toBeInTheDocument();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('keeps the applicant pending and shows the error when approval fails', async () => {
    const response = new Response(JSON.stringify({ error: 'Could not create the member\'s login' }), { status: 500 });
    mockInvoke.mockResolvedValue({ data: null, error: { context: response } });
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Approve' }));

    expect(await screen.findByText(/could not create the member's login/i)).toBeInTheDocument();
    expect(screen.queryByText(/marked as approved/i)).not.toBeInTheDocument();
  });

  it('warns when the person is approved but the email could not be sent', async () => {
    const response = new Response(JSON.stringify({ ok: true, approved: true, emailSent: false, error: 'Approved, but the email could not be sent. Use Resend.' }), { status: 502 });
    mockInvoke.mockResolvedValue({ data: null, error: { context: response } });
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Approve' }));

    expect(await screen.findByText(/approved, but the email could not be sent/i)).toBeInTheDocument();
    // Approved, so the applicant has left the Pending list even though the email failed.
    expect(await screen.findByText('All caught up!')).toBeInTheDocument();
  });

  it('rejecting still uses a plain row update and does not email anyone', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Reject' }));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({ status: 'rejected', admin_notes: '' }));
    expect(mockInvoke).not.toHaveBeenCalled();
  });
});

describe('AdminApprovals send login emails', () => {
  const approvedJoin = (n: number, name: string) => ({
    id: `0000000${n}-0000-0000-0000-00000000000${n}`,
    name,
    email: `${name.split(' ')[0].toLowerCase()}@example.com`,
    status: 'approved',
    admin_notes: null,
    created_at: `2026-07-0${n}T10:00:00Z`,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockResolvedValue({ data: { ok: true, emailSent: true }, error: null });
    joinRows = [approvedJoin(1, 'Asha Verma'), approvedJoin(2, 'Ravi Kumar'), approvedJoin(3, 'Meera Das')];
    regRows = [
      // Meera already has a login: a registrations row linked to an auth user.
      { id: 'r-3', name: 'Meera Das', email: 'meera@example.com', status: 'approved', user_id: 'u-3', admin_notes: null, created_at: '2026-07-03T10:00:00Z' },
    ];
  });

  async function openApproved(user: ReturnType<typeof userEvent.setup>) {
    renderPage();
    await user.click(await screen.findByRole('button', { name: /^Approved\s*\d+$/ }));
  }

  it('marks approved people who have no login yet', async () => {
    const user = userEvent.setup();
    await openApproved(user);

    // Asha and Ravi have no login; Meera (matched by email) does.
    expect(await screen.findAllByText('No login yet')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /no login yet \(2\)/i })).toBeInTheDocument();
  });

  it('sends a login email to one person from their card', async () => {
    const user = userEvent.setup();
    await openApproved(user);

    const ashaCard = (await screen.findByText('Asha Verma')).closest('.rounded-2xl') as HTMLElement;
    await user.click(within(ashaCard).getByRole('button', { name: 'Send login email' }));

    await waitFor(() => expect(mockInvoke).toHaveBeenCalledTimes(1));
    expect(mockInvoke.mock.calls[0][0]).toBe('approve-applicant');
    expect(mockInvoke.mock.calls[0][1].body).toMatchObject({ source: 'join_requests', id: joinRows[0].id, resend: true });
    expect(await screen.findByText(/approval email sent/i)).toBeInTheDocument();
  });

  it('sends nothing until the admin confirms, and Cancel sends nothing', async () => {
    const user = userEvent.setup();
    await openApproved(user);

    await user.click(await screen.findByRole('button', { name: /no login yet \(2\)/i }));
    await user.click(screen.getByRole('button', { name: /select all shown/i }));
    await user.click(screen.getByRole('button', { name: /send login email to 2 selected/i }));

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('Asha Verma');
    expect(dialog).toHaveTextContent('Ravi Kumar');
    expect(dialog).not.toHaveTextContent('Meera Das');
    expect(mockInvoke).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockInvoke).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('after confirming, emails each selected person once and reports the result', async () => {
    const user = userEvent.setup();
    await openApproved(user);

    await user.click(await screen.findByRole('button', { name: /no login yet \(2\)/i }));
    await user.click(screen.getByRole('button', { name: /select all shown/i }));
    await user.click(screen.getByRole('button', { name: /send login email to 2 selected/i }));
    await user.click(await screen.findByRole('button', { name: /^Send 2 emails$/ }));

    expect(await screen.findByText(/sent 2 of 2/i)).toBeInTheDocument();
    expect(mockInvoke).toHaveBeenCalledTimes(2);
    const ids = mockInvoke.mock.calls.map((c) => c[1].body.id).sort();
    expect(ids).toEqual([joinRows[0].id, joinRows[1].id].sort());
    mockInvoke.mock.calls.forEach((c) => expect(c[1].body.resend).toBe(true));
    // Both now have a login, so the "No login yet" count drops to zero.
    expect(await screen.findByRole('button', { name: /no login yet \(0\)/i })).toBeInTheDocument();
  });

  it('lists who could not be emailed when one fails', async () => {
    mockInvoke
      .mockResolvedValueOnce({ data: { ok: true, emailSent: true }, error: null })
      .mockResolvedValueOnce({ data: null, error: { context: new Response(JSON.stringify({ error: "Could not create the member's login" }), { status: 500 }) } });
    const user = userEvent.setup();
    await openApproved(user);

    await user.click(await screen.findByRole('button', { name: /no login yet \(2\)/i }));
    await user.click(screen.getByRole('button', { name: /select all shown/i }));
    await user.click(screen.getByRole('button', { name: /send login email to 2 selected/i }));
    await user.click(await screen.findByRole('button', { name: /^Send 2 emails$/ }));

    expect(await screen.findByText(/sent 1 of 2/i)).toBeInTheDocument();
    expect(screen.getByText(/could not create the member's login/i)).toBeInTheDocument();
  });
});
