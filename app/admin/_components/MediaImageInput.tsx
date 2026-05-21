"use client";

import { useState } from "react";
import { ImageIcon, X } from "lucide-react";
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
          title="Aus Medien wählen"
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
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
              <h2 className="font-medium text-zinc-100">Bild auswählen</h2>
              <button
                onClick={() => setShowPicker(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {rows.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-10">
                  Keine Bilder vorhanden — zuerst unter Medien hochladen.
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
