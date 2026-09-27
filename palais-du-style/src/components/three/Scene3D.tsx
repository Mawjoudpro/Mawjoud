"use client";

/**
 * Tout ce qui dépend de three.js est ici, chargé à la demande (dynamic import).
 * Un seul <Canvas> fixe pour toute la page ; chaque zone 3D est une <View> drei
 * posée dans le DOM (hero, tuiles de catégories) et dessinée dans ce canvas unique.
 */
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  PerspectiveCamera,
  useGLTF,
  View,
} from "@react-three/drei";
import {
  Box3,
  Color,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Vector3,
  type Material,
  type Object3D,
} from "three";
import type { MotionValue } from "framer-motion";

const TILT = MathUtils.degToRad(10);

/* ---------- canvas unique ---------- */

export function GlobalCanvas() {
  return (
    <Canvas
      // fixe, plein écran, sous l'en-tête (z-40) et ne capte aucun clic
      className="!fixed inset-0 z-30 !pointer-events-none"
      style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <View.Port />
    </Canvas>
  );
}

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

/** Éclairage studio neutre : clé, contre-jour, fill + environnement HDR "studio". */
function Studio() {
  return (
    <>
      <hemisphereLight args={["#ffffff", "#d9d7d1", 1.1]} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      <directionalLight position={[-4, 3, -4]} intensity={1.4} />
      <directionalLight position={[-3, 1, 5]} intensity={0.8} />
      <Quiet>
        <Suspense fallback={null}>
          <Environment preset="studio" environmentIntensity={0.9} />
        </Suspense>
      </Quiet>
    </>
  );
}

/* ---------- modèle normalisé ---------- */

type Fit = { width: number; height: number };

/**
 * Charge un GLB (Meshopt), le clone (le même fichier peut servir deux fois),
 * le centre et le met à l'échelle avec Box3 pour tenir dans `fit`.
 * La largeur utile tient compte de la rotation : max(x, z).
 */
function useNormalized(url: string, fit: Fit) {
  const { scene } = useGLTF(url, false, true);
  return useMemo(() => {
    const root = scene.clone(true);
    const materials: Material[] = [];
    root.traverse((o: Object3D) => {
      if (o instanceof Mesh) {
        o.material = (o.material as Material).clone();
        materials.push(o.material);
      }
    });
    const box = new Box3().setFromObject(root);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const s = Math.min(
      fit.width / Math.max(size.x, size.z),
      fit.height / size.y,
    );
    return {
      root,
      materials,
      scale: s,
      offset: center.multiplyScalar(-s),
      bottom: (-size.y * s) / 2,
    };
  }, [scene, fit.width, fit.height]);
}

/**
 * Fondu sans artefact : un voile de la couleur du fond, devant la caméra, dont l'opacité monte.
 * Le fond du hero étant uni, c'est visuellement identique à une baisse d'opacité du modèle
 * et de son ombre, sans problème de tri des faces transparentes.
 */
function FadeVeil({ amount }: { amount: () => number }) {
  const mat = useRef<MeshBasicMaterial>(null);
  const color = useMemo(
    () =>
      new Color(
        getComputedStyle(document.documentElement)
          .getPropertyValue("--paper")
          .trim() || "#f6f6f4",
      ),
    [],
  );
  useFrame(() => {
    if (mat.current) mat.current.opacity = amount();
  });
  return (
    <mesh position={[0, 0, 3.5]} renderOrder={10}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial
          toneMapped={false}
        ref={mat}
        color={color}
        transparent
        depthTest={false}
        depthWrite={false}
        opacity={0}
      />
    </mesh>
  );
}

/** Ombre au sol qui se resserre et pâlit quand l'objet monte (lié à la flottaison). */
function useShadowFollow(
  floating: React.RefObject<Group | null>,
  shadow: React.RefObject<Group | null>,
  range: number,
  base: number,
  fade: () => number,
) {
  useFrame(() => {
    const f = floating.current;
    const s = shadow.current;
    if (!f || !s) return;
    const t = MathUtils.clamp((f.position.y + range) / (2 * range), 0, 1);
    const k = 1 - 0.28 * t;
    s.scale.set(k, 1, k);
    s.traverse((o) => {
      if (o instanceof Mesh && o.material instanceof MeshBasicMaterial)
        o.material.opacity = (base - 0.2 * t) * fade();
    });
  });
}

/* ---------- hero ---------- */

const HERO_RANGE = 0.09;

