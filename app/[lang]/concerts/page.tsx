import { createClient } from "@/lib/supabase/server";
import { tl } from "@/lib/i18n";
import type { SupportedLang } from "@/lib/i18n";
import type { Metadata } from "next";
import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const labels = { de: "Konzerte", en: "Concerts", ru: "Концерты" };
  const { lang } = await params;
  return { title: labels[lang as keyof typeof labels] ?? labels.de };
}

type Concert = {
  id: string;
  title: Record<string, string>;
  date: string;
  time: string | null;
  venue: Record<string, string>;
  city: Record<string, string>;
  country: string | null;
  ticket_url: string | null;
};

function formatDate(dateStr: string, lang: string) {
  const d = new Date(dateStr + "T00:00:00");
  const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-GB" : "de-DE";
  return {
    short:   d.toLocaleDateString(locale, { day: "numeric", month: "long" }),
    weekday: d.toLocaleDateString(locale, { weekday: "long" }),
    year:    d.getFullYear(),
  };
}

const LABELS = {
  upcoming: { de: "Bevorstehende Konzerte", en: "Upcoming Concerts", ru: "Ближайшие концерты" },
  past:     { de: "Vergangene Konzerte",    en: "Past Concerts",     ru: "Прошедшие концерты" },
  tickets:  { de: "Tickets →",             en: "Tickets →",         ru: "Билеты →"           },
  none_up:  { de: "Derzeit keine Konzerte geplant.", en: "No upcoming concerts.", ru: "Концертов не запланировано." },
} as const;

export default async function ConcertsPage({ params }: { params: Promise<{ lang: SupportedLang }> }) {
  const { lang } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("concerts")
    .select("id,title,date,time,venue,city,country,ticket_url")
    .eq("artist_id", ARTIST_ID).eq("published", true)
    .order("date", { ascending: true });

  const all = (data ?? []) as Concert[];
  const today = new Date().toISOString().split("T")[0];
  const upcoming = all.filter(c => c.date >= today);
  const past = [...all.filter(c => c.date < today)].reverse();

  function ConcertTable({ list, dim = false }: { list: Concert[]; dim?: boolean }) {
    return (
      <table className="w-full border-collapse">
        <tbody>
          {list.map(c => {
            const d = formatDate(c.date, lang);
            return (
              <tr key={c.id} className={`border-b border-border transition-colors hover:bg-primary/[0.04] cursor-default ${dim ? "opacity-50" : ""}`}>
                <td className="py-[18px] pr-4 w-32 text-[0.7rem] font-normal uppercase tracking-[0.08em] text-primary whitespace-nowrap">
                  {d.short}
                </td>
                <td className="py-[18px] pr-10 font-serif text-[1.35rem] font-normal">
                  {tl(c.city, lang) || tl(c.title, lang, "–")}
                </td>
                <td className="py-[18px] pr-6 text-[0.75rem] text-muted-fg tracking-[0.05em] hidden sm:table-cell">
                  {tl(c.venue, lang)}
                </td>
                <td className="py-[18px] text-right w-24">
                  {c.ticket_url && (
                    <a href={c.ticket_url} target="_blank" rel="noopener noreferrer"
                      className="text-[0.65rem] uppercase tracking-[0.15em] text-primary border-b border-transparent hover:border-primary transition-colors pb-px">
                      {LABELS.tickets[lang]}
                    </a>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 md:px-16 pt-32 pb-24">
      <header className="mb-16">
        <span className="block text-[0.6rem] uppercase tracking-[0.4em] text-primary mb-4">
          {lang === "ru" ? "Концерты" : lang === "en" ? "Concerts" : "Konzerte"}
        </span>
        <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-light">
          {LABELS.upcoming[lang]}
        </h1>
      </header>

      {upcoming.length === 0 ? (
        <p className="text-muted-fg text-sm py-8">{LABELS.none_up[lang]}</p>
      ) : (
        <ConcertTable list={upcoming} />
      )}

      {past.length > 0 && (
        <div className="mt-20">
          <h2 className="font-serif text-[clamp(1.8rem,3vw,2.5rem)] font-light text-muted-fg mb-8">
            {LABELS.past[lang]}
          </h2>
          <ConcertTable list={past} dim />
        </div>
      )}

      <div className="mt-16">
        <NewsletterSignup lang={lang} />
      </div>

      <div className="mt-10">
        <Link href={`/${lang}`} className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-fg hover:text-primary transition-colors">
          ← {lang === "ru" ? "На главную" : lang === "en" ? "Back home" : "Zurück"}
        </Link>
      </div>
    </main>
  );
}
