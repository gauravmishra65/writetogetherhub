import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ResetPassword from '../pages/ResetPassword';

const mockVerifyOtp = vi.fn();
const mockGetUser = vi.fn();
const mockUpdateUser = vi.fn();
const mockUnsubscribe = vi.fn();

vi.mock('../lib/supabase', () => ({
  checkPasswordBreached: vi.fn().mockResolvedValue(false),
  supabase: {
    auth: {
      verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
      getUser: (...args: unknown[]) => mockGetUser(...args),
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: mockUnsubscribe } } }),
    },
  },
}));

const invitedUser = { id: 'u1', user_metadata: { invited_by_admin: true } };

function renderPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/member" element={<div>Member Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ResetPassword page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null } });
  });

  it('verifies the emailed token and shows the create-password form for a newly approved member', async () => {
    mockVerifyOtp.mockResolvedValue({ data: { session: { user: invitedUser }, user: invitedUser }, error: null });
    renderPage('/reset-password?token_hash=abc123&type=recovery');

    expect(await screen.findByText('Create Your Password')).toBeInTheDocument();
    expect(mockVerifyOtp).toHaveBeenCalledWith({ token_hash: 'abc123', type: 'recovery' });
    expect(screen.getByRole('button', { name: /create password/i })).toBeInTheDocument();
  });

  it('saves the password and marks it as set', async () => {
    mockVerifyOtp.mockResolvedValue({ data: { session: { user: invitedUser }, user: invitedUser }, error: null });
    mockUpdateUser.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderPage('/reset-password?token_hash=tok-save&type=recovery');

    await screen.findByText('Create Your Password');
    await user.type(screen.getByPlaceholderText('At least 8 characters'), 'correct-horse-9');
    await user.type(screen.getByPlaceholderText('Re-enter your password'), 'correct-horse-9');
    await user.click(screen.getByRole('button', { name: /create password/i }));

    await waitFor(() =>
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'correct-horse-9', data: { password_set: true } }),
    );
    expect(await screen.findByText('Password Created')).toBeInTheDocument();
  });

  it('rejects mismatched passwords without calling Supabase', async () => {
    mockVerifyOtp.mockResolvedValue({ data: { session: { user: invitedUser }, user: invitedUser }, error: null });
    const user = userEvent.setup();
    renderPage('/reset-password?token_hash=tok-mismatch&type=recovery');

    await screen.findByText('Create Your Password');
    await user.type(screen.getByPlaceholderText('At least 8 characters'), 'correct-horse-9');
    await user.type(screen.getByPlaceholderText('Re-enter your password'), 'different-pass-1');
    await user.click(screen.getByRole('button', { name: /create password/i }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('shows a helpful message when the link has expired', async () => {
    mockVerifyOtp.mockResolvedValue({ data: { session: null, user: null }, error: { message: 'Token has expired or is invalid' } });
    renderPage('/reset-password?token_hash=expired&type=recovery');

    expect(await screen.findByText('Link not valid')).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to sign in/i })).toHaveAttribute('href', '/login');
  });

  it('keeps the ordinary reset wording for members who already had a password', async () => {
    const existing = { id: 'u2', user_metadata: { invited_by_admin: true, password_set: true } };
    mockGetUser.mockResolvedValue({ data: { user: existing } });
    renderPage('/reset-password');

    expect(await screen.findByText('Set New Password')).toBeInTheDocument();
    expect(mockVerifyOtp).not.toHaveBeenCalled();
  });
});
