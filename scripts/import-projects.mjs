/**
 * Import full project content (performers, gallery, flowSteps, testimonials, etc.)
 * into the projects table `content` column.
 * Run: node scripts/import-projects.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const SUPABASE_URL     = "https://pqincyataskeuklijyes.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaW5jeWF0YXNrZXVrbGlqeWVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODkyNjg2OCwiZXhwIjoyMDk0NTAyODY4fQ.E0lud8-x8iw9OKuSR8FbdCjAXjLN-PaCySNfU7M08cA";
const ARTIST_ID        = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const data     = JSON.parse(readFileSync("/Users/berlintina/Downloads/natalia-uchitel-content Kopie.json", "utf8"));

async function importProjects() {
  // Delete and re-insert all projects with full content
  await supabase.from("projects").delete().eq("artist_id", ARTIST_ID);

  const rows = (data.projects ?? []).map((p, i) => ({
    artist_id:   ARTIST_ID,
    slug:        p.slug,
    title:       p.title ?? {},
    description: p.description ?? {},
    cover_image: p.imageUrl ?? null,
    published:   true,
    position:    i + 1,
    content: {
      subtitle:     p.subtitle     ?? null,
      imageUrl:     p.imageUrl     ?? null,
      gallery:      p.gallery      ?? [],
      performers:   p.performers   ?? [],
      flowSteps:    p.flowSteps    ?? [],
      testimonials: p.testimonials ?? [],
      youtubeId:    p.youtubeId    ?? null,
      fullText:     p.fullText     ?? null,
      eventWhen:    p.eventWhen    ?? null,
      eventWhere:   p.eventWhere   ?? null,
      eventTickets: p.eventTickets ?? null,
      eventEmail:   p.eventEmail   ?? null,
      eventNote:    p.eventNote    ?? null,
      eventDuration:p.eventDuration?? null,
      statFormat:   p.statFormat   ?? null,
      statDuration: p.statDuration ?? null,
      statPartner:  p.statPartner  ?? null,
      partnerTitle: p.partnerTitle ?? null,
      partnerBody:  p.partnerBody  ?? null,
      partnerCtaUrl:p.partnerCtaUrl?? null,
      heroCta:      p.heroCta      ?? null,
      conversionTitle:  p.conversionTitle  ?? null,
      conversionSubtitle: p.conversionSubtitle ?? null,
      conversionUrgency:  p.conversionUrgency  ?? null,
      conversionLabel:    p.conversionLabel    ?? null,
    },
  }));

  const { error } = await supabase.from("projects").insert(rows);
  if (error) throw error;

  for (const r of rows) {
    const hasContent = r.content.gallery?.length || r.content.performers?.length || r.content.flowSteps?.length;
    console.log(`  ✓ ${r.slug} (gallery:${r.content.gallery?.length ?? 0}, performers:${r.content.performers?.length ?? 0}, steps:${r.content.flowSteps?.length ?? 0})`);
  }
  console.log(`\nprojects ✓ (${rows.length} total)`);
}

(async () => {
  try {
    await importProjects();
  } catch (e) {
    console.error("Error:", e.message ?? e);
    process.exit(1);
  }
})();
