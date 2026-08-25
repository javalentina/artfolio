import { createClient } from "@/lib/supabase/server";
import { tl } from "@/lib/i18n";
import type { SupportedLang } from "@/lib/i18n";
import type { Metadata } from "next";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const labels = { de: "Repertoire", en: "Repertoire", ru: "Репертуар" };
  const { lang } = await params;
  return { title: labels[lang as keyof typeof labels] ?? labels.de };
}

type RepertoireRow = {
  id: string;
  composer: Record<string, string>;
  works: { en: string[]; ru: string[] } | string[] | null;
  tab: string;
  position: number;
};

function getWorks(row: RepertoireRow, lang: string): string[] {
  const w = row.works;
  if (!w) return [];
  if (Array.isArray(w)) return w;
  if (lang === "ru" && w.ru?.length) return w.ru;
  return w.en ?? [];
}

function parseWorks(works: string[]) {
  return works.map(line => ({
    header: line.trimEnd().endsWith(":"),
    text: line.trimEnd().endsWith(":") ? line.slice(0, -1).trim() : line.trim(),
  }));
}

const TAB_LABELS: Record<string, Record<string, string>> = {
  solo:    { de: "Solo", en: "Solo", ru: "Соло" },
  chamber: { de: "Kammermusik", en: "Chamber Music", ru: "Камерная" },
  duo:     { de: "Duo", en: "Duo", ru: "Дуэт" },
  vocal:   { de: "Vokal", en: "Vocal", ru: "Вокал" },
  "Contemporary composers": { de: "Zeitgenössische Komponisten", en: "Contemporary composers", ru: "Современные композиторы" },
  "Other repertoire":       { de: "Weiteres Repertoire", en: "Other repertoire", ru: "Прочий репертуар" },
};
function tabLabel(tab: string, lang: string): string {
  return TAB_LABELS[tab]?.[lang] ?? TAB_LABELS[tab]?.de ?? tab;
}

export default async function RepertoirePage({ params }: { params: Promise<{ lang: SupportedLang }> }) {
  const { lang } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("repertoire")
    .select("id,composer,works,tab,position")
    .eq("artist_id", ARTIST_ID)
    .order("position");

  const rows = (data ?? []) as RepertoireRow[];
  const tabs = [...new Set(rows.map(r => r.tab))];

  return (
    <main className="pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6 md:px-16 mb-16">
        <span className="block text-[0.6rem] uppercase tracking-[0.4em] text-primary mb-4">
          {lang === "ru" ? "Репертуар" : lang === "en" ? "Repertoire" : "Repertoire"}
        </span>
        <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-light">
          {lang === "ru" ? "Произведения" : lang === "en" ? "Works" : "Werke"}
        </h1>
      </div>

      {tabs.map(tab => {
        const tabRows = rows.filter(r => r.tab === tab);
        return (
          <section key={tab} className="border-t border-border mb-0">
            {/* Tab header */}
            <div className="max-w-5xl mx-auto px-6 md:px-16 py-10">
              <div className="flex items-center gap-4">
                <span className="font-serif text-[1.4rem] font-light capitalize text-muted-fg">{tabLabel(tab, lang)}</span>
                <span className="flex-1 border-t border-border" />
              </div>
            </div>

            {/* Composers */}
            <div className="max-w-5xl mx-auto px-6 md:px-16 space-y-10 pb-10">
              {tabRows.map(row => {
                const works = parseWorks(getWorks(row, lang));
                return (
                  <div key={row.id} className="grid md:grid-cols-[14rem_1fr] gap-4 border-b border-border pb-10">
                    <h2 className="font-serif text-[1.5rem] font-light leading-tight md:sticky md:top-20 self-start">
                      {tl(row.composer, lang, "–")}
                    </h2>
                    <div className="space-y-0.5">
                      {works.map((item, i) =>
                        item.header ? (
                          <p key={i} className="pt-5 pb-1 first:pt-0 text-[0.6rem] uppercase tracking-[0.2em] text-primary font-normal">
                            {item.text}
                          </p>
                        ) : (
                          <p key={i} className="text-[0.82rem] leading-relaxed text-muted-fg pl-2 border-l border-transparent hover:border-border transition-colors">
                            {item.text}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
