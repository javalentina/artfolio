"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MediaImageInput } from "../../_components/MediaImageInput";

type Lang = "de" | "en" | "ru";
const LANGS: Lang[] = ["de", "en", "ru"];

type BlockType = "heading" | "text" | "image" | "quote" | "divider" | "two_col" | "spacer";

const BLOCK_LABELS: Record<BlockType, string> = {
  heading: "Überschrift",
  text: "Text",
  image: "Bild",
  quote: "Zitat",
  divider: "Trennlinie",
  two_col: "Zwei Spalten",
  spacer: "Abstand",
};

export type Block = {
  id: string;
  type: BlockType;
  position: number;
  content: Record<string, unknown>;
  published: boolean;
};

const inputCls =
  "w-full rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 px-3 py-2.5 text-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const textareaCls =
  "w-full rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 px-3 py-2.5 text-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 min-h-[120px] resize-y font-mono";

// ── per-block content editors ────────────────────────────────────────────────

function HeadingEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const [lang, setLang] = useState<Lang>("de");
  const text = (content.text as Record<string, string>) ?? {};
  const level = (content.level as string) ?? "h2";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <select
          value={level}
          onChange={(e) => onChange({ ...content, level: e.target.value })}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
        </select>
        <LangTabs active={lang} onChange={setLang} />
      </div>
      <input
        className={inputCls}
        value={text[lang] ?? ""}
        placeholder={`Überschrift (${lang.toUpperCase()})`}
        onChange={(e) =>
          onChange({ ...content, text: { ...text, [lang]: e.target.value } })
        }
      />
    </div>
  );
}

function TextEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const [lang, setLang] = useState<Lang>("de");
  const body = (content.body as Record<string, string>) ?? {};
  const taRef = useRef<HTMLTextAreaElement>(null);

  function wrap(before: string, after: string) {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const val   = ta.value;
    const selected = val.slice(start, end) || "Text";
    const next  = val.slice(0, start) + before + selected + after + val.slice(end);
    onChange({ ...content, body: { ...body, [lang]: next } });
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <LangTabs active={lang} onChange={setLang} />
        <div className="flex items-center gap-1 text-xs">
          <button onClick={() => wrap("**", "**")} title="Fett" className="px-2 py-1 rounded border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-950 font-bold">B</button>
          <button onClick={() => wrap("_", "_")} title="Kursiv" className="px-2 py-1 rounded border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-950 italic">I</button>
          <button onClick={() => wrap("\n\n", "")} title="Neuer Absatz" className="px-2 py-1 rounded border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-950">¶</button>
        </div>
      </div>
      <textarea
        ref={taRef}
        className={textareaCls}
        value={body[lang] ?? ""}
        placeholder={`Text (${lang.toUpperCase()}) — **fett**, _kursiv_, Leerzeile = neuer Absatz`}
        onChange={(e) =>
          onChange({ ...content, body: { ...body, [lang]: e.target.value } })
        }
      />
      <p className="text-[11px] text-zinc-400">**fett** · _kursiv_ · Leerzeile = neuer Absatz</p>
    </div>
  );
}

function SpacerEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const size = (content.size as string) ?? "md";
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Abstandsgröße</label>
      <div className="flex gap-2">
        {[["sm", "Klein (2rem)"], ["md", "Mittel (4rem)"], ["lg", "Groß (8rem)"], ["xl", "Sehr groß (12rem)"]].map(([v, label]) => (
          <button key={v} onClick={() => onChange({ ...content, size: v })}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${size === v ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" : "border-zinc-800 text-zinc-600 hover:border-zinc-500"}`}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ImageEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const [lang, setLang] = useState<Lang>("de");
  const caption = (content.caption as Record<string, string>) ?? {};

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
          Bild
        </label>
        <MediaImageInput
          value={(content.url as string) ?? ""}
          onChange={(v) => onChange({ ...content, url: v })}
        />
      </div>
      {Boolean(content.url) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={content.url as string}
          alt=""
          className="max-h-40 rounded-lg object-cover"
        />
      )}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Bildunterschrift
          </label>
          <LangTabs active={lang} onChange={setLang} />
        </div>
        <input
          className={inputCls}
          value={caption[lang] ?? ""}
          placeholder={`Bildunterschrift (${lang.toUpperCase()})`}
          onChange={(e) =>
            onChange({ ...content, caption: { ...caption, [lang]: e.target.value } })
          }
        />
      </div>
    </div>
  );
}

function QuoteEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const [lang, setLang] = useState<Lang>("de");
  const text = (content.text as Record<string, string>) ?? {};
  const author = (content.author as Record<string, string>) ?? {};

  return (
    <div className="space-y-3">
      <LangTabs active={lang} onChange={setLang} />
      <textarea
        className={textareaCls}
        value={text[lang] ?? ""}
        placeholder={`Zitat (${lang.toUpperCase()})`}
        onChange={(e) =>
          onChange({ ...content, text: { ...text, [lang]: e.target.value } })
        }
      />
      <input
        className={inputCls}
        value={author[lang] ?? ""}
        placeholder={`Quelle / Autor (${lang.toUpperCase()})`}
        onChange={(e) =>
          onChange({ ...content, author: { ...author, [lang]: e.target.value } })
        }
      />
    </div>
  );
}

function TwoColEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const [lang, setLang] = useState<Lang>("de");
  const left = (content.left as Record<string, string>) ?? {};
  const right = (content.right as Record<string, string>) ?? {};

  return (
    <div className="space-y-3">
      <LangTabs active={lang} onChange={setLang} />
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
            Links
          </label>
          <textarea
            className={textareaCls}
            value={left[lang] ?? ""}
            placeholder={`Linke Spalte (${lang.toUpperCase()})`}
            onChange={(e) =>
              onChange({ ...content, left: { ...left, [lang]: e.target.value } })
            }
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
            Rechts
          </label>
          <textarea
            className={textareaCls}
            value={right[lang] ?? ""}
            placeholder={`Rechte Spalte (${lang.toUpperCase()})`}
            onChange={(e) =>
              onChange({ ...content, right: { ...right, [lang]: e.target.value } })
            }
          />
        </div>
      </div>
    </div>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────

function LangTabs({
  active,
  onChange,
}: {
  active: Lang;
  onChange: (l: Lang) => void;
}) {
  return (
    <div className="flex gap-1">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`px-2.5 py-1 rounded text-xs font-medium uppercase transition-colors ${
            active === l
              ? "bg-zinc-900 text-white dark:bg-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function BlockContentEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (c: Record<string, unknown>) => void;
}) {
  if (block.type === "heading") return <HeadingEditor content={block.content} onChange={onChange} />;
  if (block.type === "text") return <TextEditor content={block.content} onChange={onChange} />;
  if (block.type === "image") return <ImageEditor content={block.content} onChange={onChange} />;
  if (block.type === "quote") return <QuoteEditor content={block.content} onChange={onChange} />;
  if (block.type === "two_col") return <TwoColEditor content={block.content} onChange={onChange} />;
  if (block.type === "divider") return <p className="text-xs text-zinc-400 italic">Trennlinie — kein Inhalt nötig</p>;
  if (block.type === "spacer")  return <SpacerEditor content={block.content} onChange={onChange} />;
  return null;
}

// ── main editor ──────────────────────────────────────────────────────────────

export default function BlockEditor({
  pageId,
  initialBlocks,
  pageTitle,
}: {
  pageId: string;
  initialBlocks: Block[];
  pageTitle: string;
}) {
  const supabase = createClient();
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [addType, setAddType] = useState<BlockType>("text");

  function updateContent(id: string, content: Record<string, unknown>) {
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, content } : b)));
  }

  async function saveBlock(block: Block) {
    setSaving(block.id);
    await supabase
      .from("blocks")
      .update({ content: block.content, published: block.published })
      .eq("id", block.id);
    setSaving(null);
  }

  async function deleteBlock(id: string) {
    if (!confirm("Block löschen?")) return;
    await supabase.from("blocks").delete().eq("id", id);
    const remaining = blocks.filter((b) => b.id !== id);
    setBlocks(remaining);
    if (expanded === id) setExpanded(null);
    await reposition(remaining);
  }

  async function reposition(bs: Block[]) {
    await Promise.all(
      bs.map((b, i) =>
        supabase.from("blocks").update({ position: i + 1 }).eq("id", b.id)
      )
    );
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setBlocks(next);
    await reposition(next);
  }

  async function addBlock() {
    const maxPos = blocks.reduce((m, b) => Math.max(m, b.position), 0);
    const defaultContent: Record<BlockType, Record<string, unknown>> = {
      heading: { text: { de: "", en: "", ru: "" }, level: "h2" },
      text: { body: { de: "", en: "", ru: "" } },
      image: { url: "", caption: { de: "", en: "", ru: "" } },
      quote: { text: { de: "", en: "", ru: "" }, author: { de: "", en: "", ru: "" } },
      divider: {},
      two_col: { left: { de: "", en: "", ru: "" }, right: { de: "", en: "", ru: "" } },
      spacer:  { size: "md" },
    };
    const { data, error } = await supabase
      .from("blocks")
      .insert({
        page_id: pageId,
        type: addType,
        position: maxPos + 1,
        content: defaultContent[addType],
        published: true,
      })
      .select()
      .single();
    if (!error && data) {
      const newBlock = data as Block;
      setBlocks((bs) => [...bs, newBlock]);
      setExpanded(newBlock.id);
    }
  }

  async function togglePublished(block: Block) {
    const next = !block.published;
    await supabase.from("blocks").update({ published: next }).eq("id", block.id);
    setBlocks((bs) => bs.map((b) => (b.id === block.id ? { ...b, published: next } : b)));
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-light tracking-wide">{pageTitle}</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{blocks.length} Blöcke</p>
        </div>
      </div>

      {/* add block */}
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-4">
        <select
          value={addType}
          onChange={(e) => setAddType(e.target.value as BlockType)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 flex-1"
        >
          {(Object.keys(BLOCK_LABELS) as BlockType[]).map((t) => (
            <option key={t} value={t}>
              {BLOCK_LABELS[t]}
            </option>
          ))}
        </select>
        <button
          onClick={addBlock}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors dark:bg-zinc-900 dark:text-zinc-100"
        >
          <Plus className="h-4 w-4" /> Block hinzufügen
        </button>
      </div>

      {/* block list */}
      {blocks.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-800 py-16 text-center dark:border-zinc-800">
          <p className="text-sm text-zinc-400">Noch keine Blöcke. Füge deinen ersten Block hinzu.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block, idx) => (
            <div
              key={block.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden"
            >
              {/* block header */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer select-none"
                onClick={() => setExpanded(expanded === block.id ? null : block.id)}
              >
                <GripVertical className="h-4 w-4 text-zinc-300 shrink-0" />
                <span className="flex-1 text-sm font-medium">
                  {BLOCK_LABELS[block.type]}
                  {block.type === "heading" &&
                    (block.content.text as Record<string, string>)?.de && (
                      <span className="ml-2 text-zinc-400 font-normal">
                        — {(block.content.text as Record<string, string>).de.slice(0, 40)}
                      </span>
                    )}
                  {block.type === "text" &&
                    (block.content.body as Record<string, string>)?.de && (
                      <span className="ml-2 text-zinc-400 font-normal text-xs">
                        {(block.content.body as Record<string, string>).de.slice(0, 50)}…
                      </span>
                    )}
                </span>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => togglePublished(block)}
                    title={block.published ? "Sichtbar" : "Versteckt"}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      block.published
                        ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950"
                        : "text-zinc-400 bg-zinc-950 dark:bg-zinc-800"
                    }`}
                  >
                    {block.published ? "Sichtbar" : "Versteckt"}
                  </button>
                  <button
                    disabled={idx === 0}
                    onClick={() => move(block.id, -1)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-300 disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    disabled={idx === blocks.length - 1}
                    onClick={() => move(block.id, 1)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-300 disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteBlock(block.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* expanded editor */}
              {expanded === block.id && (
                <div className="border-t border-zinc-800 dark:border-zinc-800 p-4 space-y-4">
                  <BlockContentEditor
                    block={block}
                    onChange={(c) => updateContent(block.id, c)}
                  />
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => saveBlock(block)}
                      disabled={saving === block.id}
                      className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 transition-colors dark:bg-zinc-900 dark:text-zinc-100"
                    >
                      <Check className="h-4 w-4" />
                      {saving === block.id ? "Speichert…" : "Speichern"}
                    </button>
                    <button
                      onClick={() => setExpanded(null)}
                      className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-600 hover:border-zinc-500 transition-colors"
                    >
                      Schließen
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
