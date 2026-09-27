import Link from "next/link";

export type LegalSection = { title: string; body: string };

/** Squelette des pages légales. Le texte définitif doit être fourni ou validé par le client. */
export function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  return (
    <div className="wrap grid gap-12 pt-12 pb-24 lg:grid-cols-12 lg:gap-8 lg:pt-20 lg:pb-32">
      <aside className="lg:col-span-4">
        <div className="lg:sticky lg:top-[96px]">
          <h1 className="font-serif text-h2">{title}</h1>
          <p className="mt-4 max-w-[36ch] text-ink-2">{intro}</p>
          <nav aria-label="Sommaire" className="mt-8 hidden lg:block">
            <ol className="grid gap-1 text-small">
              {sections.map((s, i) => (
                <li key={s.title}>
                  <a href={`#s${i + 1}`} className="inline-flex min-h-9 items-center text-ink-2 hover:text-ink">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </aside>
      <div className="max-w-[68ch] lg:col-span-7 lg:col-start-6">
        {sections.map((s, i) => (
          <section key={s.title} id={`s${i + 1}`} className="scroll-mt-28 border-t border-line py-8 first:border-t-0 first:pt-0">
            <h2 className="font-serif text-h4">{s.title}</h2>
            <p className="mt-4 leading-relaxed text-ink-2">{s.body}</p>
          </section>
        ))}
        <p className="mt-8 text-small text-ink-2">
          Une question ?{" "}
          <Link href="/conseiller" className="underline underline-offset-4">
            Écris à ton conseiller
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
