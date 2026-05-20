import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { tl } from "@/lib/i18n";
import type { SupportedLang } from "@/lib/i18n";
import BlockRenderer from "@/components/blocks/BlockRenderer";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

type Block = {
  id: string;
  type: string;
  position: number;
  content: Record<string, unknown>;
  published: boolean;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("title")
    .eq("artist_id", ARTIST_ID)
    .eq("published", true)
    .filter(`slug->>'de'`, "eq", slug)
    .maybeSingle();

  if (!page) return {};

  return {
    title: tl(page.title as Record<string, string>, lang as SupportedLang, slug),
  };
}

export default async function CustomPage({
  params,
}: {
  params: Promise<{ lang: SupportedLang; slug: string }>;
}) {
  const { lang, slug } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("id,title,published")
    .eq("artist_id", ARTIST_ID)
    .eq("published", true)
    .filter(`slug->>'de'`, "eq", slug)
    .maybeSingle();

  if (!page) notFound();

  const { data: blocks } = await supabase
    .from("blocks")
    .select("id,type,position,content,published")
    .eq("page_id", page.id)
    .order("position");

  const title = tl(page.title as Record<string, string>, lang, "");

  return (
    <main className="max-w-3xl mx-auto px-6 md:px-16 pt-32 pb-24">
      {title && (
        <header className="mb-16">
          <span className="block text-[0.6rem] uppercase tracking-[0.4em] text-primary mb-4">
            Seite
          </span>
          <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-light">{title}</h1>
        </header>
      )}
      <BlockRenderer blocks={(blocks ?? []) as Block[]} lang={lang} />
    </main>
  );
}
