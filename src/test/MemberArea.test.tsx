import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import MemberArea from '../pages/MemberArea';

// ---------- Mock data store (mutable per test) ----------

type ChainStep = { table: string; filters: Record<string, unknown> };
let recordedSteps: ChainStep[] = [];

let tableData: Record<string, unknown[]> = {
  feedback_submissions: [],
  feedback_replies: [],
  registrations: [],
  join_requests: [],
};

// ---------- Mocks ----------

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function chainable(table: string, filters: Record<string, unknown> = {}) {
  const step: ChainStep = { table, filters };
  recordedSteps.push(step);

  const chain = {
    eq(col: string, val: unknown) { step.filters[col] = val; return chain; },
    in(col: string, val: unknown) { step.filters[col] = val; return chain; },
    neq(col: string, val: unknown) { step.filters[col] = val; return chain; },
    or(_filter: string) { return chain; },
    order() { return chain; },
    select() { return chain; },
    maybeSingle() {
      return Promise.resolve({ data: (tableData[table] ?? [])[0] ?? null, error: null });
    },
    then(resolve: (v: { data: unknown[] | null; error: null }) => void) {
      resolve({ data: tableData[table] ?? [], error: null });
    },
  };
  return chain;
}

const mockGetUser = vi.fn();
const mockSignOut = vi.fn().mockResolvedValue({});
const mockUpdateUser = vi.fn().mockResolvedValue({ error: null });

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: (..._args: unknown[]) => mockGetUser(),
      signOut: (..._args: unknown[]) => mockSignOut(),
      updateUser: (..._args: unknown[]) => mockUpdateUser(),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: (table: string) => chainable(table),
  },
}));

// ---------- Helpers ----------

const TEST_EMAIL = 'writer@example.com';

function setPosts(posts: Record<string, unknown>[]) {
  tableData.feedback_submissions = posts;
}

function setReplies(replies: Record<string, unknown>[]) {
  tableData.feedback_replies = replies;
}

function setRegistration(reg: Record<string, unknown> | null) {
  tableData.registrations = reg ? [reg] : [];
  tableData.join_requests = [];
}

