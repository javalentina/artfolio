import { createClient } from "@/lib/supabase/server";
import type { SupportedLang } from "@/lib/i18n";
import { notFound } from "next/navigation";
import Link from "next/link";
import SectionDivider from "@/components/SectionDivider";
import TestimonialsSection from "./TestimonialsSection";
import NewsletterSignup from "@/components/NewsletterSignup";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";
type Lang = SupportedLang;

function tl(o: unknown, lang: Lang, fb = ""): string {
  if (!o) return fb;
  if (typeof o === "string") return o;
  const m = o as Record<string, string>;
  return m[lang] ?? m.de ?? m.en ?? fb;
}

function ml(de?: string, en?: string, ru?: string, lang?: Lang) {
  if (lang === "ru") return ru || de || "";
  if (lang === "en") return en || de || "";
  return de || "";
}

type Performer  = { id: string; name: string; roleDE?: string; roleEN?: string; roleRU?: string; photoUrl?: string };
type FlowStep   = { id: string; titleDE?: string; titleEN?: string; titleRU?: string; textDE?: string; textEN?: string; textRU?: string };
type Testimonial= { id: string; name: string; professionDE?: string; professionEN?: string; professionRU?: string; textDE?: string; textEN?: string; textRU?: string };

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ lang: Lang; slug: string }>;
}) {
  const { lang, slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("projects")
    .select("id,slug,title,description,cover_image,content")
    .eq("artist_id", ARTIST_ID)
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!data) notFound();

  const c = (data.content ?? {}) as Record<string, unknown>;

  const title        = tl(data.title, lang);
  const label        = tl({ de: "Projekte", en: "Projects", ru: "Проекты" }, lang);
  const subtitle     = tl(c.subtitle,      lang);
  const fullText     = tl(c.fullText,      lang);
  const heroImg      = (c.imageUrl as string) ?? data.cover_image ?? null;
  const gallery      = ((c.gallery      as string[])     ?? []).filter(Boolean);
  const performers   = (c.performers   as Performer[])  ?? [];
  const flowSteps    = (c.flowSteps    as FlowStep[])   ?? [];
  const testimonials = (c.testimonials as Testimonial[]) ?? [];
  const youtubeId    = c.youtubeId    as string | undefined;
  const eventEmail   = c.eventEmail   as string | undefined;
  const eventNote    = tl(c.eventNote,    lang);
  const eventTickets = tl(c.eventTickets, lang);
  const eventWhen    = tl(c.eventWhen,    lang);
  const eventWhere   = tl(c.eventWhere,   lang);
  const eventDuration= tl(c.eventDuration,lang);
  const statFormat   = tl(c.statFormat,   lang);
  const statDuration = tl(c.statDuration, lang);
  const statPartner  = c.statPartner as string | undefined;
  const partnerTitle = tl(c.partnerTitle, lang);
  const partnerBody  = tl(c.partnerBody,  lang);
  const conversionTitle    = tl(c.conversionTitle,    lang);
  const conversionSubtitle = tl(c.conversionSubtitle, lang);
  const conversionLabel    = tl(c.conversionLabel,    lang);
  const conversionUrgency  = tl(c.conversionUrgency,  lang);
  const heroCta      = tl(c.heroCta, lang) || (lang === "ru" ? "Забронировать" : lang === "en" ? "Reserve" : "Reservieren");

  const paragraphs  = fullText.split(/\n\n+/).filter(Boolean);
  const hasFlow       = flowSteps.length > 0;
  const hasStats      = statDuration || statFormat || statPartner;
  const hasPerformers = performers.length > 0;
  const hasTestimonials = testimonials.length > 0;
  const hasGallery    = gallery.length > 0;
  const hasPartner    = !!(partnerTitle || partnerBody);
  const hasConversion = !!(eventWhen || eventWhere || eventNote || eventDuration || conversionTitle || eventEmail);

  const BACK = { de: "← Alle Projekte", en: "← All Projects", ru: "← Все проекты" };
  const ENSEMBLE = { de: "Das Ensemble", en: "The Ensemble", ru: "Ансамбль" };
  const REVIEWS  = { de: "Was Gäste sagen", en: "What Guests Say", ru: "Что говорят гости" };
  const MORE     = { de: "Mehr erfahren", en: "Learn more", ru: "Узнать больше" };
  const READY    = { de: "Bereit?", en: "Ready?", ru: "Готовы?" };
  const WHEN     = { de: "Wann", en: "When", ru: "Когда" };
  const WHERE    = { de: "Wo", en: "Where", ru: "Где" };
  const DUR      = { de: "Dauer", en: "Duration", ru: "Продолжительность" };
  const URGENCY  = { de: "Nur wenige Plätze · Reservierung erforderlich", en: "Few seats · reservation required", ru: "Мест немного · требуется бронирование" };
  const RESERVE  = { de: "Platz reservieren", en: "Reserve a seat", ru: "Забронировать" };
  const ASK      = { de: "Frage stellen", en: "Ask a question", ru: "Задать вопрос" };
  const L = (o: Record<Lang, string>) => o[lang] ?? o.de;

  return (
    <div className="min-h-screen">

      {/* ── 1. Hero ──────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden">
        {heroImg && (
          <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-32">
          <Link
            href={`/${lang}/projects`}
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-foreground/40 hover:text-primary transition-colors mb-10"
          >
            ← {L(BACK).replace("← ", "")}
          </Link>
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-6">{label}</p>
          <h1 className="font-serif text-5xl font-light leading-[1.05] md:text-7xl lg:text-8xl text-balance mb-8">
            {title}
          </h1>
          {subtitle && (
            <p className="font-serif max-w-2xl text-2xl font-light italic text-foreground/80 md:text-3xl mb-10">
              {subtitle}
            </p>
          )}
          {(eventEmail || paragraphs.length > 0) && (
            <div className="flex flex-wrap gap-4">
              {eventEmail && (
                <a href={`mailto:${eventEmail}`}
                  className="inline-flex items-center gap-3 bg-primary text-background px-8 py-4 text-[11px] tracking-[0.3em] uppercase transition-opacity hover:opacity-90">
                  {heroCta}
                </a>
              )}
              {paragraphs.length > 0 && (
                <a href="#concept"
                  className="inline-flex items-center gap-3 border border-primary/40 text-primary px-8 py-4 text-[11px] tracking-[0.3em] uppercase transition-colors hover:border-primary hover:bg-primary/5">
                  {L(MORE)}
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      <SectionDivider />

      {/* ── 2. Concept — 2-col magazine layout ───────────────────────── */}
      {paragraphs.length > 0 && (
        <section id="concept" className="py-24 md:py-32">
          <div className="mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:gap-20">
            <div>
              <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">{label}</p>
              <h2 className="font-serif text-4xl font-light leading-tight md:text-5xl">{title}</h2>
            </div>
            <div className="space-y-6 text-lg leading-[1.8] text-foreground/85">
              {paragraphs.map((para, i) => (
                <p key={i} dangerouslySetInnerHTML={{
                  __html: para
                    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\*(.+?)\*/g, "<em>$1</em>"),
                }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 3. Video ──────────────────────────────────────────────────── */}
      {youtubeId && (
        <>
          <SectionDivider />
          <section id="video" className="py-24 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
              <div className="relative overflow-hidden border border-border bg-secondary/20 shadow-2xl">
                <div className="aspect-video w-full">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── 4. Flow / How it works ────────────────────────────────────── */}
      {hasFlow && (
        <>
          <SectionDivider />
          <section id="flow" className="py-24 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
              {/* Steps grid — gap-px on bg-border creates thin dividers */}
              <div className={`grid gap-px bg-border sm:grid-cols-${Math.min(flowSteps.length, 3)}`}>
                {flowSteps.map((step, i) => (
                  <div key={step.id} className="bg-background p-8 md:p-10">
                    <span className="font-serif text-5xl font-light text-primary/60">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="font-serif mt-6 text-2xl font-light">
                      {ml(step.titleDE, step.titleEN, step.titleRU, lang)}
                    </h3>
                    <p className="mt-3 text-base leading-[1.75] text-foreground/75">
                      {ml(step.textDE, step.textEN, step.textRU, lang)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              {hasStats && (
                <div className="mt-16 flex flex-wrap items-center justify-center gap-12 border-t border-border pt-10">
                  {statDuration && (
                    <div className="text-center">
                      <p className="text-[11px] tracking-[0.3em] uppercase text-primary/70 mb-2">{L(DUR)}</p>
                      <p className="font-serif text-2xl font-light">{statDuration}</p>
                    </div>
                  )}
                  {statFormat && (
                    <div className="text-center">
                      <p className="text-[11px] tracking-[0.3em] uppercase text-primary/70 mb-2">Format</p>
                      <p className="font-serif text-2xl font-light">{statFormat}</p>
                    </div>
                  )}
                  {statPartner && (
                    <div className="text-center">
                      <p className="text-[11px] tracking-[0.3em] uppercase text-primary/70 mb-2">Partner</p>
                      <p className="font-serif text-2xl font-light">{statPartner}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ── 5. Performers ─────────────────────────────────────────────── */}
      {hasPerformers && (
        <>
          <SectionDivider />
          <section id="performers" className="py-24 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
              <div className="mb-14">
                <h2 className="font-serif text-4xl font-light md:text-5xl">{L(ENSEMBLE)}</h2>
              </div>
              <div className={`grid gap-12 sm:grid-cols-${Math.min(performers.length, 3)}`}>
                {performers.map(p => {
                  const role = ml(p.roleDE, p.roleEN, p.roleRU, lang);
                  return (
                    <div key={p.id} className="text-center">
                      <div className="mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full border border-primary/20 bg-secondary/30 flex items-center justify-center">
                        {p.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.photoUrl} alt={p.name} className="h-full w-full object-cover object-top" />
                        ) : (
                          <span className="font-serif text-2xl font-light text-primary/60">
                            {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-2xl font-light">{p.name}</h3>
                      {role && <p className="mt-2 text-sm tracking-[0.15em] uppercase text-primary/80">{role}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── 6. Testimonials (client component — needs expand/collapse) ── */}
      {hasTestimonials && (
        <>
          <SectionDivider variant="line" />
          <section id="testimonials" className="py-24 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
              <div className="mb-14">
                <h2 className="font-serif text-4xl font-light md:text-5xl">{L(REVIEWS)}</h2>
              </div>
              <TestimonialsSection testimonials={testimonials} lang={lang} />
            </div>
          </section>
        </>
      )}

      {/* ── 7. Gallery ────────────────────────────────────────────────── */}
      {hasGallery && (
        <>
          <SectionDivider variant="line" />
          <section id="gallery" className="py-24 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {gallery.map((src, i) => (
                  <div key={i} className="overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-105" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── 8. Partner / Trust block ──────────────────────────────────── */}
      {hasPartner && (
        <>
          <SectionDivider />
          <section id="partner" className="py-24 md:py-32 bg-secondary/10">
            <div className="mx-auto max-w-5xl px-6">
              <div className="grid gap-16 md:grid-cols-[1fr_2fr] md:gap-20">
                <div>
                  <h2 className="font-serif text-4xl font-light leading-tight md:text-5xl">{partnerTitle}</h2>
                </div>
                <div className="space-y-6 text-lg leading-[1.8] text-foreground/85">
                  {partnerBody.split(/\n\n+/).filter(Boolean).map((para, i) => (
                    <p key={i} dangerouslySetInnerHTML={{
                      __html: para
                        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\*(.+?)\*/g, "<em>$1</em>"),
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── 9. Conversion / Action ────────────────────────────────────── */}
      {hasConversion && (
        <>
          <SectionDivider />
          <section id="conversion" className="py-24 md:py-32">
            <div className="mx-auto max-w-5xl px-6 text-center">
              <div className="mb-14">
                <p className="text-sm tracking-[0.3em] uppercase text-primary mb-6">
                  {conversionLabel || L(READY)}
                </p>
                {conversionTitle && (
                  <h2 className="font-serif text-5xl font-light md:text-7xl text-balance mb-8">
                    {conversionTitle}
                  </h2>
                )}
                {conversionSubtitle && (
                  <p className="text-lg leading-[1.75] text-foreground/70 max-w-2xl mx-auto">
                    {conversionSubtitle}
                  </p>
                )}
              </div>

              {/* Facts grid */}
              {(eventWhen || eventWhere || eventDuration) && (
                <div className="border border-border text-left mb-10">
                  <div className="grid gap-px bg-border sm:grid-cols-3">
                    {[
                      { label: L(WHEN), value: eventWhen },
                      { label: L(WHERE), value: eventWhere },
                      { label: L(DUR), value: eventDuration },
                    ].filter(item => item.value).map(item => (
                      <div key={item.label} className="bg-background px-8 py-10">
                        <p className="text-[11px] tracking-[0.3em] uppercase text-primary/70 mb-4">{item.label}</p>
                        <p className="font-serif text-2xl font-light leading-snug md:text-3xl">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs tracking-[0.25em] uppercase text-primary/60">
                ◆ {conversionUrgency || L(URGENCY)} ◆
              </p>

              {eventEmail && (
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <a href={`mailto:${eventEmail}`}
                    className="w-52 flex items-center justify-center bg-primary text-background py-4 text-[11px] tracking-[0.3em] uppercase transition-opacity hover:opacity-90">
                    {L(RESERVE)}
                  </a>
                  <a href={`mailto:${eventEmail}?subject=Frage`}
                    className="w-52 flex items-center justify-center border border-primary/60 text-primary py-4 text-[11px] tracking-[0.3em] uppercase transition-colors hover:border-primary hover:bg-primary/5">
                    {L(ASK)}
                  </a>
                </div>
              )}

              {eventNote && (
                <p className="mt-8 text-sm text-foreground/50 max-w-lg mx-auto leading-relaxed">{eventNote}</p>
              )}
              {eventTickets && (
                <p className="mt-4 text-xs uppercase tracking-widest text-primary/70">{eventTickets}</p>
              )}
            </div>
          </section>
        </>
      )}

      {/* ── Newsletter ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-6 py-16">
        <NewsletterSignup lang={lang} />
      </div>

      {/* ── Back ──────────────────────────────────────────────────────── */}
      <div className="py-8 border-t border-border/40">
        <div className="mx-auto max-w-5xl px-6">
          <Link href={`/${lang}/projects`} className="text-xs tracking-[0.3em] uppercase text-foreground/40 hover:text-primary transition-colors border-b border-border pb-1">
            {L(BACK)}
          </Link>
        </div>
      </div>

    </div>
  );
}
