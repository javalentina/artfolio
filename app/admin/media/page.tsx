"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Upload, Trash2, Copy, Check, Image as ImageIcon, Pencil, X, GripVertical } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loadSettings, patchSettings } from "../_lib";
import { cn } from "@/lib/utils";
import { useDragSort } from "../_components/useDragSort";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

type MediaRow = {
  id: string;
  url: string;
  filename: string;
  alt: Record<string, string> | null;
  created_at: string;
};
type AltEdit = { de: string; en: string; ru: string };

export default function MediaAdmin() {
  const supabase = createClient();
  const [rows, setRows]         = useState<MediaRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [editId, setEditId]     = useState<string | null>(null);
  const [altEdit, setAltEdit]   = useState<AltEdit>({ de: "", en: "", ru: "" });
  const [savingOrder, setSavingOrder] = useState(false);
  const { dragIdx, overIdx, getItemProps } = useDragSort(async (from, to) => {
    const list = [...rows];
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    setRows(list);
    await saveOrder(list);
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const [{ data: mediaData }, { settings }] = await Promise.all([
      supabase.from("media").select("id,url,filename,alt,created_at").eq("artist_id", ARTIST_ID),
      loadSettings(supabase),
    ]);
    const all = (mediaData ?? []) as MediaRow[];
    const order = (settings.media_order as string[] | undefined) ?? [];
    if (order.length) {
      const map = new Map(all.map(r => [r.id, r]));
      const sorted: MediaRow[] = [];
      for (const id of order) { const r = map.get(id); if (r) sorted.push(r); }
      for (const r of all)    { if (!order.includes(r.id)) sorted.push(r); }
      setRows(sorted);
    } else {
      setRows(all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function saveOrder(ordered: MediaRow[]) {
    setSavingOrder(true);
    await patchSettings(supabase, { media_order: ordered.map(r => r.id) }, "Galerie-Reihenfolge");
    setSavingOrder(false);
  }


  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    setUploading(true);
    setUploadError(null);
    for (const file of selected) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        setUploadError(`Upload-Fehler: ${body.error ?? res.statusText}`);
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    load();
  }

  async function remove(id: string, filename: string) {
    if (!confirm(`${filename} löschen?`)) return;
    await supabase.from("media").delete().eq("id", id);
    load();
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  function startEdit(row: MediaRow) {
    const a = row.alt ?? {};
    setAltEdit({ de: a.de ?? "", en: a.en ?? "", ru: a.ru ?? "" });
    setEditId(row.id);
  }

  async function saveAlt() {
    if (!editId) return;
    await supabase.from("media").update({ alt: altEdit }).eq("id", editId);
    setEditId(null);
    load();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Medien / Galerie</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{rows.length} Bilder · Reihenfolge per Drag &amp; Drop ändern</p>
        </div>
        <div className="flex items-center gap-3">
          {savingOrder && <span className="text-xs text-zinc-500">Reihenfolge wird gespeichert…</span>}
          <label className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors",
            uploading ? "bg-zinc-300 text-zinc-500 cursor-not-allowed" : "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          )}>
            <Upload className="h-4 w-4" />
            {uploading ? "Lädt hoch…" : "Hochladen"}
            <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{uploadError}</p>
          <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-200 shrink-0"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Alt-text edit modal */}
      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Alt-Text bearbeiten</h2>
              <button onClick={() => setEditId(null)}><X className="h-4 w-4" /></button>
            </div>
            {(["de","en","ru"] as const).map(lang => (
              <div key={lang}>
                <label className="text-xs uppercase tracking-widest text-zinc-400">{lang.toUpperCase()}</label>
                <input value={altEdit[lang]} onChange={e => setAltEdit(a => ({ ...a, [lang]: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
                  placeholder={`Alt-Text auf ${lang.toUpperCase()}`} />
              </div>
            ))}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditId(null)} className="px-4 py-2 text-sm rounded-lg border border-zinc-700 hover:bg-zinc-800">Abbrechen</button>
              <button onClick={saveAlt} className="px-4 py-2 text-sm rounded-lg bg-zinc-100 text-zinc-950 hover:bg-white">Speichern</button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <p className="text-sm text-zinc-400">Wird geladen…</p>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800 py-16 text-center">
          <ImageIcon className="h-10 w-10 text-zinc-300 mb-3" />
          <p className="text-sm text-zinc-400">Noch keine Bilder</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {rows.map((row, i) => (
            <div
              key={row.id}
              {...getItemProps(i)}
              className={cn(
                "group relative rounded-xl border bg-zinc-900 overflow-hidden transition-all",
                overIdx === i && dragIdx !== i ? "border-zinc-400 shadow-lg scale-[1.02]" : "border-zinc-800"
              )}
            >
              {/* Drag handle */}
              <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                <div className="rounded-md bg-black/60 p-1"><GripVertical className="h-3.5 w-3.5 text-white" /></div>
              </div>

              {/* Thumbnail */}
              <div className="aspect-square bg-zinc-950 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.url} alt={row.alt?.de || row.filename} className="h-full w-full object-cover" />
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-xs text-zinc-400 truncate">{row.filename}</p>
                {row.alt?.de && <p className="text-xs text-zinc-600 truncate">{row.alt.de}</p>}
              </div>

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => copyUrl(row.url)} className="rounded-lg bg-zinc-900/90 p-2 text-zinc-300 hover:bg-zinc-800" title="URL kopieren">
                  {copiedUrl === row.url ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <button onClick={() => startEdit(row)} className="rounded-lg bg-zinc-900/90 p-2 text-zinc-300 hover:bg-zinc-800" title="Alt-Text">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(row.id, row.filename)} className="rounded-lg bg-zinc-900/90 p-2 text-zinc-300 hover:bg-red-900/50 hover:text-red-400" title="Löschen">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
