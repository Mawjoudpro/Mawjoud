"use client";

import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, useGLTF } from "@react-three/drei";
import { Box3, Group, MathUtils, Mesh, MeshBasicMaterial, Vector3 } from "three";
import type { MotionValue } from "framer-motion";

const TILT = MathUtils.degToRad(10); // inclinaison max vers la souris
const AUTO_SPEED = 0.28; // rad/s
const SIZE = 2.6; // plus grande dimension du modèle après normalisation
const FLOAT_RANGE: [number, number] = [-0.09, 0.09];

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

function Sneaker({ url, progress, onReady, onBottom }: Props & { onBottom: (y: number) => void }) {
  const { scene } = useGLTF(url, true, true);
  const host = useThree((s) => s.gl.domElement.parentElement);
  const group = useRef<Group>(null);
  // spin : rotation auto (départ de profil) · drag : rotation manuelle · pointer : souris sur toute la page
  const motion = useRef({ spin: Math.PI / 2, drag: 0, velocity: 0, fine: false, px: 0, py: 0 });

  // Box3 : centre le modèle et le ramène à une taille fixe, quelles que soient ses unités
  const { scale, offset, bottom } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const s = SIZE / Math.max(size.x, size.y, size.z);
    return { scale: s, offset: center.multiplyScalar(-s), bottom: (-size.y * s) / 2 };
  }, [scene]);

  useEffect(() => {
    onBottom(bottom);
    onReady();
  }, [bottom, onBottom, onReady]);

  useEffect(() => {
    const m = motion.current;
    m.fine = window.matchMedia("(pointer: fine)").matches;
    let last: number | null = null;
    const down = (e: PointerEvent) => {
      last = e.clientX;
    };
    const move = (e: PointerEvent) => {
      m.px = (e.clientX / window.innerWidth) * 2 - 1;
      m.py = (e.clientY / window.innerHeight) * 2 - 1;
      if (last == null) return;
      m.velocity = (e.clientX - last) * 0.005;
      last = e.clientX;
    };
    const up = () => {
      last = null;
    };
    // drag uniquement depuis la scène, sans bloquer le scroll vertical (touch-action: pan-y)
    host?.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      host?.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [host]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const m = motion.current;
    m.velocity *= 0.92;
    m.drag += m.velocity;
    m.spin += dt * AUTO_SPEED;
    // + 180° sur la hauteur du hero (animation pilotée par le scroll)
    g.rotation.y = m.spin + m.drag + progress.get() * Math.PI;
    g.rotation.x = MathUtils.damp(g.rotation.x, m.fine ? m.py * TILT : 0, 4, dt);
    g.rotation.z = MathUtils.damp(g.rotation.z, m.fine ? -m.px * TILT * 0.6 : 0, 4, dt);
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={scale} position={offset} />
    </group>
  );
}

/** Ombre au sol liée à la hauteur de flottaison : plus le modèle monte, plus elle se resserre et pâlit. */
function Stage(props: Props) {
  const floating = useRef<Group>(null);
  const shadow = useRef<Group>(null);
  const [bottom, setBottom] = useState(-0.6);

  useFrame(() => {
    const f = floating.current;
    const s = shadow.current;
    if (!f || !s) return;
    const t = MathUtils.clamp(MathUtils.inverseLerp(FLOAT_RANGE[0], FLOAT_RANGE[1], f.position.y), 0, 1);
    const k = 1 - 0.28 * t;
    s.scale.set(k, 1, k);
    s.traverse((o) => {
      if (o instanceof Mesh && o.material instanceof MeshBasicMaterial) o.material.opacity = 0.55 - 0.25 * t;
    });
  });

  return (
    <>
      <Suspense fallback={null}>
        <Float ref={floating} speed={1.6} rotationIntensity={0.12} floatIntensity={1} floatingRange={FLOAT_RANGE}>
          <Sneaker {...props} onBottom={setBottom} />
        </Float>
      </Suspense>
      <group ref={shadow} position={[0, bottom - 0.14, 0]}>
        <ContactShadows opacity={0.55} scale={4.2} blur={2.4} far={1.6} resolution={512} color="#1a1a18" />
      </group>
    </>
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
      <Canvas dpr={[1, 1.5]} frameloop={visible ? "always" : "never"} camera={{ position: [0, 0.6, 6], fov: 30 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
        {/* éclairage studio neutre : clé, contre-jour, fill (et l'environnement HDR par-dessus) */}
        <hemisphereLight args={["#ffffff", "#d9d7d1", 1.1]} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} />
        <directionalLight position={[-4, 3, -4]} intensity={1.4} />
        <directionalLight position={[-3, 1, 5]} intensity={0.8} />
        <Stage {...props} />
        <Quiet>
          <Suspense fallback={null}>
            <Environment preset="studio" environmentIntensity={0.9} />
          </Suspense>
        </Quiet>
      </Canvas>
    </div>
  );
}
