import { createClient } from "@/lib/supabase/server";
import type { SupportedLang } from "@/lib/i18n";
import { tl } from "@/lib/i18n";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

type Concert = {
  id: string;
  title: Record<string, string>;
  date: string;
  time: string | null;
  venue: Record<string, string>;
  city: Record<string, string>;
  country: string | null;
  description: Record<string, string> | null;
  gallery: string[] | null;
  ticket_url: string | null;
};

function formatDate(dateStr: string, lang: string) {
  const d = new Date(dateStr + "T00:00:00");
  const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-GB" : "de-DE";
  return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

function formatDateShort(dateStr: string, lang: string) {
  const d = new Date(dateStr + "T00:00:00");
  const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-GB" : "de-DE";
  return d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" });
}

const LABELS = {
  back:        { de: "Alle Konzerte",         en: "All Concerts",         ru: "Все концерты"         },
  past_eyebrow:{ de: "Vergangenes Konzert",   en: "Past Concert",         ru: "Прошедший концерт"    },
  when:        { de: "Wann",                  en: "When",                 ru: "Когда"                },
  where:       { de: "Wo",                    en: "Where",                ru: "Где"                  },
  gallery_lbl: { de: "Impressionen",          en: "Impressions",          ru: "Впечатления"          },
  gallery_ttl: { de: "Bildergalerie",         en: "Photo Gallery",        ru: "Фотогалерея"          },
  tickets:     { de: "Tickets →",             en: "Tickets →",            ru: "Билеты →"             },
} as const;
const L = (k: keyof typeof LABELS, lang: string) =>
  LABELS[k][lang as "de" | "en" | "ru"] ?? LABELS[k].de;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("concerts")
    .select("title,venue,city,date,description,gallery")
    .eq("id", id)
    .single();
  if (!data) return { title: "Konzert" };

  const city  = tl(data.city as Record<string, string>, lang);
  const venue = tl(data.venue as Record<string, string>, lang);
  const rawTitle = tl(data.title as Record<string, string>, lang, "–");
  const pageTitle = [rawTitle !== "–" ? rawTitle : null, city || null].filter(Boolean).join(" · ") || "Konzert";

  const ownDescription = tl(data.description as Record<string, string> | null, lang);
  const description = ownDescription || [
    "Natalia Uchitel",
    [venue, city].filter(Boolean).join(", "),
    formatDate(data.date, lang),
  ].filter(Boolean).join(" · ");

  const image = data.gallery?.[0];

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      type: "article",
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function ConcertDetailPage({
  params,
}: {
  params: Promise<{ lang: SupportedLang; id: string }>;
}) {
  const { lang, id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("concerts")
    .select("id,title,date,time,venue,city,country,description,gallery,ticket_url")
    .eq("id", id)
    .eq("artist_id", ARTIST_ID)
    .single();

  if (!data) notFound();

  const c = data as Concert;
  const photos = (c.gallery ?? []).filter(Boolean);
  const heroPhoto = photos[0] ?? null;
  const today = new Date().toISOString().split("T")[0];
  const isPast = c.date < today;
  const city = tl(c.city, lang);
  const venue = tl(c.venue, lang);
  const desc = c.description ? tl(c.description, lang) : null;

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[55vh] min-h-[340px] w-full overflow-hidden bg-secondary/30">
        {heroPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroPhoto}
            alt={city}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 to-secondary/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {/* Back link */}
        <div className="absolute top-6 left-6 md:top-8 md:left-10">
          <Link
            href={`/${lang}/concerts`}
            className="text-[0.65rem] uppercase tracking-[0.2em] text-foreground/70 hover:text-primary transition-colors backdrop-blur-sm bg-background/20 px-3 py-1.5 rounded-full"
          >
            ← {L("back", lang)}
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 md:px-16 -mt-20 relative pb-24">
        {/* Eyebrow */}
        <p className="text-[0.6rem] uppercase tracking-[0.4em] text-primary mb-3">
          {isPast ? L("past_eyebrow", lang) : ""} · {formatDateShort(c.date, lang)}
        </p>

        {/* Title */}
        <h1 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-[1.05]">
          {city || tl(c.title, lang, "–")}
        </h1>
        {venue && (
          <p className="mt-2 text-lg text-foreground/70 font-light">{venue}</p>
        )}

        {/* Info grid */}
        <div className="mt-10 grid grid-cols-2 gap-8 border-t border-border pt-8 max-w-sm">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-primary mb-1">{L("when", lang)}</p>
            <p className="text-sm">{formatDate(c.date, lang)}</p>
            {c.time && <p className="text-sm text-foreground/60">{c.time}</p>}
          </div>
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-primary mb-1">{L("where", lang)}</p>
            <p className="text-sm">{venue}</p>
            {c.country && <p className="text-sm text-foreground/60">{c.country}</p>}
          </div>
        </div>

        {/* Tickets */}
        {c.ticket_url && (
          <div className="mt-6">
            <a
              href={c.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[0.65rem] uppercase tracking-[0.15em] border border-primary/40 px-5 py-2.5 hover:border-primary hover:bg-primary/10 transition-colors"
            >
              {L("tickets", lang)}
            </a>
          </div>
        )}

        {/* Description */}
        {desc && (
          <div className="mt-12 max-w-2xl">
            <p className="text-base leading-[1.85] text-foreground/80 whitespace-pre-line">{desc}</p>
          </div>
        )}

        {/* Photo gallery */}
        {photos.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-2">
              <span className="h-px w-10 bg-primary" />
              <p className="text-xs tracking-[0.4em] uppercase text-primary">{L("gallery_lbl", lang)}</p>
            </div>
            <h2 className="font-serif text-3xl font-light mb-8">{L("gallery_ttl", lang)}</h2>
            <div className="columns-1 sm:columns-2 md:columns-3 gap-3 space-y-3">
              {photos.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-full h-auto rounded-lg break-inside-avoid"
                />
              ))}
            </div>
          </div>
        )}

        {/* Back link at bottom */}
        <div className="mt-16">
          <Link
            href={`/${lang}/concerts`}
            className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-fg hover:text-primary transition-colors"
          >
            ← {L("back", lang)}
          </Link>
        </div>
      </div>
    </main>
  );
}
