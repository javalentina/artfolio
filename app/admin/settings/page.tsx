"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loadSettings, patchSettings, inputCls, labelCls, cardCls, saveBtnCls, type S } from "../_lib";

type PodcastData = { title: S; description: S; youtubeUrl: string };

function SaveBtn({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={saving} className={saveBtnCls}>
      <Check className="h-4 w-4" />
      {saved ? "Gespeichert!" : saving ? "Speichert…" : "Speichern"}
    </button>
  );
}

// ── Podcast ───────────────────────────────────────────────────────────────────

function PodcastSection({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [titleDe, setTitleDe] = useState(""); const [titleEn, setTitleEn] = useState(""); const [titleRu, setTitleRu] = useState("");
  const [descDe,  setDescDe]  = useState(""); const [descEn,  setDescEn]  = useState(""); const [descRu,  setDescRu]  = useState("");
  const [url, setUrl]         = useState("");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    loadSettings(supabase).then(({ settings: cfg }) => {
      const p = (cfg.podcast as PodcastData) ?? {};
      const t = (p.title as S) ?? {}; const d = (p.description as S) ?? {};
      setTitleDe((t.de as string) ?? ""); setTitleEn((t.en as string) ?? ""); setTitleRu((t.ru as string) ?? "");
      setDescDe((d.de as string) ?? "");  setDescEn((d.en as string) ?? "");  setDescRu((d.ru as string) ?? "");
      setUrl(p.youtubeUrl ?? "");
    });
  }, []);

  async function save() {
    setSaving(true);
    await patchSettings(supabase, {
      podcast: { title: { de: titleDe, en: titleEn, ru: titleRu }, description: { de: descDe, en: descEn, ru: descRu }, youtubeUrl: url },
    }, "Podcast");
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-4">
      <div className={cardCls}>
        <h2 className="text-sm font-medium text-zinc-300 dark:text-zinc-300">Podcast</h2>
        {([["Titel DE", titleDe, setTitleDe], ["Titel EN", titleEn, setTitleEn], ["Titel RU", titleRu, setTitleRu]] as const).map(([l, v, set]) => (
          <div key={l}><label className={labelCls}>{l}</label><input className={inputCls} value={v} onChange={e => set(e.target.value)} /></div>
        ))}
        {([["Beschreibung DE", descDe, setDescDe], ["Beschreibung EN", descEn, setDescEn], ["Beschreibung RU", descRu, setDescRu]] as const).map(([l, v, set]) => (
          <div key={l}><label className={labelCls}>{l}</label><textarea className={inputCls + " resize-none"} rows={2} value={v} onChange={e => set(e.target.value)} /></div>
        ))}
        <div><label className={labelCls}>YouTube / Link URL</label><input type="url" className={inputCls} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" /></div>
      </div>
      <SaveBtn saving={saving} saved={saved} onClick={save} />
    </div>
  );
}

// ── Contact / Social ──────────────────────────────────────────────────────────

function ContactSection({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [addrDe, setAddrDe] = useState(""); const [addrEn, setAddrEn] = useState(""); const [addrRu, setAddrRu] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube]     = useState("");
  const [spotify, setSpotify]     = useState("");
  const [telegram, setTelegram]   = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    loadSettings(supabase).then(({ settings: cfg }) => {
      const addr = (cfg.address as S) ?? {};
      setAddrDe((addr.de as string) ?? ""); setAddrEn((addr.en as string) ?? ""); setAddrRu((addr.ru as string) ?? "");
      const soc = (cfg.social as S) ?? {};
      setInstagram((soc.instagram as string) ?? "");
      setYoutube((soc.youtube as string) ?? "");
      setSpotify((soc.spotify as string) ?? "");
      setTelegram((soc.telegram as string) ?? "");
    });
  }, []);

  async function save() {
    setSaving(true);
    await patchSettings(supabase, {
      address: { de: addrDe || null, en: addrEn || null, ru: addrRu || null },
      social: { instagram: instagram || null, youtube: youtube || null, spotify: spotify || null, telegram: telegram || null },
    }, "Kontakt & Social");
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-4">
      <div className={cardCls}>
        <h2 className="text-sm font-medium text-zinc-300 dark:text-zinc-300">Adresse</h2>
        {([["DE", addrDe, setAddrDe], ["EN", addrEn, setAddrEn], ["RU", addrRu, setAddrRu]] as const).map(([l, v, set]) => (
          <div key={l}><label className={labelCls}>{l}</label><input className={inputCls} value={v} onChange={e => set(e.target.value)} placeholder="Berlin, Deutschland" /></div>
        ))}
      </div>
      <div className={cardCls}>
        <h2 className="text-sm font-medium text-zinc-300 dark:text-zinc-300">Social Media</h2>
        <div><label className={labelCls}>Instagram URL</label><input type="url" className={inputCls} value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/…" /></div>
        <div><label className={labelCls}>YouTube URL</label><input type="url" className={inputCls} value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="https://youtube.com/…" /></div>
        <div><label className={labelCls}>Spotify URL</label><input type="url" className={inputCls} value={spotify} onChange={e => setSpotify(e.target.value)} placeholder="https://open.spotify.com/…" /></div>
        <div><label className={labelCls}>Telegram URL</label><input type="url" className={inputCls} value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="https://t.me/…" /></div>
      </div>
      <SaveBtn saving={saving} saved={saved} onClick={save} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "podcast", label: "Podcast" },
  { id: "contact", label: "Kontakt & Social" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function SettingsAdmin() {
  const supabase = createClient();
  const [tab, setTab] = useState<TabId>("podcast");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-light tracking-wide">Einstellungen</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Podcast & Kontakt</p>
      </div>

      <div className="flex flex-wrap gap-1 mb-8 border-b border-zinc-800 dark:border-zinc-800">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors ${
              tab === t.id
                ? "border-zinc-900 text-zinc-100 dark:border-white dark:text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-xl">
        {tab === "podcast" && <PodcastSection supabase={supabase} />}
        {tab === "contact" && <ContactSection supabase={supabase} />}
      </div>
    </div>
  );
}
