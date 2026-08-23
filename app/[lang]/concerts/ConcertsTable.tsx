"use client";

import { useRouter } from "next/navigation";
import { tl } from "@/lib/i18n";
import { Camera } from "lucide-react";

type Concert = {
  id: string;
  title: Record<string, string>;
  date: string;
  time: string | null;
  venue: Record<string, string>;
  city: Record<string, string>;
  country: string | null;
  ticket_url: string | null;
  gallery: string[] | null;
};

function formatDate(dateStr: string, lang: string) {
  const d = new Date(dateStr + "T00:00:00");
  const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-GB" : "de-DE";
  return d.toLocaleDateString(locale, { day: "numeric", month: "long" });
}

export default function ConcertsTable({
  list, lang, ticketsLabel, dim = false,
}: {
  list: Concert[];
  lang: string;
  ticketsLabel: string;
  dim?: boolean;
}) {
  const router = useRouter();

  return (
    <table className="w-full border-collapse">
      <tbody>
        {list.map(c => {
          const photos = (c.gallery ?? []).filter(Boolean);

          return (
            <tr
              key={c.id}
              onClick={() => router.push(`/${lang}/concerts/${c.id}`)}
              className={`border-b border-border transition-colors hover:bg-primary/[0.04] cursor-pointer ${dim ? "opacity-60" : ""}`}
            >
              <td className="py-[18px] pr-4 w-32 text-[0.7rem] font-normal uppercase tracking-[0.08em] text-primary whitespace-nowrap">
                {formatDate(c.date, lang)}
              </td>
              <td className="py-[18px] pr-10 font-serif text-[1.35rem] font-normal">
                {tl(c.city, lang) || tl(c.title, lang, "–")}
              </td>
              <td className="py-[18px] pr-6 text-[0.75rem] text-muted-fg tracking-[0.05em] hidden sm:table-cell">
                {tl(c.venue, lang)}
              </td>
              <td className="py-[18px] text-right w-28">
                <div className="flex items-center justify-end gap-3">
                  {photos.length > 0 && (
                    <span className="flex items-center gap-1 text-[0.6rem] text-primary/50">
                      <Camera className="h-3 w-3" />
                      {photos.length}
                    </span>
                  )}
                  {c.ticket_url && (
                    <a href={c.ticket_url} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-[0.65rem] uppercase tracking-[0.15em] text-primary border-b border-transparent hover:border-primary transition-colors pb-px">
                      {ticketsLabel}
                    </a>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
