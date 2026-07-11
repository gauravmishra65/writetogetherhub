import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';

// ---------- Mocks ----------

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockSignInWithPassword = vi.fn();
const mockResetPasswordForEmail = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      resetPasswordForEmail: (...args: unknown[]) => mockResetPasswordForEmail(...args),
    },
  },
}));

// ---------- Helpers ----------

function renderLogin(initialPath = '/login', state?: Record<string, unknown>) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: initialPath, state }]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/member" element={<div>Member Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

// ---------- Tests ----------

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering ---

  it('renders the sign-in form with email and password fields', () => {
    renderLogin();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders links to Register and Join Free pages', () => {
    renderLogin();
    expect(screen.getByRole('link', { name: /register as a member/i })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /join for free/i })).toHaveAttribute('href', '/join');
  });

  // --- Password visibility toggle ---

  it('toggles password field to visible text when show-password button is clicked', async () => {
    const user = userEvent.setup();
    renderLogin();
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // The toggle button has no label; it's the button inside the password row
    const toggleBtn = passwordInput.closest('div')!.querySelector('button[tabindex="-1"]')!;
    await user.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('hides password again on second toggle', async () => {
    const user = userEvent.setup();
    renderLogin();
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const toggleBtn = passwordInput.closest('div')!.querySelector('button[tabindex="-1"]')!;

    await user.click(toggleBtn);
    await user.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // --- Successful login ---

  it('calls signInWithPassword with entered credentials and navigates on success', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('your@email.com'), 'writer@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'secret123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'writer@example.com',
        password: 'secret123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/member', { replace: true });
    });
  });

  it('navigates to the "from" location passed via router state after login', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderLogin('/login', { from: '/writer-forum' });

    await user.type(screen.getByPlaceholderText('your@email.com'), 'writer@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'pass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/writer-forum', { replace: true });
    });
  });

  // --- Failed login ---

  it('displays an error message when credentials are incorrect', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid credentials' } });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('your@email.com'), 'bad@email.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Incorrect email or password. Please try again.')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables the sign-in button while the request is in flight', async () => {
    let resolve!: (v: unknown) => void;
    mockSignInWithPassword.mockReturnValue(new Promise((r) => { resolve = r; }));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('your@email.com'), 'a@b.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'pw');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    resolve({ error: null });
  });

  // --- Forgot password flow ---

  it('switches to reset-password mode when "Forgot password?" is clicked', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /forgot password/i }));

    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('calls resetPasswordForEmail with the entered email', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /forgot password/i }));

    const emailInput = screen.getByPlaceholderText('your@email.com');
    await user.clear(emailInput);
    await user.type(emailInput, 'reset@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        'reset@example.com',
        expect.objectContaining({ redirectTo: expect.stringContaining('/reset-password') }),
      );
    });
  });

  it('shows success message with the email after reset is requested', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /forgot password/i }));
    await user.type(screen.getByPlaceholderText('your@email.com'), 'someone@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText('Check your inbox')).toBeInTheDocument();
      expect(screen.getByText(/someone@example\.com/)).toBeInTheDocument();
    });
  });

  it('shows an error when the reset request fails', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: { message: 'SMTP error' } });
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /forgot password/i }));
    await user.type(screen.getByPlaceholderText('your@email.com'), 'bad@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/SMTP error/i)).toBeInTheDocument();
    });
  });

  it('returns to login form from reset form via "Back to Sign In" button', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /forgot password/i }));
    expect(screen.getByText('Reset Password')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /back to sign in/i }));
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('returns to login from the post-reset success screen', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /forgot password/i }));
    await user.type(screen.getByPlaceholderText('your@email.com'), 'x@x.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => screen.getByText('Check your inbox'));
    await user.click(screen.getByRole('button', { name: /back to sign in/i }));

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  // --- Error cleared on mode switch ---

  it('clears a login error when switching to reset mode', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'bad' } });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('your@email.com'), 'x@x.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'pw');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => screen.getByText('Incorrect email or password. Please try again.'));

    await user.click(screen.getByRole('button', { name: /forgot password/i }));
    expect(screen.queryByText('Incorrect email or password. Please try again.')).not.toBeInTheDocument();
  });
});
