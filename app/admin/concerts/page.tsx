"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star, StarOff, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveEntityVersion } from "../_lib";
import { cn } from "@/lib/utils";

type Concert = {
  id: string;
  title: Record<string, string>;
  date: string;
  venue: Record<string, string>;
  city: Record<string, string>;
  country: string | null;
  ticket_url: string | null;
  featured: boolean;
  published: boolean;
};

type FormData = {
  title_de: string;
  title_en: string;
  title_ru: string;
  date: string;
  time: string;
  venue_de: string;
  city_de: string;
  country: string;
  ticket_url: string;
  featured: boolean;
  published: boolean;
};

const empty: FormData = {
  title_de: "", title_en: "", title_ru: "",
  date: "", time: "",
  venue_de: "", city_de: "", country: "",
  ticket_url: "",
  featured: false, published: true,
};

const inputCls = "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none";
const labelCls = "block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider";

export default function ConcertsAdmin() {
  const supabase = createClient();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

  async function load() {
    const { data } = await supabase
      .from("concerts")
      .select("id,title,date,venue,city,country,ticket_url,featured,published")
      .eq("artist_id", ARTIST_ID)
      .order("date", { ascending: false });
    setConcerts((data ?? []) as Concert[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Auto-save draft to localStorage while form is open
  useEffect(() => {
    if (!showForm) return;
    try { localStorage.setItem(`artfolio_concert_${editing ?? "new"}`, JSON.stringify(form)); } catch {}
  }, [form, showForm, editing]);

  function tryLoadDraft(key: string): FormData | null {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
  function clearDraft(key: string) { try { localStorage.removeItem(key); } catch {} }

  const today = new Date().toISOString().split("T")[0];
  const upcoming = concerts.filter(c => c.date >= today);
  const past = concerts.filter(c => c.date < today);
  const list = tab === "upcoming" ? upcoming : past;

  function openNew() {
    const draft = tryLoadDraft("artfolio_concert_new");
    setForm(draft ?? empty);
    setDraftLoaded(!!draft);
    setEditing(null);
    setSaveError(null);
    setShowForm(true);
  }

  function openEdit(c: Concert) {
    const base: FormData = {
      title_de: c.title?.de ?? "",
      title_en: c.title?.en ?? "",
      title_ru: c.title?.ru ?? "",
      date: c.date ?? "",
      time: "",
      venue_de: c.venue?.de ?? "",
      city_de: c.city?.de ?? "",
      country: c.country ?? "",
      ticket_url: c.ticket_url ?? "",
      featured: c.featured,
      published: c.published,
    };
    const draft = tryLoadDraft(`artfolio_concert_${c.id}`);
    setForm(draft ?? base);
    setDraftLoaded(!!draft);
    setEditing(c.id);
    setSaveError(null);
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    setSaveError(null);
    const payload = {
      title: { de: form.title_de, en: form.title_en, ru: form.title_ru },
      date: form.date,
      venue: { de: form.venue_de, en: form.venue_de, ru: form.venue_de },
      city: { de: form.city_de, en: form.city_de, ru: form.city_de },
      country: form.country || null,
      ticket_url: form.ticket_url || null,
      featured: form.featured,
      published: form.published,
    };
    try {
      let savedId = editing;
      if (editing) {
        const { error } = await supabase.from("concerts").update(payload).eq("id", editing);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase.from("concerts").insert({ ...payload, artist_id: ARTIST_ID }).select("id").single();
        if (error) throw error;
        savedId = inserted?.id ?? null;
      }
      if (savedId) {
        const label = `Konzert: ${form.city_de || form.title_de} (${form.date})`;
        await saveEntityVersion(supabase, "concert", savedId, payload as Record<string, unknown>, label);
      }
      clearDraft(`artfolio_concert_${editing ?? "new"}`);
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
    if (!confirm("Konzert löschen?")) return;
    await supabase.from("concerts").delete().eq("id", id);
    load();
  }

  async function toggleFeatured(c: Concert) {
    await supabase.from("concerts").update({ featured: !c.featured }).eq("id", c.id);
    load();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Konzerte</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{upcoming.length} bevorstehend · {past.length} vergangen</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors dark:bg-zinc-900 dark:text-zinc-100"
        >
          <Plus className="h-4 w-4" />
          Neu
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-zinc-800 dark:border-zinc-800">
        {(["upcoming", "past"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "pb-3 text-sm transition-colors",
              tab === t
                ? "border-b-2 border-zinc-900 font-medium text-zinc-100 dark:border-white dark:text-white"
                : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            {t === "upcoming" ? "Bevorstehend" : "Vergangen"}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <p className="text-sm text-zinc-400">Wird geladen…</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-zinc-400">Keine Konzerte</p>
      ) : (
        <div className="space-y-2">
          {list.map(c => (
            <div
              key={c.id}
              className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-100 dark:text-zinc-100 truncate">
                  {c.title?.de || c.title?.en || "–"}
                </p>
                <p className="text-sm text-zinc-500 mt-0.5">
                  {c.date} · {c.venue?.de || "–"} · {c.city?.de || "–"}
                </p>
              </div>
              <div className="flex items-center shrink-0">
                <button onClick={() => toggleFeatured(c)} className="p-2.5 text-zinc-500 hover:text-amber-400 transition-colors" title={c.featured ? "Featured entfernen" : "Featured setzen"}>
                  {c.featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                </button>
                <button onClick={() => openEdit(c)} className="p-2.5 text-zinc-500 hover:text-zinc-200 transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(c.id)} className="p-2.5 text-zinc-500 hover:text-red-500 transition-colors">
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
              <h2 className="font-medium text-zinc-100">{editing ? "Konzert bearbeiten" : "Neues Konzert"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Draft restored banner */}
            {draftLoaded && (
              <div className="mx-5 mt-3 flex items-center justify-between rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-400 shrink-0">
                <span>Nicht gespeicherte Änderungen wiederhergestellt</span>
                <button onClick={() => { setDraftLoaded(false); clearDraft(`artfolio_concert_${editing ?? "new"}`); setForm(empty); }} className="ml-3 underline hover:text-amber-200 shrink-0">Verwerfen</button>
              </div>
            )}

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:gap-y-5 lg:space-y-0 lg:content-start">

              <div className="lg:col-span-2">
                <label className={labelCls}>Titel (DE)</label>
                <input className={inputCls} value={form.title_de} onChange={e => setForm(f => ({ ...f, title_de: e.target.value }))} placeholder="Konzertabend…" />
              </div>
              <div>
                <label className={labelCls}>Titel (EN)</label>
                <input className={inputCls} value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Titel (RU)</label>
                <input className={inputCls} value={form.title_ru} onChange={e => setForm(f => ({ ...f, title_ru: e.target.value }))} />
              </div>

              <div>
                <label className={labelCls}>Datum *</label>
                <input type="date" className={inputCls} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Uhrzeit</label>
                <input type="time" className={inputCls} value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </div>

              <div className="lg:col-span-2">
                <label className={labelCls}>Venue</label>
                <input className={inputCls} value={form.venue_de} onChange={e => setForm(f => ({ ...f, venue_de: e.target.value }))} placeholder="Elbphilharmonie" />
              </div>
              <div>
                <label className={labelCls}>Stadt</label>
                <input className={inputCls} value={form.city_de} onChange={e => setForm(f => ({ ...f, city_de: e.target.value }))} placeholder="Hamburg" />
              </div>
              <div>
                <label className={labelCls}>Land</label>
                <input className={inputCls} value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="DE" />
              </div>

              <div className="lg:col-span-2">
                <label className={labelCls}>Ticket URL</label>
                <input className={inputCls} value={form.ticket_url} onChange={e => setForm(f => ({ ...f, ticket_url: e.target.value }))} placeholder="https://…" />
              </div>

              <div className="flex gap-6 pt-1 lg:col-span-2">
                <label className="flex items-center gap-3 text-sm text-zinc-300 cursor-pointer">
                  <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="h-4 w-4 rounded accent-amber-400" />
                  Veröffentlicht
                </label>
                <label className="flex items-center gap-3 text-sm text-zinc-300 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="h-4 w-4 rounded accent-amber-400" />
                  Featured
                </label>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="px-5 pt-3 pb-4 border-t border-zinc-800 shrink-0 space-y-2">
              {saveError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">{saveError}</div>
              )}
              <div className="flex gap-3">
                <button onClick={save} disabled={saving || !form.date}
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
