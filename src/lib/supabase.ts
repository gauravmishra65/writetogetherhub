import { createClient } from '@supabase/supabase-js';

/**
 * Checks a password against the HaveIBeenPwned Passwords API using k-anonymity.
 * Only the first 5 hex chars of the SHA-1 hash are sent; no plain-text password leaves the browser.
 * Returns true if the password appears in a known data breach.
 */
export async function checkPasswordBreached(password: string): Promise<boolean> {
  try {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
    });
    if (!response.ok) return false; // fail open — don't block on API errors
    const text = await response.text();
    return text.split('\n').some(line => line.split(':')[0] === suffix);
  } catch {
    return false; // fail open on network/crypto errors
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AdminStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export type Admin = {
  user_id: string;
  created_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: AdminStatus;
  admin_notes: string | null;
  created_at: string;
};

export type JoinRequest = {
  id: string;
  name: string;
  email: string;
  experience_level: string | null;
  writing_type: string | null;
  interests: string[] | null;
  message: string | null;
  status: AdminStatus;
  admin_notes: string | null;
  created_at: string;
};

export type ForumDiscussion = {
  id: string;
  category: string;
  title: string;
  author_name: string;
  replies: number;
  is_hot: boolean;
  status: AdminStatus;
  admin_notes: string | null;
  created_at: string;
};

export type FeedbackSubmission = {
  id: string;
  title: string;
  genre: string;
  word_count: string | null;
  feedback_type: string;
  excerpt: string;
  author_name: string;
  response_count: number;
  status: AdminStatus;
  admin_notes: string | null;
  created_at: string;
};

export type Registration = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  experience_level: string | null;
  writing_type: string | null;
  genres: string[] | null;
  bio: string | null;
  how_heard: string | null;
  status: AdminStatus;
  admin_notes: string | null;
  created_at: string;
};

export type FeedbackReply = {
  id: string;
  submission_id: string;
  author_name: string;
  liked: string;
  confused: string;
  suggestion: string;
  encouragement: string;
  status: AdminStatus;
  admin_notes: string | null;
  created_at: string;
};

export type ChallengeEntry = {
  id: string;
  challenge_title: string;
  entry_text: string;
  author_name: string;
  status: AdminStatus;
  admin_notes: string | null;
  created_at: string;
};
