"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SupportedLang } from "@/lib/i18n";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

const LABELS = {
  label: { de: "Galerie",       en: "Gallery",    ru: "Галерея"    },
  title: { de: "Fotogalerie",   en: "Photo Gallery", ru: "Фотогалерея" },
  empty: { de: "Keine Fotos vorhanden.", en: "No photos yet.", ru: "Фотографий пока нет." },
};

type MediaItem = { id: string; url: string; alt: Record<string, string>; filename: string };

export default function GalleryPage() {
  const params = useParams();
  const lang = (params?.lang as SupportedLang) ?? "de";
  const tl = (obj: Record<string, string>) => obj[lang] ?? obj.de ?? "";

  const [images, setImages] = useState<MediaItem[]>([]);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("media")
      .select("id,url,alt,filename")
      .eq("artist_id", ARTIST_ID)
      .order("created_at", { ascending: false })
      .then(({ data }) => setImages(data ?? []));
  }, []);

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(() => setActive(i => (i !== null ? (i > 0 ? i - 1 : images.length - 1) : 0)), [images.length]);
  const next = useCallback(() => setActive(i => (i !== null ? (i < images.length - 1 ? i + 1 : 0) : 0)), [images.length]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, prev, next]);

  return (
    <main className="max-w-6xl mx-auto px-6 md:px-16 pt-32 pb-24">
      <div className="mb-16">
        <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-4">
          {LABELS.label[lang]}
        </p>
        <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-light">
          {LABELS.title[lang]}
        </h1>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-muted-fg py-8 border-t border-border">
          {LABELS.empty[lang]}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className="group relative aspect-square overflow-hidden bg-secondary/30 focus:outline-none"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={tl(img.alt) || img.filename}
                className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {active !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-background/95 backdrop-blur-sm"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute top-5 right-6 flex h-10 w-10 items-center justify-center text-foreground/60 hover:text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute left-4 flex h-12 w-12 items-center justify-center text-foreground/60 hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            className="absolute right-4 flex h-12 w-12 items-center justify-center text-foreground/60 hover:text-primary transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div
            className="max-h-[85vh] max-w-[85vw] flex flex-col items-center gap-4"
            onClick={e => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[active].url}
              alt={tl(images[active].alt) || images[active].filename}
              className="max-h-[75vh] max-w-full object-contain"
            />
            {tl(images[active].alt) && (
              <p className="text-xs tracking-[0.15em] uppercase text-muted-fg">
                {tl(images[active].alt)}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
