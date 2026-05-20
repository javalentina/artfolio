"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SupportedLang } from "@/lib/i18n";
import { useNav } from "./NavContext";

const LANGS: SupportedLang[] = ["de", "en", "ru"];

export default function HeroTopBar({ lang }: { lang: SupportedLang }) {
  const { setOpen } = useNav();
  const pathname = usePathname();

  function switchLang(newLang: string) {
    document.cookie = `preferred_lang=${newLang};path=/;max-age=31536000;samesite=lax`;
    window.location.href = pathname.replace(/^\/(de|en|ru)/, `/${newLang}`);
  }

  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 animate-fade-in">
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 flex-col justify-center gap-[5px] p-1"
        aria-label="Open menu"
      >
        <span className="block h-px w-[22px] bg-foreground" />
        <span className="block h-px w-[14px] bg-foreground" />
        <span className="block h-px w-[22px] bg-foreground" />
      </button>

      <div className="flex gap-4">
        {LANGS.map(l => (
          <span
            key={l}
            onClick={() => switchLang(l)}
            className={cn(
              "cursor-pointer text-sm tracking-[0.15em] uppercase transition-colors hover:text-primary",
              l === lang ? "text-foreground/80" : "text-foreground/30"
            )}
          >
            {l.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
