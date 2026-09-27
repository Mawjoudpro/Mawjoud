"use client";

import { useState } from "react";

export function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <section aria-labelledby="nl-title" className="bg-ink py-20 text-paper lg:py-28">
      <div className="wrap grid gap-8 lg:grid-cols-2 lg:items-end">
        <div>
          <h2 id="nl-title" className="font-serif text-h2">
            Les bonnes pièces partent vite.
          </h2>
          <p className="mt-4 max-w-[42ch] text-paper/70">Reçois les nouveautés avant tout le monde. Un e-mail par arrivage, rien d&apos;autre.</p>
        </div>
        {done ? (
          <p role="status" className="border-b border-paper/30 pb-4 text-lead">
            C&apos;est noté. Rendez-vous au prochain arrivage.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
            className="flex border-b border-paper/40 focus-within:border-paper"
          >
            <label htmlFor="nl-email" className="sr-only">
              Ton adresse e-mail
            </label>
            <input id="nl-email" type="email" required autoComplete="email" placeholder="ton@email.fr" className="min-h-14 min-w-0 flex-1 bg-transparent text-lead outline-none placeholder:text-paper/40" />
            <button type="submit" className="min-h-14 px-2 text-small font-semibold">
              M&apos;inscrire
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
