import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FROM = "Write Together Hub <noreply@writetogetherhub.com>";
const TO = ["hello@writetogetherhub.com"];

function tableRows(rows: ([string, string] | null)[]): string {
  return rows
    .filter(Boolean)
    .map(([label, value]) => `
      <tr>
        <td style="padding:8px 12px;background:#f8f6f1;font-weight:600;color:#4a3728;width:160px;border-bottom:1px solid #e8e0d5;">${label}</td>
        <td style="padding:8px 12px;color:#2c1810;border-bottom:1px solid #e8e0d5;">${value}</td>
      </tr>`)
    .join("");
}

function emailWrapper(heading: string, subheading: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f1eb;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:#c0392b;padding:32px 36px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">${heading}</h1>
      <p style="margin:8px 0 0;color:#f5cfc9;font-size:14px;">${subheading}</p>
    </div>
    <div style="padding:32px 36px;">
      ${body}
      <p style="margin:24px 0 0;font-size:13px;color:#8a7a6a;">
        Submitted on ${new Date().toUTCString()} via Write Together Hub
      </p>
    </div>
  </div>
</body>
</html>`;
}

function tableBlock(rows: ([string, string] | null)[]): string {
  return `<table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #e8e0d5;">${tableRows(rows)}</table>`;
}

function excerptBlock(text: string): string {
  const preview = text.length > 400 ? text.slice(0, 400) + "…" : text;
  return `<div style="margin-top:20px;background:#faf9f6;border-left:4px solid #c0392b;border-radius:0 8px 8px 0;padding:16px 20px;font-style:italic;color:#4a3728;font-size:14px;line-height:1.7;">${preview.replace(/\n/g, "<br>")}</div>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { source } = payload;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let subject = "";
    let html = "";

    if (source === "registration") {
      const { name, email, phone, city, country, experience_level, writing_type, genres, bio, how_heard } = payload;
      subject = `New Member Registration: ${name}`;
      html = emailWrapper(
        "New Member Registration",
        "Someone has completed the full registration form on Write Together Hub.",
        tableBlock([
          ["Name", name],
          ["Email", email],
          phone ? ["Phone", phone] : null,
          city ? ["City", city] : null,
          country ? ["Country", country] : null,
          experience_level ? ["Experience Level", experience_level] : null,
          writing_type ? ["Writing Type", writing_type] : null,
          genres?.length ? ["Genres", genres.join(", ")] : null,
          bio ? ["Bio", bio] : null,
          how_heard ? ["How Heard", how_heard] : null,
        ]),
      );

    } else if (source === "join_free") {
      const { name, email, experience_level, writing_type, interests, message } = payload;
      subject = `New Community Join Request: ${name}`;
      html = emailWrapper(
        "New Community Join Request",
        "Someone has submitted the Join Free form on Write Together Hub.",
        tableBlock([
          ["Name", name],
          ["Email", email],
          experience_level ? ["Experience Level", experience_level] : null,
          writing_type ? ["Writing Type", writing_type] : null,
          interests?.length ? ["Interests", interests.join(", ")] : null,
          message ? ["Message", message] : null,
        ]),
      );

    } else if (source === "challenge_entry") {
      const { author_name, challenge_title, entry_text } = payload;
      subject = `New Challenge Entry: ${challenge_title} — by ${author_name}`;
      html = emailWrapper(
        "New Challenge Entry",
        `A member has submitted an entry for the "${challenge_title}" challenge.`,
        tableBlock([
          ["Author", author_name],
          ["Challenge", challenge_title],
        ]) + excerptBlock(entry_text),
      );

    } else if (source === "forum_discussion") {
      const { author_name, category, title } = payload;
      subject = `New Forum Discussion: ${title}`;
      html = emailWrapper(
        "New Forum Discussion",
        "A new discussion thread has been started in the Writer Forum.",
        tableBlock([
          ["Author", author_name],
          ["Category", category],
          ["Title", title],
        ]),
      );

    } else if (source === "feedback_submission") {
      const { author_name, title, genre, word_count, feedback_type, excerpt } = payload;
      subject = `New Feedback Submission: "${title}" by ${author_name}`;
      html = emailWrapper(
        "New Feedback Submission",
        "A writer has submitted an excerpt to the Feedback Corner.",
        tableBlock([
          ["Author", author_name],
          ["Title", title],
          ["Genre", genre],
          word_count ? ["Word Count", word_count] : null,
          ["Feedback Needed", feedback_type],
        ]) + excerptBlock(excerpt),
      );

    } else if (source === "contact_message") {
      const { name, email, subject: msgSubject, message } = payload;
      subject = `New Contact Message: ${msgSubject} — from ${name}`;
      html = emailWrapper(
        "New Contact Message",
        "Someone has sent a message via the Contact page.",
        tableBlock([
          ["Name", name],
          ["Email", email],
          ["Subject", msgSubject],
        ]) + excerptBlock(message),
      );

    } else {
      return new Response(
        JSON.stringify({ error: "Unknown source type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: TO, subject, html }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Resend API error:", res.status, errorBody);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
