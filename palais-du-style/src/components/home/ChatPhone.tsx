"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/scroll-progress";
import { ChatBubble, ChatImage, DateSeparator, TypingIndicator, type BubbleSide, type DeliveryStatus } from "@/components/ui/chat";

type Message = { id: string; step: number; side: BubbleSide; time: string; text?: ReactNode; image?: { alt: string; caption: string } };

/** La conversation : le client (à droite) écrit à Palais du Style (à gauche). `step` = étape de scroll où le message arrive (-1 : fil encore vide). */
const MESSAGES: Message[] = [
  { id: "ask", step: 0, side: "out", time: "23:12", text: "Salut ! Les sneakers blanches en cuir, vous les avez en 42 ?" },
  { id: "photo", step: 1, side: "in", time: "23:13", image: { alt: "Photo de la pièce, envoyée au client", caption: "[Photo de la pièce]" }, text: <>Oui, en 42. Prise à l&apos;instant : <span className="price ph">[PRIX]</span></> },
  { id: "take", step: 2, side: "out", time: "23:14", text: "Je la prends, tu me la gardes ?" },
  { id: "kept", step: 2, side: "in", time: "23:14", text: "C'est réservé à ton nom." },
  { id: "tonight", step: 3, side: "in", time: "23:15", text: "À ce soir pour la remise." },
];

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const TYPING_MS = 1000; // durée du « écrit… » avant une réponse
const LEAD_MS = 1300; // délai avant que la boutique commence à écrire (annonce l'étape suivante)

type State = { shown: string[]; status: Record<string, DeliveryStatus>; typing: boolean };

/** État « final » d'une étape : tout ce qui précède est affiché, les messages du client sont lus. */
function settled(step: number): State {
  const shown = MESSAGES.filter((m) => m.step <= step).map((m) => m.id);
  const status: Record<string, DeliveryStatus> = {};
  for (const m of MESSAGES) if (m.side === "out") status[m.id] = "read";
  return { shown, status, typing: false };
}

/**
 * Déroule la conversation au rythme des étapes de scroll.
 * Étape suivante (+1) : petite scène minutée (le client envoie, les coches passent de gris à or, la boutique « écrit… », répond).
 * Saut de plusieurs étapes, retour en arrière ou prefers-reduced-motion : état final immédiat, sans animation.
 */
function useConversation(step: number, live: boolean): State {
  const [state, setState] = useState<State>(() => settled(MESSAGES.at(-1)!.step));
  const prev = useRef<number | null>(null);

  useEffect(() => {
    const from = prev.current;
    prev.current = step;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const animate = live && !prefersReducedMotion() && from != null && step === from + 1;

    if (!animate) {
      // état final de l'étape, posé en une fois (synchronisation avec le scroll, pas une cascade de rendus)
      setState(settled(step));
    } else {
      // on part de l'étape précédente, déjà affichée, et on joue les messages de la nouvelle étape
      const queue = MESSAGES.filter((m) => m.step === step);
      let t = 0;
      for (const m of queue) {
        if (m.side === "in") {
          later(t, () => setState((s) => ({ ...s, typing: true })));
          t += s0(t) ? TYPING_MS * 0.6 : TYPING_MS;
          later(t, () => setState((s) => ({ ...s, typing: false, shown: [...s.shown, m.id] })));
          t += 450;
        } else {
          later(t, () => setState((s) => ({ ...s, typing: false, shown: [...s.shown, m.id], status: { ...s.status, [m.id]: "sent" } })));
          later(t + 350, () => setState((s) => ({ ...s, status: { ...s.status, [m.id]: "delivered" } })));
          later(t + 1000, () => setState((s) => ({ ...s, status: { ...s.status, [m.id]: "read" } })));
          t += 1200;
        }
      }
    }

    // la boutique se met à écrire : annonce la réponse de l'étape suivante
    const next = MESSAGES.find((m) => m.step === step + 1);
    const lastIsOut = MESSAGES.filter((m) => m.step === step).at(-1)?.side === "out";
    if (live && !prefersReducedMotion() && next?.side === "in" && lastIsOut) {
      later(animate ? 1200 + LEAD_MS * 0.4 : LEAD_MS, () => setState((s) => ({ ...s, typing: true })));
    }
    return () => timers.forEach((id) => window.clearTimeout(id));

    // si la boutique écrivait déjà (annoncée à l'étape précédente), la réponse arrive plus vite
    function s0(at: number) {
      return at === 0 && from != null && MESSAGES.filter((m) => m.step === from).at(-1)?.side === "out";
    }
  }, [step, live]);

  return state;
}

