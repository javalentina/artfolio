import { createClient } from "@/lib/supabase/server";
import type { SupportedLang } from "@/lib/i18n";
import type { Metadata } from "next";
import ContactForm from "./ContactForm";

const ARTIST_ID = "23f1f611-5ba9-4c78-9a71-bd3ea1c7856a";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const labels = { de: "Kontakt", en: "Contact", ru: "Контакт" };
  const { lang } = await params;
  return { title: labels[lang as keyof typeof labels] ?? labels.de };
}

export default async function ContactPage({ params }: { params: Promise<{ lang: SupportedLang }> }) {
  const { lang } = await params;
  const supabase = await createClient();

  const { data: artist } = await supabase
    .from("artists").select("settings").eq("id", ARTIST_ID).single();

  const settings = ((artist?.settings ?? {}) as Record<string, unknown>);
  const email = typeof settings.email === "string" ? settings.email : null;
  const phone = typeof settings.phone === "string" ? settings.phone : null;
  const management = typeof settings.management === "string" ? settings.management : null;

  const LABELS = {
    label:    { de: "Kontakt",           en: "Contact",          ru: "Контакт"         },
    title:    { de: "Schreiben Sie mir.",en: "Get in touch.",    ru: "Напишите мне."   },
    email_l:  { de: "E-Mail",           en: "Email",            ru: "Email"           },
    phone_l:  { de: "Telefon",          en: "Phone",            ru: "Телефон"         },
    mgmt_l:   { de: "Management",       en: "Management",       ru: "Менеджмент"      },
  } as const;

  function l(key: keyof typeof LABELS) { return LABELS[key][lang] ?? LABELS[key].de; }

  return (
    <main className="max-w-5xl mx-auto px-6 md:px-16 pt-32 pb-24">
      <header className="mb-16">
        <span className="block text-[0.6rem] uppercase tracking-[0.4em] text-primary mb-4">{l("label")}</span>
        <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-light">{l("title")}</h1>
      </header>

      <div className="grid md:grid-cols-[1fr_2fr] gap-16">
        {/* Contact info */}
        <aside className="space-y-8">
          {email && (
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-primary mb-2">{l("email_l")}</p>
              <a href={`mailto:${email}`} className="text-[0.85rem] text-foreground hover:text-primary transition-colors break-all">
                {email}
              </a>
            </div>
          )}
          {phone && (
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-primary mb-2">{l("phone_l")}</p>
              <a href={`tel:${phone}`} className="text-[0.85rem] text-foreground hover:text-primary transition-colors">
                {phone}
              </a>
            </div>
          )}
          {management && (
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-primary mb-2">{l("mgmt_l")}</p>
              <p className="text-[0.85rem] text-muted-fg whitespace-pre-line leading-relaxed">{management}</p>
            </div>
          )}
        </aside>

        <ContactForm lang={lang} />
      </div>
    </main>
  );
}
