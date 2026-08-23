import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { tl } from "@/lib/i18n";
import type { SupportedLang } from "@/lib/i18n";
import { MapPin, Phone, Mail } from "lucide-react";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

type ML  = Record<string, string>;
type Any = Record<string, unknown>;

// ── Labels ────────────────────────────────────────────────────────────────────
const L: Record<string, Record<string, string>> = {
  back:           { de: "← Zur Startseite",       en: "← Back to Homepage",      ru: "← На главную"                },
  cvLabel:        { de: "Lebenslauf",              en: "Curriculum Vitae",         ru: "Резюме"                      },
  location:       { de: "Standort",                en: "Location",                 ru: "Местонахождение"             },
  phone:          { de: "Telefon",                 en: "Phone",                    ru: "Телефон"                     },
  email:          { de: "E-Mail",                  en: "E-Mail",                   ru: "E-Mail"                      },
  teachingLabel:  { de: "Pädagogische Arbeit",     en: "Teaching",                 ru: "Педагогическая работа"       },
  expLabel:       { de: "Berufserfahrung",          en: "Professional Experience",  ru: "Опыт работы"                 },
  highlightLabel: { de: "Schwerpunkte",             en: "Highlights",               ru: "Направления"                 },
  eduLabel:       { de: "Ausbildung",               en: "Education",                ru: "Образование"                 },
  eduTitle:       { de: "Studium & Schule",         en: "Studies & schooling",      ru: "Учёба и школа"              },
  awardsLabel:    { de: "Auszeichnungen",           en: "Awards",                   ru: "Награды"                     },
  awardsTitle:    { de: "Wettbewerbe",              en: "Competitions",             ru: "Конкурсы"                    },
  concertLabel:   { de: "Konzerttätigkeit",         en: "Concert Activity",         ru: "Концертная деятельность"     },
  concertTitle:   { de: "Auswahl",                  en: "Selection",                ru: "Избранное"                   },
  pubLabel:       { de: "Veröffentlichungen",       en: "Publications",             ru: "Публикации"                  },
  pubTitle:       { de: "Bücher & Vorträge",        en: "Books & lectures",         ru: "Книги и лекции"              },
  langLabel:      { de: "Sprachen",                 en: "Languages",                ru: "Языки"                       },
  langTitle:      { de: "Mehrsprachig",             en: "Multilingual",             ru: "Многоязычность"              },
};
const t = (k: string, lang: string) => L[k]?.[lang] ?? L[k]?.de ?? "";

// ── Reusable section header ───────────────────────────────────────────────────
function SectionHead({ icon, label, title }: { icon?: string; label: string; title: string }) {
  return (
    <div className="mb-12 md:mb-16">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-primary mb-5">
        {icon && <span>{icon}</span>}{label}
      </p>
      <h2 className="font-serif text-[clamp(2.2rem,5vw,3.5rem)] font-light leading-tight">{title}</h2>
    </div>
  );
}

function ColLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-6">{children}</p>;
}

