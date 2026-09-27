import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/catalog";
import { site } from "@/lib/config";

export function Footer() {
  const cols = [
    { title: "Boutique", links: [{ href: "/boutique", label: "Nouveautés" }, ...categories.map((c) => ({ href: `/boutique/${c.handle}`, label: c.title }))] },
    { title: "Aide", links: [{ href: "/conseiller", label: "Mon conseiller" }, { href: "/livraison", label: "Livraison" }, { href: "/retours", label: "Retours" }] },
    { title: "Légal", links: [{ href: "/cgv", label: "CGV" }, { href: "/mentions-legales", label: "Mentions légales" }] },
    { title: "Nous suivre", links: [{ href: site.whatsappUrl, label: "WhatsApp" }, { href: site.snapchatUrl, label: "Snapchat" }, { href: "#", label: "Instagram [LIEN]" }] },
  ];
  return (
    <footer className="border-t border-line bg-paper pt-16 pb-[calc(env(safe-area-inset-bottom)+32px)] lg:pt-24">
      <div className="wrap">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div className="flex items-start gap-5">
            <Image src="/brand/blason.png" alt="Blason Palais du Style" width={72} height={62} className="h-auto w-[72px]" />
            <p className="max-w-[26ch] text-small text-ink-2">Des pièces de qualité, moins chères qu&apos;ailleurs, livrées vite. En ligne et en Île-de-France.</p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {cols.map((c) => (
              <div key={c.title}>
                <p className="mb-4 text-small font-semibold">{c.title}</p>
                <ul className="grid gap-1">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith("http") ? (
                        <a href={l.href} target="_blank" rel="noopener" className="inline-flex min-h-9 items-center text-small text-ink-2 hover:text-ink">
                          {l.label}
                        </a>
                      ) : (
                        <Link href={l.href} className="inline-flex min-h-9 items-center text-small text-ink-2 hover:text-ink">
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-6 text-micro text-ink-2 lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name} · <span className="ph">{site.legal.company}</span> · SIRET <span className="ph">{site.legal.siret}</span> ·{" "}
            <span className="ph">{site.legal.address}</span>
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Moyens de paiement">
            {["CB", "Visa", "Mastercard", "Apple Pay", "3x 4x sans frais"].map((m) => (
              <li key={m} className="border border-line-2 px-2 py-1 text-[11px] font-semibold tracking-wide text-ink">
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
