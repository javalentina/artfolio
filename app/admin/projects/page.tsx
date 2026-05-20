"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Eye, EyeOff, GripVertical, ChevronDown, ChevronUp, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { saveEntityVersion } from "../_lib";
import { cn } from "@/lib/utils";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

type ContentFields = {
  subtitle_de: string; subtitle_en: string; subtitle_ru: string;
  fullText_de: string; fullText_en: string; fullText_ru: string;
  imageUrl: string;
  youtubeId: string;
};

type Project = {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  category: string | null;
  year: number | null;
  cover_image: string | null;
  published: boolean;
  position: number;
  content: Record<string, unknown> | null;
};

type FormData = {
  title_de: string;
  title_en: string;
  title_ru: string;
  description_de: string;
  description_en: string;
  description_ru: string;
  category: string;
  year: string;
  cover_image: string;
  published: boolean;
} & ContentFields;

const empty: FormData = {
  title_de: "", title_en: "", title_ru: "",
  description_de: "", description_en: "", description_ru: "",
  category: "", year: "", cover_image: "", published: true,
  subtitle_de: "", subtitle_en: "", subtitle_ru: "",
  fullText_de: "", fullText_en: "", fullText_ru: "",
  imageUrl: "", youtubeId: "",
};

const inputCls = "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none";
const labelCls = "block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider";

