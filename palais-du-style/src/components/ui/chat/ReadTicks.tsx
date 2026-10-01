export type DeliveryStatus = "sent" | "delivered" | "read";

/**
 * Coches de distribution : une grise (envoyé), deux grises (distribué), deux or (lu).
 * L'or remplace le bleu de la messagerie : c'est l'accent unique de la marque.
 * Les deux coches existent toujours dans le DOM : seules leur opacité et leur couleur changent (pas de saut de mise en page).
 */
export function ReadTicks({ status, className = "" }: { status: DeliveryStatus; className?: string }) {
  const label = status === "read" ? "Lu" : status === "delivered" ? "Distribué" : "Envoyé";
  return (
    <svg viewBox="0 0 18 11" width="18" height="11" role="img" aria-label={label} className={`shrink-0 transition-colors duration-500 ease-[var(--ease-out)] ${status === "read" ? "text-gold" : "text-current opacity-60"} ${className}`}>
      <path d="M1 6.2 4.2 9.4 11 1.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M7.6 8.6 8.4 9.4 15.2 1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-opacity duration-300 ${status === "sent" ? "opacity-0" : "opacity-100"}`}
      />
    </svg>
  );
}
