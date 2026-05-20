"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, Check, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

type Submission = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  read: boolean;
  created_at: string;
};

export default function SubmissionsAdmin() {
  const supabase = createClient();
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState<"unread" | "all">("unread");

  async function load() {
    const { data } = await supabase
      .from("contact_submissions")
      .select("*")
      .eq("artist_id", ARTIST_ID)
      .order("created_at", { ascending: false });
    setItems((data ?? []) as Submission[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markRead(id: string) {
    await supabase.from("contact_submissions").update({ read: true }).eq("id", id);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Anfrage löschen?")) return;
    await supabase.from("contact_submissions").delete().eq("id", id);
    load();
  }

  const unread = items.filter(i => !i.read);
  const list = tab === "unread" ? unread : items;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light tracking-wide">Anfragen</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          {unread.length} ungelesen · {items.length} gesamt
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-zinc-800 dark:border-zinc-800">
        {(["unread", "all"] as const).map(t => (
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
            {t === "unread" ? `Ungelesen (${unread.length})` : "Alle"}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <p className="text-sm text-zinc-400">Wird geladen…</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-zinc-400">{tab === "unread" ? "Keine ungelesenen Anfragen" : "Keine Anfragen"}</p>
      ) : (
        <div className="space-y-2">
          {list.map(item => (
            <div
              key={item.id}
              className={cn(
                "rounded-xl border bg-zinc-900 transition-all dark:bg-zinc-900",
                item.read ? "border-zinc-800 dark:border-zinc-800" : "border-zinc-400 dark:border-zinc-600"
              )}
            >
              {/* Summary row */}
              <button
                className="w-full flex items-center gap-3 p-4 text-left"
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              >
                {!item.read && <span className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-900 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className={cn("truncate text-sm", !item.read && "font-semibold text-zinc-100 dark:text-zinc-100")}>
                    {item.name}
                    {item.subject && <span className="text-zinc-400 font-normal"> · {item.subject}</span>}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">{formatDate(item.created_at)}</p>
                </div>
                {expanded === item.id ? (
                  <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
                )}
              </button>

              {/* Expanded */}
              {expanded === item.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-zinc-800 dark:border-zinc-800 pt-4">
                  <div className="flex flex-wrap gap-3 text-sm text-zinc-600">
                    <a href={`mailto:${item.email}`} className="flex items-center gap-1.5 hover:text-zinc-100 transition-colors">
                      <Mail className="h-3.5 w-3.5" /> {item.email}
                    </a>
                    {item.phone && (
                      <a href={`tel:${item.phone}`} className="flex items-center gap-1.5 hover:text-zinc-100 transition-colors">
                        <Phone className="h-3.5 w-3.5" /> {item.phone}
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-zinc-300 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{item.message}</p>
                  <div className="flex gap-2 pt-1">
                    {!item.read && (
                      <button
                        onClick={() => markRead(item.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors dark:bg-zinc-900 dark:text-zinc-100"
                      >
                        <Check className="h-3.5 w-3.5" /> Als gelesen markieren
                      </button>
                    )}
                    <button
                      onClick={() => remove(item.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-500 hover:border-red-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Löschen
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
