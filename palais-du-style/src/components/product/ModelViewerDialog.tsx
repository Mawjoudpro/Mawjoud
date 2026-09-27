"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "framer-motion";
import { useOverlay } from "@/lib/useOverlay";
import { IconClose, IconCube, IconReset } from "@/components/ui/Icons";

type ModelViewerElement = HTMLElement & { canActivateAR?: boolean; cameraOrbit: string; fieldOfView: string; jumpCameraToGoal?: () => void; resetTurntableRotation?: () => void };

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, unknown>;
    }
  }
}

const noop = () => () => {};
const ORBIT = "30deg 75deg 105%";
const ease = [0.2, 0.75, 0.15, 1] as const;

/** Vue 360° avec <model-viewer> : drag, zoom limité, reset, et AR sur mobile. */
export function ModelViewerDialog({ src, title, open, onClose }: { src: string; title: string; open: boolean; onClose: () => void }) {
  const ref = useOverlay<HTMLDivElement>(open, onClose);
  const viewer = useRef<ModelViewerElement>(null);
  const [ready, setReady] = useState(false);
  // vrai uniquement côté navigateur (évite un écart d'hydratation avec le portail)
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    // le modèle est compressé en Meshopt : model-viewer charge le décodeur servi localement
    const w = window as Window & { ModelViewerElement?: Record<string, string> };
    w.ModelViewerElement = { ...w.ModelViewerElement, meshoptDecoderLocation: "/vendor/meshopt_decoder.js" };
    import("@google/model-viewer").then(() => setReady(true));
  }, [open]);

  const reset = () => {
    const v = viewer.current;
    if (!v) return;
    v.cameraOrbit = ORBIT;
    v.fieldOfView = "auto";
    v.resetTurntableRotation?.();
    v.jumpCameraToGoal?.();
  };

  // rendu dans <body> : la fenêtre passe au-dessus de l'en-tête collant, quel que soit son parent
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} en 3D`}
          className="fixed inset-0 z-50 flex flex-col bg-paper pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease }}
        >
          <header className="wrap flex h-16 items-center justify-between">
            <p className="font-serif text-lead">{title}</p>
            <button onClick={onClose} className="-mr-3 grid size-11 place-items-center" aria-label="Fermer la vue 3D" data-autofocus>
              <IconClose />
            </button>
          </header>
          <div className="relative flex-1">
            {ready ? (
              <model-viewer
                ref={viewer}
                src={src}
                alt={`${title}, modèle 3D`}
                camera-controls=""
                touch-action="pan-y"
                auto-rotate=""
                auto-rotate-delay="1500"
                rotation-per-second="18deg"
                camera-orbit={ORBIT}
                min-camera-orbit="auto 20deg 70%"
                max-camera-orbit="auto 100deg 140%"
                interaction-prompt="auto"
                shadow-intensity="0.8"
                shadow-softness="1"
                environment-image="neutral"
                exposure="1"
                ar=""
                ar-modes="webxr scene-viewer quick-look"
                ar-scale="fixed"
                style={{ width: "100%", height: "100%", background: "transparent" }}
              >
                <button slot="ar-button" className="btn btn-ink absolute bottom-6 left-1/2 -translate-x-1/2">
                  <IconCube width={18} /> Voir chez moi
                </button>
              </model-viewer>
            ) : (
              <p className="grid h-full place-items-center text-small text-ink-2">Chargement du modèle…</p>
            )}
          </div>
          <footer className="wrap flex items-center justify-between gap-4 py-4 text-micro text-ink-2">
            <span>Fais glisser pour tourner. Pince ou molette pour zoomer.</span>
            <button onClick={reset} className="flex min-h-11 items-center gap-2 text-small font-medium text-ink">
              <IconReset width={18} /> Recentrer
            </button>
          </footer>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
