export const dynamic = "force-dynamic";

import Script from "next/script";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { tl } from "@/lib/i18n";
import type { SupportedLang } from "@/lib/i18n";
import ScrollReveal from "@/components/ScrollReveal";
import HeroTopBar from "@/components/HeroTopBar";
import SectionDivider from "@/components/SectionDivider";
import ContactForm from "@/app/[lang]/contact/ContactForm";
import GallerySectionHome from "@/components/GallerySectionHome";
import NewsletterSignup from "@/components/NewsletterSignup";
import RepertoireHomeSection from "@/components/RepertoireHomeSection";
import ConcertsPastSection from "@/components/ConcertsPastSection";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

type Settings    = Record<string, unknown>;
type VideoEntry  = { id: string; youtubeId: string; title: string; duration?: string };
type PodcastData = { title: Record<string,string>; description: Record<string,string>; youtubeUrl?: string };
type RepertoireRow = { id: string; composer: Record<string,string>; works: { en: string[]; ru: string[] } | string[] | null; tab: string; position: number };
type GalleryItem   = { id: string; url: string; alt: Record<string,string>; filename: string };
type CareerEntry   = { id: string; year: string; title: Record<string,string>; text: Record<string,string> };
type PubEntry      = { id: string; year: string; title: Record<string,string>; description: Record<string,string>; buyUrl?: string };

function formatDate(dateStr: string, lang: SupportedLang) {
  const d = new Date(dateStr + "T00:00:00");
  const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-GB" : "de-DE";
  return d.toLocaleDateString(locale, { day: "numeric", month: "long" });
}

const L = {
  subtitle:   { de: "Pianistin",                   en: "Pianist",                        ru: "Пианистка"                    },
  bio_btn:    { de: "Biografie",                   en: "Biography",                      ru: "Биография"                    },
  con_btn:    { de: "Konzerte",                    en: "Concerts",                       ru: "Концерты"                     },
  scroll:     { de: "Scrollen",                    en: "Scroll",                         ru: "Прокрутить"                   },
  bio_label:  { de: "Biografie",                   en: "Biography",                      ru: "Биография"                    },
  bio_title:  { de: "Konzertpianistin,\nPädagogin & Projektleiterin",
                en: "Concert Pianist,\nEducator & Project Leader",
                ru: "Концертный пианист,\nПедагог & Руководитель проектов"                                                  },
  car_divider:{ de: "Werdegang · Career",           en: "Career",                         ru: "Карьера"                      },
  pub_label:  { de: "Veröffentlichungen",          en: "Publications",                   ru: "Публикации"                   },
  pub_title:  { de: "Bücher",                      en: "Books",                          ru: "Книги"                        },
  pub_soon:   { de: "Demnächst verfügbar",         en: "Coming soon",                    ru: "Скоро"                        },
  pub_buy:    { de: "Kaufen →",                    en: "Buy →",                          ru: "Купить →"                     },
  con_label:  { de: "Konzerte",                    en: "Concerts",                       ru: "Концерты"                     },
  con_title:  { de: "Kommende Auftritte",          en: "Upcoming Performances",          ru: "Ближайшие концерты"           },
  tickets:    { de: "Tickets →",                   en: "Tickets →",                      ru: "Билеты →"                    },
  no_con:     { de: "Derzeit keine Konzerte geplant.", en: "No concerts scheduled.",     ru: "Концертов не запланировано."  },
  rep_label:  { de: "Repertoire",                  en: "Repertoire",                     ru: "Репертуар"                    },
  rep_title:  { de: "Ausgewählte Werke",           en: "Selected Works",                 ru: "Избранные произведения"       },
  vid_label:  { de: "Videos",                      en: "Videos",                         ru: "Видео"                        },
  vid_title:  { de: "Aufnahmen",                   en: "Recordings",                     ru: "Записи"                      },
  vid_yt:     { de: "Alle Videos →",              en: "All videos →",                   ru: "Все видео →"                  },
  gal_label:  { de: "Galerie",                     en: "Gallery",                        ru: "Галерея"                      },
  gal_title:  { de: "Momente auf der Bühne",        en: "Moments on Stage",               ru: "Моменты на сцене"             },
  proj_label: { de: "Projekte",                    en: "Projects",                       ru: "Проекты"                      },
  proj_title: { de: "Kreative & Bildungsprojekte", en: "Creative & Educational Projects",ru: "Творческие проекты"           },
  proj_more:  { de: "Mehr erfahren →",              en: "Read more →",                    ru: "Подробнее →"                  },
  pod_label:  { de: "Podcast",                     en: "Podcast",                        ru: "Подкаст"                      },
  pod_listen: { de: "Zuhören →",                   en: "Listen →",                       ru: "Слушать →"                    },
  ct_label:   { de: "Kontakt",                     en: "Contact",                        ru: "Контакт"                      },
  ct_head1:   { de: "Schreiben ",                  en: "Get in ",                        ru: "Напишите "                    },
  ct_head2:   { de: "Sie mir",                     en: "touch",                          ru: "мне"                          },
  ct_sub:     { de: "Für Konzertanfragen, Unterricht oder Projekte — ich freue mich auf Ihre Nachricht.",
                en: "For concert enquiries, lessons, or projects — I look forward to hearing from you.",
                ru: "По вопросам концертов, уроков или проектов — буду рада вашему сообщению."                              },
  loc_lbl:    { de: "Standort",                    en: "Location",                       ru: "Местонахождение"               },
  tel_lbl:    { de: "Telefon",                     en: "Phone",                          ru: "Телефон"                       },
  email_lbl:  { de: "E-Mail",                      en: "E-Mail",                         ru: "E-Mail"                        },
  whatsapp:   { de: "WhatsApp",                    en: "WhatsApp",                       ru: "WhatsApp"                      },
  ct_form:    { de: "Schreiben Sie mir direkt",    en: "Write to me directly",           ru: "Напишите мне напрямую"         },
  ct_follow:  { de: "Folgen Sie",                  en: "Follow",                         ru: "Следите за мной"               },
  ct_news:    { de: "Ich möchte über kommende Konzerte und Projekte von Natalia Uchitel informiert werden.",
                en: "I would like to be informed about upcoming concerts and projects by Natalia Uchitel.",
                ru: "Я хочу получать информацию о предстоящих концертах и проектах Натальи Учитель."                       },
  ct_send:    { de: "Nachricht senden →",          en: "Send message →",                 ru: "Отправить →"                   },
} as const;

