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
};

const L = {
  label: { de: "Projekte",                       en: "Projects",                        ru: "Проекты"               },
  title: { de: "Kreative & Bildungsprojekte",    en: "Creative & Educational Projects", ru: "Творческие проекты"    },
  more:  { de: "Mehr erfahren →",                en: "Read more →",                     ru: "Подробнее →"           },
  empty: { de: "Keine Projekte vorhanden.",       en: "No projects yet.",                ru: "Проектов пока нет."    },
} as const;

export default async function ProjectsPage({ params }: { params: Promise<{ lang: SupportedLang }> }) {
  const { lang } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("projects")
    .select("id,slug,title,description")
    .eq("artist_id", ARTIST_ID)
    .eq("published", true)
    .order("position");

  const projects = (data ?? []) as Project[];

  return (
    <main className="relative py-14 md:py-24 overflow-hidden pt-32 md:pt-40">
      <div className="relative mx-auto max-w-5xl px-6">

        <div className="mb-16">
          <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-4">
            {L.label[lang]}
          </p>
          <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-light leading-tight">
            {L.title[lang]}
          </h1>
        </div>

        {projects.length === 0 ? (
          <p className="text-sm text-foreground/50">{L.empty[lang]}</p>
        ) : (
          <div className="grid gap-px bg-border sm:grid-cols-2">
            {projects.map(p => (
              <Link
                key={p.id}
                href={`/${lang}/projects/${p.slug}`}
                className="group bg-background p-10 md:p-12 block"
              >
                <h2 className="font-serif text-2xl font-light mb-4 group-hover:text-primary transition-colors leading-tight">
                  {tl(p.title, lang, "–")}
                </h2>
                {p.description && tl(p.description, lang) && (
                  <p className="text-base leading-relaxed text-foreground/70 text-pretty">
                    {tl(p.description, lang)}
                  </p>
                )}
                <span className="inline-block mt-6 text-[11px] tracking-[0.2em] uppercase text-primary">
                  {L.more[lang]}
                </span>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
