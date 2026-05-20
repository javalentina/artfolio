import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import BlockEditor, { type Block } from "./BlockEditor";

export default async function PageEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("id,title,slug")
    .eq("id", id)
    .single();

  if (!page) notFound();

  const { data: blocks } = await supabase
    .from("blocks")
    .select("id,type,position,content,published")
    .eq("page_id", id)
    .order("position");

  const title =
    (page.title as Record<string, string>)?.de ||
    (page.title as Record<string, string>)?.en ||
    "Seite";

  return (
    <div className="space-y-4">
      <Link
        href="/admin/pages"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu Seiten
      </Link>
      <BlockEditor
        pageId={id}
        initialBlocks={(blocks ?? []) as unknown as Block[]}
        pageTitle={title}
      />
    </div>
  );
}
