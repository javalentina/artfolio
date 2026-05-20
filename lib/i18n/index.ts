export const SUPPORTED_LANGS = ["de", "en", "ru"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: SupportedLang = "de";

export function isValidLang(lang: string): lang is SupportedLang {
  return SUPPORTED_LANGS.includes(lang as SupportedLang);
}

export function tl(obj: Record<string, string> | null | undefined, lang: string, fallback = ""): string {
  if (!obj) return fallback;
  return obj[lang] || obj[DEFAULT_LANG] || obj["en"] || fallback;
}
