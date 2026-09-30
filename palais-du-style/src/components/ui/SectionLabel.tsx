/** Étiquette mono en haut de section : « (01) — LE DROP ». Une par section, pas plus. */
export function SectionLabel({ n, children, className = "" }: { n: string; children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-micro tracking-[0.04em] uppercase ${className}`}>
      ({n}) — {children}
    </p>
  );
}
