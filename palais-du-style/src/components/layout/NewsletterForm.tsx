"use client";

import { useState } from "react";

/** Inscription aux arrivages (démonstration : à brancher sur l'outil d'e-mailing). */
export function NewsletterForm() {
  const [done, setDone] = useState(false);
  if (done)
    return (
      <p role="status" className="border-b border-cream/30 pb-4 text-lead">
        C&apos;est noté. Rendez-vous au prochain arrivage.
      </p>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      className="grid gap-3 sm:flex sm:gap-0 sm:border-b sm:border-cream/40 sm:focus-within:border-cream"
    >
      <label htmlFor="nl-email" className="sr-only">
        Ton adresse e-mail
      </label>
      <input
        id="nl-email"
        type="email"
        required
        autoComplete="email"
        placeholder="ton@email.fr"
        className="min-h-[52px] min-w-0 flex-1 border-b border-cream/40 bg-transparent text-lead text-cream outline-none placeholder:text-cream/45 focus:border-cream sm:border-0"
      />
      <button type="submit" className="btn bg-cream text-black hover:bg-gold sm:bg-transparent sm:px-2 sm:text-cream sm:hover:bg-transparent sm:hover:text-gold">
        M&apos;inscrire
      </button>
    </form>
  );
}
