"use client";

import { useEffect, useState } from "react";
import { History, RotateCcw, ChevronDown, ChevronUp, Download, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ARTIST_ID, cardCls, labelCls } from "../_lib";

type Version = {
  id: string;
  label: string | null;
  entity_type: string;
  entity_id: string;
  data: Record<string, unknown>;
  created_at: string;
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return `vor ${diff}s`;
  if (diff < 3600)  return `vor ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `vor ${Math.floor(diff / 3600)}h`;
  return `vor ${Math.floor(diff / 86400)}d`;
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function previewKeys(data: Record<string, unknown>) {
  const keys = Object.keys(data).filter(k => data[k] !== null && data[k] !== "");
  return keys.slice(0, 8).join(", ") + (keys.length > 8 ? ` +${keys.length - 8}` : "");
}

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  settings:        { label: "Einstellungen",  cls: "bg-zinc-800 text-zinc-300" },
  concert:         { label: "Konzert",         cls: "bg-blue-950 text-blue-400" },
  project:         { label: "Projekt",         cls: "bg-amber-950 text-amber-400" },
  project_content: { label: "Projekt-Inhalt",  cls: "bg-orange-950 text-orange-400" },
  repertoire:      { label: "Repertoire",      cls: "bg-purple-950 text-purple-400" },
};

const RESTORE_CONFIRM: Record<string, string> = {
  settings:        "Alle Einstellungen (Bio, Hero, Videos, …) auf diesen Stand zurücksetzen?",
  concert:         "Dieses Konzert auf den gespeicherten Stand zurücksetzen?",
  project:         "Dieses Projekt (Grunddaten) auf den gespeicherten Stand zurücksetzen?",
  project_content: "Den Seiteninhalt dieses Projekts auf den gespeicherten Stand zurücksetzen?",
  repertoire:      "Diesen Repertoire-Eintrag auf den gespeicherten Stand zurücksetzen?",
};

export default function VersionsAdmin() {
  const supabase = createClient();
  const [versions, setVersions]     = useState<Version[]>([]);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [restoring, setRestoring]   = useState<string | null>(null);
  const [restored, setRestored]     = useState<string | null>(null);
  const [exporting, setExporting]   = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [restoreError, setRestoreError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("content_versions")
      .select("id,label,entity_type,entity_id,data,created_at")
      .eq("artist_id", ARTIST_ID)
      .order("created_at", { ascending: false })
      .limit(100);
    setVersions((data as Version[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function restore(v: Version) {
    const confirmText = RESTORE_CONFIRM[v.entity_type] ?? "Diesen Stand wiederherstellen?";
    if (!confirm(`${confirmText}\n\n${formatDate(v.created_at)}`)) return;

    setRestoring(v.id);
    setRestoreError(null);

    let error: { message: string } | null = null;

    if (v.entity_type === "settings") {
      ({ error } = await supabase.from("artists")
        .update({ settings: v.data })
        .eq("id", ARTIST_ID));

    } else if (v.entity_type === "concert") {
      ({ error } = await supabase.from("concerts")
        .update(v.data)
        .eq("id", v.entity_id));

    } else if (v.entity_type === "project") {
      ({ error } = await supabase.from("projects")
        .update(v.data)
        .eq("id", v.entity_id));

    } else if (v.entity_type === "project_content") {
      ({ error } = await supabase.from("projects")
        .update({ content: v.data })
        .eq("id", v.entity_id));

    } else if (v.entity_type === "repertoire") {
      ({ error } = await supabase.from("repertoire")
        .update(v.data)
        .eq("id", v.entity_id));
    }

    setRestoring(null);

    if (error) {
      setRestoreError(`Fehler: ${error.message}`);
      return;
    }

    setRestored(v.id);
    setTimeout(() => {
      setRestored(null);
      // For settings changes refresh the page so admin reflects the restored state
      if (v.entity_type === "settings") window.location.reload();
    }, 2000);
  }

  async function exportAll() {
    setExporting(true);
    const [
      { data: artist },
      { data: concerts },
      { data: projects },
      { data: repertoire },
      { data: media },
      { data: newsletter },
    ] = await Promise.all([
      supabase.from("artists").select("name,settings").eq("id", ARTIST_ID).single(),
      supabase.from("concerts").select("*").eq("artist_id", ARTIST_ID).order("date"),
      supabase.from("projects").select("*").eq("artist_id", ARTIST_ID).order("position"),
      supabase.from("repertoire").select("*").eq("artist_id", ARTIST_ID).order("position"),
      supabase.from("media").select("id,url,filename,alt,created_at").eq("artist_id", ARTIST_ID),
      supabase.from("newsletter_subscribers").select("email,created_at,source").eq("artist_id", ARTIST_ID),
    ]);

    const blob = new Blob([JSON.stringify({
      exported_at: new Date().toISOString(),
      artist: { id: ARTIST_ID, ...artist },
      concerts:  concerts  ?? [],
      projects:  projects  ?? [],
      repertoire: repertoire ?? [],
      media:     media     ?? [],
      newsletter_subscribers: newsletter ?? [],
    }, null, 2)], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `artfolio-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  const typeOptions = ["all", ...Array.from(new Set(versions.map(v => v.entity_type)))];
  const filtered = filterType === "all" ? versions : versions.filter(v => v.entity_type === filterType);

  return (
    <div className="max-w-2xl space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Versionen & Export</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Letzte 100 gespeicherte Zustände — alle Typen können wiederhergestellt werden.
          </p>
        </div>
        <button onClick={exportAll} disabled={exporting}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 disabled:opacity-50 transition-colors">
          <Download className="h-4 w-4" />
          {exporting ? "Exportiert…" : "Alles exportieren"}
        </button>
      </div>

      {/* Restore error banner */}
      {restoreError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {restoreError}
        </div>
      )}

      {/* Filter tabs */}
      {!loading && versions.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {typeOptions.map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${filterType === t ? "bg-zinc-100 text-zinc-950 font-medium" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
              {t === "all"
                ? `Alle (${versions.length})`
                : `${TYPE_BADGE[t]?.label ?? t} (${versions.filter(v => v.entity_type === t).length})`}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-sm text-zinc-500 py-12 justify-center">
          <History className="h-5 w-5 animate-pulse" /> Lade Verlauf…
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800 py-16 text-center space-y-3">
          <History className="h-10 w-10 text-zinc-600" />
          <p className="text-sm text-zinc-500">Keine Versionen vorhanden.</p>
          <p className="text-xs text-zinc-600">Versionen werden automatisch beim Speichern erstellt.</p>
        </div>
      )}

      {/* Version list */}
      <div className="space-y-2">
        {filtered.map((v, i) => {
          const badge = TYPE_BADGE[v.entity_type] ?? { label: v.entity_type, cls: "bg-zinc-800 text-zinc-400" };
          const isRestored = restored === v.id;
          const isRestoring = restoring === v.id;
          return (
            <div key={v.id} className={cardCls + " !space-y-0 !p-4"}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[11px] tabular-nums text-zinc-600 shrink-0">#{filtered.length - i}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${badge.cls}`}>
                    {badge.label}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{v.label ?? "Gespeichert"}</p>
                    <p className="text-xs text-zinc-500">{formatDate(v.created_at)} · {timeAgo(v.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => restore(v)}
                    disabled={isRestoring || !!restoring}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors disabled:opacity-40 ${
                      isRestored
                        ? "border-green-500/50 bg-green-500/10 text-green-400"
                        : "border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    {isRestored
                      ? <><Check className="h-3 w-3" /> Wiederhergestellt!</>
                      : isRestoring
                      ? "…"
                      : <><RotateCcw className="h-3 w-3" /> Wiederherstellen</>
                    }
                  </button>
                  <button
                    onClick={() => setExpanded(x => x === v.id ? null : v.id)}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {expanded === v.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {expanded === v.id && (
                <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                  <p className={labelCls}>Gespeicherte Felder</p>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed break-all">{previewKeys(v.data)}</p>
                  <p className="text-[10px] text-zinc-600 font-mono">entity_id: {v.entity_id}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
