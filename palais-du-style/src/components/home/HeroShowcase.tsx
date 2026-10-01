"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { HeroProduct } from "@/lib/hero-products";
import { prefersReducedMotion } from "@/lib/scroll-progress";
import { IconArrow, IconArrowLeft } from "@/components/ui/Icons";

const HeroModel = dynamic(() => import("./HeroModel"), { ssr: false });

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SETTLE_MS = 600;
const AUTOPLAY_MS = 5000;
const THRESHOLD = 40; // px de glissé pour changer de pièce

/* ---------- géométrie de l'arc ----------
 * d = distance (en pièces) au centre, fractionnaire pendant le geste.
 * Les valeurs sont interpolées entre les points d'appui |d| = 0, 1, 2 : la pièce glisse le long de l'arc
 * en s'inclinant et en rapetissant, la suivante arrive en se redressant et en grossissant.
 */
type Arc = { x1: number; x2: number; y1: number; y2: number };
const lerp3 = (a: number, b: number, c: number, t: number) => (t <= 1 ? a + (b - a) * t : b + (c - b) * Math.min(1, t - 1));

function pose(d: number, baseRot: number, arc: Arc) {
  const t = Math.abs(d);
  const s = Math.sign(d) || 1;
  const x = s * lerp3(0, arc.x1, arc.x2, t);
  const y = lerp3(0, arc.y1, arc.y2, t);
  const rot = t <= 1 ? baseRot * (1 - t) + s * 18 * t : s * (18 + 12 * Math.min(1, t - 1));
  const scale = lerp3(1, 0.7, 0.5, t);
  const opacity = lerp3(1, 1, 0, t); // opaque jusqu'aux voisines, puis disparaît au-delà
  const veil = lerp3(0, 0.5, 0.5, t); // estompe : voile crème à la forme exacte de la pièce (pas de transparence)
  return { transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`, opacity: opacity.toFixed(3), veil: veil.toFixed(3) };
}

/**
 * Pose du premier rendu (serveur), avant toute mesure : mêmes valeurs que `pose`, exprimées avec les variables CSS
 * de la scène (--x1, --y1), pour que rien ne bouge à l'hydratation, sur mobile comme sur desktop.
 */
function ssrPose(d: number, baseRot: number) {
  if (d === 0) return { transform: `translate3d(0, 0, 0) rotate(${baseRot}deg) scale(1)`, opacity: 1, veil: 0 };
  if (Math.abs(d) === 1) return { transform: `translate3d(calc(var(--x1) * ${d}), var(--y1), 0) rotate(${18 * d}deg) scale(0.7)`, opacity: 1, veil: 0.5 };
  return { transform: `translate3d(calc(var(--x1) * ${Math.sign(d) * 1.7}), var(--y1), 0) rotate(${30 * Math.sign(d)}deg) scale(0.5)`, opacity: 0, veil: 0.5 };
}

/** Distance signée la plus courte entre la pièce i et la position p (le carrousel boucle). */
function wrapDist(i: number, p: number, n: number) {
  let d = (((i - p) % n) + n) % n;
  if (d > n / 2) d -= n;
  return d;
}

const withPh = (s: string) =>
  s.split(/(\[[^\]]+\])/).map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <span key={i} className="ph">
        {part}
      </span>
    ) : (
      part
    ),
  );

/**
 * La vitrine flottante : un carrousel de pièces posées sur un arc.
 * Seuls transform et opacity sont animés (sur le compositeur) ; pendant le geste, les positions
 * sont écrites directement dans le style des pièces, sans rendu React à chaque image.
 */
export function HeroShowcase({ products, button, backdrop }: { products: HeroProduct[]; button: string; backdrop?: ReactNode }) {
  const n = products.length;
  const stage = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const tiltEl = useRef<(HTMLDivElement | null)[]>([]);
  const veils = useRef<(HTMLSpanElement | null)[]>([]);
  const pos = useRef(0); // position courante (fractionnaire pendant le geste)
  const arc = useRef<Arc>({ x1: 240, x2: 420, y1: 36, y2: 90 });
  const [active, setActive] = useState(0);
  const [settled, setSettled] = useState(true);
  const [paused, setPaused] = useState(false);
  const [userTookOver, setUserTookOver] = useState(false);
  const [can3D, setCan3D] = useState(false);
  // pièces cachées au chargement (ni au centre ni voisines) : chargées une fois la page prête
  const [later, setLater] = useState(false);
  useEffect(() => {
    const go = () => setLater(true);
    if (document.readyState === "complete") {
      const t = window.setTimeout(go, 600);
      return () => window.clearTimeout(t);
    }
    window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);

  /* écrit la pose de chaque pièce ; animate = transition CSS de 600 ms (sinon suivi direct du doigt) */
  const apply = useCallback(
    (p: number, animate: boolean) => {
      items.current.forEach((el, i) => {
        if (!el) return;
        const d = wrapDist(i, p, n);
        const { transform, opacity, veil } = pose(d, products[i].rotation, arc.current);
        const tr = animate ? `transform ${SETTLE_MS}ms ${EASE}, opacity ${SETTLE_MS}ms ${EASE}` : "none";
        el.style.transition = tr;
        el.style.transform = transform;
        el.style.opacity = opacity;
        const v = veils.current[i];
        if (v) {
          v.style.transition = animate ? `opacity ${SETTLE_MS}ms ${EASE}` : "none";
          v.style.opacity = veil;
        }
        el.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
        el.style.pointerEvents = Math.abs(d) < 1.5 ? "auto" : "none";
      });
    },
    [n, products],
  );

  /* dimensions de l'arc selon l'écran (mobile : voisines coupées par le bord) */
  useEffect(() => {
    const measure = () => {
      const el = stage.current;
      if (!el) return;
      const cs = getComputedStyle(el);
      const px = (v: string) => parseFloat(cs.getPropertyValue(v)) || 0;
      const x1 = px("--x1-px"),
        y1 = px("--y1-px");
      arc.current = { x1, x2: x1 * 1.7, y1, y2: y1 * 2.6 };
      apply(pos.current, false);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [apply]);

  /* aller à une pièce (décalage relatif, avec boucle) */
  const go = useCallback(
    (steps: number) => {
      if (!steps) return;
      pos.current = Math.round(pos.current) + steps;
      apply(pos.current, !prefersReducedMotion());
      setSettled(false);
      setActive((((Math.round(pos.current) % n) + n) % n));
    },
    [apply, n],
  );

  /* navigation demandée par l'utilisateur : le défilement automatique s'arrête */
  const take = useCallback(
    (steps: number) => {
      setUserTookOver(true);
      go(steps);
    },
    [go],
  );

  /* fin de transition : la 3D éventuelle peut réapparaître */
  useEffect(() => {
    if (settled) return;
    const t = window.setTimeout(() => setSettled(true), SETTLE_MS);
    return () => window.clearTimeout(t);
  }, [settled, active]);

  /* 3D seulement sur un appareil puissant, sans prefers-reduced-motion */
  useEffect(() => {
    if ((navigator.hardwareConcurrency ?? 0) > 4 && !prefersReducedMotion() && products.some((p) => p.model)) setCan3D(true); // eslint-disable-line react-hooks/set-state-in-effect -- capacité connue au navigateur seulement
  }, [products]);

  /* ---------- geste au doigt / à la souris ---------- */
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let startX = 0,
      startY = 0,
      startPos = 0,
      dragging = false,
      decided = false,
      id = -1;
    const samples: { x: number; t: number }[] = [];
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      id = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      startPos = Math.round(pos.current);
      dragging = false;
      decided = false;
      samples.length = 0;
      samples.push({ x: e.clientX, t: e.timeStamp });
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!decided) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        decided = true;
        dragging = Math.abs(dx) > Math.abs(dy); // vertical : on laisse la page défiler
        if (dragging) {
          setUserTookOver(true);
          el.setPointerCapture(id);
        }
      }
      if (!dragging) return;
      samples.push({ x: e.clientX, t: e.timeStamp });
      while (samples.length > 2 && e.timeStamp - samples[0].t > 90) samples.shift();
      pos.current = startPos - dx / arc.current.x1;
      apply(pos.current, false);
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = -1;
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - startX;
      const first = samples[0];
      const v = first && e.timeStamp > first.t ? (e.clientX - first.x) / (e.timeStamp - first.t) : 0; // px/ms
      const projected = dx + v * 180; // inertie
      let steps = 0;
      if (Math.abs(projected) >= THRESHOLD) steps = -Math.max(1, Math.min(2, Math.round(Math.abs(projected) / arc.current.x1))) * Math.sign(projected);
      pos.current = startPos;
      if (steps) go(steps);
      else apply(startPos, true);
    };
    // un glissé ne doit pas déclencher le lien de la pièce
    const click = (e: MouseEvent) => {
      if (Math.abs(e.clientX - startX) > 6) e.preventDefault();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true);
    };
  }, [apply, go]);

  /* ---------- desktop : molette horizontale, clavier ---------- */
  useEffect(() => {
    const el = stage.current?.closest("section");
    if (!el) return;
    let acc = 0,
      lock = 0;
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // défilement vertical : page normale
      e.preventDefault();
      if (e.timeStamp < lock) return;
      acc += e.deltaX;
      if (Math.abs(acc) > THRESHOLD) {
        take(acc > 0 ? 1 : -1);
        acc = 0;
        lock = e.timeStamp + 450;
      }
    };
    const key = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 80 || r.top > window.innerHeight * 0.5) return; // seulement quand la vitrine est à l'écran
      if (e.key === "ArrowRight") take(1);
      if (e.key === "ArrowLeft") take(-1);
    };
    el.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);
    return () => {
      el.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", key);
    };
  }, [take]);

  /* ---------- défilement automatique (5 s), en pause au survol, au toucher, hors écran ---------- */
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (paused || userTookOver || !visible || prefersReducedMotion()) return;
    const t = window.setTimeout(() => !document.hidden && go(1), AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [paused, userTookOver, visible, active, go]);

  /* ---------- inclinaison qui suit la souris (desktop, 6° max) ou le gyroscope (mobile, 4° max) ---------- */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const tilts = tiltEl.current;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const max = fine ? 6 : 4;
    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0,
      raf = 0,
      ref: { b: number; g: number } | null = null;
    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      const el = tilts[((Math.round(pos.current) % n) + n) % n];
      if (el) el.style.transform = `perspective(900px) rotateX(${(-cy * max).toFixed(2)}deg) rotateY(${(cx * max).toFixed(2)}deg)`;
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const mouse = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      kick();
    };
    // gyroscope : seulement s'il ne demande pas d'autorisation (Android) ; pas de fenêtre système imposée sur iOS
    const orient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      ref ??= { b: e.beta, g: e.gamma };
      tx = Math.max(-1, Math.min(1, (e.gamma - ref.g) / 25));
      ty = Math.max(-1, Math.min(1, (e.beta - ref.b) / 25));
      kick();
    };
    const needsPermission = typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === "function";
    if (fine) window.addEventListener("pointermove", mouse, { passive: true });
    else if (!needsPermission) window.addEventListener("deviceorientation", orient);
    return () => {
      window.removeEventListener("pointermove", mouse);
      window.removeEventListener("deviceorientation", orient);
      cancelAnimationFrame(raf);
      tilts.forEach((el) => {
        if (el) el.style.transform = "";
      });
    };
  }, [n]);

  const current = products[active];
  const show3D = can3D && !!current.model && settled;

  return (
    <div className="relative flex flex-col justify-center" onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)} onPointerLeave={() => setPaused(false)}>
      {/* scène : les pièces sur l'arc */}
      <div
        ref={stage}
        className="hero-stage relative h-[clamp(300px,47svh,420px)] touch-pan-y select-none lg:h-[clamp(420px,58vh,600px)]"
        role="group"
        aria-roledescription="carrousel"
        aria-label="La vitrine"
      >
        {backdrop}
        {products.map((p, i) => {
          const d0 = wrapDist(i, 0, n);
          const init = ssrPose(d0, p.rotation);
          const load = Math.abs(d0) <= 1 || later;
          // masque du voile : petite version optimisée (la forme suffit), pas l'original
          const mask = `url(/_next/image?url=${encodeURIComponent(p.image)}&w=384&q=75)`;
          return (
            <div
              key={p.image}
              ref={(el) => {
                items.current[i] = el;
              }}
              className="absolute top-1/2 left-1/2 -mt-[calc(var(--slot)/2)] -ml-[calc(var(--slot)/2)] size-[var(--slot)] will-change-transform"
              style={{ transform: init.transform, opacity: init.opacity, zIndex: 100 - Math.abs(d0) * 10 } as CSSProperties}
              aria-hidden={i !== active}
            >
              <button
                type="button"
                tabIndex={-1}
                className="group block size-full cursor-pointer"
                onClick={() => {
                  const d = wrapDist(i, pos.current, n);
                  if (Math.round(d) !== 0) take(Math.round(d));
                }}
                aria-label={i === active ? p.nom : `Voir ${p.nom}`}
              >
                {/* ombre portée : image statique, se resserre quand la pièce monte */}
                <span aria-hidden="true" className="float-shadow absolute inset-x-[12%] bottom-[2%] h-[16%] bg-[url(/images/hero/shadow.webp)] bg-[length:100%_100%] bg-no-repeat" />
                <span className="float-y absolute inset-0 block">
                  <span
                    ref={(el) => {
                      tiltEl.current[i] = el as HTMLDivElement | null;
                    }}
                    className="absolute inset-0 block transition-opacity duration-500"
                    style={{ opacity: show3D && i === active ? 0 : 1 }}
                  >
                    {load && <Image
                      src={p.image}
                      alt={p.nom}
                      fill
                      draggable={false}
                      priority={i === 0}
                      loading={i === 0 ? undefined : "eager"}
                      fetchPriority={i === 0 ? "high" : "low"}
                      sizes="(min-width: 1024px) 34vw, 70vw"
                      className="object-contain"
                    />}
                    {/* voile crème découpé à la forme de la pièce (masque statique, seule son opacité varie) */}
                    <span
                      ref={(el) => {
                        veils.current[i] = el;
                      }}
                      aria-hidden="true"
                      className="absolute inset-0 bg-paper will-change-[opacity]"
                      style={{ opacity: init.veil, maskImage: load ? mask : "none", WebkitMaskImage: load ? mask : "none", maskSize: "contain", WebkitMaskSize: "contain", maskPosition: "center", WebkitMaskPosition: "center", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" }}
                    />
                  </span>
                </span>
              </button>
            </div>
          );
        })}
        {/* un seul canvas 3D, posé sur la pièce centrale, quand elle a un modèle */}
        {can3D && current.model && (
          <div className={`pointer-events-none absolute top-1/2 left-1/2 z-[200] -mt-[calc(var(--slot)/2)] -ml-[calc(var(--slot)/2)] size-[var(--slot)] transition-opacity duration-500 ${show3D ? "opacity-100" : "opacity-0"}`}>
            <HeroModel url={current.model} />
          </div>
        )}
      </div>

      {/* nom, prix, bouton : fondu montant synchronisé au changement de pièce */}
      <div className="relative z-[300] mt-3 grid justify-items-center gap-1 text-center lg:mt-8" aria-live="polite">
        <p key={`n${active}`} className="hero-swap text-[19px] leading-tight font-medium lg:text-[22px]">
          {current.nom}
        </p>
        <p key={`p${active}`} className="hero-swap hero-swap-2 price text-[17px] text-ink-2 lg:text-[19px]">
          {withPh(current.prix)}
        </p>
      </div>
      <div className="relative z-[300] mt-4 flex items-center justify-center gap-3 px-[var(--gutter)] lg:mt-5">
        <button type="button" onClick={() => take(-1)} className="hidden size-[52px] place-items-center rounded-full border border-line-2 transition-colors duration-500 hover:border-ink lg:grid" aria-label="Pièce précédente">
          <IconArrowLeft width={18} />
        </button>
        <Link href={current.lien} className="btn btn-ink sm:min-w-[260px]">
          {button} <IconArrow width={18} />
        </Link>
        <button type="button" onClick={() => take(1)} className="hidden size-[52px] place-items-center rounded-full border border-line-2 transition-colors duration-500 hover:border-ink lg:grid" aria-label="Pièce suivante">
          <IconArrow width={18} />
        </button>
      </div>

      {/* repères + invitation */}
      <div className="relative z-[300] mt-4 flex items-center justify-center gap-4 lg:mt-6">
        <ol className="flex items-center gap-1.5" aria-label="Pièces">
          {products.map((p, i) => (
            <li key={p.image}>
              <button
                type="button"
                onClick={() => take(wrapDist(i, active, n))}
                className="grid size-6 place-items-center"
                aria-label={`${p.nom}${i === active ? " (affichée)" : ""}`}
                aria-current={i === active}
              >
                <span className={`block h-1.5 w-5 origin-center rounded-full bg-ink transition-[transform,opacity] duration-500 ease-[var(--ease-out)] ${i === active ? "scale-x-100 opacity-100" : "scale-x-[0.3] opacity-25"}`} />
              </button>
            </li>
          ))}
        </ol>
        <p className="font-mono text-micro tracking-[0.04em] text-ink-2 uppercase">
          <span className="lg:hidden">Swipe pour découvrir</span>
          <span className="hidden lg:inline">Défile pour découvrir</span>
        </p>
      </div>
    </div>
  );
}
