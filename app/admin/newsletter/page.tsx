"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ARTIST_ID } from "../_lib";
import { Mail, Users, Download } from "lucide-react";

type Subscriber = { id: string; email: string; created_at: string; active: boolean };

export default function NewsletterAdmin() {
  const supabase = createClient();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("newsletter_subscribers")
      .select("id,email,created_at,active")
      .eq("artist_id", ARTIST_ID)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSubscribers(data ?? []);
        setLoading(false);
      });
  }, []);

  const active = subscribers.filter(s => s.active !== false);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function exportCsv() {
    const rows = [["E-Mail", "Datum", "Status"], ...subscribers.map(s => [s.email, formatDate(s.created_at), s.active !== false ? "Aktiv" : "Inaktiv"])];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "newsletter-abonnenten.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Newsletter</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Abonnenten-Liste</p>
        </div>
        <div className="flex gap-4 items-start">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 px-5 py-3 text-center">
            <p className="text-2xl font-light">{active.length}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Aktiv</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 px-5 py-3 text-center">
            <p className="text-2xl font-light">{subscribers.length}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Gesamt</p>
          </div>
          {subscribers.length > 0 && (
            <button onClick={exportCsv} className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors">
              <Download className="h-4 w-4" />
              CSV Export
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-400">Wird geladen…</p>
      ) : subscribers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800 py-16 text-center dark:border-zinc-800">
          <Users className="h-10 w-10 text-zinc-300 mb-3" />
          <p className="text-sm text-zinc-400">Noch keine Abonnenten</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 dark:border-zinc-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">E-Mail</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Datum</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {subscribers.map(s => (
                <tr key={s.id} className="hover:bg-zinc-950 dark:hover:bg-zinc-800/50">
                  <td className="px-5 py-3 flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    {s.email}
                  </td>
                  <td className="px-5 py-3 text-zinc-500">{formatDate(s.created_at)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.active !== false
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-zinc-950 text-zinc-500 dark:bg-zinc-800"
                    }`}>
                      {s.active !== false ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
