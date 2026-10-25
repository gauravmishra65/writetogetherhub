import { supabase } from './supabase';

export type DecisionResult = { ok: boolean; message?: string; warn?: boolean };

export type ApplicantSource = 'join_requests' | 'registrations';

export function isApplicantTable(table: string): table is ApplicantSource {
  return table === 'join_requests' || table === 'registrations';
}

/**
 * Approves a join request or registration through the `approve-applicant` edge
 * function, which creates the member's login if needed and emails them a link to
 * confirm their address and create a password. Every admin screen that approves
 * an applicant must go through this rather than updating `status` directly,
 * otherwise the person is marked approved but never gets a login or an email.
 */
export async function approveApplicant(
  source: ApplicantSource,
  id: string,
  extra: { resend?: boolean; admin_notes?: string } = {},
): Promise<DecisionResult> {
  const { data, error } = await supabase.functions.invoke('approve-applicant', {
    body: { source, id, ...extra },
  });
  let payload: { error?: string; emailSent?: boolean; approved?: boolean } | null = data ?? null;
  if (error) {
    const ctx = (error as { context?: Response }).context;
    try { payload = ctx ? await ctx.clone().json() : null; } catch { payload = null; }
    if (payload?.approved) {
      return { ok: true, warn: true, message: payload.error ?? 'Approved, but the email could not be sent. Use "Resend approval email".' };
    }
    return { ok: false, message: payload?.error ?? 'Could not approve this applicant. Please try again.' };
  }
  return {
    ok: true,
    message: extra.resend ? 'Approval email sent.' : 'Approved — an email with a link to create their password has been sent.',
  };
}
