"use client";

import { LazyMotion, MotionConfig } from "framer-motion";

const loadFeatures = () => import("./motion-features").then((r) => r.default);

/** Animations : respect de prefers-reduced-motion + fonctionnalités chargées après l'affichage. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
