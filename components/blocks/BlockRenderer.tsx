import type { SupportedLang } from "@/lib/i18n";
import { tl } from "@/lib/i18n";

type Block = {
  id: string;
  type: string;
  position: number;
  content: Record<string, unknown>;
  published: boolean;
};

function tls(field: unknown, lang: SupportedLang, fallback = ""): string {
  if (!field || typeof field !== "object") return fallback;
  return tl(field as Record<string, string>, lang, fallback);
}

// ── Inline markdown parser: **bold**, _italic_ ────────────────────────────────

function InlineMarkdown({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  // tokenize: **bold** and _italic_
  const re = /(\*\*(.+?)\*\*|_(.+?)_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[0].startsWith("**")) parts.push(<strong key={m.index}>{m[2]}</strong>);
    else parts.push(<em key={m.index}>{m[3]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

// ── Blocks ────────────────────────────────────────────────────────────────────

function HeadingBlock({ content, lang }: { content: Record<string, unknown>; lang: SupportedLang }) {
  const text  = tls(content.text, lang);
  const level = (content.level as string) ?? "h2";
  const cls   = "font-serif font-light";
  if (level === "h1") return <h1 className={`${cls} text-[clamp(2rem,4vw,3rem)] mb-6`}>{text}</h1>;
  if (level === "h3") return <h3 className={`${cls} text-xl mb-4 text-primary`}>{text}</h3>;
  return <h2 className={`${cls} text-[clamp(1.5rem,3vw,2.25rem)] mb-5`}>{text}</h2>;
}

function TextBlock({ content, lang }: { content: Record<string, unknown>; lang: SupportedLang }) {
  const body = tls(content.body, lang);
  if (!body) return null;
  const paragraphs = body.split(/\n\n+/).filter(Boolean);
  return (
    <div className="space-y-4 text-[0.9rem] leading-[1.8] text-foreground/80">
      {paragraphs.map((p, i) => (
        <p key={i}>
          {p.split("\n").map((line, j) => (
            <span key={j}>
              {j > 0 && <br />}
              <InlineMarkdown text={line} />
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

function ImageBlock({ content, lang }: { content: Record<string, unknown>; lang: SupportedLang }) {
  const url     = content.url as string;
  if (!url) return null;
  const caption = tls(content.caption, lang);
  return (
    <figure className="my-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={caption || ""} className="w-full rounded-sm object-cover" />
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-foreground/50 italic">{caption}</figcaption>
      )}
    </figure>
  );
}

function QuoteBlock({ content, lang }: { content: Record<string, unknown>; lang: SupportedLang }) {
  const text   = tls(content.text, lang);
  const author = tls(content.author, lang);
  if (!text) return null;
  return (
    <blockquote className="border-l-2 border-primary pl-6 py-2 my-2">
      <p className="font-serif text-xl font-light italic leading-relaxed text-foreground/90">
        &ldquo;{text}&rdquo;
      </p>
      {author && (
        <cite className="block mt-3 text-xs uppercase tracking-widest text-primary not-italic">{author}</cite>
      )}
    </blockquote>
  );
}

function DividerBlock() {
  return <hr className="border-0 border-t border-border" />;
}

function TwoColBlock({ content, lang }: { content: Record<string, unknown>; lang: SupportedLang }) {
  const left  = tls(content.left, lang);
  const right = tls(content.right, lang);
  return (
    <div className="grid sm:grid-cols-2 gap-8">
      <div className="text-[0.9rem] leading-[1.8] text-foreground/80 whitespace-pre-line">
        <InlineMarkdown text={left} />
      </div>
      <div className="text-[0.9rem] leading-[1.8] text-foreground/80 whitespace-pre-line">
        <InlineMarkdown text={right} />
      </div>
    </div>
  );
}

function SpacerBlock({ content }: { content: Record<string, unknown> }) {
  const sizes: Record<string, string> = { sm: "h-8", md: "h-16", lg: "h-32", xl: "h-48" };
  const cls = sizes[(content.size as string) ?? "md"] ?? "h-16";
  return <div className={cls} aria-hidden />;
}

// ── Renderer ──────────────────────────────────────────────────────────────────

export default function BlockRenderer({ blocks, lang }: { blocks: Block[]; lang: SupportedLang }) {
  return (
    <div className="space-y-8">
      {blocks
        .filter(b => b.published)
        .sort((a, b) => a.position - b.position)
        .map(block => (
          <div key={block.id}>
            {block.type === "heading"  && <HeadingBlock  content={block.content} lang={lang} />}
            {block.type === "text"     && <TextBlock     content={block.content} lang={lang} />}
            {block.type === "image"    && <ImageBlock    content={block.content} lang={lang} />}
            {block.type === "quote"    && <QuoteBlock    content={block.content} lang={lang} />}
            {block.type === "divider"  && <DividerBlock />}
            {block.type === "two_col"  && <TwoColBlock   content={block.content} lang={lang} />}
            {block.type === "spacer"   && <SpacerBlock   content={block.content} />}
          </div>
        ))}
    </div>
  );
}
