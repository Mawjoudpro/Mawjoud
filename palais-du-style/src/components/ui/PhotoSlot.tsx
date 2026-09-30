import Image from "next/image";

type Props = {
  src?: string | null;
  alt: string;
  caption: string;
  tone?: number;
  /** ratio CSS, ex. "4/5". Passer null pour remplir le parent. */
  ratio?: string | null;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Emplacement photo. Avec `src`, affiche une vraie image (next/image, object-fit
 * cover, lazy par défaut). Sans `src`, affiche un aplat neutre et une légende
 * discrète qui dit quelle photo produire.
 */
export function PhotoSlot({ src, alt, caption, tone = 2, ratio = "4/5", sizes = "(min-width: 1024px) 25vw, 50vw", priority, className = "" }: Props) {
  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ aspectRatio: ratio ?? undefined, background: `var(--tone-${tone})` }}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div role="img" aria-label={alt} className="absolute inset-0 grid place-items-center p-4">
          <span className="text-center font-mono text-micro tracking-[0.02em] text-ink-2 uppercase">{caption}</span>
        </div>
      )}
    </div>
  );
}