function t(key: keyof typeof L, lang: SupportedLang, override?: Record<string,string> | undefined): string {
  if (override) return override[lang] ?? override["de"] ?? L[key][lang] ?? L[key]["de"] ?? "";
  return L[key][lang] ?? L[key]["de"] ?? "";
}

export default async function HomePage({ params }: { params: Promise<{ lang: SupportedLang }> }) {
  const { lang } = await params;
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [
    { data: artist },
    { data: allConcerts },
    { data: projects },
    { data: repertoireRows },
    { data: galleryItems },
  ] = await Promise.all([
    supabase.from("artists").select("name,settings").eq("id", ARTIST_ID).single(),
    supabase.from("concerts").select("id,title,date,venue,city,ticket_url,gallery").eq("artist_id", ARTIST_ID).eq("published", true).order("date"),
    supabase.from("projects").select("id,title,description,slug").eq("artist_id", ARTIST_ID).eq("published", true).order("position"),
    supabase.from("repertoire").select("id,composer,works,tab,position").eq("artist_id", ARTIST_ID).order("position"),
    supabase.from("media").select("id,url,alt,filename").eq("artist_id", ARTIST_ID),
  ]);

  const s = (artist?.settings ?? {}) as Settings;
  const sectionLabels   = (s.section_labels  as Record<string, Record<string,string>> | undefined) ?? {};
  const sl = (key: string) => sectionLabels[key] as Record<string,string> | undefined;

  const bio             = s.bio             as Record<string,string> | undefined;
  const bioQuote        = s.bio_quote       as Record<string,string> | undefined;
  const bioTitle        = s.bio_title       as Record<string,string> | undefined;
  const photoUrl        = s.photo_url       as string | undefined;
  const heroImageUrl    = s.hero_image_url  as string | undefined;
  const introVideoId    = s.intro_video_id  as string | undefined;
  const introVideoTitle = s.intro_video_title as Record<string,string> | undefined;
  const videos          = (s.videos         as VideoEntry[] | undefined) ?? [];
  const podcast         = s.podcast         as PodcastData | undefined;
  const social          = (s.social         as Record<string,string> | undefined) ?? {};
  const phone           = s.phone           as string | undefined;
  const address         = s.address         as Record<string,string> | undefined;
  const career          = (s.career         as CareerEntry[] | undefined) ?? [];
  const publications    = (s.publications   as PubEntry[]    | undefined) ?? [];
  const mediaOrder      = (s.media_order    as string[]      | undefined) ?? [];
  const repTabOrder     = (s.repertoire_tab_order as string[] | undefined) ?? [];
  const youtubeChannel  = social.youtube;

  const upcoming = (allConcerts ?? []).filter(c => c.date >= today);
  const past     = (allConcerts ?? []).filter(c => c.date < today).reverse();
  const rawGallery = (galleryItems ?? []) as GalleryItem[];
  const gallery = mediaOrder.length
    ? [...rawGallery].sort((a, b) => {
        const ai = mediaOrder.indexOf(a.id); const bi = mediaOrder.indexOf(b.id);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      })
    : rawGallery;
  const repRows  = (repertoireRows ?? []) as RepertoireRow[];

  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://natalia-uchitel.vercel.app";
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Natalia Uchitel",
    "alternateName": "Наталья Учитель",
    "jobTitle": lang === "ru" ? "Пианистка" : lang === "en" ? "Pianist" : "Pianistin",
    "description": lang === "ru"
      ? "Пианистка из Санкт-Петербурга, живёт в Берлине. Концерты, образовательные проекты, Академия искусств Эссен."
      : lang === "en"
      ? "Pianist from St. Petersburg, based in Berlin. Concerts, educational projects, Academy of Arts Essen."
      : "Pianistin aus St. Petersburg, tätig in Berlin. Konzerte, Bildungsprojekte, Folkwang Universität.",
    "birthDate": "1996-10-08",
    "birthPlace": { "@type": "Place", "name": "St. Petersburg, Russia" },
    "nationality": "Russian",
    "url": `${BASE}/${lang}`,
    "sameAs": [],
    "alumniOf": [
      { "@type": "EducationalOrganization", "name": "St. Petersburg Conservatory" },
      { "@type": "EducationalOrganization", "name": "Academy of Arts Essen" },
    ],
    "award": [
      "Robert Schumann Competition 2017",
      "Gummert Competition 1st Prize 2018",
      "Slonimsky Chamber Music Grand Prix 2021",
    ],
    "knowsLanguage": ["de", "en", "ru"],
    "worksFor": { "@type": "Organization", "name": "Freelance / Self-employed" },
  };

  return (
    <>
      <Script
        id="person-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      {/* ── HERO ── */}
      <section className="relative h-screen w-full overflow-hidden">
        <HeroTopBar lang={lang} />
        {heroImageUrl || photoUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImageUrl ?? photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-background/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#111] to-background" />
        )}
        <div className="relative z-10 flex h-full flex-col items-center justify-end pb-[18vh] px-6 text-center animate-reveal-up">
          <p className="text-sm tracking-[0.35em] uppercase text-primary">{t("subtitle", lang)}</p>
          <h1 className="font-serif mt-4 text-6xl font-light leading-[1.05] tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
            {tl(s.name_i18n as Record<string,string> | undefined, lang, lang === "ru" ? "Наталья Учитель" : "Natalia Uchitel")}
          </h1>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <a href={`/${lang}#bio`}
              className="border border-primary/40 px-8 py-3.5 text-sm tracking-[0.15em] uppercase text-foreground transition-all duration-300 hover:border-primary hover:bg-primary/10 active:scale-[0.97] text-center">
              {t("bio_btn", lang)}
            </a>
            <a href={`/${lang}#concerts`}
              className="border border-primary bg-primary px-8 py-3.5 text-sm tracking-[0.15em] uppercase text-background transition-all duration-300 hover:bg-primary/90 active:scale-[0.97] text-center">
              {t("con_btn", lang)}
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 animate-fade-in delay-800">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] tracking-[0.3em] uppercase text-foreground/30">{t("scroll", lang)}</span>
            <div className="h-8 w-px bg-foreground/20" />
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── VIDEO INTRO ── */}
      {introVideoId && (
        <>
          <ScrollReveal>
            <section id="video-intro" className="py-14 md:py-24">
              <div className="mx-auto max-w-4xl px-6">
                {introVideoTitle && (
                  <div className="mb-10 text-center">
                    <h2 className="font-serif text-4xl font-light md:text-5xl text-balance">{tl(introVideoTitle, lang)}</h2>
                  </div>
                )}
                <div className="relative aspect-video overflow-hidden border border-border/50">
                  <iframe
                    src={`https://www.youtube.com/embed/${introVideoId}?rel=0`}
                    title={tl(introVideoTitle ?? {}, lang)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen className="absolute inset-0 h-full w-full border-0" loading="lazy"
                  />
                </div>
              </div>
            </section>
          </ScrollReveal>
          <SectionDivider />
        </>
      )}

      {/* ── BIOGRAPHY ── */}
      <ScrollReveal>
        <section id="bio" className="relative overflow-hidden pt-16 pb-8 md:pt-28 md:pb-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-16 md:grid-cols-2 md:gap-20 items-start">
              <div>
                <p className="text-xs tracking-[0.3em] uppercase text-primary mb-6">{t("bio_label", lang)}</p>
                <h2 className="font-serif text-4xl font-light leading-[1.1] md:text-5xl text-balance mb-8 whitespace-pre-line">
                  {bioTitle ? tl(bioTitle, lang) : t("bio_title", lang)}
                </h2>
                {bio && (
                  <div className="space-y-5 text-lg leading-relaxed text-foreground/75 text-pretty">
                    {tl(bio, lang).split(/\n\n+/).map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                )}
                {bioQuote && tl(bioQuote, lang) && (
                  <blockquote className="mt-10 border-l-2 border-primary/60 pl-6">
                    <p className="font-display text-2xl font-light italic leading-relaxed text-foreground/80 text-pretty">
                      {tl(bioQuote, lang)}
                    </p>
                    <footer className="mt-4 font-body text-[11px] tracking-[0.3em] uppercase text-primary">— Natalia Uchitel</footer>
                  </blockquote>
                )}
                <div className="mt-10 flex flex-wrap gap-6">
                  <Link href={`/${lang}/lebenslauf`} className="text-[0.65rem] uppercase tracking-[0.2em] text-primary border-b border-primary/40 pb-px hover:border-primary transition-colors">
                    {lang === "ru" ? "Curriculum Vitae →" : lang === "en" ? "Curriculum Vitae →" : "Lebenslauf →"}
                  </Link>
                  <a href={`/${lang}#repertoire`} className="text-[0.65rem] uppercase tracking-[0.2em] text-foreground/40 border-b border-foreground/20 pb-px hover:text-primary hover:border-primary transition-colors">
                    {lang === "ru" ? "Репертуар →" : "Repertoire →"}
                  </a>
                </div>
              </div>
              <div className="overflow-hidden md:sticky md:top-24">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="Natalia Uchitel" className="w-full grayscale" loading="lazy" />
                ) : (
                  <div className="aspect-[3/4] bg-gradient-to-br from-card to-secondary" />
                )}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── WERDEGANG (CAREER) ── */}
      {career.length > 0 && (
        <>
          <ScrollReveal>
            <section id="career" className="py-12 md:py-20">
              {/* Labeled divider */}
              <div className="mx-auto max-w-6xl px-6 flex items-center gap-6 mb-20">
                <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
                <p className="text-[0.6rem] uppercase tracking-[0.4em] text-primary shrink-0">{t("car_divider", lang, sl("car_divider"))}</p>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              </div>

              {/* Timeline */}
              <div className="mx-auto max-w-4xl px-6 md:px-12 space-y-12 md:space-y-20">
                {career.map(entry => (
                  <div key={entry.id} className="flex flex-col gap-3 md:grid md:grid-cols-[8rem_1px_1fr] md:gap-12 md:items-start">
                    {/* Year */}
                    <div className="md:text-right">
                      <span className="font-serif text-3xl font-light text-primary/70 leading-none md:text-[clamp(2rem,4vw,3.5rem)]">
                        {entry.year}
                      </span>
                    </div>
                    {/* Vertical line + diamond — desktop only */}
                    <div className="hidden md:flex relative flex-col items-center self-stretch">
                      <div className="absolute top-3 h-2.5 w-2.5 rotate-45 bg-primary/60" />
                      <div className="mt-3 w-px flex-1 bg-border/60" />
                    </div>
                    {/* Content */}
                    <div className="border-l-2 border-primary/30 pl-4 md:border-0 md:pl-0 md:pt-1">
                      <h3 className="font-serif text-xl font-light leading-tight mb-3 text-foreground/90 md:text-[clamp(1.4rem,2.5vw,2rem)] md:mb-4">
                        {tl(entry.title, lang)}
                      </h3>
                      {tl(entry.text, lang).split(/\n\n+/).map((p, i) => (
                        <p key={i} className="text-sm leading-relaxed text-foreground/65 mb-3 last:mb-0">{p}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
          <SectionDivider />
        </>
      )}

      {/* ── VIDEOS (AUFNAHMEN) ── */}
      {videos.length > 0 && (
        <>
          <SectionDivider />
          <ScrollReveal>
            <section id="videos" className="py-16 md:py-32">
              <div className="mx-auto max-w-6xl px-6">
                <div className="mb-16 text-center">
                  <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-4">{t("vid_label", lang)}</p>
                  <h2 className="font-serif text-4xl font-light leading-none md:text-5xl">{t("vid_title", lang, sl("vid_title"))}</h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {videos.map(v => (
                    <a key={v.id} href={`https://www.youtube.com/watch?v=${v.youtubeId}`} target="_blank" rel="noopener noreferrer"
                      className="group relative overflow-hidden bg-background transition-all duration-300 hover:shadow-[0_8px_30px_hsl(38_35%_58%/0.1)] active:scale-[0.98]">
                      <div className="relative aspect-video overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`} alt={v.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-foreground/30 backdrop-blur-sm">
                            <svg className="ml-1 h-5 w-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="font-serif text-lg font-light leading-snug">{v.title}</p>
                        {v.duration && <p className="mt-2 text-xs text-foreground/50 tabular-nums">{v.duration}</p>}
                      </div>
                    </a>
                  ))}
                </div>
                {youtubeChannel && (
                  <div className="mt-12 text-center">
                    <a href={youtubeChannel} target="_blank" rel="noopener noreferrer"
                      className="inline-block border-b border-primary/40 pb-1 text-xs tracking-[0.2em] uppercase text-primary transition-colors hover:border-primary">
                      {t("vid_yt", lang)}
                    </a>
                  </div>
                )}
              </div>
            </section>
          </ScrollReveal>
        </>
      )}

      {/* ── GALLERY (MOMENTE) ── */}
      {gallery.length > 0 && (
        <>
          <SectionDivider />
          <ScrollReveal>
            <section id="gallery" className="py-14 md:py-24">
              <div className="mx-auto max-w-5xl px-6">
                <div className="mb-16">
                  <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-4">{t("gal_label", lang)}</p>
                  <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-light leading-tight">{t("gal_title", lang, sl("gal_title"))}</h2>
                </div>
                <GallerySectionHome images={gallery} lang={lang} />
              </div>
            </section>
          </ScrollReveal>
        </>
      )}

      {/* ── CONCERTS ── */}
      <SectionDivider />
      <ScrollReveal>
        <section id="concerts" className="py-16 md:py-28">
          <div className="mx-auto max-w-4xl px-6 md:px-16">
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-10 bg-primary" />
                <p className="text-[11px] tracking-[0.4em] uppercase text-primary">{t("con_label", lang)}</p>
              </div>
              <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-light">{t("con_title", lang, sl("con_title"))}</h2>
            </div>

            {!upcoming.length ? (
              <p className="text-muted-fg text-sm py-8 border-t border-border">{t("no_con", lang)}</p>
            ) : (
              <div className="border-t border-border">
                {upcoming.map(c => (
                  <div key={c.id} className="group flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0 py-5 border-b border-border hover:bg-secondary/30 transition-colors sm:px-4">
                    <span className="w-44 text-sm tracking-[0.15em] uppercase text-primary shrink-0">{formatDate(c.date, lang)}</span>
                    <span className="font-serif text-2xl md:text-3xl font-light flex-1">{tl(c.city, lang) || tl(c.title, lang, "–")}</span>
                    <span className="text-base text-foreground/75">{tl(c.venue, lang)}</span>
                    {c.ticket_url && (
                      <a href={c.ticket_url} target="_blank" rel="noopener noreferrer"
                        className="sm:ml-4 shrink-0 text-[0.65rem] uppercase tracking-[0.15em] text-primary border-b border-transparent hover:border-primary transition-colors pb-px">
                        {t("tickets", lang)}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            <ConcertsPastSection past={past} lang={lang} />
          </div>
        </section>
      </ScrollReveal>

      {/* ── PROJECTS (KREATIVE) ── */}
      {projects && projects.length > 0 && (
        <>
          <SectionDivider />
          <ScrollReveal>
            <section id="projects" className="relative py-14 md:py-24 overflow-hidden">
              <div className="relative mx-auto max-w-5xl px-6">
                <div className="mb-16">
                  <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-4">{t("proj_label", lang)}</p>
                  <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-light leading-tight">{t("proj_title", lang, sl("proj_title"))}</h2>
                </div>
                <div className="grid gap-px bg-border sm:grid-cols-2">
                  {projects.map(p => (
                    <Link key={p.id} href={`/${lang}/projects/${p.slug}`}
                      className="group bg-background p-10 md:p-12 block">
                      <h3 className="font-serif text-2xl font-light mb-4 group-hover:text-primary transition-colors">{tl(p.title, lang, "–")}</h3>
                      {p.description && (
                        <p className="text-base leading-relaxed text-foreground/70 text-pretty">{tl(p.description as Record<string,string>, lang)}</p>
                      )}
                      <span className="inline-block mt-6 text-[11px] tracking-[0.2em] uppercase text-primary">
                        {t("proj_more", lang)}
                      </span>
                    </Link>
                  ))}
                </div>
                {podcast && (podcast.title || podcast.description) && (
                  <div className="mt-16 border border-border p-8 md:p-12">
                    <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">{t("pod_label", lang)}</p>
                    <h3 className="font-serif text-3xl font-light mb-4">{tl(podcast.title, lang)}</h3>
                    <p className="text-lg text-foreground/70 mb-6 max-w-lg text-pretty">{tl(podcast.description, lang)}</p>
                    {podcast.youtubeUrl && (
                      <a href={podcast.youtubeUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-block border-b border-primary/40 pb-1 text-xs tracking-[0.2em] uppercase text-primary transition-colors hover:border-primary">
                        {t("pod_listen", lang)}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </section>
          </ScrollReveal>
        </>
      )}

      {/* ── REPERTOIRE ── */}
      {repRows.length > 0 && (
        <>
          <SectionDivider variant="line" />
          <ScrollReveal>
            <div id="repertoire">
              <RepertoireHomeSection rows={repRows} lang={lang} tabOrder={repTabOrder} sectionLabels={sectionLabels} />
            </div>
          </ScrollReveal>
        </>
      )}

      {/* ── BÜCHER (PUBLICATIONS) ── */}
      {publications.length > 0 && (
        <>
          <SectionDivider />
          <ScrollReveal>
            <section id="books" className="py-12 md:py-20">
              <div className="mx-auto max-w-6xl px-6 md:px-12">
                <div className="mb-14">
                  <p className="text-[0.6rem] uppercase tracking-[0.4em] text-primary mb-4">{t("pub_label", lang)}</p>
                  <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-light leading-none">{t("pub_title", lang, sl("pub_title"))}</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-px bg-border/30">
                  {publications.map(pub => (
                    <div key={pub.id} className="bg-background p-8 md:p-12 space-y-5">
                      <div>
                        <p className="font-serif text-[clamp(2rem,4vw,3rem)] font-light text-primary/70 leading-none mb-4">
                          {pub.year}
                        </p>
                        <div className="h-px bg-border/60 mb-5" />
                        <h3 className="font-serif text-[clamp(1.4rem,2.5vw,2rem)] font-light leading-tight text-foreground/90 mb-4">
                          {tl(pub.title, lang)}
                        </h3>
                        {tl(pub.description, lang) && (
                          <p className="text-sm leading-relaxed text-foreground/60">
                            {tl(pub.description, lang)}
                          </p>
                        )}
                      </div>
                      {pub.buyUrl ? (
                        <a href={pub.buyUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-block border border-primary/30 px-5 py-2 text-[0.6rem] uppercase tracking-[0.25em] text-primary hover:bg-primary/10 transition-colors">
                          {t("pub_buy", lang)}
                        </a>
                      ) : (
                        <span className="inline-block border border-border/40 px-5 py-2 text-[0.6rem] uppercase tracking-[0.25em] text-foreground/30">
                          {t("pub_soon", lang)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-12">
                  <NewsletterSignup lang={lang} />
                </div>
              </div>
            </section>
          </ScrollReveal>
        </>
      )}

      {/* ── CONTACT ── */}
      <SectionDivider />
      <ScrollReveal>
        <section id="contact" className="py-14 md:py-24">
          <div className="mx-auto max-w-5xl px-6">

            {/* heading */}
            <div className="text-center">
              <p className="text-[11px] tracking-[0.4em] uppercase text-primary">{t("ct_label", lang)}</p>
              <h2 className="font-serif mt-6 text-4xl font-light leading-[1.05] tracking-tight md:text-6xl">
                {t("ct_head1", lang)}<span className="italic text-primary">{t("ct_head2", lang)}</span>
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-foreground/70">{t("ct_sub", lang, sl("ct_sub"))}</p>
            </div>

            {/* 3-col info strip */}
            <div className="mt-16 grid gap-px bg-border sm:grid-cols-3">
              <div className="bg-background p-8">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <MapPin className="h-3 w-3" />
                  <span className="text-[11px] tracking-[0.3em] uppercase">{t("loc_lbl", lang)}</span>
                </div>
                <p className="text-base leading-snug">{address ? tl(address, lang) : "Lübeck"}</p>
              </div>
              <div className="bg-background p-8">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <Phone className="h-3 w-3" />
                  <span className="text-[11px] tracking-[0.3em] uppercase">{t("tel_lbl", lang)}</span>
                </div>
                {phone ? (
                  <>
                    <p className="text-base">{phone}</p>
                    <p className="mt-1 text-sm text-foreground/50">{t("whatsapp", lang)}</p>
                  </>
                ) : (
                  <p className="text-base text-foreground/40">—</p>
                )}
              </div>
              <div className="bg-background p-8">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <Mail className="h-3 w-3" />
                  <span className="text-[11px] tracking-[0.3em] uppercase">{t("email_lbl", lang)}</span>
                </div>
                {social.email ? (
                  <a href={`mailto:${social.email}`} className="text-base hover:text-primary transition-colors break-all">
                    {social.email}
                  </a>
                ) : (
                  <p className="text-base text-foreground/40">—</p>
                )}
              </div>
            </div>

            {/* form in bordered container */}
            <div className="mt-12 border border-border p-8 md:p-12">
              <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-8">{t("ct_form", lang)}</p>
              <ContactForm lang={lang} />
            </div>

            {/* FOLGEN SIE social links */}
            {[social.instagram, social.youtube, social.telegram].some(Boolean) && (
              <div className="mt-12 text-center">
                <p className="text-[11px] tracking-[0.4em] uppercase text-primary mb-6">{t("ct_follow", lang)}</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    { label: "Instagram", url: social.instagram },
                    { label: "YouTube",   url: social.youtube   },
                    { label: "Telegram",  url: social.telegram  },
                  ].filter(s => s.url).map(s => (
                    <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 border border-border px-6 py-2.5 text-[11px] tracking-[0.2em] uppercase hover:border-primary hover:text-primary transition-colors">
                      {s.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
