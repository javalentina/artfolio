"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Image = { id: string; url: string; alt: Record<string, string>; filename: string };

export default function GallerySectionHome({ images, lang }: { images: Image[]; lang: string }) {
  const [active, setActive] = useState<number | null>(null);
  const tl = (obj: Record<string, string> | null | undefined) => obj?.[lang] ?? obj?.de ?? "";

  const close = useCallback(() => setActive(null), []);
  const prev  = useCallback(() => setActive(i => (i !== null ? (i > 0 ? i - 1 : images.length - 1) : 0)), [images.length]);
  const next  = useCallback(() => setActive(i => (i !== null ? (i < images.length - 1 ? i + 1 : 0) : 0)), [images.length]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")     close();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [active, close, prev, next]);

  if (!images.length) return null;

  return (
    <>
      <div className="columns-2 md:columns-3 gap-2 space-y-2">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActive(i)}
            className="group relative w-full overflow-hidden focus:outline-none break-inside-avoid block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={tl(img.alt) || img.filename}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90"
          onClick={close}
        >
          {/* close */}
          <button onClick={close} aria-label="Schließen"
            className="absolute top-5 right-6 h-10 w-10 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10">
            <X className="h-6 w-6" />
          </button>

          {/* prev */}
          <button onClick={e => { e.stopPropagation(); prev(); }} aria-label="Zurück"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10">
            <ChevronLeft className="h-8 w-8" />
          </button>

          {/* next */}
          <button onClick={e => { e.stopPropagation(); next(); }} aria-label="Weiter"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10">
            <ChevronRight className="h-8 w-8" />
          </button>

          {/* image */}
          <div className="max-h-[90vh] max-w-[90vw] flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[active].url}
              alt={tl(images[active].alt) || images[active].filename}
              className="max-h-[82vh] max-w-full object-contain"
            />
            {/* counter */}
            <p className="text-white/40 text-xs tracking-[0.2em]">{active + 1} / {images.length}</p>
          </div>
        </div>
      )}
    </>
  );
}
