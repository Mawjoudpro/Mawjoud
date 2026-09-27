"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";

const channels = ["WhatsApp", "Snapchat", "E-mail"] as const;

export function AdvisorForm() {
  const [sent, setSent] = useState(false);
  const [channel, setChannel] = useState<(typeof channels)[number]>("WhatsApp");

  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <m.div key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 border-t border-ink pt-8" role="status">
          <p className="font-serif text-h3">C&apos;est envoyé.</p>
          <p className="max-w-[44ch] text-ink-2">Ton conseiller te répond sur {channel} en <span className="ph">[DÉLAI DE RÉPONSE]</span> avec la pièce et son prix.</p>
          <div>
            <Link href="/boutique" className="btn btn-ink">
              Continuer mes achats
            </Link>
          </div>
        </m.div>
      ) : (
        <m.form
          key="form"
          exit={{ opacity: 0 }}
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="grid gap-7"
        >
          <div className="grid gap-2">
            <label htmlFor="piece" className="text-small font-semibold">
              La pièce que tu cherches
            </label>
            <textarea id="piece" required rows={3} placeholder="Ex. sneakers blanches en cuir, ou colle un lien" className="min-h-28 resize-y border border-line-2 bg-surface px-4 py-3 outline-none focus:border-ink" />
          </div>
          <div className="grid gap-2 sm:max-w-[220px]">
            <label htmlFor="taille" className="text-small font-semibold">
              Ta taille
            </label>
            <input id="taille" placeholder="Ex. 42, M, unique" className="h-12 border border-line-2 bg-surface px-4 outline-none focus:border-ink" />
          </div>
          <fieldset className="grid gap-3">
            <legend className="mb-3 text-small font-semibold">On te répond sur</legend>
            <div className="flex flex-wrap gap-2">
              {channels.map((c) => (
                <label key={c} className={`flex h-11 cursor-pointer items-center rounded-full border px-5 text-small font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold ${channel === c ? "border-ink bg-ink text-paper" : "border-line-2 hover:border-ink"}`}>
                  <input type="radio" name="canal" value={c} checked={channel === c} onChange={() => setChannel(c)} className="sr-only" />
                  {c}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-2 sm:max-w-[360px]">
            <label htmlFor="contact" className="text-small font-semibold">
              {channel === "E-mail" ? "Ton e-mail" : channel === "Snapchat" ? "Ton pseudo Snap" : "Ton numéro"}
            </label>
            <input id="contact" required type={channel === "E-mail" ? "email" : "text"} inputMode={channel === "WhatsApp" ? "tel" : undefined} className="h-12 border border-line-2 bg-surface px-4 outline-none focus:border-ink" />
          </div>
          <div>
            <button type="submit" className="btn btn-ink">
              Envoyer ma demande
            </button>
          </div>
        </m.form>
      )}
    </AnimatePresence>
  );
}
