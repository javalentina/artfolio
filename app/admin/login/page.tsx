"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("E-Mail oder Passwort falsch.");
      setLoading(false);
    } else {
      window.location.href = "/admin";
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-zinc-500 mb-2">Artfolio</p>
          <h1 className="font-serif text-2xl font-light text-white tracking-wide">
            Natalia Uchitel
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
              E-Mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="deine@email.de"
              className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-4 py-3 focus:outline-none focus:border-zinc-600 transition-colors placeholder-zinc-700"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
              Passwort
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-4 py-3 focus:outline-none focus:border-zinc-600 transition-colors placeholder-zinc-700"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full border border-zinc-700 text-white text-xs uppercase tracking-widest py-3 transition-colors hover:border-zinc-500 hover:bg-zinc-900 disabled:opacity-40"
          >
            {loading ? "Anmelden…" : "Anmelden"}
          </button>
        </form>
      </div>
    </div>
  );
}
