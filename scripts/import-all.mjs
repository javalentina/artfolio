/**
 * Full import from natalia-uchitel-content Kopie.json into v2 Supabase.
 * - Resume data (education, awards, languages, experience, concertActivity)
 * - Concerts with corrected years (past=2024/2025, upcoming=2026)
 * - Social links, phone, address
 * - Gallery images (media table)
 * Run: node scripts/import-all.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const SUPABASE_URL     = "https://pqincyataskeuklijyes.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaW5jeWF0YXNrZXVrbGlqeWVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODkyNjg2OCwiZXhwIjoyMDk0NTAyODY4fQ.E0lud8-x8iw9OKuSR8FbdCjAXjLN-PaCySNfU7M08cA";
const ARTIST_ID        = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const data     = JSON.parse(readFileSync("/Users/berlintina/Downloads/natalia-uchitel-content Kopie.json", "utf8"));

// ── helpers ──────────────────────────────────────────────────────────────────

function parseDate(dateStr, upcoming) {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(".");
  if (parts.length < 2) return null;
  const day   = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  if (!day || !month) return null;
  // upcoming concerts → 2026; past December → 2024; past Jan–Nov → 2025
  let year;
  if (upcoming) {
    year = 2026;
  } else if (month === 12) {
    year = 2024;
  } else {
    year = 2025;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

async function loadSettings() {
  const { data: row } = await supabase.from("artists").select("name,settings").eq("id", ARTIST_ID).single();
  return { name: row?.name ?? "", settings: row?.settings ?? {} };
}

async function patchSettings(patch) {
  const { settings: current } = await loadSettings();
  const { error } = await supabase.from("artists").update({ settings: { ...current, ...patch } }).eq("id", ARTIST_ID);
  if (error) throw error;
}

// ── 1. Resume data ────────────────────────────────────────────────────────────

async function importResume() {
  const r = data.resume ?? {};
  const resume = {
    intro:              r.intro              ?? {},
    subtitle:           r.subtitle           ?? {},
    education:          r.education          ?? [],
    awards:             r.awards             ?? [],
    languages:          r.languages          ?? [],
    experience:         r.experience         ?? [],
    concertActivity:    r.concertActivity    ?? {},
    concertCountries:   r.concertCountries   ?? {},
    teachingHighlights: r.concertActivity?.teachingHighlights ?? r.teachingHighlights ?? [],
    location:           r.location           ?? "",
    phone:              r.phone              ?? "",
    whatsapp:           r.whatsapp           ?? "",
  };
  await patchSettings({ resume });
  console.log(`resume ✓ (${resume.education.length} edu, ${resume.awards.length} awards, ${resume.languages.length} lang, ${resume.experience.length} exp)`);
}

// ── 2. Social / contact ───────────────────────────────────────────────────────

async function importSocial() {
  const soc = data.social ?? data.resume?.social ?? {};
  await patchSettings({
    social: {
      instagram: soc.instagram ?? null,
      youtube:   soc.youtube   ?? null,
      spotify:   soc.spotify   ?? null,
      telegram:  soc.telegram  ?? null,
    },
    email:   soc.email   ?? null,
    phone:   soc.phone   ?? (data.resume?.phone ?? null),
    address: { de: "Lübeck, Deutschland", en: "Lübeck, Germany", ru: "Любек, Германия" },
  });
  console.log("social + contact ✓");
}

// ── 3. Concerts ───────────────────────────────────────────────────────────────

async function importConcerts() {
  await supabase.from("concerts").delete().eq("artist_id", ARTIST_ID);

  const rows = (data.concerts ?? []).map(c => {
    const isoDate = parseDate(c.date, c.upcoming);
    return {
      artist_id:  ARTIST_ID,
      title:      { de: c.venue ?? "", en: c.venue ?? "", ru: c.venue ?? "" },
      date:       isoDate ?? "2025-01-01",
      city:       { de: (c.city ?? "").trim(), en: (c.city ?? "").trim(), ru: (c.city ?? "").trim() },
      venue:      { de: (c.venue ?? "").trim(), en: (c.venue ?? "").trim(), ru: (c.venue ?? "").trim() },
      image:      c.image ?? (c.gallery?.[0] ?? null),
      gallery:    c.gallery ?? [],
      ticket_url: c.ticketUrl ?? null,
      published:  true,
    };
  }).filter(r => r.date);

  const { error } = await supabase.from("concerts").insert(rows);
  if (error) throw error;

  const upcoming = rows.filter(r => r.date >= "2026-05-17");
  const past     = rows.filter(r => r.date <  "2026-05-17");
  console.log(`concerts ✓ (${upcoming.length} upcoming, ${past.length} past)`);
}

// ── 4. Gallery ────────────────────────────────────────────────────────────────

async function importGallery() {
  await supabase.from("media").delete().eq("artist_id", ARTIST_ID);

  const rows = (data.gallery ?? []).map(img => ({
    artist_id: ARTIST_ID,
    url:       img.src,
    filename:  img.alt,
    alt:       { de: img.caption ?? "", en: img.caption ?? "", ru: img.caption ?? "" },
  }));

  const { error } = await supabase.from("media").insert(rows);
  if (error) throw error;
  console.log(`gallery ✓ (${rows.length} images)`);
}

// ── 5. Verify settings already imported ──────────────────────────────────────

async function verifySettings() {
  const { settings: cfg } = await loadSettings();
  const checks = {
    bio:          !!(cfg.bio?.de),
    photo:        !!(cfg.photo_url),
    hero:         !!(cfg.hero_image_url),
    introVideo:   !!(cfg.intro_video_id),
    career:       Array.isArray(cfg.career) && cfg.career.length > 0,
    videos:       Array.isArray(cfg.videos) && cfg.videos.length > 0,
    podcast:      !!(cfg.podcast?.title?.de),
    publications: Array.isArray(cfg.publications) && cfg.publications.length > 0,
    resume:       !!(cfg.resume?.education?.length),
    social:       !!(cfg.social?.instagram),
  };
  console.log("\n── Settings check ──────────────────────────────");
  for (const [k, v] of Object.entries(checks)) {
    console.log(`  ${v ? "✓" : "✗"} ${k}`);
  }
}

// ── run ───────────────────────────────────────────────────────────────────────

(async () => {
  try {
    console.log("── Importing… ──────────────────────────────────");
    await importResume();
    await importSocial();
    await importConcerts();
    await importGallery();
    await verifySettings();
    console.log("\nDone ✓");
  } catch (e) {
    console.error("Error:", e.message ?? e);
    process.exit(1);
  }
})();
