/** Séparateur de date centré (« Aujourd'hui »). */
export function DateSeparator({ children }: { children: React.ReactNode }) {
  return <p className="my-1.5 self-center rounded-full bg-cream/90 px-3 py-1 font-mono text-[15px] leading-tight text-ink-2 uppercase shadow-[0_1px_0_rgb(14_14_12/0.06)]">{children}</p>;
}
