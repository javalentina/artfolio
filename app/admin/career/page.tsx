"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loadSettings, patchSettings, uid, inputCls, labelCls, cardCls, saveBtnCls, type S } from "../_lib";

type CareerEntry = { id: string; year: string; title: S; text: S };

function SaveBtn({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={saving} className={saveBtnCls}>
      <Check className="h-4 w-4" />
      {saved ? "Gespeichert!" : saving ? "Speichert…" : "Speichern"}
    </button>
  );
}

export default function CareerAdmin() {
  const supabase = createClient();
  const [entries, setEntries] = useState<CareerEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    loadSettings(supabase).then(({ settings: cfg }) => {
      setEntries((cfg.career as CareerEntry[]) ?? []);
    });
  }, []);

  function update(id: string, field: string, val: string | S) {
    setEntries(es => es.map(e => e.id === id ? { ...e, [field]: val } : e));
  }
  function updateLang(id: string, field: string, lang: string, val: string) {
    setEntries(es => es.map(e => e.id === id ? { ...e, [field]: { ...(e[field as keyof CareerEntry] as S), [lang]: val } } : e));
  }
  function add() {
    const newId = uid();
    setEntries(es => [...es, { id: newId, year: "", title: { de: "", en: "", ru: "" }, text: { de: "", en: "", ru: "" } }]);
    setExpanded(newId);
  }
  function remove(id: string) { setEntries(es => es.filter(e => e.id !== id)); }

  async function save() {
    setSaving(true);
    await patchSettings(supabase, { career: entries }, "Werdegang");
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-light tracking-wide">Werdegang</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Karriere-Einträge verwalten</p>
      </div>

      {entries.map(e => (
        <div key={e.id} className={cardCls + " !space-y-0"}>
          <button className="flex w-full items-center justify-between" onClick={() => setExpanded(x => x === e.id ? null : e.id)}>
            <span className="font-medium text-zinc-100">
              {e.year || "Neuer Eintrag"} — {(e.title as S).de as string || "—"}
            </span>
            {expanded === e.id ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
          </button>
          {expanded === e.id && (
            <div className="mt-4 space-y-3">
              <div><label className={labelCls}>Jahr</label><input className={inputCls} value={e.year} onChange={ev => update(e.id, "year", ev.target.value)} placeholder="2019" /></div>
              {(["de","en","ru"] as const).map(l => (
                <div key={l}><label className={labelCls}>Titel {l.toUpperCase()}</label>
                  <input className={inputCls} value={(e.title as S)[l] as string ?? ""} onChange={ev => updateLang(e.id, "title", l, ev.target.value)} />
                </div>
              ))}
              {(["de","en","ru"] as const).map(l => (
                <div key={l}><label className={labelCls}>Text {l.toUpperCase()}</label>
                  <textarea className={inputCls + " resize-none"} rows={3} value={(e.text as S)[l] as string ?? ""} onChange={ev => updateLang(e.id, "text", l, ev.target.value)} />
                </div>
              ))}
              <button onClick={() => remove(e.id)} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700">
                <Trash2 className="h-3 w-3" /> Löschen
              </button>
            </div>
          )}
        </div>
      ))}

      <button onClick={add} className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 w-full dark:border-zinc-700">
        <Plus className="h-4 w-4" /> Eintrag hinzufügen
      </button>

      <SaveBtn saving={saving} saved={saved} onClick={save} />
    </div>
  );
}
