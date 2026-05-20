import { notFound } from "next/navigation";
import { isValidLang } from "@/lib/i18n";
import type { SupportedLang } from "@/lib/i18n";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { NavProvider } from "@/components/NavContext";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://natalia-uchitel.vercel.app";
const LANGS: SupportedLang[] = ["de", "en", "ru"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  const titles: Record<string, string> = {
    de: "Natalia Uchitel · Pianistin in Berlin | Konzerte & Projekte",
    en: "Natalia Uchitel · Pianist in Berlin | Concerts & Projects",
    ru: "Наталья Учитель · Пианистка в Берлине | Концерты и проекты",
  };

  const descriptions: Record<string, string> = {
    de: "Natalia Uchitel — Pianistin aus St. Petersburg, tätig in Berlin. Klassische Konzerte, Bildungsprojekte und Repertoire für Veranstalter.",
    en: "Natalia Uchitel — Pianist from St. Petersburg, based in Berlin. Classical concerts, educational projects and repertoire for promoters.",
    ru: "Наталья Учитель — пианистка из Санкт-Петербурга, живёт в Берлине. Концерты, образовательные проекты и репертуар для организаторов.",
  };

  const alternates: Record<string, string> = {};
  LANGS.forEach(l => { alternates[l] = `${BASE}/${l}`; });

  return {
    title: titles[lang] ?? titles.de,
    description: descriptions[lang] ?? descriptions.de,
    alternates: {
      canonical: `${BASE}/${lang}`,
      languages: { ...alternates, "x-default": `${BASE}/de` },
    },
    openGraph: {
      siteName: "Natalia Uchitel",
      title: titles[lang] ?? titles.de,
      description: descriptions[lang] ?? descriptions.de,
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
