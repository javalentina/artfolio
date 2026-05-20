import { createClient } from "@/lib/supabase/server";
import type { SupportedLang } from "@/lib/i18n";
import type { Metadata } from "next";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

const LABELS = {
  label:  { de: "Videos",       en: "Videos",              ru: "Видео"          },
  title:  { de: "Aufnahmen",    en: "Recordings",          ru: "Записи"         },
  all:    { de: "Alle Videos auf YouTube →", en: "All videos on YouTube →", ru: "Все видео на YouTube →" },
  empty:  { de: "Keine Videos vorhanden.", en: "No videos yet.", ru: "Видео пока нет." },
} as const;

function tl(obj: Record<SupportedLang, string>, lang: SupportedLang) {
  return obj[lang] ?? obj.de;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: LABELS.title[lang as SupportedLang] ?? LABELS.title.de };
}

type Video = { youtubeId: string; title: string; duration?: string };

export default async function VideosPage({ params }: { params: Promise<{ lang: SupportedLang }> }) {
  const { lang } = await params;
  const supabase = await createClient();

  const { data: artist } = await supabase
    .from("artists")
    .select("settings")
    .eq("id", ARTIST_ID)
    .single();

  const videos: Video[] = (artist?.settings as Record<string, unknown>)?.videos as Video[] ?? [];

  return (
    <main className="max-w-6xl mx-auto px-6 md:px-16 pt-32 pb-24">
      <div className="mb-16">
        <p className="text-[11px] tracking-[0.3em] uppercase text-primary mb-4">
          {tl(LABELS.label, lang)}
        </p>
        <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-light">
          {tl(LABELS.title, lang)}
        </h1>
      </div>

      {videos.length === 0 ? (
        <p className="text-sm text-muted-fg py-8 border-t border-border">
          {tl(LABELS.empty, lang)}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {videos.map((video, i) => (
            <a
              key={video.youtubeId ?? i}
              href={`https://youtu.be/${video.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden bg-secondary/30 transition-all duration-300 hover:shadow-[0_8px_30px_hsl(38_35%_58%/0.1)] active:scale-[0.98]"
            >
              <div className="relative aspect-video overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-foreground/30 backdrop-blur-sm">
                    <svg className="ml-1 h-5 w-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="font-serif text-lg font-light leading-snug">{video.title}</p>
                {video.duration && (
                  <p className="mt-2 text-xs text-muted-fg tabular-nums">{video.duration}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <a
          href="https://www.youtube.com/@natalia_uchitel/videos"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border-b border-primary/40 pb-1 text-xs tracking-[0.2em] uppercase text-primary transition-colors hover:border-primary"
        >
          {tl(LABELS.all, lang)}
        </a>
      </div>
    </main>
  );
}
