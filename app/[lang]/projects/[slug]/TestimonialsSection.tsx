"use client";

import { useState } from "react";
import type { SupportedLang } from "@/lib/i18n";

type Testimonial = {
  id: string;
  name: string;
  professionDE?: string;
  professionEN?: string;
  professionRU?: string;
  textDE?: string;
  textEN?: string;
  textRU?: string;
};

type Lang = SupportedLang;

const LIMIT = 180;

const MEHR   = { de: "Mehr lesen", en: "Read more", ru: "Читать далее" };
const WENIG  = { de: "Weniger",    en: "Less",      ru: "Скрыть"       };

function ml(de?: string, en?: string, ru?: string, lang?: Lang) {
  if (lang === "ru") return ru || de || "";
  if (lang === "en") return en || de || "";
  return de || "";
}

function Card({ t, lang }: { t: Testimonial; lang: Lang }) {
  const [expanded, setExpanded] = useState(false);
  const text = ml(t.textDE, t.textEN, t.textRU, lang);
  const profession = ml(t.professionDE, t.professionEN, t.professionRU, lang);
  const isLong = text.length > LIMIT;
  const displayed = isLong && !expanded ? text.slice(0, LIMIT).trimEnd() + "…" : text;

  return (
    <figure className="border-l-2 border-primary/40 pl-8 md:pl-12">
      <blockquote className="font-serif text-xl font-light italic leading-relaxed text-foreground/90 md:text-2xl">
        &bdquo;{displayed}&ldquo;
      </blockquote>
      {isLong && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-3 text-xs tracking-[0.2em] uppercase text-primary/60 hover:text-primary transition-colors"
        >
          {expanded ? WENIG[lang] ?? WENIG.de : MEHR[lang] ?? MEHR.de}
        </button>
      )}
      <figcaption className="mt-6">
        <span className="font-serif text-lg">{t.name}</span>
        {profession && (
          <span className="block text-xs uppercase tracking-widest text-foreground/45 mt-1">{profession}</span>
        )}
      </figcaption>
    </figure>
  );
}

export default function TestimonialsSection({
  testimonials,
  lang,
}: {
  testimonials: Testimonial[];
  lang: Lang;
}) {
  if (!testimonials.length) return null;
  return (
    <div className="space-y-12">
      {testimonials.map(t => (
        <Card key={t.id} t={t} lang={lang} />
      ))}
    </div>
  );
}