function HeroModel({
  url,
  progress,
  takeVelocity,
  onReady,
}: {
  url: string;
  progress: MotionValue<number>;
  takeVelocity: () => number;
  onReady: () => void;
}) {
  const { root, scale, offset, bottom } = useNormalized(url, {
    width: 2.6,
    height: 1.6,
  });
  const rig = useRef<Group>(null);
  const spinner = useRef<Group>(null);
  const floating = useRef<Group>(null);
  const shadow = useRef<Group>(null);
  const st = useRef({
    spin: Math.PI / 2,
    drag: 0,
    fine: false,
    px: 0,
    py: 0,
    fade: 1,
  });

  useEffect(() => onReady(), [onReady]);

  useEffect(() => {
    const s = st.current;
    s.fine = window.matchMedia("(pointer: fine)").matches;
    const move = (e: PointerEvent) => {
      s.px = (e.clientX / window.innerWidth) * 2 - 1;
      s.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useShadowFollow(floating, shadow, HERO_RANGE, 0.55, () => 1);

  useFrame((_, dt) => {
    const s = st.current;
    s.drag += takeVelocity();
    s.spin += dt * 0.28;
    // scroll : 90° max, légère descente et fondu, terminés avant que le hero ne sorte de l'écran
    const p = MathUtils.clamp(progress.get() / 0.6, 0, 1);
    const fade = 1 - MathUtils.clamp((progress.get() - 0.2) / 0.4, 0, 1);
    s.fade = fade;
    if (rig.current) {
      rig.current.position.y = -0.35 * p;
      rig.current.rotation.y = p * (Math.PI / 2);
    }
    if (spinner.current) {
      spinner.current.rotation.y = s.spin + s.drag;
      spinner.current.rotation.x = MathUtils.damp(
        spinner.current.rotation.x,
        s.fine ? s.py * TILT : 0,
        4,
        dt,
      );
      spinner.current.rotation.z = MathUtils.damp(
        spinner.current.rotation.z,
        s.fine ? -s.px * TILT * 0.6 : 0,
        4,
        dt,
      );
    }
  });

  return (
    <>
      {/* modèle et ombre dans le même groupe : l'ombre suit toujours le modèle */}
      <group ref={rig}>
        <Float
          ref={floating}
          speed={1.6}
          rotationIntensity={0.12}
          floatIntensity={1}
          floatingRange={[-HERO_RANGE, HERO_RANGE]}
        >
          <group ref={spinner}>
            <primitive object={root} scale={scale} position={offset} />
          </group>
        </Float>
        <group ref={shadow} position={[0, bottom - 0.14, 0]}>
          <ContactShadows
            opacity={0.55}
            scale={4.2}
            blur={2.4}
            far={1.6}
            resolution={512}
            color="#1a1a18"
          />
        </group>
      </group>
      <FadeVeil amount={() => 1 - st.current.fade} />
    </>
  );
}

export function HeroView({
  url,
  progress,
  onReady,
}: {
  url: string;
  progress: MotionValue<number>;
  onReady: () => void;
}) {
  const drag = useRef({ velocity: 0 });
  const last = useRef<number | null>(null);
  // vitesse de rotation au drag, avec inertie
  const takeVelocity = useCallback(() => {
    const v = drag.current.velocity;
    drag.current.velocity *= 0.92;
    return v;
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (last.current == null) return;
      drag.current.velocity = (e.clientX - last.current) * 0.005;
      last.current = e.clientX;
    };
    const up = () => {
      last.current = null;
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
      onPointerDown={(e) => {
        last.current = e.clientX;
      }}
      aria-label="Sneaker en 3D, fais-la tourner"
      role="img"
    >
      <View className="absolute inset-0">
        <PerspectiveCamera
          makeDefault
          position={[0, 0.6, 6]}
          fov={30}
          onUpdate={(c) => c.lookAt(0, 0, 0)}
        />
        <Studio />
        <Suspense fallback={null}>
          <HeroModel
            url={url}
            progress={progress}
            takeVelocity={takeVelocity}
            onReady={onReady}
          />
        </Suspense>
      </View>
    </div>
  );
}

/* ---------- tuiles de catégories ---------- */

const TILE_RANGE = 0.05;

function TileModel({
  url,
  hovered,
  active,
  onReady,
}: {
  url: string;
  hovered: boolean;
  active: boolean;
  onReady: () => void;
}) {
  // même présence visuelle pour tous : cadré dans une boîte 1,7 × 1,7 (hauteur pour la doudoune)
  const { root, scale, offset, bottom } = useNormalized(url, {
    width: 1.7,
    height: 1.7,
  });
  const spinner = useRef<Group>(null);
  const zoom = useRef<Group>(null);
  const floating = useRef<Group>(null);
  const shadow = useRef<Group>(null);
  const st = useRef({ spin: 0.5, hovered, active });

  useEffect(() => {
    st.current.hovered = hovered;
    st.current.active = active;
  }, [hovered, active]);
  useEffect(() => onReady(), [onReady]);

  useShadowFollow(floating, shadow, TILE_RANGE, 0.5, () => 1);

  useFrame((_, dt) => {
    const s = st.current;
    if (s.active) s.spin += dt * (s.hovered ? 0.9 : 0.35);
    if (spinner.current) spinner.current.rotation.y = s.spin;
    if (zoom.current) {
      const k = MathUtils.damp(
        zoom.current.scale.x,
        s.hovered ? 1.05 : 1,
        6,
        dt,
      );
      zoom.current.scale.setScalar(k);
    }
  });

  return (
    <group ref={zoom}>
      <Float
        ref={floating}
        speed={1.2}
        rotationIntensity={0.05}
        floatIntensity={1}
        floatingRange={[-TILE_RANGE, TILE_RANGE]}
      >
        <group ref={spinner}>
          <primitive object={root} scale={scale} position={offset} />
        </group>
      </Float>
      <group ref={shadow} position={[0, bottom - 0.1, 0]}>
        <ContactShadows
          opacity={0.5}
          scale={3}
          blur={2.2}
          far={1.2}
          resolution={256}
          color="#1a1a18"
        />
      </group>
    </group>
  );
}

export function TileView(props: {
  url: string;
  hovered: boolean;
  active: boolean;
  onReady: () => void;
}) {
  return (
    // la View ne capte pas les clics : la tuile reste un lien
    <View className="pointer-events-none absolute inset-0">
      <PerspectiveCamera
        makeDefault
        position={[0, 0.5, 5.4]}
        fov={30}
        onUpdate={(c) => c.lookAt(0, 0, 0)}
      />
      <Studio />
      <Suspense fallback={null}>
        <TileModel {...props} />
      </Suspense>
    </View>
  );
}
