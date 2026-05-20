"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/app/[lang]/contact/actions";

const LABELS = {
  heading:     { de: "Bleiben Sie informiert",            en: "Stay informed",                     ru: "Будьте в курсе"                    },
  sub:         { de: "Kommende Konzerte & Neuigkeiten",   en: "Upcoming concerts & news",          ru: "Предстоящие концерты и новости"    },
  placeholder: { de: "Ihre E-Mail-Adresse",               en: "Your email address",                ru: "Ваш email"                         },
  btn:         { de: "Abonnieren →",                      en: "Subscribe →",                       ru: "Подписаться →"                     },
  sending:     { de: "Wird gesendet…",                    en: "Sending…",                          ru: "Отправка…"                         },
  success:     { de: "Danke! Sie werden benachrichtigt.", en: "Thank you! You'll be notified.",    ru: "Спасибо! Вы будете уведомлены."    },
  error:       { de: "Fehler. Bitte erneut versuchen.",   en: "Error. Please try again.",          ru: "Ошибка. Попробуйте снова."         },
} as const;

export default function NewsletterSignup({ lang }: { lang: string }) {
  const [state, action, pending] = useActionState(subscribeNewsletter, null);
  const l = (key: keyof typeof LABELS) => LABELS[key][lang as keyof (typeof LABELS)[typeof key]] ?? LABELS[key].de;

  if (state?.success) {
    return (
      <div className="py-10 text-center">
        <p className="font-serif text-xl font-light italic text-primary">{l("success")}</p>
      </div>
    );
  }

  return (
    <div className="border border-border p-8 md:p-12 text-center">
      <p className="text-[11px] tracking-[0.4em] uppercase text-primary mb-4">{l("sub")}</p>
      <h3 className="font-serif text-2xl md:text-3xl font-light mb-8">{l("heading")}</h3>
      <form action={action} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          name="email"
          type="email"
          required
          placeholder={l("placeholder")}
          className="flex-1 bg-transparent border-b border-border py-3 text-sm text-foreground placeholder-foreground/40 focus:border-primary focus:outline-none transition-colors"
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 bg-primary px-8 py-3 text-[0.65rem] uppercase tracking-[0.25em] font-medium text-background hover:bg-primary/80 disabled:opacity-40 transition-colors"
        >
          {pending ? l("sending") : l("btn")}
        </button>
      </form>
      {state?.error && <p className="mt-3 text-xs text-red-400">{l("error")}</p>}
    </div>
  );
}
