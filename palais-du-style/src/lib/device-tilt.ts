"use client";

/**
 * Inclinaison normalisée (-1…1) :
 * - desktop : position de la souris dans la fenêtre ;
 * - mobile : gyroscope (deviceorientation), relatif à la position de départ du téléphone.
 *   Sur iOS 13+, la permission ne peut être demandée qu'après un geste de l'utilisateur :
 *   on la demande au premier toucher, sans bouton ni message.
 */
export type Tilt = { x: number; y: number };

type OrientationCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

export function startTilt(): { read: () => Tilt; stop: () => void } {
  const tilt: Tilt = { x: 0, y: 0 };
  const cleanups: (() => void)[] = [];
  const on = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
    window.addEventListener(type, fn, opts);
    cleanups.push(() => window.removeEventListener(type, fn));
  };

  if (window.matchMedia("(pointer: fine)").matches) {
    on(
      "pointermove",
      (e) => {
        tilt.x = clamp((e.clientX / window.innerWidth) * 2 - 1);
        tilt.y = clamp((e.clientY / window.innerHeight) * 2 - 1);
      },
      { passive: true },
    );
  } else if (typeof DeviceOrientationEvent !== "undefined") {
    let base: { beta: number; gamma: number } | null = null;
    const listen = () =>
      on("deviceorientation", (e) => {
        if (e.beta == null || e.gamma == null) return;
        base ??= { beta: e.beta, gamma: e.gamma };
        // ±25° de mouvement du téléphone = inclinaison maximale
        tilt.x = clamp((e.gamma - base.gamma) / 25);
        tilt.y = clamp((e.beta - base.beta) / 25);
      });
    const Ctor = DeviceOrientationEvent as OrientationCtor;
    if (typeof Ctor.requestPermission === "function") {
      on(
        "touchend",
        () => {
          Ctor.requestPermission?.()
            .then((r) => r === "granted" && listen())
            .catch(() => {});
        },
        { once: true },
      );
    } else {
      listen();
    }
  }

  return { read: () => tilt, stop: () => cleanups.forEach((c) => c()) };
}
