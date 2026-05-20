"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X, GripVertical, Download, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { loadSettings, patchSettings, saveEntityVersion } from "../_lib";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

type RepertoireRow = {
  id: string;
  composer: Record<string, string>;
  works: { en: string[]; ru: string[] } | string[];
  tab: string;
  position: number;
};

type FormData = {
  composer_de: string;
  composer_ru: string;
  works: string;
  works_ru: string;
  tab: string;
};

const empty: FormData = { composer_de: "", composer_ru: "", works: "", works_ru: "", tab: "solo" };
const inputCls = "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none";
const labelCls = "block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider";

export default function RepertoireAdmin() {
  const supabase = createClient();
  const [rows, setRows] = useState<RepertoireRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("solo");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [tabOrder, setTabOrder] = useState<string[]>([]);
  const [tabDragIdx, setTabDragIdx] = useState<number | null>(null);
  const [tabOverIdx, setTabOverIdx] = useState<number | null>(null);

  async function load() {
    const { data } = await supabase
      .from("repertoire")
      .select("*")
      .eq("artist_id", ARTIST_ID)
      .order("position");
    setRows((data ?? []) as RepertoireRow[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    loadSettings(supabase).then(({ settings }) => {
      const stored = settings.repertoire_tab_order as string[] | undefined;
      if (stored?.length) setTabOrder(stored);
    });
  }, []);

  useEffect(() => {
    if (!showForm) return;
    try { localStorage.setItem(`artfolio_repertoire_${editing ?? "new"}`, JSON.stringify(form)); } catch {}
  }, [form, showForm, editing]);

  function tryLoadDraft(key: string): FormData | null {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
  function clearDraft(key: string) { try { localStorage.removeItem(key); } catch {} }

  const rawTabs = [...new Set(rows.map(r => r.tab))];
  const tabs = rawTabs.slice().sort((a, b) => {
    const ai = tabOrder.indexOf(a); const bi = tabOrder.indexOf(b);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  const list = rows.filter(r => r.tab === tab);

  async function handleTabDrop(toIdx: number) {
    if (tabDragIdx === null || tabDragIdx === toIdx) { setTabDragIdx(null); setTabOverIdx(null); return; }
    const next = [...tabs];
    const [moved] = next.splice(tabDragIdx, 1);
    next.splice(toIdx, 0, moved);
    setTabOrder(next);
    setTabDragIdx(null); setTabOverIdx(null);
    await patchSettings(supabase, { repertoire_tab_order: next }, "Tab-Reihenfolge");
  }

  function openNew() {
    const draft = tryLoadDraft("artfolio_repertoire_new");
    setForm(draft ?? { ...empty, tab });
    setDraftLoaded(!!draft);
    setEditing(null);
    setSaveError(null);
    setShowForm(true);
  }

  function worksEn(r: RepertoireRow): string[] {
    const w = r.works;
    if (!w) return [];
    if (Array.isArray(w)) return w;
    return w.en ?? [];
  }
  function worksRu(r: RepertoireRow): string[] {
    const w = r.works;
    if (!w || Array.isArray(w)) return [];
    return w.ru ?? [];
  }

  function openEdit(r: RepertoireRow) {
    const base: FormData = {
      composer_de: r.composer?.de ?? r.composer?.en ?? "",
      composer_ru: r.composer?.ru ?? "",
      works: worksEn(r).join("\n"),
      works_ru: worksRu(r).join("\n"),
      tab: r.tab,
    };
    const draft = tryLoadDraft(`artfolio_repertoire_${r.id}`);
    setForm(draft ?? base);
    setDraftLoaded(!!draft);
    setEditing(r.id);
    setSaveError(null);
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    setSaveError(null);
    const payload = {
      composer: { de: form.composer_de, en: form.composer_de, ru: form.composer_ru },
      works: {
        en: form.works.split("\n").map(s => s.trim()).filter(Boolean),
        ru: form.works_ru.split("\n").map(s => s.trim()).filter(Boolean),
      },
      tab: form.tab,
    };
    try {
      let savedId = editing;
      if (editing) {
        const { error } = await supabase.from("repertoire").update(payload).eq("id", editing);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase.from("repertoire")
          .insert({ ...payload, artist_id: ARTIST_ID, position: rows.filter(r => r.tab === form.tab).length })
          .select("id").single();
        if (error) throw error;
        savedId = inserted?.id ?? null;
      }
      if (savedId) {
        const label = `Repertoire: ${form.composer_de} (${form.tab})`;
        await saveEntityVersion(supabase, "repertoire", savedId, payload as Record<string, unknown>, label);
      }
      clearDraft(`artfolio_repertoire_${editing ?? "new"}`);
      setShowForm(false);
      load();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Speichern fehlgeschlagen — bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Löschen?")) return;
    await supabase.from("repertoire").delete().eq("id", id);
    load();
  }

  async function handleDrop(toIdx: number) {
    if (dragIdx === null || dragIdx === toIdx) { setDragIdx(null); setOverIdx(null); return; }
    const tabRows = [...list];
    const [moved] = tabRows.splice(dragIdx, 1);
    tabRows.splice(toIdx, 0, moved);
    const updates = tabRows.map((r, i) => supabase.from("repertoire").update({ position: i }).eq("id", r.id));
    await Promise.all(updates);
    setDragIdx(null); setOverIdx(null);
    load();
  }

  function handleExport() {
    const data = JSON.stringify(rows, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "repertoire.json"; a.click();
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string) as RepertoireRow[];
        await supabase.from("repertoire").delete().eq("artist_id", ARTIST_ID);
        for (let i = 0; i < imported.length; i++) {
          const r = imported[i];
          await supabase.from("repertoire").insert({
            artist_id: ARTIST_ID,
            composer: r.composer,
            works: Array.isArray(r.works) ? { en: r.works, ru: [] } : (r.works ?? { en: [], ru: [] }),
            tab: r.tab,
            position: i,
          });
        }
        load();
      } catch { alert("Import fehlgeschlagen"); }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Repertoire</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{rows.length} Komponisten</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-600 hover:border-zinc-500 transition-colors">
            <Download className="h-4 w-4" /> Export
          </button>
          <label className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-600 hover:border-zinc-500 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" /> Import
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button onClick={openNew} className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors dark:bg-zinc-900 dark:text-zinc-100">
            <Plus className="h-4 w-4" /> Neu
          </button>
        </div>
      </div>

      {/* Tabs with drag-to-reorder */}
      <div className="flex gap-1 border-b border-zinc-800 dark:border-zinc-800 overflow-x-auto">
        {tabs.map((t, i) => (
          <div
            key={t}
            draggable
            onDragStart={() => setTabDragIdx(i)}
            onDragOver={e => { e.preventDefault(); setTabOverIdx(i); }}
            onDrop={() => handleTabDrop(i)}
            onDragEnd={() => { setTabDragIdx(null); setTabOverIdx(null); }}
            className={cn(
              "group flex items-center gap-1 pb-3 pr-4 shrink-0 cursor-grab transition-all",
              tabOverIdx === i ? "opacity-50" : ""
            )}
          >
            <GripVertical className="h-3.5 w-3.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 cursor-grab" />
            <button onClick={() => setTab(t)} className={cn(
              "text-sm whitespace-nowrap transition-colors",
              tab === t ? "border-b-2 border-white font-medium text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
            )}>
              {t} ({rows.filter(r => r.tab === t).length})
            </button>
          </div>
        ))}
        <p className="ml-auto self-end pb-3 text-xs text-zinc-600 shrink-0">Tabs ziehen zum Sortieren</p>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-sm text-zinc-400">Wird geladen…</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-zinc-400">Keine Einträge</p>
      ) : (
        <div className="space-y-2">
          {list.map((r, i) => (
            <div
              key={r.id}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={e => { e.preventDefault(); setOverIdx(i); }}
              onDrop={() => handleDrop(i)}
              onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-zinc-900 p-4 transition-all dark:bg-zinc-900",
                overIdx === i ? "border-zinc-400 shadow-md" : "border-zinc-800 dark:border-zinc-800"
              )}
            >
              <GripVertical className="h-4 w-4 text-zinc-300 cursor-grab shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-100 dark:text-zinc-100 truncate">
                  {r.composer?.de ?? r.composer?.en ?? "–"}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">{worksEn(r).length} Werke</p>
              </div>
              <div className="flex items-center shrink-0">
                <button onClick={() => openEdit(r)} className="p-2.5 text-zinc-500 hover:text-zinc-200 transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(r.id)} className="p-2.5 text-zinc-500 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal (centered on desktop, bottom-sheet on mobile) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:items-center lg:justify-center bg-black/60" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="w-full bg-zinc-900 rounded-t-2xl lg:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] lg:max-h-[85vh] lg:max-w-2xl">
            {/* Handle — mobile only */}
            <div className="flex justify-center pt-3 pb-1 shrink-0 lg:hidden">
              <div className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 shrink-0">
              <h2 className="font-medium text-zinc-100">{editing ? "Bearbeiten" : "Neuer Eintrag"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            {/* Draft restored banner */}
            {draftLoaded && (
              <div className="mx-5 mt-3 flex items-center justify-between rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-400 shrink-0">
                <span>Nicht gespeicherte Änderungen wiederhergestellt</span>
                <button onClick={() => { setDraftLoaded(false); clearDraft(`artfolio_repertoire_${editing ?? "new"}`); setForm(empty); }} className="ml-3 underline hover:text-amber-200 shrink-0">Verwerfen</button>
              </div>
            )}

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:gap-y-4 lg:space-y-0 lg:content-start">
              <div>
                <label className={labelCls}>Komponist (DE/EN)</label>
                <input className={inputCls} value={form.composer_de} onChange={e => setForm(f => ({ ...f, composer_de: e.target.value }))} placeholder="Johann Sebastian Bach" />
              </div>
              <div>
                <label className={labelCls}>Komponist (RU)</label>
                <input className={inputCls} value={form.composer_ru} onChange={e => setForm(f => ({ ...f, composer_ru: e.target.value }))} placeholder="Иоганн Себастьян Бах" />
              </div>
              <div className="lg:col-span-2">
                <label className={labelCls}>Tab / Kategorie</label>
                <input className={inputCls} value={form.tab} onChange={e => setForm(f => ({ ...f, tab: e.target.value }))} placeholder="solo" />
                <p className="mt-1 text-xs text-zinc-500">z.B. solo, chamber</p>
              </div>
              <div>
                <label className={labelCls}>Werke EN (eine pro Zeile, Zeile mit : = Gruppe)</label>
                <textarea className={inputCls + " resize-none"} rows={6} value={form.works} onChange={e => setForm(f => ({ ...f, works: e.target.value }))} placeholder={"Preludes:\nPrelude in C major\nFugue in D minor"} />
              </div>
              <div>
                <label className={labelCls}>Werke RU (eine pro Zeile)</label>
                <textarea className={inputCls + " resize-none"} rows={6} value={form.works_ru} onChange={e => setForm(f => ({ ...f, works_ru: e.target.value }))} />
              </div>
            </div>
            {/* Footer */}
            <div className="px-5 pt-3 pb-4 border-t border-zinc-800 shrink-0 space-y-2">
              {saveError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">{saveError}</div>
              )}
              <div className="flex gap-3">
                <button onClick={save} disabled={saving || !form.composer_de}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-zinc-100 py-3 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-40 transition-colors">
                  <Check className="h-4 w-4" />{saving ? "Speichert…" : "Speichern"}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="rounded-xl border border-zinc-700 px-5 py-3 text-sm text-zinc-400 hover:border-zinc-500 transition-colors">
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
