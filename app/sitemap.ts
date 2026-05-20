import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://natalia-uchitel.vercel.app";
const LANGS = ["de", "en", "ru"] as const;

const PAGES = [
  { path: "",           priority: 1.0,  changeFreq: "weekly"  },
  { path: "/concerts",  priority: 0.9,  changeFreq: "weekly"  },
  { path: "/repertoire",priority: 0.8,  changeFreq: "monthly" },
  { path: "/projects",  priority: 0.7,  changeFreq: "monthly" },
  { path: "/contact",   priority: 0.6,  changeFreq: "yearly"  },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of PAGES) {
    for (const lang of LANGS) {
      entries.push({
        url: `${BASE}/${lang}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFreq,
        priority: page.priority,
      });
    }
  }

  return entries;
}
