"use client";

import { useActionState } from "react";
import { submitContact } from "./actions";

const inputCls = "w-full bg-transparent border-b border-border py-3 text-[0.85rem] text-foreground placeholder-muted-fg focus:border-primary focus:outline-none transition-colors";
const labelCls = "block text-[0.6rem] uppercase tracking-[0.3em] text-primary mb-2";

const LABELS = {
  name:       { de: "Name *",          en: "Name *",          ru: "Имя *"           },
  email:      { de: "E-Mail *",        en: "Email *",         ru: "Email *"         },
  message:    { de: "Nachricht *",     en: "Message *",       ru: "Сообщение *"     },
  send:       { de: "Nachricht senden →", en: "Send message →", ru: "Отправить →"   },
  sending:    { de: "Sendet…",         en: "Sending…",        ru: "Отправка…"       },
  newsletter: {
    de: "Ich möchte über kommende Konzerte und Projekte von Natalia Uchitel informiert werden.",
    en: "I would like to be informed about upcoming concerts and projects by Natalia Uchitel.",
    ru: "Я хочу получать информацию о предстоящих концертах и проектах Натальи Учитель.",
  },
  success:    { de: "Vielen Dank! Ich melde mich bald.", en: "Thank you! I'll be in touch.", ru: "Спасибо! Я свяжусь с вами." },
  error:      { de: "Fehler. Bitte erneut versuchen.", en: "Error. Please try again.", ru: "Ошибка. Попробуйте снова." },
} as const;

export default function ContactForm({ lang }: { lang: string }) {
  const [state, action, pending] = useActionState(submitContact, null);

  const l = (key: keyof typeof LABELS) => LABELS[key][lang as keyof (typeof LABELS)[typeof key]] ?? LABELS[key].de;

  if (state?.success) {
    return (
      <div className="py-12">
        <p className="font-serif text-3xl font-light italic text-foreground">{l("success")}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-8">
      {/* Honeypot — hidden from humans, bots fill it in */}
      <input name="website" type="text" tabIndex={-1} aria-hidden="true" style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0 }} autoComplete="off" />

      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          <label className={labelCls}>{l("name")}</label>
          <input name="name" required className={inputCls} placeholder="—" autoComplete="name" />
        </div>
        <div>
          <label className={labelCls}>{l("email")}</label>
          <input name="email" type="email" required className={inputCls} placeholder="—" autoComplete="email" />
        </div>
      </div>

      <div>
        <label className={labelCls}>{l("message")}</label>
        <textarea name="message" required rows={5} className={`${inputCls} resize-none`} placeholder="—" />
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input type="checkbox" name="newsletter" className="mt-0.5 h-4 w-4 shrink-0 accent-primary cursor-pointer" />
        <span className="text-sm text-foreground/60 leading-snug group-hover:text-foreground/80 transition-colors">
          {l("newsletter")}
        </span>
      </label>

      {state?.error && state.error !== "required" && (
        <p className="text-red-400 text-xs">{l("error")}</p>
      )}

      <div className="pt-2">
        <button type="submit" disabled={pending}
          className="bg-primary px-10 py-3.5 text-[0.65rem] uppercase tracking-[0.25em] font-medium text-background transition-colors hover:bg-primary/80 disabled:opacity-40">
          {pending ? l("sending") : l("send")}
        </button>
      </div>
    </form>
  );
}
