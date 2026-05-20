"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loadSettings, patchSettings, uid, inputCls, labelCls, cardCls, saveBtnCls } from "../_lib";

type VideoEntry = { id: string; youtubeId: string; title: string; duration: string };

function SaveBtn({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={saving} className={saveBtnCls}>
      <Check className="h-4 w-4" />
      {saved ? "Gespeichert!" : saving ? "Speichert…" : "Speichern"}
    </button>
  );
}

export default function VideosAdmin() {
  const supabase = createClient();
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    loadSettings(supabase).then(({ settings: cfg }) => setVideos((cfg.videos as VideoEntry[]) ?? []));
  }, []);

  function update(id: string, field: string, val: string) {
    setVideos(vs => vs.map(v => v.id === id ? { ...v, [field]: val } : v));
  }
  function add() { setVideos(vs => [...vs, { id: uid(), youtubeId: "", title: "", duration: "" }]); }
  function remove(id: string) { setVideos(vs => vs.filter(v => v.id !== id)); }

  async function save() {
    setSaving(true);
    await patchSettings(supabase, { videos }, "Videos");
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-light tracking-wide">Videos</h1>
        <p className="mt-0.5 text-sm text-zinc-500">YouTube-Videos verwalten</p>
      </div>

      {videos.map((v, i) => (
        <div key={v.id} className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Video {i + 1}</span>
            <button onClick={() => remove(v.id)} className="text-zinc-400 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div>
            <label className={labelCls}>YouTube ID</label>
            <input className={inputCls} value={v.youtubeId} onChange={e => update(v.id, "youtubeId", e.target.value)} placeholder="-_vjUDQgXnc" />
          </div>
          {v.youtubeId && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`} alt="" className="rounded mt-1 w-48" />
          )}
          <div><label className={labelCls}>Titel</label><input className={inputCls} value={v.title} onChange={e => update(v.id, "title", e.target.value)} /></div>
          <div><label className={labelCls}>Dauer</label><input className={inputCls} value={v.duration} onChange={e => update(v.id, "duration", e.target.value)} placeholder="2:11" /></div>
        </div>
      ))}

      <button onClick={add} className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 w-full dark:border-zinc-700">
        <Plus className="h-4 w-4" /> Video hinzufügen
      </button>

      <SaveBtn saving={saving} saved={saved} onClick={save} />
    </div>
  );
}
