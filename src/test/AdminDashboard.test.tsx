import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '../pages/admin/AdminDashboard';

const mockInvoke = vi.fn();
const updatedTables: string[] = [];
const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });

const joinRequest = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Asha Verma',
  email: 'asha@example.com',
  status: 'pending',
  admin_notes: null,
  created_at: '2026-07-01T10:00:00Z',
};

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => vi.fn() };
});

// A query chain that can be awaited at any point, like the real Supabase builder.
function queryChain(rows: unknown[]) {
  const chain: Record<string, unknown> = {
    eq: () => chain,
    order: () => chain,
    then: (resolve: (v: unknown) => void) => resolve({ data: rows, count: rows.length, error: null }),
  };
  return chain;
}

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { email: 'admin@example.com' } } }),
      signOut: vi.fn(),
    },
    functions: { invoke: (...args: unknown[]) => mockInvoke(...args) },
    from: (table: string) => ({
      select: () => queryChain(table === 'join_requests' ? [joinRequest] : []),
      update: () => { updatedTables.push(table); return { eq: mockUpdateEq }; },
    }),
  },
}));

async function openJoinRequestAndChoose(user: ReturnType<typeof userEvent.setup>, statusLabel: RegExp) {
  render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
  await user.click(await screen.findByRole('button', { name: /join requests/i }));
  await user.click(await screen.findByRole('button', { name: /asha verma/i }));
  // The same labels exist as list filters above; the decision buttons are the last matches.
  await screen.findByText('Evaluation');
  await user.click(screen.getAllByRole('button', { name: statusLabel }).at(-1)!);
  await user.click(screen.getByRole('button', { name: /^save$/i }));
}

describe('AdminDashboard approvals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updatedTables.length = 0;
  });

  it('approving a join request creates their login via the edge function, not a bare status update', async () => {
    mockInvoke.mockResolvedValue({ data: { ok: true, emailSent: true }, error: null });
    await openJoinRequestAndChoose(userEvent.setup(), /^approved$/i);

    await waitFor(() =>
      expect(mockInvoke).toHaveBeenCalledWith('approve-applicant', {
        body: { source: 'join_requests', id: joinRequest.id, admin_notes: '' },
      }),
    );
    expect(updatedTables).toEqual([]);
    expect(await screen.findByText(/link to create their password has been sent/i)).toBeInTheDocument();
  });

  it('shows the error and does not mark the entry approved when the function fails', async () => {
    const response = new Response(JSON.stringify({ error: "Could not create the member's login" }), { status: 500 });
    mockInvoke.mockResolvedValue({ data: null, error: { context: response } });
    await openJoinRequestAndChoose(userEvent.setup(), /^approved$/i);

    expect(await screen.findByText(/could not create the member's login/i)).toBeInTheDocument();
    expect(screen.queryByText('Saved!')).not.toBeInTheDocument();
  });

  it('rejecting still uses a plain status update', async () => {
    await openJoinRequestAndChoose(userEvent.setup(), /^rejected$/i);

    await waitFor(() => expect(updatedTables).toEqual(['join_requests']));
    expect(mockInvoke).not.toHaveBeenCalled();
  });
});
