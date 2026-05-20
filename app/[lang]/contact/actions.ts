"use server";

import { createClient } from "@/lib/supabase/server";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

type State = { success: boolean; error?: string } | null;

export async function submitContact(_prev: State, formData: FormData): Promise<State> {
  const name = (formData.get("name") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim();
  const message = (formData.get("message") as string | null)?.trim();
  const newsletter = formData.get("newsletter") === "on";

  if (!name || !email || !message) return { success: false, error: "required" };

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