function renderMember() {
  return render(
    <MemoryRouter initialEntries={['/member']}>
      <Routes>
        <Route path="/member" element={<MemberArea />} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/feedback-corner" element={<div>Feedback Corner</div>} />
        <Route path="/feedback-corner/:id" element={<div>Feedback Detail</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

// ---------- Tests ----------

describe('MemberArea — My Posts & Feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recordedSteps = [];
    tableData = { feedback_submissions: [], feedback_replies: [], registrations: [], join_requests: [] };

    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: TEST_EMAIL } } });
    setRegistration({
      name: 'Jane Writer',
      email: TEST_EMAIL,
      city: 'London',
      country: 'UK',
      experience_level: 'Intermediate',
      writing_type: 'Fiction',
      genres: ['Fantasy'],
      bio: 'I love writing.',
      status: 'approved',
    });
  });

  // --- Loading state ---

  it('renders the section heading after the page loads', async () => {
    renderMember();
    await waitFor(() => {
      expect(screen.getByText('My Posts & Feedback')).toBeInTheDocument();
    });
  });

  // --- Empty state ---

  it('renders the empty state when the user has no posts', async () => {
    setPosts([]);
    renderMember();

    await waitFor(() => {
      expect(screen.getByText(/haven't submitted any posts yet/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /submit your first piece/i })).toHaveAttribute('href', '/feedback-corner');
  });

  // --- Posts list ---

  it('renders the user\'s posts with title, genre, and feedback count', async () => {
    setPosts([
      {
        id: 'p1',
        title: 'The Quiet Forest',
        genre: 'Fantasy',
        word_count: '1,200',
        feedback_type: 'General impressions',
        excerpt: 'The trees whispered...',
        author_name: 'Jane Writer',
        user_email: TEST_EMAIL,
        response_count: 2,
        status: 'approved',
        admin_notes: null,
        created_at: '2025-01-15T10:00:00Z',
      },
      {
        id: 'p2',
        title: 'City Lights',
        genre: 'Literary',
        word_count: '800',
        feedback_type: 'Pacing',
        excerpt: 'Neon bled into puddles...',
        author_name: 'Jane Writer',
        user_email: TEST_EMAIL,
        response_count: 0,
        status: 'approved',
        admin_notes: null,
        created_at: '2025-02-01T10:00:00Z',
      },
    ]);
    setReplies([
      {
        id: 'r1',
        submission_id: 'p1',
        author_name: 'Sam',
        liked: 'Great imagery',
        confused: 'The ending was abrupt',
        suggestion: 'Expand the final scene',
        encouragement: 'Keep going!',
        status: 'approved',
        admin_notes: null,
        created_at: '2025-01-16T10:00:00Z',
      },
      {
        id: 'r2',
        submission_id: 'p1',
        author_name: 'Alex',
        liked: 'Loved the atmosphere',
        confused: 'Who is the protagonist?',
        suggestion: 'Introduce the MC earlier',
        encouragement: 'Strong voice!',
        status: 'approved',
        admin_notes: null,
        created_at: '2025-01-17T10:00:00Z',
      },
    ]);

    renderMember();

    await waitFor(() => {
      expect(screen.getByText('The Quiet Forest')).toBeInTheDocument();
    });

    expect(screen.getByText('City Lights')).toBeInTheDocument();
    expect(screen.getByText(/2 feedbacks/)).toBeInTheDocument();
    expect(screen.getByText(/0 feedback/)).toBeInTheDocument();
  });

  it('queries feedback_submissions for the signed-in user', async () => {
    setPosts([]);
    renderMember();

    await waitFor(() => {
      expect(screen.getByText(/haven't submitted any posts yet/i)).toBeInTheDocument();
    });

    const postsStep = recordedSteps.find((s) => s.table === 'feedback_submissions');
    expect(postsStep).toBeDefined();
  });

  // --- Expand post to see feedback ---

  it('expands a post to show the excerpt and feedback received', async () => {
    const user = userEvent.setup();
    setPosts([
      {
        id: 'p1',
        title: 'The Quiet Forest',
        genre: 'Fantasy',
        word_count: '1,200',
        feedback_type: 'General impressions',
        excerpt: 'The trees whispered in the dark.',
        author_name: 'Jane Writer',
        user_email: TEST_EMAIL,
        response_count: 1,
        status: 'approved',
        admin_notes: null,
        created_at: '2025-01-15T10:00:00Z',
      },
    ]);
    setReplies([
      {
        id: 'r1',
        submission_id: 'p1',
        author_name: 'Sam',
        liked: 'Great imagery',
        confused: 'The ending was abrupt',
        suggestion: 'Expand the final scene',
        encouragement: 'Keep going!',
        status: 'approved',
        admin_notes: null,
        created_at: '2025-01-16T10:00:00Z',
      },
    ]);

    renderMember();

    await waitFor(() => {
      expect(screen.getByText('The Quiet Forest')).toBeInTheDocument();
    });

    expect(screen.queryByText('The trees whispered in the dark.')).not.toBeInTheDocument();
    expect(screen.queryByText('Feedback Received')).not.toBeInTheDocument();

    await user.click(screen.getByText('The Quiet Forest'));

    expect(screen.getByText('The trees whispered in the dark.')).toBeInTheDocument();
    expect(screen.getByText(/General impressions/)).toBeInTheDocument();
    expect(screen.getByText('Feedback Received')).toBeInTheDocument();
    expect(screen.getByText('Great imagery')).toBeInTheDocument();
    expect(screen.getByText('Expand the final scene')).toBeInTheDocument();
    expect(screen.getByText('Keep going!')).toBeInTheDocument();
    expect(screen.getByText('Sam')).toBeInTheDocument();
  });

  it('collapses the post when the header is clicked again', async () => {
    const user = userEvent.setup();
    setPosts([
      {
        id: 'p1',
        title: 'The Quiet Forest',
        genre: 'Fantasy',
        word_count: null,
        feedback_type: 'General impressions',
        excerpt: 'The trees whispered in the dark.',
        author_name: 'Jane Writer',
        user_email: TEST_EMAIL,
        response_count: 0,
        status: 'approved',
        admin_notes: null,
        created_at: '2025-01-15T10:00:00Z',
      },
    ]);
    setReplies([]);

    renderMember();

    await waitFor(() => {
      expect(screen.getByText('The Quiet Forest')).toBeInTheDocument();
    });

    await user.click(screen.getByText('The Quiet Forest'));
    expect(screen.getByText('The trees whispered in the dark.')).toBeInTheDocument();

    await user.click(screen.getByText('The Quiet Forest'));
    expect(screen.queryByText('The trees whispered in the dark.')).not.toBeInTheDocument();
  });

  // --- Post with no feedback ---

  it('shows "No feedback yet" for an expanded post with zero replies', async () => {
    const user = userEvent.setup();
    setPosts([
      {
        id: 'p1',
        title: 'The Quiet Forest',
        genre: 'Fantasy',
        word_count: null,
        feedback_type: 'General impressions',
        excerpt: 'The trees whispered...',
        author_name: 'Jane Writer',
        user_email: TEST_EMAIL,
        response_count: 0,
        status: 'approved',
        admin_notes: null,
        created_at: '2025-01-15T10:00:00Z',
      },
    ]);
    setReplies([]);

    renderMember();

    await waitFor(() => {
      expect(screen.getByText('The Quiet Forest')).toBeInTheDocument();
    });

    await user.click(screen.getByText('The Quiet Forest'));

    expect(screen.getByText(/No feedback yet/i)).toBeInTheDocument();
  });

  // --- Pending status badge ---

  it('shows a "Pending review" badge for a post with pending status', async () => {
    setPosts([
      {
        id: 'p1',
        title: 'Draft Piece',
        genre: 'Poetry',
        word_count: null,
        feedback_type: 'Line-level feedback',
        excerpt: 'A whisper of dawn...',
        author_name: 'Jane Writer',
        user_email: TEST_EMAIL,
        response_count: 0,
        status: 'pending',
        admin_notes: null,
        created_at: '2025-01-15T10:00:00Z',
      },
    ]);
    setReplies([]);

    renderMember();

    await waitFor(() => {
      expect(screen.getByText('Draft Piece')).toBeInTheDocument();
    });

    expect(screen.getByText('Pending review')).toBeInTheDocument();
  });

  // --- Link to Feedback Corner detail ---

  it('links to the Feedback Corner detail page for an expanded post', async () => {
    const user = userEvent.setup();
    setPosts([
      {
        id: 'p1',
        title: 'The Quiet Forest',
        genre: 'Fantasy',
        word_count: null,
        feedback_type: 'General impressions',
        excerpt: 'The trees whispered...',
        author_name: 'Jane Writer',
        user_email: TEST_EMAIL,
        response_count: 0,
        status: 'approved',
        admin_notes: null,
        created_at: '2025-01-15T10:00:00Z',
      },
    ]);
    setReplies([]);

    renderMember();

    await waitFor(() => {
      expect(screen.getByText('The Quiet Forest')).toBeInTheDocument();
    });

    await user.click(screen.getByText('The Quiet Forest'));

    expect(screen.getByRole('link', { name: /view on feedback corner/i })).toHaveAttribute('href', '/feedback-corner/p1');
  });

  // --- Redirect when not signed in ---

  it('redirects to /login when there is no signed-in user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    renderMember();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { from: '/member' } });
    });
  });

  // --- Excludes rejected replies ---

  it('does not show rejected replies in the expanded feedback', async () => {
    const user = userEvent.setup();
    setPosts([
      {
        id: 'p1',
        title: 'The Quiet Forest',
        genre: 'Fantasy',
        word_count: null,
        feedback_type: 'General impressions',
        excerpt: 'The trees whispered...',
        author_name: 'Jane Writer',
        user_email: TEST_EMAIL,
        response_count: 2,
        status: 'approved',
        admin_notes: null,
        created_at: '2025-01-15T10:00:00Z',
      },
    ]);
    // The mock returns ALL rows for feedback_replies regardless of .neq filter,
    // but the component's .neq('status', 'rejected') is still recorded. To test
    // the UI behavior, we simulate what Supabase would return: only non-rejected rows.
    setReplies([
      {
        id: 'r1',
        submission_id: 'p1',
        author_name: 'Sam',
        liked: 'Great',
        confused: 'None',
        suggestion: 'Add more',
        encouragement: 'Go!',
        status: 'approved',
        admin_notes: null,
        created_at: '2025-01-16T10:00:00Z',
      },
    ]);

    renderMember();

    await waitFor(() => {
      expect(screen.getByText('The Quiet Forest')).toBeInTheDocument();
    });

    await user.click(screen.getByText('The Quiet Forest'));

    const feedbackArea = screen.getByText('Feedback Received').closest('div')!;
    expect(within(feedbackArea).getByText('Sam')).toBeInTheDocument();
    expect(within(feedbackArea).queryByText('Troll')).not.toBeInTheDocument();
    expect(screen.getByText(/1 feedback/)).toBeInTheDocument();

    // Verify the .neq('status', 'rejected') filter was applied
    const repliesStep = recordedSteps.find((s) => s.table === 'feedback_replies');
    expect(repliesStep).toBeDefined();
    expect(repliesStep!.filters.status).toBe('rejected');
  });
});

// Keep the supabase import reference alive for type checking
void supabase;
