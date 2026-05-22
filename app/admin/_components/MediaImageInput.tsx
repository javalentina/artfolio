"use client";

import { useRef, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const inputCls = "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

type MediaRow = { id: string; url: string; filename: string };

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function MediaImageInput({ value, onChange }: Props) {
  const supabase = createClient();
  const [showPicker, setShowPicker] = useState(false);
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function openPicker() {
    if (!rows.length) {
      const { data } = await supabase
        .from("media")
        .select("id,url,filename")
        .eq("artist_id", ARTIST_ID);
      setRows((data ?? []) as MediaRow[]);
    }
    setShowPicker(true);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload-asset", { method: "POST", body: fd });
    const body = await res.json();
    if (!res.ok) {
      setUploadError(body.error ?? "Upload fehlgeschlagen");
    } else {
      onChange(body.url);
      setShowPicker(false);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <>
      <div className="flex gap-2">
        <input
          className={inputCls}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://…"
          readOnly
        />
        <button
          type="button"
          onClick={openPicker}
          className="shrink-0 rounded-lg border border-zinc-700 px-3 py-2 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
          title="Bild auswählen oder hochladen"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
      </div>

      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={e => { if (e.target === e.currentTarget) setShowPicker(false); }}
        >
          <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl shadow-2xl flex flex-col max-h-[80vh] mx-4">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
              <h2 className="font-medium text-zinc-100">Bild auswählen</h2>
              <button onClick={() => setShowPicker(false)} className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Upload strip */}
            <div className="px-4 pt-4 shrink-0">
              <label className={[
                "flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed py-4 text-sm cursor-pointer transition-colors",
                uploading
                  ? "border-zinc-700 text-zinc-600 cursor-not-allowed"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              ].join(" ")}>
                <Upload className="h-4 w-4" />
                {uploading ? "Lädt hoch…" : "Vom Computer hochladen"}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={handleUpload}
                />
              </label>
              {uploadError && (
                <p className="mt-2 text-xs text-red-400">{uploadError}</p>
              )}
              {rows.length > 0 && (
                <p className="mt-3 mb-1 text-xs text-zinc-600 uppercase tracking-wider">Oder aus Galerie wählen</p>
              )}
            </div>

            {/* Gallery grid */}
            <div className="overflow-y-auto flex-1 p-4 pt-2">
              {rows.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-6">
                  Noch keine Galerie-Bilder — oder lade oben direkt hoch.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {rows.map(row => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => { onChange(row.url); setShowPicker(false); }}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-400 transition-all focus:outline-none focus:border-amber-400"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={row.url} alt={row.filename} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
