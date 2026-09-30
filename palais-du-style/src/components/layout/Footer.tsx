import Link from "next/link";
import { categories } from "@/lib/catalog";
import { site } from "@/lib/config";
import { IconInstagram, IconSnapchat, IconTiktok } from "@/components/ui/Icons";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  const cols = [
    { title: "Boutique", links: [{ href: "/boutique", label: "Nouveautés" }, ...categories.map((c) => ({ href: `/boutique/${c.handle}`, label: c.title }))] },
    { title: "Aide", links: [{ href: "/conseiller", label: `On te répond ${site.availability}` }, { href: "/livraison", label: "Livraison" }, { href: "/retours", label: "Retours" }] },
    { title: "Légal", links: [{ href: "/cgv", label: "CGV" }, { href: "/mentions-legales", label: "Mentions légales" }] },
  ];
  const socials = [
    { href: site.tiktokUrl, label: "TikTok", Icon: IconTiktok },
    { href: site.instagramUrl, label: "Instagram", Icon: IconInstagram },
    { href: site.snapchatUrl, label: "Snapchat", Icon: IconSnapchat },
  ];
  return (
    <footer className="overflow-hidden bg-black pt-20 pb-[calc(env(safe-area-inset-bottom)+24px)] text-cream lg:pt-28">
      <div className="wrap">
        {/* newsletter */}
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p className="font-mono text-micro tracking-[0.04em] text-cream/60 uppercase">(06) — Les arrivages</p>
            <h2 className="mt-3 font-display text-[clamp(44px,12vw,80px)] leading-[0.9] uppercase">
              Les bonnes pièces <span className="text-gold">partent vite.</span>
            </h2>
            <p className="mt-4 max-w-[42ch] text-cream/70">Reçois les nouveautés avant tout le monde. Un e-mail par arrivage, rien d&apos;autre.</p>
          </div>
          <NewsletterForm />
        </div>

        {/* liens + réseaux */}
        <div className="mt-16 grid gap-10 border-t border-cream/15 pt-10 lg:mt-24 lg:grid-cols-[2fr_1fr] lg:pt-14">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {cols.map((c) => (
              <div key={c.title}>
                <p className="mb-3 font-mono text-micro tracking-[0.04em] text-cream/55 uppercase">{c.title}</p>
                <ul className="grid">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="inline-flex min-h-11 items-center text-body text-cream/85 transition-colors duration-500 hover:text-gold">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-4 font-mono text-micro tracking-[0.04em] text-cream/55 uppercase">Suis-nous pour les nouveaux arrivages</p>
            <ul className="flex gap-3" aria-label="Nos réseaux">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener" aria-label={label} className="grid size-14 place-items-center rounded-full border border-cream/25 transition-colors duration-500 ease-[var(--ease-out)] hover:border-gold hover:bg-gold hover:text-black">
                    <Icon width={22} height={22} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* le nom, en grand, en signature */}
        {/* pur décor : en pseudo-élément, pour ne pas être lu comme du texte peu contrasté */}
        <div aria-hidden="true" className="mt-16 font-display leading-[0.8] text-cream/10 uppercase [container-type:inline-size] lg:mt-24">
          <span className="block text-[calc(100cqw/6.0199)] whitespace-nowrap before:content-['Palais_du_Style']" style={{ marginLeft: "-0.03em" }} />
        </div>

        {/* mentions */}
        <div className="mt-8 flex flex-col gap-4 border-t border-cream/15 pt-6 font-mono text-micro text-cream/60 lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name} · <span className="ph">{site.legal.company}</span> · SIRET <span className="ph">{site.legal.siret}</span> · <span className="ph">{site.legal.address}</span>
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Moyens de paiement">
            {["CB", "Visa", "Mastercard", "Apple Pay"].map((m) => (
              <li key={m} className="border border-cream/25 px-2 py-1 uppercase">
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
