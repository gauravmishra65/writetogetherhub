import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
        order: () => Promise.resolve({ data: table === 'join_requests' ? [joinRequest] : [], error: null }),
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
