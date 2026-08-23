import { notFound } from "next/navigation";
import { isValidLang } from "@/lib/i18n";
import type { SupportedLang } from "@/lib/i18n";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { NavProvider } from "@/components/NavContext";
import { createClient } from "@/lib/supabase/server";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://natalia-uchitel.vercel.app";
const LANGS: SupportedLang[] = ["de", "en", "ru"];
const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

const DEFAULT_TITLES: Record<string, string> = {
  de: "Natalia Uchitel · Pianistin in Berlin | Konzerte & Projekte",
  en: "Natalia Uchitel · Pianist in Berlin | Concerts & Projects",
  ru: "Наталия Учитель · Пианистка в Берлине | Концерты и проекты",
};
const DEFAULT_DESCS: Record<string, string> = {
  de: "Natalia Uchitel — Pianistin aus St. Petersburg, tätig in Berlin. Klassische Konzerte, Bildungsprojekte und Repertoire für Veranstalter.",
  en: "Natalia Uchitel — Pianist from St. Petersburg, based in Berlin. Classical concerts, educational projects and repertoire for promoters.",
  ru: "Наталия Учитель — пианистка из Санкт-Петербурга, живёт в Берлине. Концерты, образовательные проекты и репертуар для организаторов.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  const supabase = await createClient();
  const { data: artist } = await supabase.from("artists").select("settings").eq("id", ARTIST_ID).single();
  const seo = ((artist?.settings as Record<string, unknown>)?.seo as Record<string, Record<string, string>> | undefined) ?? {};
  const titles = seo.title ?? {};
  const descs  = seo.description ?? {};

  const title       = titles[lang] || DEFAULT_TITLES[lang] || DEFAULT_TITLES.de;
  const description = descs[lang]  || DEFAULT_DESCS[lang]  || DEFAULT_DESCS.de;

  const alternates: Record<string, string> = {};
  LANGS.forEach(l => { alternates[l] = `${BASE}/${l}`; });

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${lang}`,
      languages: { ...alternates, "x-default": `${BASE}/de` },
    },
    openGraph: {
      siteName: "Natalia Uchitel",
      title,
      description,
      locale: lang === "ru" ? "ru_RU" : lang === "en" ? "en_GB" : "de_DE",
      type: "website",
      url: `${BASE}/${lang}`,
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  return (
    <NavProvider>
      <Nav lang={lang as SupportedLang} />
      <div className="flex min-h-screen flex-col">
        {children}
      </div>
      <Footer lang={lang as SupportedLang} />
    </NavProvider>
  );
}

export async function generateStaticParams() {
  return [{ lang: "de" }, { lang: "en" }, { lang: "ru" }];
}
