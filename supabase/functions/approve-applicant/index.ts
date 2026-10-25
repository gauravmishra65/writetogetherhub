import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * approve-applicant
 *
 * Called by an admin from /admin/approvals. Approves a join request or a
 * registration and tells the person:
 *   - join_requests (no account yet): creates a passwordless, email-confirmed
 *     account and emails a one-time link to /reset-password where they create
 *     their password.
 *   - registrations (already chose a password at sign-up): marks them approved
 *     and emails a "you're approved, sign in" message.
 * `resend: true` re-issues the email for someone who is already approved.
 *
 * The link points at our own /reset-password page with a token_hash, so it does
 * not depend on the Supabase redirect allow-list and email scanners that only
 * GET the URL cannot consume the token (it is verified client-side).
 */

const SITE_URL = (Deno.env.get("SITE_URL") ?? "https://writetogetherhub.com").replace(/\/+$/, "");
const FROM = "Write Together Hub <hello@writetogetherhub.com>";
const REPLY_TO = "hello@writetogetherhub.com";

const ALLOWED_ORIGINS = new Set([
  SITE_URL,
  "https://www.writetogetherhub.com",
  "http://localhost:5173",
  "http://localhost:3000",
]);

function corsFor(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : SITE_URL,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
    "Vary": "Origin",
  };
}

function json(req: Request, status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsFor(req), "Content-Type": "application/json" },
  });
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type EmailKind = "set_password" | "signed_up";

