"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loadSettings, patchSettings, inputCls, labelCls, cardCls, saveBtnCls } from "../_lib";

const SECTIONS = [
  {
    key: "bio",
    heading: "Biografie",
    fields: [
      { id: "bio_title", label: "Biografie Untertitel (unter dem Namen)" },
    ],
  },
  {
    key: "concerts",
    heading: "Konzerte",
    fields: [
      { id: "con_title", label: "Konzerte — Hauptüberschrift" },
    ],
  },
  {
    key: "videos",
    heading: "Videos",
    fields: [
      { id: "vid_title", label: "Videos — Hauptüberschrift" },
    ],
  },
  {
    key: "gallery",
    heading: "Galerie",
    fields: [
      { id: "gal_title", label: "Galerie — Hauptüberschrift" },
    ],
  },
  {
    key: "projects",
    heading: "Projekte",
    fields: [
      { id: "proj_title", label: "Projekte — Hauptüberschrift" },
    ],
  },
  {
    key: "repertoire",
    heading: "Repertoire",
    fields: [
      { id: "rep_title", label: "Repertoire — Hauptüberschrift" },
    ],
  },
  {
    key: "career",
    heading: "Werdegang",
    fields: [
      { id: "car_divider", label: "Werdegang — Trennzeichen-Text" },
    ],
  },
  {
    key: "publications",
    heading: "Bücher",
    fields: [
      { id: "pub_title", label: "Bücher — Hauptüberschrift" },
    ],
  },
  {
    key: "contact",
    heading: "Kontakt",
    fields: [
      { id: "ct_sub", label: "Kontakt — Untertitel" },
    ],
  },
] as const;

type FieldId = typeof SECTIONS[number]["fields"][number]["id"];
type LabelMap = Record<FieldId, { de: string; en: string; ru: string }>;

const DEFAULTS: Record<string, Record<string, string>> = {
  bio_title:   { de: "Konzertpianistin,\nPädagogin & Projektleiterin", en: "Concert Pianist,\nEducator & Project Leader", ru: "Концертный пианист,\nПедагог & Руководитель проектов" },
  con_title:   { de: "Kommende Auftritte", en: "Upcoming Performances", ru: "Ближайшие концерты" },
  vid_title:   { de: "Aufzeichnungen von Auftritten", en: "Recordings", ru: "Записи" },
  gal_title:   { de: "Momente auf der Bühne", en: "Moments on Stage", ru: "Моменты на сцене" },
  proj_title:  { de: "Kreative & Bildungsprojekte", en: "Creative & Educational Projects", ru: "Творческие проекты" },
  rep_title:   { de: "Ausgewählte Werke", en: "Selected Works", ru: "Избранные произведения" },
  car_divider: { de: "Werdegang · Career", en: "Career", ru: "Карьера" },
  pub_title:   { de: "Bücher", en: "Books", ru: "Книги" },
  ct_sub:      { de: "Für Konzertanfragen, Unterricht oder Projekte — ich freue mich auf Ihre Nachricht.", en: "For concert enquiries, lessons, or projects — I look forward to hearing from you.", ru: "По вопросам концертов, уроков или проектов — буду рада вашему сообщению." },
};

function emptyMap(): LabelMap {
  const m = {} as LabelMap;
  for (const id of Object.keys(DEFAULTS) as FieldId[]) {
    m[id] = { de: "", en: "", ru: "" };
  }
  return m;
}

export default function LabelsAdmin() {
  const supabase = createClient();
  const [labels, setLabels] = useState<LabelMap>(emptyMap());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    loadSettings(supabase).then(({ settings }) => {
      const stored = (settings.section_labels ?? {}) as Record<string, Record<string, string>>;
      const m = emptyMap();
      for (const id of Object.keys(DEFAULTS) as FieldId[]) {
        const def = DEFAULTS[id];
        const s   = stored[id] ?? {};
        m[id] = {
          de: s.de ?? def.de ?? "",
          en: s.en ?? def.en ?? "",
          ru: s.ru ?? def.ru ?? "",
        };
      }
      setLabels(m);
    });
  }, []);

  async function save() {
    setSaving(true);
    await patchSettings(supabase, { section_labels: labels }, "Sektion-Texte");
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-light tracking-wide">Sektion-Texte</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Überschriften der Homepage-Sektionen in drei Sprachen bearbeiten</p>
      </div>

      {SECTIONS.map(section => (
        <div key={section.key} className={cardCls}>
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">{section.heading}</h2>
          {section.fields.map(field => (
            <div key={field.id} className="space-y-3">
              <p className="text-xs text-zinc-500">{field.label}</p>
              {(["de", "en", "ru"] as const).map(lang => (
                <div key={lang}>
                  <label className={labelCls}>{lang.toUpperCase()}</label>
                  {DEFAULTS[field.id]?.de?.includes("\n") ? (
                    <textarea
                      rows={2}
                      className={inputCls + " resize-none"}
                      value={labels[field.id]?.[lang] ?? ""}
                      onChange={e => setLabels(l => ({ ...l, [field.id]: { ...l[field.id], [lang]: e.target.value } }))}
                      placeholder={DEFAULTS[field.id]?.[lang] ?? ""}
                    />
                  ) : (
                    <input
                      className={inputCls}
                      value={labels[field.id]?.[lang] ?? ""}
                      onChange={e => setLabels(l => ({ ...l, [field.id]: { ...l[field.id], [lang]: e.target.value } }))}
                      placeholder={DEFAULTS[field.id]?.[lang] ?? ""}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      <button onClick={save} disabled={saving} className={saveBtnCls}>
        <Check className="h-4 w-4" />
        {saved ? "Gespeichert!" : saving ? "Speichert…" : "Speichern"}
      </button>
    </div>
  );
}
