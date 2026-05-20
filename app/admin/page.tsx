import { Calendar, FileText, FolderOpen, Mail, Music2 } from "lucide-react";
import Link from "next/link";

const CARDS = [
  { href: "/admin/pages", label: "Seiten", icon: FileText, desc: "Seiten & Blöcke bearbeiten" },
  { href: "/admin/concerts", label: "Konzerte", icon: Calendar, desc: "Konzerte verwalten" },
  { href: "/admin/repertoire", label: "Repertoire", icon: Music2, desc: "Komponisten & Werke" },
  { href: "/admin/projects", label: "Projekte", icon: FolderOpen, desc: "Projekte bearbeiten" },
  { href: "/admin/submissions", label: "Anfragen", icon: Mail, desc: "Kontaktanfragen" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light tracking-wide">Willkommen</h1>
        <p className="mt-1 text-sm text-zinc-500">Artfolio Admin — Natalia Uchitel</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 group-hover:bg-zinc-200 transition-colors dark:bg-zinc-800">
              <Icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="font-medium text-zinc-100 dark:text-zinc-100">{label}</p>
              <p className="text-sm text-zinc-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
