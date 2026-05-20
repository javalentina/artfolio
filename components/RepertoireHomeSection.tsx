"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type RepertoireRow = {
  id: string;
  composer: Record<string, string>;
  works: { en: string[]; ru: string[] } | string[] | null;
  tab: string;
  position: number;
};

type WorkEntry = { header: boolean; text: string; indented: boolean };

function getWorksList(works: RepertoireRow["works"], lang: string): string[] {
  if (!works) return [];
  if (Array.isArray(works)) return works;
  if (lang === "ru" && works.ru?.length) return works.ru;
  return works.en ?? [];
}

function parseWorks(works: RepertoireRow["works"], lang: string): WorkEntry[] {
  const source = getWorksList(works, lang);
  const result: WorkEntry[] = [];
  let inGroup = false;
  for (const w of source) {
    const t = w.trim();
    if (t.endsWith(":")) { result.push({ header: true, text: t.slice(0, -1), indented: false }); inGroup = true; }
    else result.push({ header: false, text: t, indented: inGroup });
  }
  return result;
}

function ComposerRow({ row, index, lang }: { row: RepertoireRow; index: number; lang: string }) {
  const [open, setOpen] = useState(index < 2);
  const tl = (o: Record<string, string>) => o[lang] ?? o.de ?? "";
  const works   = parseWorks(row.works, lang);
  const count   = works.filter(w => !w.header).length;

  return (
    <li>
      <button
        onClick={() => setOpen(o => !o)}
        className="group flex w-full items-baseline justify-between gap-6 py-6 text-left transition-colors hover:bg-card/40 md:py-8"
      >
        <div className="flex items-baseline gap-6 md:gap-10">
          <span className="text-[11px] tracking-[0.3em] text-primary/60 shrink-0">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="font-serif text-2xl font-light leading-tight transition-colors group-hover:text-primary md:text-3xl lg:text-4xl">
            {tl(row.composer)}
          </h3>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="hidden text-[11px] tracking-[0.3em] uppercase text-foreground/40 sm:inline">{count}</span>
          <ChevronDown className={`h-5 w-5 text-primary/70 transition-transform duration-500 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="pb-8 md:pl-[5.5rem] space-y-1">
            {works.map((w, i) =>
              w.header ? (
                <p key={i} className="pt-4 pb-1 text-[11px] tracking-[0.3em] uppercase text-primary">{w.text}</p>
              ) : (
                <p key={i} className={`text-[0.85rem] leading-[1.8] text-foreground/70 ${w.indented ? "ml-4" : ""}`}>{w.text}</p>
              )
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function RepertoireHomeSection({ rows, lang, tabOrder }: { rows: RepertoireRow[]; lang: string; tabOrder?: string[] }) {
  const rawTabs = [...new Set(rows.map(r => r.tab))];
  const tabs = tabOrder?.length
    ? rawTabs.slice().sort((a, b) => {
        const ai = tabOrder.indexOf(a); const bi = tabOrder.indexOf(b);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      })
    : rawTabs;
  const [tab, setTab] = useState(tabs[0] ?? "solo");
  const list = rows.filter(r => r.tab === tab);

  const TAB_LABELS: Record<string, Record<string, string>> = {
    solo:    { de: "Solo", en: "Solo", ru: "Соло" },
    chamber: { de: "Kammermusik", en: "Chamber Music", ru: "Камерная" },
    duo:     { de: "Duo", en: "Duo", ru: "Дуэт" },
    vocal:   { de: "Vokal", en: "Vocal", ru: "Вокал" },
  };
  const tabLabel = (k: string) => TAB_LABELS[k]?.[lang] ?? TAB_LABELS[k]?.de ?? k;

  const LABELS: Record<string, Record<string, string>> = {
    label:    { de: "Repertoire", en: "Repertoire", ru: "Репертуар" },
    title:    { de: "Ausgewählte Werke", en: "Selected Works", ru: "Избранные произведения" },
    subtitle: { de: "Ein Überblick über mein pianistisches Repertoire.", en: "An overview of my pianistic repertoire.", ru: "Обзор моего пианистического репертуара." },
    composers:{ de: "Komponisten", en: "composers", ru: "композиторов" },
  };
  const t = (k: string) => LABELS[k]?.[lang] ?? LABELS[k]?.de ?? k;

  return (
    <section id="repertoire" className="relative overflow-hidden py-28 md:py-36">
      <div aria-hidden className="pointer-events-none absolute -left-10 top-20 hidden select-none lg:block">
        <span className="font-serif text-[14rem] font-light leading-none text-primary/[0.04]">Op.</span>
      </div>

      <div className="relative mx-auto max-w-4xl px-6">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-primary" />
          <p className="text-xs tracking-[0.4em] uppercase text-primary">{t("label")}</p>
        </div>
        <h2 className="font-serif mt-6 max-w-3xl text-4xl font-light leading-[1.1] md:text-6xl lg:text-7xl">{t("title")}</h2>
        <p className="mt-8 max-w-2xl text-lg leading-[1.75] text-foreground/75">{t("subtitle")}</p>

        <div className="mt-14 flex flex-wrap items-center gap-8 border-b border-primary/15">
          {tabs.map(k => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`relative -mb-px pb-4 text-[11px] tracking-[0.3em] uppercase transition-colors ${tab === k ? "text-primary" : "text-foreground/50 hover:text-foreground"}`}
            >
              {tabLabel(k)}
              <span className={`absolute -bottom-px left-0 h-px bg-primary transition-all duration-500 ${tab === k ? "w-full" : "w-0"}`} />
            </button>
          ))}
          <span className="ml-auto text-[11px] tracking-[0.3em] uppercase text-foreground/40">
            {list.length} {t("composers")}
          </span>
        </div>

        <ul className="mt-4 divide-y divide-primary/10">
          {list.map((row, i) => <ComposerRow key={`${tab}-${row.id}`} row={row} index={i} lang={lang} />)}
        </ul>
      </div>
    </section>
  );
}
