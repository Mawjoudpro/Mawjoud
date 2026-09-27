import Link from "next/link";
import { site } from "@/lib/config";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { IconCard, IconReturn, IconTag, IconTruck } from "@/components/ui/Icons";

/* ---------- 4 engagements ---------- */
export function Promises() {
  const items = [
    { icon: IconTag, title: "Des prix serrés", text: "Moins cher qu'ailleurs, sur des pièces de qualité." },
    { icon: IconTruck, title: `Livrée en ${site.deliveryDelay}`, text: "Envoi suivi partout en France.", ph: true },
    { icon: IconCard, title: "3x ou 4x sans frais", text: "Carte, Apple Pay ou en plusieurs fois." },
    { icon: IconReturn, title: "Retours simples", text: `Tu changes d'avis ? Tu as ${site.returnsDelay}.`, ph: true },
  ];
  return (
    <section aria-label="Nos engagements" className="border-y border-line">
      <ul className="wrap grid grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }, i) => (
          <li
            key={title}
            className={`flex flex-col gap-3 py-7 lg:flex-row lg:gap-4 lg:py-8 ${i % 2 ? "border-l border-line pl-5 lg:pl-8" : "pr-5 lg:pr-0"} ${i === 2 ? "lg:border-l lg:border-line lg:pl-8" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""}`}
          >
            <Icon className="shrink-0 text-gold-ink" width={22} height={22} />
            <div>
              <p className="text-small font-semibold">{title}</p>
              <p className="mt-1 text-micro text-ink-2 lg:text-small">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- pourquoi c'est moins cher ---------- */
export function WhyCheaper() {
  const elsewhere = ["Le loyer d'une boutique en centre-ville", "La vitrine et la mise en scène", "Les intermédiaires entre l'atelier et toi"];
  const here = ["La pièce, choisie pour sa qualité", "Sa livraison jusqu'à chez toi", "Une marge serrée, la même sur tout"];
  const reasons = [
    { t: "Pas de boutique à payer", d: "On vend en ligne et en main propre. Pas de loyer à répercuter sur ton prix." },
    { t: "On achète en direct", d: "Moins d'intermédiaires entre la pièce et toi, donc moins de marges empilées." },
    { t: "Une marge serrée", d: "La même sur chaque pièce. On préfère vendre plus que vendre cher." },
  ];
  return (
    <section aria-labelledby="why-title" className="bg-surface py-20 lg:py-32">
      <div className="wrap">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <h2 id="why-title" className="font-serif text-h1 tracking-[-0.02em] lg:col-span-5">
            Pourquoi c&apos;est <em>moins cher</em>
          </h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:gap-8">
            <div>
              <p className="mb-4 text-small font-semibold text-ink-2">Ailleurs, tu paies aussi</p>
              <ul className="border-t border-line">
                {elsewhere.map((x) => (
                  <li key={x} className="border-b border-line py-4 text-ink-3 line-through decoration-ink-3/70">
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 text-small font-semibold">Ici, tu paies</p>
              <ul className="border-t border-ink">
                {here.map((x) => (
                  <li key={x} className="flex items-center gap-3 border-b border-line py-4">
                    <span className="size-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <ul className="mt-16 grid gap-8 border-t border-line pt-10 lg:mt-24 lg:grid-cols-3 lg:gap-8">
          {reasons.map((r) => (
            <li key={r.t}>
              <h3 className="font-serif text-h4">{r.t}</h3>
              <p className="mt-3 max-w-[38ch] text-ink-2">{r.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- garantie prix le plus bas (désactivée par défaut) ---------- */
export function PriceMatch() {
  if (!site.priceMatchEnabled) return null;
  return (
    <section aria-labelledby="pm-title" className="bg-ink py-20 text-paper lg:py-28">
      <div className="wrap grid gap-8 lg:grid-cols-2 lg:items-end">
        <h2 id="pm-title" className="font-serif text-h1">
          Trouvé moins cher ? <em>On rembourse la différence.</em>
        </h2>
        <div>
          <p className="max-w-[46ch] text-paper/70">Même pièce, même état, chez un revendeur professionnel en France, dans les <span className="ph">[DÉLAI]</span> après ton achat : on te rembourse l&apos;écart. <span className="ph">[CONDITIONS]</span></p>
          <Link href="/conseiller" className="btn mt-8 bg-paper text-ink">
            Signaler un prix
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- conseiller + avis + newsletter ---------- */
export function Advisor() {
  return (
    <section aria-labelledby="adv-title" className="py-20 lg:py-32">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="lg:col-span-5">
          <h2 id="adv-title" className="font-serif text-h1 tracking-[-0.02em]">
            Une question ? <em>Écris-nous.</em>
          </h2>
          <p className="mt-6 max-w-[40ch] text-lead text-ink-2">Une taille, une pièce introuvable, un doute sur une coupe. Ton conseiller te répond sur WhatsApp ou Snap, comme un pote qui s&apos;y connaît.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href={site.whatsappUrl} target="_blank" rel="noopener" className="btn btn-ink">
              Écrire sur WhatsApp
            </a>
            <a href={site.snapchatUrl} target="_blank" rel="noopener" className="btn btn-line">
              Ajouter sur Snap
            </a>
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7" aria-label="Exemple de conversation" role="img">
          <div className="border border-line bg-surface p-5 sm:p-7">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <span className="grid size-10 place-items-center rounded-full bg-ink font-serif text-lead italic text-paper">P</span>
              <div>
                <p className="text-small font-semibold">
                  <span className="ph">{site.advisorName}</span>, ton conseiller
                </p>
                <p className="text-micro text-ink-2">Répond en <span className="ph">[DÉLAI DE RÉPONSE]</span></p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 text-small">
              <p className="max-w-[80%] justify-self-end rounded-2xl rounded-br-sm bg-ink px-4 py-3 text-paper">Salut, les sneakers noires en cuir, tu les as en 42 ?</p>
              <p className="max-w-[80%] rounded-2xl rounded-bl-sm bg-paper px-4 py-3">Oui, il en reste. Je te les mets de côté jusqu&apos;à demain ?</p>
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-paper p-2">
                <PhotoSlot alt="" caption="[PHOTO PRODUIT]" tone={2} ratio="16/9" sizes="300px" />
                <p className="flex items-baseline justify-between gap-3 px-2 pt-2 pb-1">
                  <span>Sneakers basses cuir noir</span>
                  <span className="price ph">[PRIX]</span>
                </p>
              </div>
              <p className="max-w-[80%] justify-self-end rounded-2xl rounded-br-sm bg-ink px-4 py-3 text-paper">Carré, je prends.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Reviews() {
  return (
    <section aria-labelledby="rev-title" className="border-t border-line py-20 lg:py-28">
      <div className="wrap">
        <h2 id="rev-title" className="font-serif text-h2">
          Ils ont commandé
        </h2>
        <ul className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
          {[0, 1, 2].map((i) => (
            <li key={i} className="border-t border-ink pt-6">
              <blockquote className="font-serif text-h4 leading-snug">
                <span className="ph">[AVIS CLIENT]</span>
              </blockquote>
              <p className="mt-5 text-small text-ink-2">
                <span className="ph">[PRÉNOM]</span>, <span className="ph">[VILLE]</span> · <span className="ph">[PIÈCE ACHETÉE]</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
