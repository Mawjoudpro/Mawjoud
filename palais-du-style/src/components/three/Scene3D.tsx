"use client";

/**
 * Tout ce qui dépend de three.js est ici, chargé à la demande (dynamic import).
 * Un seul <Canvas> fixe pour toute la page ; chaque zone 3D est une <View> drei
 * posée dans le DOM (hero, tuiles de catégories) et dessinée dans ce canvas unique.
 */
import {
  Component,
  Suspense,
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
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Vector3,
  type Material,
  type Object3D,
} from "three";

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
