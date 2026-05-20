const T = {
  nav: {
    concerts:   { de: "Konzerte",   en: "Concerts",   ru: "Концерты"   },
    repertoire: { de: "Repertoire", en: "Repertoire", ru: "Репертуар"  },
    projects:   { de: "Projekte",   en: "Projects",   ru: "Проекты"    },
    contact:    { de: "Kontakt",    en: "Contact",    ru: "Контакт"    },
  },
  home: {
    subtitle:      { de: "Cellistin",             en: "Cellist",                  ru: "Виолончелистка"         },
    upcoming:      { de: "Nächste Konzerte",       en: "Upcoming Concerts",        ru: "Ближайшие концерты"     },
    all_concerts:  { de: "Alle Konzerte",          en: "All Concerts",             ru: "Все концерты"           },
    projects_h:    { de: "Projekte",               en: "Projects",                 ru: "Проекты"               },
    all_projects:  { de: "Alle Projekte",          en: "All Projects",             ru: "Все проекты"           },
    contact_cta:   { de: "Kontakt aufnehmen",      en: "Get in touch",             ru: "Связаться"              },
    contact_sub:   { de: "Für Anfragen, Engagements und Zusammenarbeit.", en: "For inquiries, engagements and collaborations.", ru: "По вопросам сотрудничества и ангажементов." },
    no_concerts:   { de: "Derzeit keine Konzerte geplant.", en: "No concerts scheduled.", ru: "Концертов не запланировано." },
  },
  concerts: {
    title:       { de: "Konzerte",      en: "Concerts",    ru: "Концерты"      },
    upcoming:    { de: "Bevorstehend",  en: "Upcoming",    ru: "Ближайшие"     },
    past:        { de: "Vergangen",     en: "Past",        ru: "Прошедшие"     },
    tickets:     { de: "Tickets",       en: "Tickets",     ru: "Билеты"        },
    no_upcoming: { de: "Derzeit sind keine Konzerte geplant.", en: "No upcoming concerts planned.", ru: "Концертов не запланировано." },
    no_past:     { de: "Keine vergangenen Konzerte.", en: "No past concerts.", ru: "Прошедших концертов нет." },
  },
  repertoire: {
    title:       { de: "Repertoire",   en: "Repertoire",  ru: "Репертуар"     },
    works:       { de: "Werke",        en: "Works",       ru: "Произведения"  },
  },
  projects: {
    title:       { de: "Projekte",     en: "Projects",    ru: "Проекты"       },
    no_projects: { de: "Keine Projekte vorhanden.", en: "No projects yet.", ru: "Проектов пока нет." },
  },
  contact: {
    title:    { de: "Kontakt",             en: "Contact",              ru: "Контакт"           },
    subtitle: { de: "Schreiben Sie mir.",  en: "Get in touch.",        ru: "Напишите мне."     },
    name:     { de: "Name",               en: "Name",                 ru: "Имя"               },
    email:    { de: "E-Mail",             en: "Email",                ru: "Email"             },
    subject:  { de: "Betreff",            en: "Subject",              ru: "Тема"              },
    message:  { de: "Nachricht",          en: "Message",              ru: "Сообщение"         },
    send:     { de: "Senden",             en: "Send message",         ru: "Отправить"         },
    sending:  { de: "Sendet…",            en: "Sending…",             ru: "Отправка…"         },
    success:  { de: "Vielen Dank! Ich melde mich bald.", en: "Thank you! I'll be in touch soon.", ru: "Спасибо! Я свяжусь с вами." },
    error:    { de: "Fehler beim Senden. Bitte erneut versuchen.", en: "Error sending. Please try again.", ru: "Ошибка. Попробуйте ещё раз." },
  },
  footer: {
    rights:   { de: "Alle Rechte vorbehalten.", en: "All rights reserved.", ru: "Все права защищены." },
  },
} as const;

type Section = keyof typeof T;
type Key<S extends Section> = keyof typeof T[S];

export function tr<S extends Section, K extends Key<S>>(
  section: S,
  key: K,
  lang: string,
): string {
  const obj = T[section][key] as Record<string, string>;
  return obj[lang] ?? obj["de"] ?? "";
}

export default T;
