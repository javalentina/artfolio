"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { loadSettings, patchSettings, uid, inputCls, labelCls, cardCls, saveBtnCls, type S } from "../_lib";
import { createClient } from "@/lib/supabase/client";

type EducationEntry = { id: string; years: string; school: S; detail: S };
type AwardEntry     = { id: string; year: string;  text: S };
type LangEntry      = { id: string; name: string;  level: string };
type ExpEntry       = { id: string; place: string; years: string };

function SaveBtn({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={saving} className={saveBtnCls}>
      <Check className="h-4 w-4" />
      {saved ? "Gespeichert!" : saving ? "Speichert…" : "Speichern"}
    </button>
  );
}

const LANGS = ["de", "en", "ru"] as const;

export default function LebenslaufAdmin() {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [education,  setEducation]  = useState<EducationEntry[]>([]);
  const [awards,     setAwards]     = useState<AwardEntry[]>([]);
  const [languages,  setLanguages]  = useState<LangEntry[]>([]);
  const [experience, setExperience] = useState<ExpEntry[]>([]);
  const [actDE, setActDE] = useState("");
  const [actEN, setActEN] = useState("");
  const [actRU, setActRU] = useState("");
  const [ctrDE, setCtrDE] = useState("");
  const [ctrEN, setCtrEN] = useState("");
  const [ctrRU, setCtrRU] = useState("");
  const [phone,    setPhone]    = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    loadSettings(supabase).then(({ settings: cfg }) => {
      const r = (cfg.resume ?? {}) as S;
      setEducation( (r.education  as EducationEntry[]) ?? []);
      setAwards(    (r.awards     as AwardEntry[])     ?? []);
      setLanguages( (r.languages  as LangEntry[])      ?? []);
      setExperience((r.experience as ExpEntry[])       ?? []);
      const act = (r.concertActivity ?? {}) as S;
      setActDE((act.de as string) ?? "");
      setActEN((act.en as string) ?? "");
      setActRU((act.ru as string) ?? "");
      const ctr = (r.concertCountries ?? {}) as S;
      setCtrDE((ctr.de as string) ?? "");
      setCtrEN((ctr.en as string) ?? "");
      setCtrRU((ctr.ru as string) ?? "");
      setPhone(    (r.phone    as string) ?? "");
      setLocation( (r.location as string) ?? "");
    });
  }, []);

  async function save() {
    setSaving(true);
    await patchSettings(supabase, {
      resume: {
        education, awards, languages, experience,
        concertActivity:  { de: actDE, en: actEN, ru: actRU },
        concertCountries: { de: ctrDE, en: ctrEN, ru: ctrRU },
        phone, location,
      },
    }, "Lebenslauf");
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  }

  const toggle = (id: string) => setExpanded(x => x === id ? null : id);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-light tracking-wide">Lebenslauf</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Ausbildung, Preise, Sprachen, Unterricht, Konzerttätigkeit</p>
      </div>

      {/* ── Education ── */}
      <div className={cardCls}>
        <h2 className="text-sm font-medium text-zinc-300">Ausbildung</h2>
        {education.map(e => (
          <div key={e.id} className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
            <button className="flex w-full items-center justify-between px-4 py-3" onClick={() => toggle(e.id)}>
              <span className="text-sm text-zinc-100">{e.years || "—"} · {(e.school.de as string) || "Neue Institution"}</span>
              {expanded === e.id ? <ChevronUp className="h-4 w-4 text-zinc-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />}
            </button>
            {expanded === e.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-zinc-800 pt-3">
                <div><label className={labelCls}>Jahre</label>
                  <input className={inputCls} value={e.years} onChange={ev => setEducation(es => es.map(x => x.id === e.id ? { ...x, years: ev.target.value } : x))} placeholder="2023 – 2025" /></div>
                {LANGS.map(l => (
                  <div key={l}><label className={labelCls}>Schule {l.toUpperCase()}</label>
                    <input className={inputCls} value={(e.school[l] as string) ?? ""} onChange={ev => setEducation(es => es.map(x => x.id === e.id ? { ...x, school: { ...x.school, [l]: ev.target.value } } : x))} /></div>
                ))}
                {LANGS.map(l => (
                  <div key={l}><label className={labelCls}>Detail {l.toUpperCase()}</label>
                    <input className={inputCls} value={(e.detail[l] as string) ?? ""} onChange={ev => setEducation(es => es.map(x => x.id === e.id ? { ...x, detail: { ...x.detail, [l]: ev.target.value } } : x))} /></div>
                ))}
                <button onClick={() => setEducation(es => es.filter(x => x.id !== e.id))} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 mt-1">
                  <Trash2 className="h-3 w-3" /> Löschen
                </button>
              </div>
            )}
          </div>
        ))}
        <button onClick={() => { const id = uid(); setEducation(es => [...es, { id, years: "", school: { de: "", en: "", ru: "" }, detail: { de: "", en: "", ru: "" } }]); setExpanded(id); }}
          className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-700 px-4 py-2.5 text-sm text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 w-full">
          <Plus className="h-4 w-4" /> Eintrag hinzufügen
        </button>
      </div>

      {/* ── Awards ── */}
      <div className={cardCls}>
        <h2 className="text-sm font-medium text-zinc-300">Preise & Auszeichnungen</h2>
        {awards.map(a => (
          <div key={a.id} className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
            <button className="flex w-full items-center justify-between px-4 py-3" onClick={() => toggle(a.id)}>
              <span className="text-sm text-zinc-100">{a.year || "—"} · {(a.text.de as string) || "Neuer Preis"}</span>
              {expanded === a.id ? <ChevronUp className="h-4 w-4 text-zinc-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />}
            </button>
            {expanded === a.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-zinc-800 pt-3">
                <div><label className={labelCls}>Jahr</label>
                  <input className={inputCls} value={a.year} onChange={ev => setAwards(as_ => as_.map(x => x.id === a.id ? { ...x, year: ev.target.value } : x))} placeholder="2021" /></div>
                {LANGS.map(l => (
                  <div key={l}><label className={labelCls}>Text {l.toUpperCase()}</label>
                    <input className={inputCls} value={(a.text[l] as string) ?? ""} onChange={ev => setAwards(as_ => as_.map(x => x.id === a.id ? { ...x, text: { ...x.text, [l]: ev.target.value } } : x))} /></div>
                ))}
                <button onClick={() => setAwards(as_ => as_.filter(x => x.id !== a.id))} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 mt-1">
                  <Trash2 className="h-3 w-3" /> Löschen
                </button>
              </div>
            )}
          </div>
        ))}
        <button onClick={() => { const id = uid(); setAwards(as_ => [...as_, { id, year: "", text: { de: "", en: "", ru: "" } }]); setExpanded(id); }}
          className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-700 px-4 py-2.5 text-sm text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 w-full">
          <Plus className="h-4 w-4" /> Eintrag hinzufügen
        </button>
      </div>

      {/* ── Teaching Experience ── */}
      <div className={cardCls}>
        <h2 className="text-sm font-medium text-zinc-300">Unterrichtstätigkeit</h2>
        {experience.map(e => (
          <div key={e.id} className="flex items-center gap-3">
            <input className={inputCls} value={e.years} onChange={ev => setExperience(es => es.map(x => x.id === e.id ? { ...x, years: ev.target.value } : x))} placeholder="2023 – heute" />
            <input className={inputCls} value={e.place} onChange={ev => setExperience(es => es.map(x => x.id === e.id ? { ...x, place: ev.target.value } : x))} placeholder="Studio Lübeck" />
            <button onClick={() => setExperience(es => es.filter(x => x.id !== e.id))} className="shrink-0 text-zinc-600 hover:text-red-500 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button onClick={() => setExperience(es => [...es, { id: uid(), years: "", place: "" }])}
          className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-700 px-4 py-2.5 text-sm text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 w-full">
          <Plus className="h-4 w-4" /> Eintrag hinzufügen
        </button>
      </div>

      {/* ── Languages ── */}
      <div className={cardCls}>
        <h2 className="text-sm font-medium text-zinc-300">Sprachen</h2>
        {languages.map(l => (
          <div key={l.id} className="flex items-center gap-3">
            <input className={inputCls} value={l.name} onChange={ev => setLanguages(ls => ls.map(x => x.id === l.id ? { ...x, name: ev.target.value } : x))} placeholder="Russisch / Russian" />
            <input className={inputCls} value={l.level} onChange={ev => setLanguages(ls => ls.map(x => x.id === l.id ? { ...x, level: ev.target.value } : x))} placeholder="Muttersprache" />
            <button onClick={() => setLanguages(ls => ls.filter(x => x.id !== l.id))} className="shrink-0 text-zinc-600 hover:text-red-500 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button onClick={() => setLanguages(ls => [...ls, { id: uid(), name: "", level: "" }])}
          className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-700 px-4 py-2.5 text-sm text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 w-full">
          <Plus className="h-4 w-4" /> Sprache hinzufügen
        </button>
      </div>

      {/* ── Concert Activity ── */}
      <div className={cardCls}>
        <h2 className="text-sm font-medium text-zinc-300">Konzerttätigkeit</h2>
        {(["de", "en", "ru"] as const).map((l, i) => {
          const val  = [actDE, actEN, actRU][i];
          const setV = [setActDE, setActEN, setActRU][i];
          return (
            <div key={l}>
              <label className={labelCls}>{l.toUpperCase()}</label>
              <textarea className={inputCls + " resize-none"} rows={4} value={val} onChange={e => setV(e.target.value)} />
            </div>
          );
        })}
        <h2 className="text-sm font-medium text-zinc-300 pt-2">Konzertländer</h2>
        {(["de", "en", "ru"] as const).map((l, i) => {
          const val  = [ctrDE, ctrEN, ctrRU][i];
          const setV = [setCtrDE, setCtrEN, setCtrRU][i];
          return (
            <div key={l}>
              <label className={labelCls}>{l.toUpperCase()}</label>
              <input className={inputCls} value={val} onChange={e => setV(e.target.value)} />
            </div>
          );
        })}
      </div>

      {/* ── Contact ── */}
      <div className={cardCls}>
        <h2 className="text-sm font-medium text-zinc-300">Kontakt & Standort</h2>
        <div><label className={labelCls}>Telefon</label>
          <input className={inputCls} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+49 176 …" /></div>
        <div><label className={labelCls}>Standort</label>
          <input className={inputCls} value={location} onChange={e => setLocation(e.target.value)} placeholder="Lübeck, …" /></div>
      </div>

      <SaveBtn saving={saving} saved={saved} onClick={save} />
    </div>
  );
}
