import Link from "next/link";
import { BlasonHero } from "@/components/blason/BlasonHero";

export default function NotFound() {
  return (
    <div className="wrap grid min-h-[70vh] place-items-center py-24 text-center">
      <div className="grid justify-items-center gap-6">
        <BlasonHero mode="small" size={180} priority />
        <h1 className="font-serif text-h2">Cette page est partie.</h1>
        <p className="max-w-[40ch] text-ink-2">Comme nos meilleures pièces. Le reste t&apos;attend en boutique.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/boutique" className="btn btn-ink">
            Voir la boutique
          </Link>
          <Link href="/" className="btn btn-line">
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