/**
 * Fil de messages ancré en bas. Quand un message (ou « écrit… ») apparaît, les bulles précédentes
 * remontent en douceur : on mesure la différence de hauteur et on l'anime en transform (sur le compositeur,
 * donc sans recalcul de mise en page à chaque image : fluide même avec un processeur ralenti).
 */
function Thread({ children, signature }: { children: ReactNode; signature: string }) {
  const inner = useRef<HTMLDivElement>(null);
  const last = useRef<number | null>(null);
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const h = el.offsetHeight;
    const delta = last.current == null ? 0 : h - last.current;
    last.current = h;
    if (delta !== 0 && !prefersReducedMotion()) {
      el.animate([{ transform: `translate3d(0, ${delta}px, 0)` }, { transform: "translate3d(0, 0, 0)" }], { duration: 600, easing: EASE });
    }
  }, [signature]);
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden bg-[color-mix(in_srgb,var(--black)_9%,var(--cream))] px-3 pb-3">
      <div ref={inner} className="flex flex-col gap-1">
        {children}
      </div>
    </div>
  );
}

/** Téléphone aux couleurs de Palais du Style : en-tête avec avatar et statut, puis le fil. */
export function ChatPhone({ step, live }: { step: number; live: boolean }) {
  const { shown, status, typing } = useConversation(step, live);
  const visible = MESSAGES.filter((m) => shown.includes(m.id));

  return (
    <div className="relative mx-auto aspect-[9/17] h-full max-h-[660px] rounded-[42px] border border-cream/25 bg-black p-2 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)]">
      <div className="flex h-full flex-col overflow-hidden rounded-[34px]">
        {/* en-tête de conversation */}
        <div className="flex items-center gap-3 bg-black px-4 pt-8 pb-3 text-cream">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream font-display text-[17px] text-black">P</span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[15px] font-semibold">Palais du Style</p>
            {/* statut : « en ligne » ↔ « écrit… » en fondu croisé (les deux occupent la même place) */}
            <p className="relative h-[19px] font-mono text-[15px] leading-tight text-gold" aria-live="polite">
              <span className={`absolute inset-0 transition-opacity duration-200 ${typing ? "opacity-0" : "opacity-100 delay-100"}`}>en ligne</span>
              <span className={`absolute inset-0 transition-opacity duration-200 ${typing ? "opacity-100 delay-100" : "opacity-0"}`}>écrit…</span>
            </p>
          </div>
        </div>

        <Thread signature={`${visible.length}-${typing}`}>
          <DateSeparator>Aujourd&apos;hui</DateSeparator>
          {visible.map((m, i) => {
            const prevSide = visible[i - 1]?.side;
            return (
              <ChatBubble
                key={m.id}
                side={m.side}
                time={m.time}
                status={m.side === "out" ? status[m.id] : undefined}
                tail={prevSide !== m.side}
                media={m.image ? <ChatImage alt={m.image.alt} caption={m.image.caption} ratio="4/3" /> : undefined}
                className="bubble-in"
              >
                {m.text}
              </ChatBubble>
            );
          })}
          {typing && <TypingIndicator className="bubble-in" />}
        </Thread>
      </div>
    </div>
  );
}
