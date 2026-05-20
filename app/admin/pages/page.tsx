"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

type Page = {
  id: string;
  title: Record<string, string>;
  slug: Record<string, string>;
  published: boolean;
  show_in_menu: boolean;
  menu_position: number;
};

type FormData = {
  title_de: string;
  title_en: string;
  title_ru: string;
  slug: string;
  published: boolean;
  show_in_menu: boolean;
  menu_position: string;
};

const empty: FormData = {
  title_de: "", title_en: "", title_ru: "",
  slug: "", published: false, show_in_menu: true, menu_position: "10",
};

const inputCls = "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none";
const labelCls = "block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function PagesAdmin() {
  const supabase = createClient();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("pages")
      .select("id,title,slug,published,show_in_menu,menu_position")
      .eq("artist_id", ARTIST_ID)
      .order("menu_position");
    setPages((data ?? []) as Page[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setForm(empty);
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(p: Page) {
    setForm({
      title_de: p.title?.de ?? "",
      title_en: p.title?.en ?? "",
      title_ru: p.title?.ru ?? "",
      slug: p.slug?.de ?? "",
      published: p.published,
      show_in_menu: p.show_in_menu,
      menu_position: String(p.menu_position),
    });
    setEditing(p.id);
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    const slug = slugify(form.slug || form.title_de);
    const payload = {
      title: { de: form.title_de, en: form.title_en || form.title_de, ru: form.title_ru || form.title_de },
      slug: { de: slug, en: slug, ru: slug },
      published: form.published,
      show_in_menu: form.show_in_menu,
      menu_position: parseInt(form.menu_position) || 10,
    };
    if (editing) {
      await supabase.from("pages").update(payload).eq("id", editing);
    } else {
      await supabase.from("pages").insert({ ...payload, artist_id: ARTIST_ID });
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Seite und alle Blöcke löschen?")) return;
    await supabase.from("pages").delete().eq("id", id);
    load();
  }

  async function togglePublished(p: Page) {
    await supabase.from("pages").update({ published: !p.published }).eq("id", p.id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Seiten</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{pages.length} Seiten</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors dark:bg-zinc-900 dark:text-zinc-100">
          <Plus className="h-4 w-4" /> Neue Seite
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-400">Wird geladen…</p>
      ) : pages.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-800 py-16 text-center dark:border-zinc-800">
          <p className="text-sm text-zinc-400">Noch keine Seiten.</p>
          <p className="text-xs text-zinc-300 mt-1">Klicke auf „Neue Seite" um loszulegen.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map(p => (
            <div key={p.id}
              className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-100 dark:text-zinc-100 truncate">
                  {p.title?.de || "–"}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  /{p.slug?.de || "—"}
                  {p.show_in_menu && <span className="ml-2 text-zinc-300">· Im Menü</span>}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => togglePublished(p)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-300 transition-colors"
                  title={p.published ? "Verstecken" : "Veröffentlichen"}>
                  {p.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-zinc-300" />}
                </button>
                <Link href={`/admin/pages/${p.id}`}
                  className="p-1.5 text-zinc-400 hover:text-zinc-300 transition-colors"
                  title="Blöcke bearbeiten">
                  <Pencil className="h-4 w-4" />
                </Link>
                <button onClick={() => remove(p.id)}
                  className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 dark:bg-zinc-900 shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 dark:border-zinc-800">
              <h2 className="font-medium">{editing ? "Seite bearbeiten" : "Neue Seite"}</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Titel (DE) *</label>
                <input className={inputCls} value={form.title_de}
                  onChange={e => {
                    const v = e.target.value;
                    setForm(f => ({ ...f, title_de: v, slug: f.slug || slugify(v) }));
                  }} placeholder="Über mich" />
              </div>
              <div>
                <label className={labelCls}>Titel (EN)</label>
                <input className={inputCls} value={form.title_en}
                  onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Titel (RU)</label>
                <input className={inputCls} value={form.title_ru}
                  onChange={e => setForm(f => ({ ...f, title_ru: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>URL-Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">/p/</span>
                  <input className={inputCls} value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                    placeholder="uber-mich" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Menü-Position</label>
                  <input type="number" className={inputCls} value={form.menu_position}
                    onChange={e => setForm(f => ({ ...f, menu_position: e.target.value }))} min="1" max="99" />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.show_in_menu}
                    onChange={e => setForm(f => ({ ...f, show_in_menu: e.target.checked }))} className="rounded" />
                  Im Menü anzeigen
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.published}
                    onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="rounded" />
                  Veröffentlicht
                </label>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-zinc-800 dark:border-zinc-800">
              <button onClick={save} disabled={saving || !form.title_de}
                className="flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 transition-colors dark:bg-zinc-900 dark:text-zinc-100">
                <Check className="h-4 w-4" />{saving ? "Speichert…" : "Speichern"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="rounded-lg border border-zinc-800 px-5 py-2.5 text-sm text-zinc-600 hover:border-zinc-500 transition-colors">
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
