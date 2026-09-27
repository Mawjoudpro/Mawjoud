"use client";

import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, useGLTF } from "@react-three/drei";
import { Box3, Group, MathUtils, Vector3 } from "three";
import type { MotionValue } from "framer-motion";

const TILT = MathUtils.degToRad(10); // inclinaison max au curseur
const AUTO_SPEED = 0.28; // rad/s

type Props = { url: string; progress: MotionValue<number>; onReady: () => void };

/** Si l'environnement HDR (CDN) échoue, on garde l'éclairage de base au lieu de casser la scène. */
class Quiet extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Sneaker({ url, progress, onReady }: Props) {
  const { scene } = useGLTF(url, true, true);
  const host = useThree((s) => s.gl.domElement.parentElement);
  const group = useRef<Group>(null);
  // angle auto + angle manuel (drag) + vitesse d'inertie
  const motion = useRef({ spin: 0, drag: 0, velocity: 0, fine: false });

  // normalise la taille et centre le modèle, quelles que soient ses unités d'origine
  const { scale, offset } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const s = 2.6 / Math.max(size.x, size.y, size.z);
    return { scale: s, offset: center.multiplyScalar(-s) };
  }, [scene]);

  useEffect(() => onReady(), [onReady]);

  // rotation au doigt / à la souris, sans bloquer le scroll vertical (touch-action: pan-y)
  useEffect(() => {
    const m = motion.current;
    m.fine = window.matchMedia("(pointer: fine)").matches;
    if (!host) return;
    let last: number | null = null;
    const down = (e: PointerEvent) => {
      last = e.clientX;
    };
    const move = (e: PointerEvent) => {
      if (last == null) return;
      m.velocity = (e.clientX - last) * 0.004;
      last = e.clientX;
    };
    const up = () => {
      last = null;
    };
    host.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      host.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [host]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const m = motion.current;
    m.velocity *= 0.92;
    m.drag += m.velocity;
    m.spin += dt * AUTO_SPEED;
    // + 180° sur toute la hauteur du hero (animation pilotée par le scroll)
    g.rotation.y = m.spin + m.drag + progress.get() * Math.PI;
    // inclinaison douce vers le curseur (desktop uniquement)
    g.rotation.x = MathUtils.damp(g.rotation.x, m.fine ? -state.pointer.y * TILT : 0, 4, dt);
    g.rotation.z = MathUtils.damp(g.rotation.z, m.fine ? state.pointer.x * TILT * 0.6 : 0, 4, dt);
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={scale} position={offset} />
    </group>
  );
}

export default function SneakerScene(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // met la boucle de rendu en pause quand la scène sort de l'écran
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={host} className="h-full w-full cursor-grab touch-pan-y active:cursor-grabbing" aria-label="Sneaker en 3D, fais-la tourner" role="img">
      <Canvas dpr={[1, 1.5]} frameloop={visible ? "always" : "never"} camera={{ position: [0, 0.35, 6.2], fov: 30 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 4]} intensity={1.4} />
        <Suspense fallback={null}>
          <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.5} floatingRange={[-0.06, 0.06]}>
            <Sneaker {...props} />
          </Float>
        </Suspense>
        <Quiet>
          <Suspense fallback={null}>
            <Environment preset="studio" environmentIntensity={0.9} />
          </Suspense>
        </Quiet>
        <ContactShadows position={[0, -0.8, 0]} opacity={0.4} scale={6} blur={2.6} far={2.2} resolution={512} />
      </Canvas>
    </div>
  );
}
