"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loadSettings, patchNameAndSettings, inputCls, labelCls, cardCls, saveBtnCls, type S } from "../_lib";
import { MediaImageInput } from "../_components/MediaImageInput";

function SaveBtn({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={saving} className={saveBtnCls}>
      <Check className="h-4 w-4" />
      {saved ? "Gespeichert!" : saving ? "Speichert…" : "Speichern"}
    </button>
  );
}

export default function BioAdmin() {
  const supabase = createClient();
  const [name, setName]         = useState("");
  const [nameDe, setNameDe]     = useState("");
  const [nameEn, setNameEn]     = useState("");
  const [nameRu, setNameRu]     = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [bioDe, setBioDe]       = useState("");
  const [bioEn, setBioEn]       = useState("");
  const [bioRu, setBioRu]       = useState("");
  const [quoteDe, setQuoteDe]   = useState("");
  const [quoteEn, setQuoteEn]   = useState("");
  const [quoteRu, setQuoteRu]   = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    loadSettings(supabase).then(({ name: n, settings: cfg }) => {
      setName(n);
      const nameI18n = (cfg.name_i18n as S) ?? {};
      setNameDe((nameI18n.de as string) ?? n);
      setNameEn((nameI18n.en as string) ?? n);
      setNameRu((nameI18n.ru as string) ?? "Наталия Учитель");
      setPhotoUrl((cfg.photo_url as string) ?? "");
      const bio = (cfg.bio as S) ?? {};
      setBioDe((bio.de as string) ?? "");
      setBioEn((bio.en as string) ?? "");
      setBioRu((bio.ru as string) ?? "");
      const quote = (cfg.bio_quote as S) ?? {};
      setQuoteDe((quote.de as string) ?? "");
      setQuoteEn((quote.en as string) ?? "");
      setQuoteRu((quote.ru as string) ?? "");
      setEmail((cfg.email as string) ?? "");
      setPhone((cfg.phone as string) ?? "");
    });
  }, []);

  async function save() {
    setSaving(true);
    await patchNameAndSettings(supabase, name, {
      name_i18n: { de: nameDe || name, en: nameEn || name, ru: nameRu || "Наталия Учитель" },
      photo_url: photoUrl || null,
      bio: { de: bioDe || null, en: bioEn || null, ru: bioRu || null },
      bio_quote: { de: quoteDe || null, en: quoteEn || null, ru: quoteRu || null },
      email: email || null,
      phone: phone || null,
    }, "Biographie");
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-light tracking-wide">Biographie</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Name, Foto & Biografie-Text</p>
      </div>

      <div className={cardCls}>
        <h2 className="text-sm font-medium text-zinc-300 dark:text-zinc-300">Profil</h2>
        <div><label className={labelCls}>Name (intern / URL)</label><input className={inputCls} value={name} onChange={e => setName(e.target.value)} /></div>
        <div>
          <label className={labelCls}>Name auf der Website</label>
          <div className="space-y-2">
            {([["DE", nameDe, setNameDe], ["EN", nameEn, setNameEn], ["RU", nameRu, setNameRu]] as const).map(([l, v, set]) => (
              <div key={l} className="flex items-center gap-2">
                <span className="w-8 shrink-0 text-xs text-zinc-500 font-mono">{l}</span>
                <input className={inputCls} value={v} onChange={e => set(e.target.value)} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>Foto</label>
          <MediaImageInput value={photoUrl} onChange={setPhotoUrl} />
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="mt-2 h-28 w-28 object-cover rounded-lg" />
          )}
        </div>
        <div><label className={labelCls}>E-Mail</label><input type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div><label className={labelCls}>Telefon</label><input type="tel" className={inputCls} value={phone} onChange={e => setPhone(e.target.value)} /></div>
      </div>

      <div className={cardCls}>
        <h2 className="text-sm font-medium text-zinc-300 dark:text-zinc-300">Biografie-Text</h2>
        {([["DE", bioDe, setBioDe], ["EN", bioEn, setBioEn], ["RU", bioRu, setBioRu]] as const).map(([l, v, set]) => (
          <div key={l}>
            <label className={labelCls}>{l}</label>
            <textarea className={inputCls + " resize-none"} rows={5} value={v} onChange={e => set(e.target.value)} />
          </div>
        ))}
      </div>

      <div className={cardCls}>
        <h2 className="text-sm font-medium text-zinc-300 dark:text-zinc-300">Zitat / Quote</h2>
        <p className="text-xs text-zinc-500">Erscheint als Blockquote unter dem Biografie-Text.</p>
        {([["DE", quoteDe, setQuoteDe], ["EN", quoteEn, setQuoteEn], ["RU", quoteRu, setQuoteRu]] as const).map(([l, v, set]) => (
          <div key={l}>
            <label className={labelCls}>{l}</label>
            <textarea className={inputCls + " resize-none"} rows={3} value={v} onChange={e => set(e.target.value)} />
          </div>
        ))}
      </div>

      <SaveBtn saving={saving} saved={saved} onClick={save} />
    </div>
  );
}
