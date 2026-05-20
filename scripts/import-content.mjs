import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const SUPABASE_URL = "https://pqincyataskeuklijyes.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaW5jeWF0YXNrZXVrbGlqeWVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODkyNjg2OCwiZXhwIjoyMDk0NTAyODY4fQ.E0lud8-x8iw9OKuSR8FbdCjAXjLN-PaCySNfU7M08cA";
const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const raw = readFileSync("/Users/berlintina/Downloads/natalia-uchitel-content_17_05.json", "utf-8");
const v1 = JSON.parse(raw);

// Read existing settings first
const { data: artist } = await supabase.from("artists").select("settings").eq("id", ARTIST_ID).single();
const current = artist?.settings ?? {};

const patch = {
  // Bio text (flat: { de, en, ru })
  bio: {
    de: v1.bio?.p1?.de ?? "",
    en: v1.bio?.p1?.en ?? "",
    ru: v1.bio?.p1?.ru ?? "",
  },
  bio_title: {
    de: v1.bio?.title?.de ?? "",
    en: v1.bio?.title?.en ?? "",
    ru: v1.bio?.title?.ru ?? "",
  },
  // Social & contact
  social: v1.social ?? {},
  phone: v1.resume?.phone ?? "",
  email: v1.social?.email ?? "",
  // Full resume block (for Lebenslauf page)
  resume: {
    education:       v1.resume?.education       ?? [],
    awards:          v1.resume?.awards          ?? [],
    languages:       v1.resume?.languages       ?? [],
    experience:      v1.resume?.experience      ?? [],
    concertActivity: v1.resume?.concertActivity ?? {},
    concertCountries:v1.resume?.concertCountries?? {},
    intro:           v1.resume?.intro           ?? {},
    phone:           v1.resume?.phone           ?? "",
    whatsapp:        v1.resume?.whatsapp        ?? "",
    location:        v1.resume?.location        ?? "",
    subtitle:        v1.resume?.subtitle        ?? {},
    books:           v1.resume?.books           ?? [],
  },
};

const merged = { ...current, ...patch };
const { error } = await supabase.from("artists").update({ settings: merged }).eq("id", ARTIST_ID);

if (error) {
  console.error("ERROR:", error.message);
  process.exit(1);
}

console.log("✓ Bio text imported");
console.log("  bio.de:", patch.bio.de.slice(0, 60) + "…");
console.log("  bio.en:", patch.bio.en.slice(0, 60) + "…");
console.log("✓ Bio title:", patch.bio_title.de);
console.log("✓ Phone:", patch.phone);
console.log("✓ Email:", patch.email);
console.log("✓ Resume sections:");
console.log("  education:", patch.resume.education.length, "entries");
console.log("  awards:   ", patch.resume.awards.length, "entries");
console.log("  languages:", patch.resume.languages.length, "entries");
console.log("  experience:", patch.resume.experience.length, "entries");
console.log("  concertActivity (DE):", String(patch.resume.concertActivity?.de ?? "").slice(0, 60) + "…");
