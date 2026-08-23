"use server";

import { createClient } from "@/lib/supabase/server";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";
const NOTIFY_EMAIL = process.env.CONTACT_NOTIFY_EMAIL;
const RESEND_KEY   = process.env.RESEND_API_KEY;

async function sendNotification(name: string, senderEmail: string, message: string) {
  if (!RESEND_KEY || !NOTIFY_EMAIL) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Artfolio <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      reply_to: senderEmail,
      subject: `Neue Nachricht von ${name}`,
      html: `
        <p><strong>Von:</strong> ${name} &lt;${senderEmail}&gt;</p>
        <hr />
        <p style="white-space:pre-wrap">${message.replace(/</g, "&lt;")}</p>
        <hr />
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/submissions">Alle Nachrichten im Admin</a></p>
      `,
    }),
  });
}

type State = { success: boolean; error?: string } | null;

export async function submitContact(_prev: State, formData: FormData): Promise<State> {
  const name = (formData.get("name") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim();
  const message = (formData.get("message") as string | null)?.trim();
  const newsletter = formData.get("newsletter") === "on";

  if (!name || !email || !message) return { success: false, error: "required" };

  // Honeypot: bots fill this hidden field, humans don't see it
  const honeypot = (formData.get("website") as string | null) ?? "";
  if (honeypot) return { success: true }; // silently ignore spam

  const supabase = await createClient();
  const { error } = await supabase.from("contact_submissions").insert({
    artist_id: ARTIST_ID,
    name,
    email,
    subject: null,
    message,
    read: false,
  });

  if (error) return { success: false, error: error.message };

  await sendNotification(name, email, message);

  if (newsletter) {
    await supabase.from("newsletter_subscribers").upsert(
      { artist_id: ARTIST_ID, email, active: true, source: "contact_form" },
      { onConflict: "artist_id,email", ignoreDuplicates: false }
    );
  }

  return { success: true };
}

export async function subscribeNewsletter(_prev: State, formData: FormData): Promise<State> {
  const email = (formData.get("email") as string | null)?.trim();
  if (!email || !email.includes("@")) return { success: false, error: "invalid_email" };

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").upsert(
    { artist_id: ARTIST_ID, email, active: true, source: "inline_form" },
    { onConflict: "artist_id,email", ignoreDuplicates: false }
  );

  if (error) return { success: false, error: error.message };
  return { success: true };
}
