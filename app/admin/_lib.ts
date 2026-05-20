import { createClient } from "@/lib/supabase/client";

export const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

export const inputCls   = "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none";
export const labelCls   = "block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider";
export const cardCls    = "rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4";
export const saveBtnCls = "flex items-center gap-2 rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-40 transition-colors";

export type S = Record<string, unknown>;

export function uid() { return Math.random().toString(36).slice(2, 10); }

export async function loadSettings(supabase: ReturnType<typeof createClient>) {
  const { data } = await supabase.from("artists").select("name,settings").eq("id", ARTIST_ID).single();
  return { name: data?.name ?? "", settings: (data?.settings ?? {}) as S };
}

async function saveVersion(supabase: ReturnType<typeof createClient>, data: S, label: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("content_versions").insert({
    artist_id: ARTIST_ID,
    user_id: user?.id ?? null,
    entity_type: "settings",
    entity_id: ARTIST_ID,
    data,
    label,
  });
  if (error) console.error("saveVersion failed:", error.message);
}

export async function saveEntityVersion(
  supabase: ReturnType<typeof createClient>,
  entityType: string,
  entityId: string,
  data: S,
  label: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("content_versions").insert({
    artist_id: ARTIST_ID,
    user_id: user?.id ?? null,
    entity_type: entityType,
    entity_id: entityId,
    data,
    label,
  });
  if (error) console.error("saveEntityVersion failed:", error.message);
}

export async function patchSettings(supabase: ReturnType<typeof createClient>, patch: S, label = "Einstellungen") {
  const { settings: current } = await loadSettings(supabase);
  const next = { ...current, ...patch };
  const result = await supabase.from("artists").update({ settings: next }).eq("id", ARTIST_ID);
  await saveVersion(supabase, next, label);
  return result;
}

export async function patchNameAndSettings(supabase: ReturnType<typeof createClient>, name: string, patch: S, label = "Einstellungen") {
  const { settings: current } = await loadSettings(supabase);
  const next = { ...current, ...patch };
  const result = await supabase.from("artists").update({ name, settings: next }).eq("id", ARTIST_ID);
  await saveVersion(supabase, next, label);
  return result;
}
