"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SupportedLang } from "@/lib/i18n";
import { useNav } from "./NavContext";

const NAV_LINKS = [
  { key: "bio",        label: { de: "Biografie",  en: "Biography",  ru: "Биография" } },
  { key: "videos",     label: { de: "Aufnahmen",  en: "Recordings", ru: "Записи"    } },
  { key: "gallery",    label: { de: "Momente",    en: "Gallery",    ru: "Галерея"   } },
  { key: "concerts",   label: { de: "Konzerte",   en: "Concerts",   ru: "Концерты"  } },
  { key: "projects",   label: { de: "Kreative",   en: "Projects",   ru: "Проекты"   } },
  { key: "repertoire", label: { de: "Repertoire", en: "Repertoire", ru: "Репертуар" } },
  { key: "books",      label: { de: "Bücher",     en: "Books",      ru: "Книги"     } },
  { key: "contact",    label: { de: "Kontakt",    en: "Contact",    ru: "Контакт"   } },
] as const;

const LANGS: SupportedLang[] = ["de", "en", "ru"];

const SOCIALS = [
  { label: "Spotify",   href: "https://open.spotify.com/track/1DJakP0QPPCP6Qp57HBz9Z?si=4EjBzQb3TeedP2GSUcNjLA" },
  { label: "Instagram", href: "https://www.instagram.com/natalia_uchitel/" },
  { label: "YouTube",   href: "https://www.youtube.com/@natalia_uchitel" },
  { label: "Telegram",  href: "https://t.me/natalia_uchitel" },
] as const;

const FOLLOW_LABEL: Record<SupportedLang, string> = {
  de: "Follow",
  en: "Follow",
  ru: "Следите",
};

export default function Nav({ lang }: { lang: SupportedLang }) {
  const pathname = usePathname();
  const { open, setOpen } = useNav();
  const isHome = /^\/(de|en|ru)\/?$/.test(pathname);
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setStickyVisible(true);
      return;
    }
    const handler = () => {
      setStickyVisible(window.scrollY > window.innerHeight * 0.7);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function switchLang(newLang: string) {
    document.cookie = `preferred_lang=${newLang};path=/;max-age=31536000;samesite=lax`;
    window.location.href = pathname.replace(/^\/(de|en|ru)/, `/${newLang}`);
  }

  function navHref(key: string) {
    return `/${lang}#${key}`;
  }

  return (
    <>
      {/* ── Slide-out panel ── */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[60] w-full border-r border-primary/20",
          "bg-background/[0.97] backdrop-blur-xl",
          "flex flex-col justify-center overflow-y-auto",
          "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-5 right-6 flex h-10 w-10 cursor-pointer flex-col justify-center gap-[5px] p-1"
          aria-label="Close menu"
        >
          <span className="block h-px w-[22px] bg-foreground translate-y-[6px] rotate-45 transition-all duration-300" />
          <span className="block h-px w-[22px] bg-foreground opacity-0 transition-all duration-300" />
          <span className="block h-px w-[22px] bg-foreground -translate-y-[6px] -rotate-45 transition-all duration-300" />
        </button>

        <nav className="px-10 md:px-20 py-16">
          <ul className="space-y-0">
            {NAV_LINKS.map((link, i) => (
              <li key={link.key}>
                <a
                  href={navHref(link.key)}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group flex items-baseline gap-4 py-5 border-b border-primary/10",
                    "transition-all duration-200",
                    open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5"
                  )}
                  style={{ transitionDelay: open ? `${i * 70}ms` : "0ms" }}
                >
                  <span className="text-[11px] tracking-[0.3em] text-foreground/30 group-hover:text-primary/60 transition-colors w-5 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-foreground group-hover:text-primary transition-colors leading-none">
                    {link.label[lang]}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {/* Social + lang */}
          <div
            className={cn(
              "mt-12 border-t border-primary/10 pt-8 flex flex-wrap items-start justify-between gap-6",
              open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            )}
            style={{ transitionDelay: open ? "500ms" : "0ms", transition: "opacity 0.5s, transform 0.5s" }}
          >
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-foreground/40 mb-4">
                {FOLLOW_LABEL[lang]}
              </p>
              <div className="flex flex-wrap gap-4">
                {SOCIALS.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs tracking-[0.2em] uppercase text-foreground/60 hover:text-primary transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              {LANGS.map(l => (
                <button
                  key={l}
                  onClick={() => { setOpen(false); switchLang(l); }}
                  className={cn(
                    "cursor-pointer text-[11px] uppercase tracking-[0.2em] transition-colors",
                    l === lang ? "text-primary" : "text-foreground/30 hover:text-primary"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* ── Sticky top bar (always on inner pages, after 70vh scroll on homepage) ── */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between px-6 py-3",
          "border-b border-border bg-background/95 backdrop-blur-md",
          "transition-transform duration-300",
          stickyVisible ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <button
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 flex-col justify-center gap-[5px] p-1"
          aria-label="Open menu"
        >
          <span className="block h-px w-[22px] bg-foreground transition-all duration-300" />
          <span className="block h-px w-[14px] bg-foreground transition-all duration-300" />
          <span className="block h-px w-[22px] bg-foreground transition-all duration-300" />
        </button>

        <a
          href={`/${lang}`}
          className="absolute left-1/2 -translate-x-1/2 font-serif text-xl font-light tracking-wide text-foreground/80 hover:text-primary transition-colors whitespace-nowrap"
        >
          Natalia Uchitel
        </a>

        <div className="flex gap-3">
          {LANGS.map(l => (
            <button
              key={l}
              onClick={() => switchLang(l)}
              className={cn(
                "cursor-pointer text-[0.6rem] uppercase tracking-[0.15em] transition-colors",
                l === lang ? "text-primary" : "text-foreground/30 hover:text-primary"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </header>
    </>
  );
}
