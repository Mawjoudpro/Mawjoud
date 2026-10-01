import type { ReactNode } from "react";
import { ReadTicks, type DeliveryStatus } from "./ReadTicks";

export type BubbleSide = "in" | "out";

/** Petite queue de bulle, collée au coin supérieur (comme dans les messageries). */
function Tail({ side }: { side: BubbleSide }) {
  return (
    <svg viewBox="0 0 8 13" width="8" height="13" aria-hidden="true" className={`absolute top-0 ${side === "out" ? "-right-[7px] text-black" : "-left-[7px] -scale-x-100 text-cream"}`}>
      <path d="M0 0h8L1.5 10.5C.9 11.4 0 11 0 10Z" fill="currentColor" />
    </svg>
  );
}

/** Heure + coches, en bas à droite de la bulle. */
export function BubbleMeta({ time, status, overlay = false }: { time: string; status?: DeliveryStatus; overlay?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 font-sans text-[15px] leading-none tabular-nums ${overlay ? "rounded-full bg-black/55 px-2 py-1 text-cream" : ""}`}>
      <time className={overlay ? "" : "opacity-65"}>{time}</time>
      {status && <ReadTicks status={status} />}
    </span>
  );
}

/**
 * Bulle de message : sortant (noir, à droite) ou entrant (crème, à gauche), coins de 18 px,
 * queue sur la première bulle d'un groupe, heure et coches en bas à droite.
 * L'heure est réservée par un espace invisible en fin de texte : elle se place sur la dernière ligne
 * quand il y a la place, sinon en dessous, sans jamais chevaucher le texte.
 */
export function ChatBubble({ side, time, status, tail = true, children, media, className = "" }: { side: BubbleSide; time: string; status?: DeliveryStatus; tail?: boolean; children?: ReactNode; media?: ReactNode; className?: string }) {
  const out = side === "out";
  return (
    <div className={`relative max-w-[84%] ${out ? "self-end" : "self-start"} ${tail ? "mt-1.5" : ""} ${className}`}>
      {tail && <Tail side={side} />}
      <div
        className={`relative rounded-[18px] text-[15px] leading-[1.35] ${out ? "bg-black text-cream" : "bg-cream text-ink"} ${tail ? (out ? "rounded-tr-[4px]" : "rounded-tl-[4px]") : ""} ${
          media ? "p-1" : "px-3 py-2"
        } shadow-[0_1px_0_rgb(14_14_12/0.08)]`}
      >
        {media}
        {children != null && (
          <p className={media ? "px-2 pt-1.5 pb-1.5" : ""}>
            {children}
            {/* espace réservé à l'heure (invisible) */}
            <span aria-hidden="true" className={`invisible ml-2 inline-block ${status ? "w-[66px]" : "w-[44px]"}`} />
          </p>
        )}
        <span className={`absolute ${media && children == null ? "right-2.5 bottom-2.5" : "right-2.5 bottom-1.5"}`}>
          <BubbleMeta time={time} status={status} overlay={media != null && children == null} />
        </span>
      </div>
    </div>
  );
}
