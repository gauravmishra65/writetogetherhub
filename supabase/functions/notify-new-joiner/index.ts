import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { name, email, source, experience_level, writing_type, interests, message, phone, city, country, genres, bio, how_heard } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const isRegistration = source === "registration";

    const detailRows = isRegistration
      ? [
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
        ].filter(Boolean)
      : [
          ["Name", name],
          ["Email", email],
          experience_level ? ["Experience Level", experience_level] : null,
          writing_type ? ["Writing Type", writing_type] : null,
          interests?.length ? ["Interests", interests.join(", ")] : null,
          message ? ["Message", message] : null,
        ].filter(Boolean);

    const tableRows = detailRows
      .map(([label, value]) => `
        <tr>
          <td style="padding:8px 12px;background:#f8f6f1;font-weight:600;color:#4a3728;width:160px;border-bottom:1px solid #e8e0d5;">${label}</td>
          <td style="padding:8px 12px;color:#2c1810;border-bottom:1px solid #e8e0d5;">${value}</td>
        </tr>`)
      .join("");

    const subject = isRegistration
      ? `New Member Registration: ${name}`
      : `New Community Join Request: ${name}`;

    const heading = isRegistration
      ? "New Member Registration"
      : "New Community Join Request";

    const subheading = isRegistration
      ? "Someone has completed the full registration form on Write Together Hub."
      : "Someone has submitted the Join Free form on Write Together Hub.";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f1eb;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:#c0392b;padding:32px 36px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">${heading}</h1>
      <p style="margin:8px 0 0;color:#f5cfc9;font-size:14px;">${subheading}</p>
    </div>
    <div style="padding:32px 36px;">
      <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #e8e0d5;">
        ${tableRows}
      </table>
      <p style="margin:24px 0 0;font-size:13px;color:#8a7a6a;">
        Submitted on ${new Date().toUTCString()} via Write Together Hub
      </p>
    </div>
  </div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Write Together Hub <onboarding@resend.dev>",
        to: ["gaurav.mishra65@gmail.com"],
        subject,
        html,
      }),
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
