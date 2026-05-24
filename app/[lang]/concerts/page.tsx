import { createClient } from "@/lib/supabase/server";
import type { SupportedLang } from "@/lib/i18n";
import type { Metadata } from "next";
import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";
import ConcertsTable from "./ConcertsTable";

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
  gallery: string[] | null;
};

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
    .select("id,title,date,time,venue,city,country,ticket_url,gallery")
    .eq("artist_id", ARTIST_ID).eq("published", true)
    .order("date", { ascending: true });

  const all = (data ?? []) as Concert[];
  const today = new Date().toISOString().split("T")[0];
  const upcoming = all.filter(c => c.date >= today);
  const past = [...all.filter(c => c.date < today)].reverse();

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
        <ConcertsTable list={upcoming} lang={lang} ticketsLabel={LABELS.tickets[lang]} />
      )}

      {past.length > 0 && (
        <div className="mt-20">
          <h2 className="font-serif text-[clamp(1.8rem,3vw,2.5rem)] font-light text-muted-fg mb-8">
            {LABELS.past[lang]}
          </h2>
          <ConcertsTable list={past} lang={lang} ticketsLabel={LABELS.tickets[lang]} dim />
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
