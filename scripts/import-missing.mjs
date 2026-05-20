/**
 * Import missing v1 data into v2 Supabase.
 * Adds career, videos, podcast, publications, intro video to artist settings.
 * Adds gallery images to media table.
 * Run: node scripts/import-missing.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const SUPABASE_URL = "https://pqincyataskeuklijyes.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaW5jeWF0YXNrZXVrbGlqeWVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODkyNjg2OCwiZXhwIjoyMDk0NTAyODY4fQ.E0lud8-x8iw9OKuSR8FbdCjAXjLN-PaCySNfU7M08cA";
const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const data = JSON.parse(readFileSync("/Users/berlintina/Downloads/natalia-uchitel-content Kopie.json", "utf8"));

console.log("\n🎹 Importing missing v1 data into v2...\n");

// 1. Merge new fields into existing artist settings
const { data: artist } = await supabase.from("artists").select("settings").eq("id", ARTIST_ID).single();
const current = artist?.settings ?? {};

const merged = {
  ...current,
  intro_video_id:    data.hero?.introVideoId    ?? null,
  intro_video_title: data.hero?.introVideoTitle  ?? {},
  intro_video_desc:  data.hero?.introVideoDesc   ?? {},
  career:       data.career       ?? [],
  videos:       data.videos       ?? [],
  podcast:      data.podcast      ?? {},
  publications: data.publications ?? [],
  phone:        data.social?.phone    ?? current.phone   ?? null,
  email:        data.social?.email    ?? current.email   ?? null,
  address: { de: "Lübeck", en: "Lübeck", ru: "Любек" },
  social: {
    ...(current.social ?? {}),
    instagram: data.social?.instagram ?? null,
    youtube:   data.social?.youtube   ?? null,
    telegram:  data.social?.telegram  ?? null,
    spotify:   data.social?.spotify   ?? null,
    email:     data.social?.email     ?? null,
  },
};

const { error: settingsErr } = await supabase.from("artists").update({ settings: merged }).eq("id", ARTIST_ID);
if (settingsErr) console.error("  ✗ settings:", settingsErr.message);
else console.log(`  ✓ Settings updated — career (${merged.career.length}), videos (${merged.videos.length}), podcast, publications (${merged.publications.length}), introVideo`);

// 2. Import gallery to media table
const gallery = data.gallery ?? [];
if (gallery.length > 0) {
  await supabase.from("media").delete().eq("artist_id", ARTIST_ID);

  const rows = gallery.map((item, i) => ({
    artist_id:     ARTIST_ID,
    url:           item.src,
    thumbnail_url: item.src,
    filename:      item.alt ?? `photo-${i + 1}`,
    size:          0,
    alt: {
      de: item.caption ?? item.alt ?? "",
      en: item.caption ?? item.alt ?? "",
      ru: item.caption ?? item.alt ?? "",
    },
  }));

  const { error: mediaErr } = await supabase.from("media").insert(rows);
  if (mediaErr) console.error("  ✗ gallery:", mediaErr.message);
  else console.log(`  ✓ ${rows.length} gallery images imported to media table`);
}

console.log("\n✅ Done!\n");