export default function ProjectsAdmin() {
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [showContent, setShowContent] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("projects")
      .select("id,title,description,category,year,cover_image,published,position,content")
      .eq("artist_id", ARTIST_ID)
      .order("position");
    setProjects((data ?? []) as Project[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!showForm) return;
    try { localStorage.setItem(`artfolio_project_${editing ?? "new"}`, JSON.stringify(form)); } catch {}
  }, [form, showForm, editing]);

  function tryLoadDraft(key: string): FormData | null {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
  function clearDraft(key: string) { try { localStorage.removeItem(key); } catch {} }

  function openNew() {
    const draft = tryLoadDraft("artfolio_project_new");
    setForm(draft ?? empty);
    setDraftLoaded(!!draft);
    setEditing(null);
    setSaveError(null);
    setShowForm(true);
  }

  function openEdit(p: Project) {
    const c = (p.content ?? {}) as Record<string, unknown>;
    const sub = (c.subtitle ?? {}) as Record<string, string>;
    const ft  = (c.fullText  ?? {}) as Record<string, string>;
    const base: FormData = {
      title_de: p.title?.de ?? "",
      title_en: p.title?.en ?? "",
      title_ru: p.title?.ru ?? "",
      description_de: p.description?.de ?? "",
      description_en: p.description?.en ?? "",
      description_ru: p.description?.ru ?? "",
      category: p.category ?? "",
      year: p.year ? String(p.year) : "",
      cover_image: p.cover_image ?? "",
      published: p.published,
      subtitle_de: sub.de ?? "", subtitle_en: sub.en ?? "", subtitle_ru: sub.ru ?? "",
      fullText_de: ft.de ?? "",  fullText_en: ft.en ?? "",  fullText_ru: ft.ru ?? "",
      imageUrl: (c.imageUrl as string) ?? "",
      youtubeId: (c.youtubeId as string) ?? "",
    };
    const draft = tryLoadDraft(`artfolio_project_${p.id}`);
    setForm(draft ?? base);
    setDraftLoaded(!!draft);
    setEditing(p.id);
    setSaveError(null);
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    setSaveError(null);
    const existingProject = projects.find(p => p.id === editing);
    const existingContent = (existingProject?.content ?? {}) as Record<string, unknown>;
    const payload = {
      title: { de: form.title_de, en: form.title_en, ru: form.title_ru },
      description: { de: form.description_de, en: form.description_en, ru: form.description_ru },
      category: form.category || null,
      year: form.year ? parseInt(form.year) : null,
      cover_image: form.cover_image || null,
      published: form.published,
      content: {
        ...existingContent,
        subtitle: { de: form.subtitle_de, en: form.subtitle_en, ru: form.subtitle_ru },
        fullText: { de: form.fullText_de, en: form.fullText_en, ru: form.fullText_ru },
        imageUrl: form.imageUrl || existingContent.imageUrl || null,
        youtubeId: form.youtubeId || null,
      },
    };
    try {
      let savedId = editing;
      if (editing) {
        const { error } = await supabase.from("projects").update(payload).eq("id", editing);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase.from("projects").insert({ ...payload, artist_id: ARTIST_ID, position: projects.length }).select("id").single();
        if (error) throw error;
        savedId = inserted?.id ?? null;
      }
      if (savedId) {
        const label = `Projekt: ${form.title_de}`;
        await saveEntityVersion(supabase, "project", savedId, payload as Record<string, unknown>, label);
      }
      clearDraft(`artfolio_project_${editing ?? "new"}`);
      setShowForm(false);
      setEditing(null);
      load();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Speichern fehlgeschlagen — bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Projekt löschen?")) return;
    await supabase.from("projects").delete().eq("id", id);
    load();
  }

  async function togglePublished(p: Project) {
    await supabase.from("projects").update({ published: !p.published }).eq("id", p.id);
    load();
  }

  async function handleDrop(toIdx: number) {
    if (dragIdx === null || dragIdx === toIdx) { setDragIdx(null); setOverIdx(null); return; }
    const list = [...projects];
    const [moved] = list.splice(dragIdx, 1);
    list.splice(toIdx, 0, moved);
    const updates = list.map((p, i) => supabase.from("projects").update({ position: i }).eq("id", p.id));
    await Promise.all(updates);
    setDragIdx(null); setOverIdx(null);
    load();
  }

  const categories = [...new Set(projects.map(p => p.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Projekte</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {projects.filter(p => p.published).length} veröffentlicht · {projects.filter(p => !p.published).length} Entwurf
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors dark:bg-zinc-900 dark:text-zinc-100"
        >
          <Plus className="h-4 w-4" /> Neu
        </button>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-sm text-zinc-400">Wird geladen…</p>
      ) : projects.length === 0 ? (
        <p className="text-sm text-zinc-400">Noch keine Projekte</p>
      ) : (
        <div className="space-y-2">
          {projects.map((p, i) => (
            <div
              key={p.id}
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

              {p.cover_image && (
                <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.cover_image} alt="" className="h-full w-full object-cover" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-100 dark:text-zinc-100 truncate">
                  {p.title?.de || p.title?.en || "–"}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {[p.category, p.year].filter(Boolean).join(" · ")}
                </p>
              </div>

              <div className="flex items-center shrink-0">
                <button onClick={() => togglePublished(p)} className="p-2.5 text-zinc-500 hover:text-zinc-200 transition-colors" title={p.published ? "Verstecken" : "Veröffentlichen"}>
                  {p.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-zinc-400" />}
                </button>
                <Link href={`/admin/projects/${p.id}`} className="p-2.5 text-zinc-500 hover:text-amber-400 transition-colors" title="Seiteninhalte bearbeiten">
                  <LayoutTemplate className="h-4 w-4" />
                </Link>
                <button onClick={() => openEdit(p)} className="p-2.5 text-zinc-500 hover:text-zinc-200 transition-colors" title="Grunddaten bearbeiten">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(p.id)} className="p-2.5 text-zinc-500 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal (centered on desktop, bottom-sheet on mobile) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:items-center lg:justify-center bg-black/60"
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="w-full bg-zinc-900 rounded-t-2xl lg:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] lg:max-h-[85vh] lg:max-w-2xl">

            {/* Handle — mobile only */}
            <div className="flex justify-center pt-3 pb-1 shrink-0 lg:hidden">
              <div className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 shrink-0">
              <h2 className="font-medium text-zinc-100">{editing ? "Projekt bearbeiten" : "Neues Projekt"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Draft restored banner */}
            {draftLoaded && (
              <div className="mx-5 mt-3 flex items-center justify-between rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-400 shrink-0">
                <span>Nicht gespeicherte Änderungen wiederhergestellt</span>
                <button onClick={() => { setDraftLoaded(false); clearDraft(`artfolio_project_${editing ?? "new"}`); setForm(empty); }} className="ml-3 underline hover:text-amber-200 shrink-0">Verwerfen</button>
              </div>
            )}

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:gap-y-5 lg:space-y-0 lg:content-start">

              <div>
                <label className={labelCls}>Titel (DE) *</label>
                <input className={inputCls} value={form.title_de} onChange={e => setForm(f => ({ ...f, title_de: e.target.value }))} placeholder="Trio-Konzert" />
              </div>
              <div>
                <label className={labelCls}>Kategorie</label>
                <input className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Kammermusik" list="categories" />
                <datalist id="categories">{categories.map(c => <option key={c} value={c!} />)}</datalist>
              </div>
              <div>
                <label className={labelCls}>Titel (EN)</label>
                <input className={inputCls} value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Titel (RU)</label>
                <input className={inputCls} value={form.title_ru} onChange={e => setForm(f => ({ ...f, title_ru: e.target.value }))} />
              </div>

              <div className="lg:col-span-2">
                <label className={labelCls}>Beschreibung (DE)</label>
                <textarea className={inputCls + " resize-none"} rows={3} value={form.description_de} onChange={e => setForm(f => ({ ...f, description_de: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Beschreibung (EN)</label>
                <textarea className={inputCls + " resize-none"} rows={3} value={form.description_en} onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Beschreibung (RU)</label>
                <textarea className={inputCls + " resize-none"} rows={3} value={form.description_ru} onChange={e => setForm(f => ({ ...f, description_ru: e.target.value }))} />
              </div>

              <div className="lg:col-span-2 flex gap-6 items-start">
                <div className="flex-1">
                  <label className={labelCls}>Cover Bild URL</label>
                  <input className={inputCls} value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} placeholder="https://…" />
                </div>
                {form.cover_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.cover_image} alt="" className="mt-5 h-16 w-16 shrink-0 rounded-lg object-cover" />
                )}
              </div>

              <div className="flex items-center justify-between lg:col-span-2">
                <label className="flex items-center gap-3 text-sm text-zinc-300 cursor-pointer">
                  <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="h-4 w-4 rounded accent-amber-400" />
                  Veröffentlicht
                </label>
                <div>
                  <label className={labelCls}>Jahr</label>
                  <input type="number" className={inputCls + " w-28"} value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="2024" min="1900" max="2100" />
                </div>
              </div>

              {/* ── Page Content ─────────────────────────────────────────── */}
              <div className="lg:col-span-2 border-t border-zinc-700 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContent(v => !v)}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors w-full"
                >
                  {showContent ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Seiteninhalt (Subtitle, Langtext, Bild, Video)
                </button>
              </div>

              {showContent && (
                <>
                  <div>
                    <label className={labelCls}>Subtitle DE</label>
                    <input className={inputCls} value={form.subtitle_de} onChange={e => setForm(f => ({ ...f, subtitle_de: e.target.value }))} placeholder="Kurzbeschreibung…" />
                  </div>
                  <div>
                    <label className={labelCls}>Subtitle EN</label>
                    <input className={inputCls} value={form.subtitle_en} onChange={e => setForm(f => ({ ...f, subtitle_en: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Subtitle RU</label>
                    <input className={inputCls} value={form.subtitle_ru} onChange={e => setForm(f => ({ ...f, subtitle_ru: e.target.value }))} />
                  </div>
                  <div className="lg:col-span-2">
                    <label className={labelCls}>Volltext DE (Absätze mit Leerzeile trennen)</label>
                    <textarea className={inputCls + " resize-y"} rows={5} value={form.fullText_de} onChange={e => setForm(f => ({ ...f, fullText_de: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Volltext EN</label>
                    <textarea className={inputCls + " resize-y"} rows={5} value={form.fullText_en} onChange={e => setForm(f => ({ ...f, fullText_en: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Volltext RU</label>
                    <textarea className={inputCls + " resize-y"} rows={5} value={form.fullText_ru} onChange={e => setForm(f => ({ ...f, fullText_ru: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Hero Bild URL (Seite)</label>
                    <input className={inputCls} value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" />
                  </div>
                  <div>
                    <label className={labelCls}>YouTube ID</label>
                    <input className={inputCls} value={form.youtubeId} onChange={e => setForm(f => ({ ...f, youtubeId: e.target.value }))} placeholder="dQw4w9WgXcQ" />
                  </div>
                </>
              )}
            </div>

            {/* Sticky footer */}
            <div className="px-5 pt-3 pb-4 border-t border-zinc-800 shrink-0 space-y-2">
              {saveError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">{saveError}</div>
              )}
              <div className="flex gap-3">
                <button onClick={save} disabled={saving || !form.title_de}
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
