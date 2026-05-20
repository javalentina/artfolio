"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-zinc-500 mb-2">Artfolio</p>
          <h1 className="font-serif text-2xl font-light text-white tracking-wide">
            Natalia Uchitel
          </h1>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Link wurde gesendet</p>
              <p className="text-zinc-500 text-xs mt-1">Bitte prüfe deine E-Mail: <span className="text-zinc-300">{email}</span></p>
            </div>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Andere E-Mail verwenden
            </button>
          </div>
        ) : (
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

            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full border border-zinc-700 text-white text-xs uppercase tracking-widest py-3 transition-colors hover:border-zinc-500 hover:bg-zinc-900 disabled:opacity-40"
            >
              {loading ? "Sendet…" : "Magic Link senden"}
            </button>

            <p className="text-center text-xs text-zinc-300">
              Du erhältst einen Login-Link per E-Mail — kein Passwort nötig.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