export default async function LebenslaufPage({ params }: { params: Promise<{ lang: SupportedLang }> }) {
  const { lang } = await params;
  const supabase  = await createClient();

  const { data: artist } = await supabase
    .from("artists")
    .select("name,settings")
    .eq("id", ARTIST_ID)
    .single();

  const s       = (artist?.settings ?? {}) as Any;
  const resume  = (s.resume ?? {}) as Any;
  const social  = (s.social  ?? {}) as Record<string, string>;

  const nameParts = (artist?.name ?? "Nataliia Uchitel").split(" ");
  const firstName = nameParts.slice(0, -1).join(" ");
  const lastName  = nameParts.slice(-1)[0] ?? "";

  const subtitle          = tl(resume.subtitle as ML, lang);
  const intro             = tl(resume.intro    as ML, lang);
  const location          = resume.location as string | undefined;
  const phone             = s.phone         as string | undefined;
  const whatsapp          = resume.whatsapp  as string | undefined;
  const email             = s.email         as string | undefined;

  const teachingTitle      = tl((resume.teachingTitle as ML), lang);
  const teachingHighlights = (resume.teachingHighlights as ML[] | undefined) ?? [];
  const experience         = (resume.experience as { id: string; years: string; place: string }[] | undefined) ?? [];

  const education  = (resume.education  as { id: string; years: string; school: ML; detail: ML }[] | undefined) ?? [];
  const awards     = (resume.awards     as { id: string; year: string; text: ML }[] | undefined) ?? [];
  const languages  = (resume.languages  as { id: string; name: string; level: string }[] | undefined) ?? [];
  const concertAct = tl(resume.concertActivity  as ML, lang);
  const concertCtr = tl(resume.concertCountries as ML, lang);
  const books      = (resume.books as { id: string; title: ML }[] | undefined) ?? [];

  const socialLinks = [
    { key: "spotify",   label: "Spotify"   },
    { key: "instagram", label: "Instagram" },
    { key: "youtube",   label: "YouTube"   },
    { key: "telegram",  label: "Telegram"  },
  ].filter(sl => social[sl.key]);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── HEADER ── */}
      <header className="mx-auto max-w-5xl px-5 sm:px-8 md:px-12 pt-24 md:pt-32 pb-16">
        <Link
          href={`/${lang}`}
          className="inline-block text-xs uppercase tracking-[0.3em] text-foreground/40 hover:text-primary transition-colors mb-10"
        >
          {t("back", lang)}
        </Link>

        <p className="text-xs uppercase tracking-[0.4em] text-primary mb-5">{t("cvLabel", lang)}</p>

        <h1 className="font-serif text-[clamp(3.5rem,10vw,7rem)] font-light leading-none mb-5">
          {firstName} <em style={{ fontStyle: "italic" }}>{lastName}</em>
        </h1>

        {subtitle && (
          <p className="text-lg md:text-xl italic text-foreground/50 mb-8 tracking-wide">{subtitle}</p>
        )}

        {intro && (
          <p className="max-w-xl text-base md:text-lg leading-relaxed text-foreground/70 mb-14">{intro}</p>
        )}

        {/* Contact strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-border/40 pt-8">
          {location && (
            <div>
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-primary/70 mb-3">
                <MapPin className="h-3.5 w-3.5" />{t("location", lang)}
              </p>
              <p className="text-sm md:text-base text-foreground/80 leading-snug">{location}</p>
            </div>
          )}
          {phone && (
            <div>
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-primary/70 mb-3">
                <Phone className="h-3.5 w-3.5" />{t("phone", lang)}
              </p>
              <p className="text-sm md:text-base text-foreground/80">{phone}</p>
              {whatsapp && <p className="text-sm text-foreground/40 mt-1">{whatsapp} · WhatsApp</p>}
            </div>
          )}
          {email && (
            <div>
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-primary/70 mb-3">
                <Mail className="h-3.5 w-3.5" />{t("email", lang)}
              </p>
              <a href={`mailto:${email}`} className="text-sm md:text-base text-foreground/80 hover:text-primary transition-colors break-all">
                {email}
              </a>
            </div>
          )}
        </div>
      </header>

      {/* ── TEACHING ── */}
      {(experience.length > 0 || teachingHighlights.length > 0) && (
        <section className="py-20 md:py-28 border-t border-border/40">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 md:px-12">
            <SectionHead icon="𝄞" label={t("teachingLabel", lang)} title={teachingTitle || t("teachingLabel", lang)} />
            <div className="grid md:grid-cols-2 gap-12 md:gap-20">
              {/* Experience */}
              <div>
                <ColLabel>{t("expLabel", lang)}</ColLabel>
                <div className="space-y-7">
                  {experience.map(e => (
                    <div key={e.id}>
                      <p className="text-xs uppercase tracking-[0.25em] text-primary/60 mb-1">{e.years}</p>
                      <p className="text-base md:text-lg text-foreground/75 leading-snug">{e.place}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Highlights */}
              {teachingHighlights.length > 0 && (
                <div>
                  <ColLabel>{t("highlightLabel", lang)}</ColLabel>
                  <ul className="space-y-4">
                    {teachingHighlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-3 text-base md:text-lg text-foreground/70 leading-relaxed">
                        <span className="text-primary/50 mt-1 shrink-0">—</span>
                        {tl(h, lang)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── EDUCATION ── */}
      {education.length > 0 && (
        <section className="py-20 md:py-28 border-t border-border/40">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 md:px-12">
            <SectionHead icon="◎" label={t("eduLabel", lang)} title={t("eduTitle", lang)} />
            <div className="space-y-10 md:space-y-12">
              {education.map(e => (
                <div key={e.id} className="flex flex-col sm:grid sm:grid-cols-[8rem_1fr] gap-2 sm:gap-8 md:gap-12">
                  <span className="text-sm text-foreground/35 tabular-nums sm:pt-1 shrink-0">{e.years}</span>
                  <div>
                    <p className="text-lg md:text-xl font-medium text-foreground/90 leading-snug mb-2">{tl(e.school, lang)}</p>
                    <p className="text-sm md:text-base text-foreground/55 leading-relaxed">{tl(e.detail, lang)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── AWARDS + CONCERT ── */}
      {(awards.length > 0 || concertAct) && (
        <section className="py-20 md:py-28 border-t border-border/40">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 md:px-12 grid md:grid-cols-2 gap-16 md:gap-20">
            {awards.length > 0 && (
              <div>
                <SectionHead label={t("awardsLabel", lang)} title={t("awardsTitle", lang)} />
                <div className="space-y-6">
                  {awards.map(a => (
                    <div key={a.id}>
                      <p className="text-xs uppercase tracking-[0.2em] text-primary/60 mb-1">{a.year}</p>
                      <p className="text-base md:text-lg text-foreground/75 leading-snug">{tl(a.text, lang)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {concertAct && (
              <div>
                <SectionHead icon="♩" label={t("concertLabel", lang)} title={t("concertTitle", lang)} />
                <div className="space-y-5 text-base md:text-lg text-foreground/70 leading-[1.85]">
                  <p>{concertAct}</p>
                  {concertCtr && <p>{concertCtr}</p>}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── PUBLICATIONS + LANGUAGES ── */}
      {(books.length > 0 || languages.length > 0) && (
        <section className="py-20 md:py-28 border-t border-border/40">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 md:px-12 grid md:grid-cols-2 gap-16 md:gap-20">
            {books.length > 0 && (
              <div>
                <SectionHead icon="☰" label={t("pubLabel", lang)} title={t("pubTitle", lang)} />
                <ul className="space-y-5">
                  {books.map(b => (
                    <li key={b.id} className="italic text-base md:text-lg text-foreground/70 leading-relaxed">
                      {tl(b.title, lang)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {languages.length > 0 && (
              <div>
                <div className="mb-12 md:mb-16">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-primary mb-5">
                    <span>◈</span>{t("langLabel", lang)}
                  </p>
                </div>
                <div className="space-y-4">
                  {languages.map(l => (
                    <div key={l.id} className="flex items-baseline justify-between gap-4 border-b border-border/20 pb-4">
                      <span className="text-base md:text-lg text-foreground/75">{l.name}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-primary/60 shrink-0 text-right">{l.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* bottom spacing so layout Footer has room */}
      <div className="pb-8" />
    </div>
  );
}
