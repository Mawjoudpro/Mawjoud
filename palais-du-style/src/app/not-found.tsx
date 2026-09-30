import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap grid min-h-[70vh] content-center gap-6 py-20">
      <p className="font-mono text-micro tracking-[0.04em] text-ink-2 uppercase">(404) — Page introuvable</p>
      <h1 className="font-display text-[clamp(120px,38vw,360px)] leading-[0.82] uppercase">404</h1>
      <p className="max-w-[36ch] font-serif text-[28px] leading-tight italic lg:text-[40px]">
        Cette page est partie. <span className="text-gold-ink">Comme nos meilleures pièces.</span>
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/boutique" className="btn btn-ink">
          Voir la boutique
        </Link>
        <Link href="/" className="btn btn-line">
          Accueil
        </Link>
      </div>
    </div>
  );
}
