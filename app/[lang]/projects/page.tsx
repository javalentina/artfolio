import { createClient } from "@/lib/supabase/server";
import { tl } from "@/lib/i18n";
import type { SupportedLang } from "@/lib/i18n";
import type { Metadata } from "next";
import Link from "next/link";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const labels = { de: "Projekte", en: "Projects", ru: "Проекты" };
  const { lang } = await params;
  return { title: labels[lang as keyof typeof labels] ?? labels.de };
}

type Project = {
  id: string;
  slug: string;
  title: Record<string, string>;
  description: Record<string, string> | null;
  cover_image: string | null;
};

const LABELS = {
  label:    { de: "Projekte",    en: "Projects",   ru: "Проекты"   },
  title:    { de: "Kreative & Bildungsprojekte", en: "Creative & Educational Projects", ru: "Творческие проекты" },
  empty:    { de: "Keine Projekte vorhanden.", en: "No projects yet.", ru: "Проектов пока нет." },
} as const;

export default async function ProjectsPage({ params }: { params: Promise<{ lang: SupportedLang }> }) {
  const { lang } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("projects")
    .select("id,slug,title,description,cover_image")
    .eq("artist_id", ARTIST_ID)
    .eq("published", true)
    .order("position");

  const projects = (data ?? []) as Project[];

  return (
    <main className="max-w-5xl mx-auto px-6 md:px-16 pt-32 pb-24">
      <header className="mb-16">
        <span className="block text-[0.6rem] uppercase tracking-[0.4em] text-primary mb-4">
          {LABELS.label[lang]}
        </span>
        <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-light">
          {LABELS.title[lang]}
        </h1>
      </header>

      {projects.length === 0 ? (
        <p className="text-muted-fg text-sm">{LABELS.empty[lang]}</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-0">
          {projects.map((p, i) => (
            <Link
              key={p.id}
              href={`/${lang}/projects/${p.slug}`}
              className={[
                "cursor-pointer py-7 border-b border-border transition-colors group",
                i % 2 === 1
                  ? "sm:pl-12 sm:border-l sm:border-border"
                  : "sm:pr-12",
              ].join(" ")}
            >
              {p.cover_image && (
                <div className="aspect-[16/9] overflow-hidden mb-5 bg-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.cover_image}
                    alt={tl(p.title, lang)}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <h2 className="font-serif text-[1.25rem] font-normal mb-2 transition-colors group-hover:text-primary">
                {tl(p.title, lang, "–")}
              </h2>
              {p.description && tl(p.description, lang) && (
                <p className="text-[0.75rem] leading-[1.7] text-muted-fg">
                  {tl(p.description, lang)}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
