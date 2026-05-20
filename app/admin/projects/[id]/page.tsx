"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveEntityVersion } from "../../_lib";
import { ArrowLeft, Check, ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

const iCls = "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none";
const lCls = "block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider";

/* ── Types ──────────────────────────────────────────────────────────── */

type ML = { de: string; en: string; ru: string };
const emptyML = (): ML => ({ de: "", en: "", ru: "" });
function mlFrom(v: unknown): ML {
  if (!v || typeof v !== "object") return emptyML();
  const m = v as Record<string, string>;
  return { de: m.de ?? "", en: m.en ?? "", ru: m.ru ?? "" };
}
function str(v: unknown): string { return typeof v === "string" ? v : ""; }
function uid() { return Math.random().toString(36).slice(2, 10); }

type Performer   = { id: string; name: string; roleDE: string; roleEN: string; roleRU: string; photoUrl: string };
type FlowStep    = { id: string; titleDE: string; titleEN: string; titleRU: string; textDE: string; textEN: string; textRU: string };
type Testimonial = { id: string; name: string; professionDE: string; professionEN: string; professionRU: string; textDE: string; textEN: string; textRU: string };

type Content = {
  subtitle: ML; fullText: ML; imageUrl: string; youtubeId: string; heroCta: ML;
  flowSteps: FlowStep[]; statDuration: ML; statFormat: ML; statPartner: string;
  performers: Performer[]; testimonials: Testimonial[]; gallery: string[];
  partnerTitle: ML; partnerBody: ML; eventEmail: string;
  eventWhen: ML; eventWhere: ML; eventDuration: ML; eventNote: ML; eventTickets: ML;
  conversionTitle: ML; conversionSubtitle: ML; conversionLabel: ML; conversionUrgency: ML;
};

function emptyContent(): Content {
  return {
    subtitle: emptyML(), fullText: emptyML(), imageUrl: "", youtubeId: "", heroCta: emptyML(),
    flowSteps: [], statDuration: emptyML(), statFormat: emptyML(), statPartner: "",
    performers: [], testimonials: [], gallery: [],
    partnerTitle: emptyML(), partnerBody: emptyML(), eventEmail: "",
    eventWhen: emptyML(), eventWhere: emptyML(), eventDuration: emptyML(),
    eventNote: emptyML(), eventTickets: emptyML(),
    conversionTitle: emptyML(), conversionSubtitle: emptyML(),
    conversionLabel: emptyML(), conversionUrgency: emptyML(),
  };
}

function fromDB(c: Record<string, unknown>): Content {
  return {
    subtitle:          mlFrom(c.subtitle),
    fullText:          mlFrom(c.fullText),
    imageUrl:          str(c.imageUrl),
    youtubeId:         str(c.youtubeId),
    heroCta:           mlFrom(c.heroCta),
    flowSteps:         ((c.flowSteps as FlowStep[]) ?? []).map(s => ({
      id: s.id ?? uid(), titleDE: s.titleDE ?? "", titleEN: s.titleEN ?? "", titleRU: s.titleRU ?? "",
      textDE: s.textDE ?? "", textEN: s.textEN ?? "", textRU: s.textRU ?? "",
    })),
    statDuration:      mlFrom(c.statDuration),
    statFormat:        mlFrom(c.statFormat),
    statPartner:       str(c.statPartner),
    performers:        ((c.performers as Performer[]) ?? []).map(p => ({
      id: p.id ?? uid(), name: p.name ?? "", roleDE: p.roleDE ?? "", roleEN: p.roleEN ?? "",
      roleRU: p.roleRU ?? "", photoUrl: p.photoUrl ?? "",
    })),
    testimonials:      ((c.testimonials as Testimonial[]) ?? []).map(t => ({
      id: t.id ?? uid(), name: t.name ?? "", professionDE: t.professionDE ?? "",
      professionEN: t.professionEN ?? "", professionRU: t.professionRU ?? "",
      textDE: t.textDE ?? "", textEN: t.textEN ?? "", textRU: t.textRU ?? "",
    })),
    gallery:           (c.gallery as string[]) ?? [],
    partnerTitle:      mlFrom(c.partnerTitle),
    partnerBody:       mlFrom(c.partnerBody),
    eventEmail:        str(c.eventEmail),
    eventWhen:         mlFrom(c.eventWhen),
    eventWhere:        mlFrom(c.eventWhere),
    eventDuration:     mlFrom(c.eventDuration),
    eventNote:         mlFrom(c.eventNote),
    eventTickets:      mlFrom(c.eventTickets),
    conversionTitle:   mlFrom(c.conversionTitle),
    conversionSubtitle:mlFrom(c.conversionSubtitle),
    conversionLabel:   mlFrom(c.conversionLabel),
    conversionUrgency: mlFrom(c.conversionUrgency),
  };
}

/* ── Small reusable inputs ──────────────────────────────────────────── */

const LANGS = ["DE", "EN", "RU"] as const;
const langKey = (l: string) => l.toLowerCase() as "de" | "en" | "ru";

function MLInput({ label, val, set }: { label: string; val: ML; set: (v: ML) => void }) {
  return (
    <div>
      <p className={lCls}>{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
        {LANGS.map(l => (
          <div key={l}>
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{l}</span>
            <input className={iCls + " mt-0.5"} value={val[langKey(l)]}
              onChange={e => set({ ...val, [langKey(l)]: e.target.value })} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MLArea({ label, val, set, rows = 4 }: { label: string; val: ML; set: (v: ML) => void; rows?: number }) {
  return (
    <div>
      <p className={lCls}>{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
        {LANGS.map(l => (
          <div key={l}>
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{l}</span>
            <textarea className={iCls + " resize-y mt-0.5"} rows={rows} value={val[langKey(l)]}
              onChange={e => set({ ...val, [langKey(l)]: e.target.value })} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-5">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

/* ── Tabs ────────────────────────────────────────────────────────────── */

const TABS = [
  { key: "hero",    label: "Hero" },
  { key: "text",    label: "Texte" },
  { key: "flow",    label: "Ablauf" },
  { key: "people",  label: "Personen" },
  { key: "gallery", label: "Galerie" },
  { key: "booking", label: "Buchung" },
] as const;
type Tab = typeof TABS[number]["key"];

/* ── Main component ──────────────────────────────────────────────────── */

export default function ProjectContentEditor() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();

  const [title, setTitle]     = useState("");
  const [slug, setSlug]       = useState("");
  const [content, setContent] = useState<Content>(emptyContent());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [tab, setTab]         = useState<Tab>("hero");

  useEffect(() => {
    supabase.from("projects").select("title,slug,content").eq("id", id).single()
      .then(({ data }) => {
        if (!data) return;
        const t = (data.title ?? {}) as Record<string, string>;
        setTitle(t.de ?? t.en ?? "Projekt");
        setSlug(data.slug ?? "");
        setContent(fromDB((data.content ?? {}) as Record<string, unknown>));
        setLoading(false);
      });
  }, [id]);

  const upd = useCallback(<K extends keyof Content>(key: K, val: Content[K]) => {
    setContent(c => ({ ...c, [key]: val }));
  }, []);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("projects").update({ content }).eq("id", id);
    if (!error) {
      await saveEntityVersion(supabase, "project_content", id, content as Record<string, unknown>, `Seiteninhalt: ${title}`);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32 text-zinc-500">
      <Loader2 className="h-6 w-6 animate-spin mr-3" /> Wird geladen…
    </div>
  );

  return (
    <div>
      {/* ── Sticky header ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 -mx-4 md:-mx-10 xl:-mx-12 px-4 md:px-10 xl:px-12 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 pb-0 pt-3">
        <div className="flex items-center justify-between gap-4 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin/projects" className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-light text-zinc-100 truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {slug && (
              <a href={`/de/projects/${slug}`} target="_blank" rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors">
                <ExternalLink className="h-3.5 w-3.5" /> Vorschau
              </a>
            )}
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-40 transition-colors">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saved ? "Gespeichert!" : saving ? "Speichert…" : "Speichern"}
            </button>
          </div>
        </div>
        {/* Tab bar */}
        <div className="flex overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${tab === t.key ? "border-zinc-100 text-zinc-100 font-medium" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ───────────────────────────────────────────── */}
      <div className="pt-6 space-y-5 pb-24">

        {/* HERO */}
        {tab === "hero" && <>
          <Card title="Hero-Bild">
            <div>
              <label className={lCls}>Bild-URL</label>
              <input className={iCls} value={content.imageUrl} onChange={e => upd("imageUrl", e.target.value)} placeholder="https://…" />
            </div>
            {content.imageUrl && (
              <img src={content.imageUrl} alt="" className="h-40 w-full rounded-xl object-cover border border-zinc-800" />
            )}
          </Card>
          <Card title="Untertitel (kursiv unter dem Titel)">
            <MLArea label="Subtitle" val={content.subtitle} set={v => upd("subtitle", v)} rows={2} />
          </Card>
          <Card title="Hero-Button Beschriftung">
            <MLInput label="CTA-Button Text" val={content.heroCta} set={v => upd("heroCta", v)} />
            <p className="text-xs text-zinc-600">Leer lassen → Standard: Reservieren / Reserve / Забронировать</p>
          </Card>
        </>}

        {/* TEXTE */}
        {tab === "text" && <>
          <Card title="Haupttext / Konzept">
            <MLArea label="Volltext (Absätze mit Leerzeile trennen)" val={content.fullText} set={v => upd("fullText", v)} rows={10} />
          </Card>
          <Card title="YouTube Video">
            <div>
              <label className={lCls}>Video-ID</label>
              <input className={iCls} value={content.youtubeId} onChange={e => upd("youtubeId", e.target.value)} placeholder="dQw4w9WgXcQ" />
              <p className="text-xs text-zinc-600 mt-1">Nur die ID: youtube.com/watch?v=<strong className="text-zinc-400">dQw4w9WgXcQ</strong></p>
            </div>
            {content.youtubeId && (
              <div className="aspect-video rounded-xl overflow-hidden border border-zinc-800">
                <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${content.youtubeId}`} allowFullScreen />
              </div>
            )}
          </Card>
        </>}

        {/* ABLAUF */}
        {tab === "flow" && <>
          <Card title="Ablauf-Schritte">
            <div className="space-y-3">
              {content.flowSteps.map((step, i) => (
                <div key={step.id} className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-mono">Schritt {i + 1}</span>
                    <button onClick={() => upd("flowSteps", content.flowSteps.filter((_, j) => j !== i))}
                      className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {LANGS.map(l => (
                      <div key={l}>
                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Titel {l}</span>
                        <input className={iCls + " mt-0.5"} value={step[`title${l}` as keyof FlowStep] as string}
                          onChange={e => upd("flowSteps", content.flowSteps.map((s, j) => j === i ? { ...s, [`title${l}`]: e.target.value } : s))} />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {LANGS.map(l => (
                      <div key={l}>
                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Text {l}</span>
                        <textarea className={iCls + " resize-none mt-0.5"} rows={3}
                          value={step[`text${l}` as keyof FlowStep] as string}
                          onChange={e => upd("flowSteps", content.flowSteps.map((s, j) => j === i ? { ...s, [`text${l}`]: e.target.value } : s))} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={() => upd("flowSteps", [...content.flowSteps, { id: uid(), titleDE: "", titleEN: "", titleRU: "", textDE: "", textEN: "", textRU: "" }])}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 py-3 text-sm text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors">
                <Plus className="h-4 w-4" /> Schritt hinzufügen
              </button>
            </div>
          </Card>
          <Card title="Statistiken (unter den Schritten)">
            <MLInput label="Dauer" val={content.statDuration} set={v => upd("statDuration", v)} />
            <MLInput label="Format" val={content.statFormat} set={v => upd("statFormat", v)} />
            <div>
              <label className={lCls}>Partner (einsprachig)</label>
              <input className={iCls} value={content.statPartner} onChange={e => upd("statPartner", e.target.value)} placeholder="Staatsoper Berlin" />
            </div>
          </Card>
        </>}

        {/* PERSONEN */}
        {tab === "people" && <>
          <Card title="Ensemble / Mitwirkende">
            <div className="space-y-3">
              {content.performers.map((p, i) => (
                <div key={p.id} className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">{p.name || `Person ${i + 1}`}</span>
                    <button onClick={() => upd("performers", content.performers.filter((_, j) => j !== i))}
                      className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={lCls}>Name</label>
                      <input className={iCls} value={p.name}
                        onChange={e => upd("performers", content.performers.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                    </div>
                    <div>
                      <label className={lCls}>Foto URL</label>
                      <input className={iCls} value={p.photoUrl} placeholder="https://…"
                        onChange={e => upd("performers", content.performers.map((x, j) => j === i ? { ...x, photoUrl: e.target.value } : x))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {LANGS.map(l => (
                      <div key={l}>
                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Rolle {l}</span>
                        <input className={iCls + " mt-0.5"} value={p[`role${l}` as keyof Performer] as string} placeholder="Cellistin"
                          onChange={e => upd("performers", content.performers.map((x, j) => j === i ? { ...x, [`role${l}`]: e.target.value } : x))} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={() => upd("performers", [...content.performers, { id: uid(), name: "", roleDE: "", roleEN: "", roleRU: "", photoUrl: "" }])}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 py-3 text-sm text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors">
                <Plus className="h-4 w-4" /> Person hinzufügen
              </button>
            </div>
          </Card>

          <Card title="Stimmen / Bewertungen">
            <div className="space-y-3">
              {content.testimonials.map((t, i) => (
                <div key={t.id} className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">{t.name || `Person ${i + 1}`}</span>
                    <button onClick={() => upd("testimonials", content.testimonials.filter((_, j) => j !== i))}
                      className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div>
                    <label className={lCls}>Name</label>
                    <input className={iCls} value={t.name}
                      onChange={e => upd("testimonials", content.testimonials.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {LANGS.map(l => (
                      <div key={l}>
                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Beruf {l}</span>
                        <input className={iCls + " mt-0.5"} value={t[`profession${l}` as keyof Testimonial] as string}
                          onChange={e => upd("testimonials", content.testimonials.map((x, j) => j === i ? { ...x, [`profession${l}`]: e.target.value } : x))} />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {LANGS.map(l => (
                      <div key={l}>
                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Zitat {l}</span>
                        <textarea className={iCls + " resize-none mt-0.5"} rows={4}
                          value={t[`text${l}` as keyof Testimonial] as string}
                          onChange={e => upd("testimonials", content.testimonials.map((x, j) => j === i ? { ...x, [`text${l}`]: e.target.value } : x))} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={() => upd("testimonials", [...content.testimonials, { id: uid(), name: "", professionDE: "", professionEN: "", professionRU: "", textDE: "", textEN: "", textRU: "" }])}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 py-3 text-sm text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors">
                <Plus className="h-4 w-4" /> Stimme hinzufügen
              </button>
            </div>
          </Card>
        </>}

        {/* GALERIE */}
        {tab === "gallery" && <>
          <Card title="Galerie-Bilder">
            <div className="space-y-2">
              {content.gallery.map((url, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input className={iCls + " flex-1"} value={url} placeholder="https://…"
                    onChange={e => upd("gallery", content.gallery.map((u, j) => j === i ? e.target.value : u))} />
                  {url && <img src={url} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover border border-zinc-700" />}
                  <button onClick={() => upd("gallery", content.gallery.filter((_, j) => j !== i))}
                    className="shrink-0 text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              <button onClick={() => upd("gallery", [...content.gallery, ""])}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 py-3 text-sm text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors">
                <Plus className="h-4 w-4" /> Bild hinzufügen
              </button>
            </div>
            <p className="text-xs text-zinc-600">Tipp: Lade Bilder in Galerie-Admin hoch → Kopieren-Button → URL hier einfügen.</p>
          </Card>
          <Card title="Partner / Kooperationspartner">
            <MLInput label="Titel" val={content.partnerTitle} set={v => upd("partnerTitle", v)} />
            <MLArea label="Beschreibung (Absätze mit Leerzeile)" val={content.partnerBody} set={v => upd("partnerBody", v)} rows={5} />
          </Card>
        </>}

        {/* BUCHUNG */}
        {tab === "booking" && <>
          <Card title="Kontakt & Buchung">
            <div>
              <label className={lCls}>E-Mail Adresse</label>
              <input className={iCls} type="email" value={content.eventEmail} onChange={e => upd("eventEmail", e.target.value)} placeholder="booking@example.com" />
              <p className="text-xs text-zinc-600 mt-1">Erscheint als "Reservieren" und "Frage stellen" Button auf der Seite.</p>
            </div>
          </Card>
          <Card title="Event-Daten">
            <MLInput label="Wann" val={content.eventWhen} set={v => upd("eventWhen", v)} />
            <MLInput label="Wo / Ort" val={content.eventWhere} set={v => upd("eventWhere", v)} />
            <MLInput label="Dauer" val={content.eventDuration} set={v => upd("eventDuration", v)} />
            <MLInput label="Hinweis / Zusatzinfo" val={content.eventNote} set={v => upd("eventNote", v)} />
            <MLInput label="Ticket-Info" val={content.eventTickets} set={v => upd("eventTickets", v)} />
          </Card>
          <Card title="Conversion Block (CTA am Seitenende)">
            <MLInput label="Label (z.B. 'Bereit?')" val={content.conversionLabel} set={v => upd("conversionLabel", v)} />
            <MLInput label="Haupttitel" val={content.conversionTitle} set={v => upd("conversionTitle", v)} />
            <MLArea label="Untertitel" val={content.conversionSubtitle} set={v => upd("conversionSubtitle", v)} rows={2} />
            <MLInput label="Dringlichkeitstext (kleine Zeile)" val={content.conversionUrgency} set={v => upd("conversionUrgency", v)} />
          </Card>
        </>}

      </div>
    </div>
  );
}
