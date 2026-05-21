"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loadSettings, patchSettings, inputCls, labelCls, cardCls, saveBtnCls } from "../_lib";
import { MediaImageInput } from "../_components/MediaImageInput";

function SaveBtn({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={saving} className={saveBtnCls}>
      <Check className="h-4 w-4" />
      {saved ? "Gespeichert!" : saving ? "Speichert…" : "Speichern"}
    </button>
  );
}

export default function HeroAdmin() {
  const supabase = createClient();
  const [heroUrl, setHeroUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [titleDe, setTitleDe] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleRu, setTitleRu] = useState("");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    loadSettings(supabase).then(({ settings: cfg }) => {
      setHeroUrl((cfg.hero_image_url as string) ?? "");
      setVideoId((cfg.intro_video_id as string) ?? "");
      const t = (cfg.intro_video_title as Record<string, string>) ?? {};
      setTitleDe(t.de ?? ""); setTitleEn(t.en ?? ""); setTitleRu(t.ru ?? "");
    });
  }, []);

  async function save() {
    setSaving(true);
    await patchSettings(supabase, {
      hero_image_url: heroUrl || null,
      intro_video_id: videoId || null,
      intro_video_title: { de: titleDe || null, en: titleEn || null, ru: titleRu || null },
    }, "Hero");
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-light tracking-wide">Hero</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Hintergrundbild & Intro-Video</p>
      </div>

      <div className={cardCls}>
        <h2 className="text-sm font-medium text-zinc-300 dark:text-zinc-300">Hero-Bild</h2>
        <div>
          <label className={labelCls}>Bild</label>
          <MediaImageInput value={heroUrl} onChange={setHeroUrl} />
        </div>
        {heroUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroUrl} alt="Hero preview" className="mt-2 rounded-lg w-full max-h-48 object-cover" />
        )}
      </div>

      <div className={cardCls}>
        <h2 className="text-sm font-medium text-zinc-300 dark:text-zinc-300">Intro-Video</h2>
        <div>
          <label className={labelCls}>YouTube ID</label>
          <input className={inputCls} value={videoId} onChange={e => setVideoId(e.target.value)} placeholder="z.B. zH1yMFPXq2M" />
          {videoId && (
            <a href={`https://youtu.be/${videoId}`} target="_blank" rel="noopener noreferrer"
              className="mt-1 block text-xs text-primary hover:underline">→ Video ansehen</a>
          )}
        </div>
        {videoId && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt="" className="rounded w-40 mt-1" />
        )}
        <div><label className={labelCls}>Titel DE</label><input className={inputCls} value={titleDe} onChange={e => setTitleDe(e.target.value)} /></div>
        <div><label className={labelCls}>Titel EN</label><input className={inputCls} value={titleEn} onChange={e => setTitleEn(e.target.value)} /></div>
        <div><label className={labelCls}>Titel RU</label><input className={inputCls} value={titleRu} onChange={e => setTitleRu(e.target.value)} /></div>
      </div>

      <SaveBtn saving={saving} saved={saved} onClick={save} />
    </div>
  );
}