function buildEmail(kind: EmailKind, name: string, url: string): { subject: string; html: string; text: string } {
  const firstName = esc(name.trim().split(/\s+/)[0] || "there");
  const isSetPassword = kind === "set_password";

  const subject = isSetPassword
    ? "You're approved! Confirm your email and create your password"
    : "You're approved! Welcome to Write Together Hub";

  const intro = isSetPassword
    ? "Great news — your membership request has been approved. Click the button below to confirm your email address and create your password. That is all you need to start posting, sharing excerpts and giving kind feedback."
    : "Great news — your membership has been approved. You can now sign in with the password you chose when you registered.";

  const button = isSetPassword ? "Confirm email &amp; create password" : "Sign in to Write Together Hub";

  const note = isSetPassword
    ? `<p style="margin:24px 0 0;font-size:13px;color:#8a7a6a;line-height:1.6;">This link works once and expires after a short time. If it has expired, go to <a href="${SITE_URL}/login" style="color:#c0392b;">the sign-in page</a>, choose <em>Forgot password?</em> and enter this email address to get a fresh link.</p>`
    : `<p style="margin:24px 0 0;font-size:13px;color:#8a7a6a;line-height:1.6;">Forgotten your password? Use <em>Forgot password?</em> on the sign-in page.</p>`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f1eb;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:#c0392b;padding:32px 36px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Welcome to Write Together Hub</h1>
      <p style="margin:8px 0 0;color:#f5cfc9;font-size:14px;">A free community for new writers</p>
    </div>
    <div style="padding:32px 36px;color:#2c1810;font-size:16px;line-height:1.7;">
      <p style="margin:0 0 16px;">Hi ${firstName},</p>
      <p style="margin:0 0 24px;">${intro}</p>
      <p style="margin:0 0 8px;"><a href="${url}" style="display:inline-block;background:#c0392b;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:8px;">${button}</a></p>
      <p style="margin:16px 0 0;font-size:13px;color:#8a7a6a;word-break:break-all;">Button not working? Paste this link into your browser:<br>${url}</p>
      ${note}
      <p style="margin:24px 0 0;">Please take a minute to read our <a href="${SITE_URL}/community-rules" style="color:#c0392b;">Community Rules</a> — kindness first, always.</p>
      <p style="margin:24px 0 0;">Warmly,<br>The Write Together Hub team</p>
    </div>
  </div>
</body>
</html>`;

  const plainIntro = intro;
  const text = [
    `Hi ${name.trim().split(/\s+/)[0] || "there"},`,
    "",
    plainIntro,
    "",
    `${isSetPassword ? "Confirm your email and create your password" : "Sign in"}: ${url}`,
    "",
    isSetPassword
      ? `If the link has expired, go to ${SITE_URL}/login, choose "Forgot password?" and enter this email address.`
      : `Forgotten your password? Use "Forgot password?" on ${SITE_URL}/login.`,
    "",
    `Community Rules: ${SITE_URL}/community-rules`,
    "",
    "The Write Together Hub team",
  ].join("\n");

  return { subject, html, text };
}

type AdminClient = ReturnType<typeof createClient>;
type AuthUser = { id: string; last_sign_in_at?: string | null; user_metadata?: Record<string, unknown> | null };

async function findUserByEmail(admin: AdminClient, email: string): Promise<AuthUser | null> {
  // Fast path: handle_new_user() mirrors every auth user into registrations.
  const { data: reg } = await admin.from("registrations").select("user_id").eq("email", email).maybeSingle();
  if (reg?.user_id) {
    const { data } = await admin.auth.admin.getUserById(reg.user_id);
    if (data?.user) return data.user as AuthUser;
  }
  // Slow path: page through auth users.
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data?.users?.length) break;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return hit as AuthUser;
    if (data.users.length < 1000) break;
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsFor(req) });
  if (req.method !== "POST") return json(req, 405, { error: "Method not allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey || !resendKey) {
    console.error("approve-applicant: missing environment configuration");
    return json(req, 500, { error: "Service not configured" });
  }

  // 1. Caller must be a signed-in admin.
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) return json(req, 401, { error: "Not signed in" });

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json(req, 401, { error: "Not signed in" });

  const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: adminRow } = await admin.from("admins").select("user_id").eq("user_id", userData.user.id).maybeSingle();
  if (!adminRow) return json(req, 403, { error: "Admins only" });

  // 2. Validate input.
  let body: { source?: string; id?: string; resend?: boolean; admin_notes?: string };
  try {
    body = await req.json();
  } catch {
    return json(req, 400, { error: "Invalid JSON" });
  }
  const { source, id, resend = false } = body;
  if ((source !== "join_requests" && source !== "registrations") || typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) {
    return json(req, 400, { error: "source and id are required" });
  }

  const { data: applicant, error: fetchErr } = await admin.from(source).select("*").eq("id", id).maybeSingle();
  if (fetchErr || !applicant) return json(req, 404, { error: "Applicant not found" });
  if (applicant.status === "approved" && !resend) return json(req, 409, { error: "Already approved" });

  const email = String(applicant.email).trim().toLowerCase();
  const name = String(applicant.name ?? "");

  // 3. Make sure an auth account exists.
  let user = await findUserByEmail(admin, email);
  let createdNow = false;
  if (!user) {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { name, invited_by_admin: true },
    });
    if (createErr || !created?.user) {
      // Lost a race with a concurrent sign-up: look again before giving up.
      user = await findUserByEmail(admin, email);
      if (!user) {
        console.error("approve-applicant: createUser failed", createErr);
        return json(req, 500, { error: "Could not create the member's login" });
      }
    } else {
      user = created.user as AuthUser;
      createdNow = true;
    }
  }

  // 4. Mark approved (registrations row = profile + gate; source row = admin queue).
  const { data: existingReg } = await admin.from("registrations").select("*").eq("email", email).maybeSingle();
  if (existingReg) {
    const patch: Record<string, unknown> = { status: "approved", user_id: user.id };
    if (source === "join_requests") {
      // Only fill gaps — never overwrite what the member typed themselves, nor their role.
      if (!existingReg.experience_level && applicant.experience_level) patch.experience_level = applicant.experience_level;
      if (!existingReg.writing_type && applicant.writing_type) patch.writing_type = applicant.writing_type;
      if (!existingReg.genres && applicant.interests) patch.genres = applicant.interests;
      if (!existingReg.bio && applicant.message) patch.bio = applicant.message;
    }
    const { error } = await admin.from("registrations").update(patch).eq("id", existingReg.id);
    if (error) {
      console.error("approve-applicant: registrations update failed", error);
      return json(req, 500, { error: "Could not update the member record" });
    }
  } else {
    const { error } = await admin.from("registrations").insert({
      user_id: user.id,
      email,
      name,
      status: "approved",
      role: "member",
      experience_level: applicant.experience_level ?? null,
      writing_type: applicant.writing_type ?? null,
      genres: applicant.interests ?? null,
      bio: applicant.message ?? null,
    });
    if (error) {
      console.error("approve-applicant: registrations insert failed", error);
      return json(req, 500, { error: "Could not create the member record" });
    }
  }

  if (source === "join_requests") {
    const { error } = await admin
      .from("join_requests")
      .update({ status: "approved", admin_notes: body.admin_notes ?? applicant.admin_notes ?? null })
      .eq("id", id);
    if (error) console.error("approve-applicant: join_requests update failed", error);
  }

  // 5. Work out which email this person needs, then send it.
  const meta = user.user_metadata ?? {};
  const needsPassword = createdNow || (meta.invited_by_admin === true && meta.password_set !== true);

  let kind: EmailKind;
  let link: string;
  if (needsPassword) {
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({ type: "recovery", email });
    const hashed = linkData?.properties?.hashed_token;
    if (linkErr || !hashed) {
      console.error("approve-applicant: generateLink failed", linkErr);
      return json(req, 502, { ok: true, approved: true, emailSent: false, error: "Approved, but the password link could not be created. Use Resend." });
    }
    kind = "set_password";
    link = `${SITE_URL}/reset-password?token_hash=${encodeURIComponent(hashed)}&type=recovery`;
  } else {
    kind = "signed_up";
    link = `${SITE_URL}/login`;
  }

  const mail = buildEmail(kind, name, link);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [email], reply_to: REPLY_TO, subject: mail.subject, html: mail.html, text: mail.text }),
  });
  if (!res.ok) {
    console.error("approve-applicant: Resend error", res.status, await res.text());
    return json(req, 502, { ok: true, approved: true, emailSent: false, error: "Approved, but the email could not be sent. Use Resend." });
  }

  return json(req, 200, { ok: true, approved: true, emailSent: true, kind });
});
