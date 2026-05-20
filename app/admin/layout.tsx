"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Image as ImageIcon, User, Briefcase, FileText, BookOpen,
  Music2, Calendar, Play, Camera, FolderOpen, Mail, Users,
  Settings, History, Menu, X, LogOut, ChevronDown, ChevronRight, Type,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

// ── Nav structure ─────────────────────────────────────────────────────────────

type NavItem = {
  href?: string;
  label: string;
  icon: React.ElementType;
  children?: { href: string; label: string }[];
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  // separator
  { href: "/admin/hero", label: "Hero", icon: ImageIcon },
  {
    label: "Biographie",
    icon: User,
    children: [
      { href: "/admin/bio",         label: "Biographie" },
      { href: "/admin/career",      label: "Werdegang" },
      { href: "/admin/lebenslauf",  label: "Lebenslauf" },
      { href: "/admin/books",       label: "Bücher" },
    ],
  },
  // separator
  { href: "/admin/repertoire", label: "Repertoire", icon: Music2 },
  { href: "/admin/concerts",   label: "Konzerte",   icon: Calendar },
  { href: "/admin/videos",     label: "Videos",     icon: Play },
  { href: "/admin/media",      label: "Galerie",    icon: Camera },
  { href: "/admin/projects",   label: "Projekte",   icon: FolderOpen },
  // separator
  { href: "/admin/submissions", label: "Anfragen",   icon: Mail },
  { href: "/admin/newsletter",  label: "Newsletter", icon: Users },
  // separator
  { href: "/admin/labels",   label: "Sektion-Texte", icon: Type },
  { href: "/admin/settings", label: "Einstellungen", icon: Settings },
  { href: "/admin/versions",  label: "Versionen",    icon: History },
];

const GROUPS = [
  [0],               // Dashboard
  [1, 2],            // Hero, Biographie
  [3, 4, 5, 6, 7],   // Repertoire … Projekte
  [8, 9],            // Anfragen, Newsletter
  [10, 11, 12],      // Sektion-Texte, Einstellungen, Versionen
];

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ open, onClose, onLogout }: { open: boolean; onClose: () => void; onLogout: () => void }) {
  const pathname = usePathname();

  // Biographie group is open if any child is active
  const bioActive = NAV[2].children?.some(c => pathname.startsWith(c.href)) ?? false;
  const [bioOpen, setBioOpen] = useState(bioActive);

  function isActive(href: string) {
    return href === "/admin" ? pathname === href : pathname.startsWith(href);
  }

  const linkCls = (active: boolean) => cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-light transition-colors",
    active ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
  );
  const subLinkCls = (active: boolean) => cn(
    "flex items-center rounded-lg px-3 py-2 pl-9 text-sm font-light transition-colors",
    active ? "text-white" : "text-white/40 hover:text-white/70"
  );

  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onClose} />}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-zinc-950 text-white transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto lg:shrink-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex h-14 items-center justify-between px-5 border-b border-white/10">
          <span className="font-light tracking-[0.25em] uppercase text-xs text-white/60">Artfolio</span>
          <button onClick={onClose} className="lg:hidden text-white/50 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {GROUPS.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <div className="my-2 mx-3 h-px bg-white/8" />}
              {group.map(idx => {
                const item = NAV[idx];
                const Icon = item.icon;

                // Expandable group (Biographie)
                if (item.children) {
                  return (
                    <div key={idx}>
                      <button
                        onClick={() => setBioOpen(v => !v)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-light transition-colors",
                          bioOpen || bioActive ? "text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown className={cn("h-3 w-3 text-white/30 transition-transform", bioOpen ? "rotate-180" : "")} />
                      </button>
                      {bioOpen && (
                        <div className="mt-0.5 space-y-0.5">
                          {item.children.map(child => (
                            <Link key={child.href} href={child.href} onClick={onClose}
                              className={subLinkCls(isActive(child.href))}>
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // Regular item
                if (!item.href) return null;
                const active = isActive(item.href);
                return (
                  <Link key={idx} href={item.href} onClick={onClose} className={linkCls(active)}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                    {active && <ChevronRight className="ml-auto h-3 w-3 text-white/30" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-3">
          <button onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/40 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  async function logout() {
    await createClient().auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={logout} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-zinc-800 bg-zinc-950 px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-zinc-500 hover:text-zinc-200">
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            {userEmail && <span className="hidden sm:block text-xs text-zinc-500 truncate max-w-[200px]">{userEmail}</span>}
            <button onClick={logout}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 transition-colors" title="Abmelden">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Abmelden</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 xl:p-12">{children}</main>
      </div>
    </div>
  );
}
