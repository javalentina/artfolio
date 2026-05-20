/**
 * Import v1 JSON export into v2 Supabase database.
 * Run: node scripts/import-json.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const SUPABASE_URL = "https://pqincyataskeuklijyes.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaW5jeWF0YXNrZXVrbGlqeWVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODkyNjg2OCwiZXhwIjoyMDk0NTAyODY4fQ.E0lud8-x8iw9OKuSR8FbdCjAXjLN-PaCySNfU7M08cA";
const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const raw = readFileSync("/Users/berlintina/Downloads/natalia-uchitel-content Kopie.json", "utf8");
const data = JSON.parse(raw);

// ── helpers ──────────────────────────────────────────────────────────────────

function log(msg) { console.log(`  ✓ ${msg}`); }
function err(msg) { console.error(`  ✗ ${msg}`); }

/**
 * Parse "dd.mm" or "d.mm" date strings from v1 into ISO dates.
 * v1 concerts have no year — we guess 2025 for upcoming, 2024 for past.
 */
function parseDate(dateStr, upcoming) {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(".");
  if (parts.length < 2) return null;
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  if (!day || !month) return null;
  const year = upcoming ? 2025 : 2024;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ── 1. Update artist settings ─────────────────────────────────────────────────

async function importSettings() {
  const bio = data.bio;
  const hero = data.hero;
  const social = data.resume?.social ?? data.settings?.social ?? {};
  const resume = data.resume ?? {};

  const settings = {
    bio: {
      de: [bio.p1?.de, bio.p2?.de, bio.p3?.de].filter(Boolean).join("\n\n"),
      en: [bio.p1?.en, bio.p2?.en, bio.p3?.en].filter(Boolean).join("\n\n"),
      ru: [bio.p1?.ru, bio.p2?.ru, bio.p3?.ru].filter(Boolean).join("\n\n"),
    },
    bio_title: bio.title ?? {},
    bio_quote: bio.quote ?? {},
    photo_url: bio.photoUrl ?? null,
    hero_image_url: hero?.imageUrl ?? null,
    tagline: hero?.tagline ?? {},
    email: social.email ?? resume.social?.email ?? null,
    phone: resume.phone ?? social.phone ?? null,
    website: null,
    management: null,
    social: {
      instagram: social.instagram ?? null,
      youtube: social.youtube ?? null,
      telegram: social.telegram ?? null,
      spotify: social.spotify ?? null,
    },
  };

  const { error } = await supabase
    .from("artists")
    .update({ settings })
    .eq("id", ARTIST_ID);

  if (error) err(`settings: ${error.message}`);
  else log("Artist settings updated (bio, photo, hero image, social links)");
}

// ── 2. Import concerts ────────────────────────────────────────────────────────

async function importConcerts() {
  // Clear existing concerts for this artist
  await supabase.from("concerts").delete().eq("artist_id", ARTIST_ID);

  const rows = (data.concerts ?? []).map(c => {
    const isoDate = parseDate(c.date, c.upcoming);
    return {
      artist_id: ARTIST_ID,
      title: { de: c.venue ?? "", en: c.venue ?? "", ru: c.venue ?? "" },
      date: isoDate ?? "2025-01-01",
      time: null,
      city: { de: c.city?.trim() ?? "", en: c.city?.trim() ?? "", ru: c.city?.trim() ?? "" },
      venue: { de: c.venue?.trim() ?? "", en: c.venue?.trim() ?? "", ru: c.venue?.trim() ?? "" },
      country: null,
      ticket_url: null,
      published: true,
    };
  });

  if (rows.length === 0) { log("No concerts to import"); return; }

  const { error } = await supabase.from("concerts").insert(rows);
  if (error) err(`concerts: ${error.message}`);
  else log(`${rows.length} concerts imported`);
}

function slugify(s) {
  return s.toLowerCase().trim()
    .replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe").replace(/[üÜ]/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── 3. Import projects ────────────────────────────────────────────────────────

async function importProjects() {
  await supabase.from("projects").delete().eq("artist_id", ARTIST_ID);

  const rows = (data.projects ?? []).map((p, i) => {
    const titleDe = p.title?.de ?? p.title?.en ?? `project-${i + 1}`;
    const slug = p.slug ?? slugify(titleDe);
    return {
      artist_id: ARTIST_ID,
      title: p.title ?? {},
      description: p.description ?? {},
      slug: { de: slug, en: slug, ru: slug },
      cover_image: p.imageUrl ?? (Array.isArray(p.gallery) ? p.gallery[0] : null) ?? null,
      position: i + 1,
      published: true,
    };
  });

  if (rows.length === 0) { log("No projects to import"); return; }

  const { error } = await supabase.from("projects").insert(rows);
  if (error) err(`projects: ${error.message}`);
  else log(`${rows.length} projects imported`);
}

// ── 4. Import repertoire ──────────────────────────────────────────────────────

async function importRepertoire() {
  await supabase.from("repertoire").delete().eq("artist_id", ARTIST_ID);

  const rows = (data.repertoire ?? []).map((r, i) => ({
    artist_id: ARTIST_ID,
    composer: {
      de: r.name ?? "",
      en: r.name ?? "",
      ru: r.nameRu ?? r.name ?? "",
    },
    works: r.works ?? [],
    // works_ru stored as extra array inside works with a marker, or omitted if column missing
    tab: r.tab ?? "solo",
    position: i,
  }));

  if (rows.length === 0) { log("No repertoire to import"); return; }

  // Try with works_ru column first
  const rowsWithRu = rows.map((r, i) => ({ ...r, works_ru: data.repertoire[i].worksRu ?? [] }));
  const { error } = await supabase.from("repertoire").insert(rowsWithRu);
  if (error) {
    // Column doesn't exist — insert without it
    const { error: e2 } = await supabase.from("repertoire").insert(rows);
    if (e2) err(`repertoire: ${e2.message}`);
    else log(`${rows.length} repertoire entries imported (works_ru column not found, Russian works skipped)`);
  } else {
    log(`${rows.length} repertoire entries imported (incl. Russian works)`);
  }
}

// ── run ───────────────────────────────────────────────────────────────────────

console.log("\n🎹 Importing v1 content into v2 Supabase...\n");

await importSettings();
await importConcerts();
await importProjects();
await importRepertoire();

console.log("\n✅ Done!\n");
