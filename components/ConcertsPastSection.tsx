"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera } from "lucide-react";

type Concert = {
  id: string;
  city: Record<string, string> | string;
  venue: Record<string, string> | string;
  date: string;
  image?: string | null;
  gallery?: string[] | null;
};

function tl(o: Record<string, string> | string | null | undefined, lang: string): string {
  if (!o) return "";
  if (typeof o === "string") return o;
  return o[lang] ?? o.de ?? o.en ?? "";
}

function formatDate(dateStr: string, lang: string) {
  const d = new Date(dateStr + "T00:00:00");
  const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-GB" : "de-DE";
  return d.toLocaleDateString(locale, { day: "numeric", month: "long" });
}

const LABELS = {
  past:  { de: "Vergangene Konzerte", en: "Past Concerts",  ru: "Прошедшие концерты" },
  show:  { de: "Zeigen",             en: "Show",            ru: "Показать"           },
  hide:  { de: "Verbergen",          en: "Hide",            ru: "Скрыть"             },
};
const t = (k: keyof typeof LABELS, lang: string) => LABELS[k][lang as "de" | "en" | "ru"] ?? LABELS[k].de;

export default function ConcertsPastSection({ past, lang }: { past: Concert[]; lang: string }) {
  const [open, setOpen] = useState(false);
  if (!past.length) return null;

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-2xl font-light">{t("past", lang)}</h3>
        <button
          onClick={() => setOpen(v => !v)}
          className="text-[11px] tracking-[0.25em] uppercase text-primary hover:text-primary/70 transition-colors flex items-center gap-3"
        >
          <span className="h-px w-6 bg-primary/40" />
          {open ? t("hide", lang) : `${t("show", lang)} (${past.length})`}
        </button>
      </div>

      <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-2">
            {past.map((c, i) => {
              const photos = (c.gallery ?? []).filter(Boolean);
              const coverPhoto = photos[0] ?? c.image ?? null;
              const hasPhotos = photos.length > 0;

              return (
                <Link
                  key={c.id}
                  href={`/${lang}/concerts/${c.id}`}
                  className="group block relative aspect-[4/5] overflow-hidden bg-secondary/30"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  {coverPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverPhoto}
                      alt={`${tl(c.city, lang)} — ${tl(c.venue, lang)}`}
                      className="absolute inset-0 h-full w-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 to-secondary/10 group-hover:from-primary/10 transition-colors duration-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                  {hasPhotos && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-background/70 backdrop-blur-sm px-2.5 py-1 text-[10px] tracking-[0.1em] uppercase text-primary">
                      <Camera className="h-3 w-3" />
                      {photos.length}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-1">{formatDate(c.date, lang)}</p>
                    <p className="font-serif text-2xl font-light leading-tight">{tl(c.city, lang)}</p>
                    <p className="text-sm text-foreground/70 mt-0.5">{tl(c.venue, lang)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
