import Link from "next/link";
import type { SupportedLang } from "@/lib/i18n";

const SOCIALS = [
  { label: "Spotify",   href: "https://open.spotify.com/track/1DJakP0QPPCP6Qp57HBz9Z?si=4EjBzQb3TeedP2GSUcNjLA" },
  { label: "Instagram", href: "https://www.instagram.com/natalia_uchitel/" },
  { label: "YouTube",   href: "https://www.youtube.com/@natalia_uchitel" },
  { label: "Telegram",  href: "https://t.me/natalia_uchitel" },
];

const PRIVACY_LABEL: Record<SupportedLang, string> = {
  de: "Datenschutz",
  en: "Privacy Policy",
  ru: "Конфиденциальность",
};

const RIGHTS_LABEL: Record<SupportedLang, string> = {
  de: "Alle Rechte vorbehalten.",
  en: "All rights reserved.",
  ru: "Все права защищены.",
};

export default function Footer({ lang }: { lang: SupportedLang }) {
  return (
    <footer className="border-t border-border py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-8 text-center">
          <h2 className="font-serif text-3xl font-light tracking-wide">Natalia Uchitel</h2>

          <div className="flex flex-wrap justify-center gap-6">
            {SOCIALS.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-[0.15em] uppercase text-muted-fg transition-colors hover:text-primary"
              >
                {s.label}
              </a>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-6 border-t border-border/40 pt-6 w-full">
            <Link
              href={`/${lang}/p/impressum`}
              className="text-xs tracking-[0.15em] uppercase text-muted-fg/60 transition-colors hover:text-primary"
            >
              Impressum
            </Link>
            <Link
              href={`/${lang}/p/datenschutz`}
              className="text-xs tracking-[0.15em] uppercase text-muted-fg/60 transition-colors hover:text-primary"
            >
              {PRIVACY_LABEL[lang]}
            </Link>
          </div>

          <p className="text-xs text-muted-fg/50">
            © {new Date().getFullYear()} Natalia Uchitel. {RIGHTS_LABEL[lang]}
          </p>
        </div>
      </div>
    </footer>
  );
}
