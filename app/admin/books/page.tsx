"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loadSettings, patchSettings, uid, inputCls, labelCls, cardCls, saveBtnCls, type S } from "../_lib";
import { MediaImageInput } from "../_components/MediaImageInput";

type Publication = { id: string; year: string; title: S; description: S; coverUrl: string; buyUrl: string };

function SaveBtn({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={saving} className={saveBtnCls}>
      <Check className="h-4 w-4" />
      {saved ? "Gespeichert!" : saving ? "Speichert…" : "Speichern"}
    </button>
  );
}

export default function BooksAdmin() {
  const supabase = createClient();
  const [pubs, setPubs]       = useState<Publication[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    loadSettings(supabase).then(({ settings: cfg }) => setPubs((cfg.publications as Publication[]) ?? []));
  }, []);

  function update(id: string, field: string, val: string | S) {
    setPubs(ps => ps.map(p => p.id === id ? { ...p, [field]: val } : p));
  }
  function updateLang(id: string, field: string, lang: string, val: string) {
    setPubs(ps => ps.map(p => p.id === id ? { ...p, [field]: { ...(p[field as keyof Publication] as S), [lang]: val } } : p));
  }
  function add() {
    const newId = uid();
    setPubs(ps => [...ps, { id: newId, year: "", title: { de: "", en: "", ru: "" }, description: { de: "", en: "", ru: "" }, coverUrl: "", buyUrl: "" }]);
    setExpanded(newId);
  }
  function remove(id: string) { setPubs(ps => ps.filter(p => p.id !== id)); }

  async function save() {
    setSaving(true);
    await patchSettings(supabase, { publications: pubs }, "Bücher");
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-light tracking-wide">Bücher</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Publikationen & Bücher verwalten</p>
      </div>

      {pubs.map(p => (
        <div key={p.id} className={cardCls + " !space-y-0"}>
          <button className="flex w-full items-center justify-between" onClick={() => setExpanded(x => x === p.id ? null : p.id)}>
            <span className="font-medium text-zinc-100">
              {p.year || "—"} — {(p.title as S).de as string || "Neue Publikation"}
            </span>
            {expanded === p.id ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
          </button>
          {expanded === p.id && (
            <div className="mt-4 space-y-3">
              <div><label className={labelCls}>Jahr</label><input className={inputCls} value={p.year} onChange={e => update(p.id, "year", e.target.value)} placeholder="2024" /></div>
              {(["de","en","ru"] as const).map(l => (
                <div key={l}><label className={labelCls}>Titel {l.toUpperCase()}</label>
                  <input className={inputCls} value={(p.title as S)[l] as string ?? ""} onChange={e => updateLang(p.id, "title", l, e.target.value)} />
                </div>
              ))}
              {(["de","en","ru"] as const).map(l => (
                <div key={l}><label className={labelCls}>Beschreibung {l.toUpperCase()}</label>
                  <textarea className={inputCls + " resize-none"} rows={2} value={(p.description as S)[l] as string ?? ""} onChange={e => updateLang(p.id, "description", l, e.target.value)} />
                </div>
              ))}
              <div>
                <label className={labelCls}>Cover-Bild</label>
                <MediaImageInput value={p.coverUrl} onChange={v => update(p.id, "coverUrl", v)} />
                {p.coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverUrl} alt="" className="mt-2 h-32 object-contain rounded" />
                )}
              </div>
              <div><label className={labelCls}>Kauf-Link URL</label><input className={inputCls} value={p.buyUrl} onChange={e => update(p.id, "buyUrl", e.target.value)} placeholder="https://…" /></div>
              <button onClick={() => remove(p.id)} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700">
                <Trash2 className="h-3 w-3" /> Löschen
              </button>
            </div>
          )}
        </div>
      ))}

      <button onClick={add} className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 w-full dark:border-zinc-700">
        <Plus className="h-4 w-4" /> Publikation hinzufügen
      </button>

      <SaveBtn saving={saving} saved={saved} onClick={save} />
    </div>
  );
}
