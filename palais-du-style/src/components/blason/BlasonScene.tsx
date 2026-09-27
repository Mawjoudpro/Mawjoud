"use client";

/**
 * Blason en or massif. Chargé à la demande (dynamic import, ssr:false) : tout le code three.js est ici.
 *
 * Géométrie : SVG vectorisé → ExtrudeGeometry avec biseau fin (les arêtes accrochent la lumière).
 * Quand le blason montre son dos, on affiche une copie tournée de 180° : le texte se lit toujours
 * dans le bon sens. La bascule se fait quand il est vu par la tranche, donc invisible.
 * Matériau : or jaune de joaillerie satiné, avec un léger vernis.
 * Reflets : softboxes (Lightformers) blanches et une chaude, comme une photo studio de montre.
 */
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment, Float, Lightformer, PerspectiveCamera, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { BufferAttribute, BufferGeometry, ExtrudeGeometry, Group, MathUtils, Mesh, Vector3 } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Tilt } from "@/lib/device-tilt";

export type BlasonMode = "hero" | "loader" | "small";

const TURN_SECONDS = 40; // un tour complet toutes les 40 s
const MAX_TILT = MathUtils.degToRad(8);
const WIDTH = 2.7; // largeur du blason dans la scène

/** Le SVG a l'axe Y vers le bas : on le retourne, puis on rétablit l'ordre des sommets (sinon faces invisibles). */
function flipY(geo: BufferGeometry) {
  geo.scale(1, -1, 1);
  for (const name of Object.keys(geo.attributes)) {
    const attr = geo.getAttribute(name) as BufferAttribute;
    const size = attr.itemSize;
    const a = attr.array;
    for (let t = 0; t < attr.count; t += 3) {
      for (let k = 0; k < size; k++) {
        const i1 = (t + 1) * size + k;
        const i2 = (t + 2) * size + k;
        const tmp = a[i1];
        a[i1] = a[i2];
        a[i2] = tmp;
      }
    }
    attr.needsUpdate = true;
  }
}

function useBlasonGeometry(url: string, detail: number) {
  const svg = useLoader(SVGLoader, url);
  return useMemo(() => {
    const parts: BufferGeometry[] = [];
    for (const path of svg.paths) {
      for (const shape of SVGLoader.createShapes(path)) {
        parts.push(
          new ExtrudeGeometry(shape, {
            depth: 7, // épaisseur modérée (unités du SVG, 700 de large)
            bevelEnabled: true,
            bevelThickness: 1.6,
            bevelSize: 1.1,
            bevelSegments: 3, // biseau arrondi fin
            curveSegments: detail,
          }),
        );
      }
    }
    const geo = mergeGeometries(parts);
    parts.forEach((p) => p.dispose());
    flipY(geo);
    geo.computeBoundingBox();
    const box = geo.boundingBox!;
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    // centré sur les trois axes : le blason tourne autour de son propre centre
    geo.translate(-center.x, -center.y, -center.z);
    const s = WIDTH / size.x;
    geo.scale(s, s, s);
    return geo;
  }, [svg, detail]);
}

function Gold() {
  // or jaune satiné : métal pur, rugosité moyenne (brossé), vernis léger pour la profondeur
  return <meshPhysicalMaterial color="#e2bd66" metalness={1} roughness={0.28} clearcoat={0.35} clearcoatRoughness={0.2} envMapIntensity={1.35} />;
}

function Emblem({ url, mode, detail, tilt, onReady }: { url: string; mode: BlasonMode; detail: number; tilt: () => Tilt; onReady: () => void }) {
  const geo = useBlasonGeometry(url, detail);
  const spin = useRef<Group>(null);
  const lean = useRef<Group>(null);
  const front = useRef<Mesh>(null);
  const back = useRef<Mesh>(null);

  useEffect(() => onReady(), [onReady]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05); // pas de saut après une pause
    if (spin.current) {
      spin.current.rotation.y += (d * Math.PI * 2) / TURN_SECONDS;
      const facing = Math.cos(spin.current.rotation.y) >= 0;
      if (front.current) front.current.visible = facing;
      if (back.current) back.current.visible = !facing;
    }
    if (lean.current && mode === "hero") {
      const t = tilt();
      // fortement amorti : le blason suit la main avec retenue, jamais d'à-coup
      lean.current.rotation.x = MathUtils.damp(lean.current.rotation.x, t.y * MAX_TILT, 1.6, d);
      lean.current.rotation.z = MathUtils.damp(lean.current.rotation.z, -t.x * MAX_TILT, 1.6, d);
    }
  });

  return (
    <group ref={lean}>
      <Float speed={0.8} rotationIntensity={0} floatIntensity={0.5} floatingRange={[-0.05, 0.05]}>
        {/* départ de trois quarts */}
        <group ref={spin} rotation={[0, -0.45, 0]}>
          <mesh ref={front} geometry={geo}>
            <Gold />
          </mesh>
          <mesh ref={back} geometry={geo} rotation={[0, Math.PI, 0]} visible={false}>
            <Gold />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

function StudioReflections() {
  return (
    <Environment resolution={256} frames={1}>
      {/* softboxes blanches : reflets nets et longs sur les volutes */}
      <Lightformer form="rect" intensity={3} color="#ffffff" position={[-4, 2, 3]} rotation={[0, Math.PI / 3, 0]} scale={[5, 1.4, 1]} />
      <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[4, 0.5, 3]} rotation={[0, -Math.PI / 3, 0]} scale={[4, 1, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[6, 6, 1]} />
      {/* une chaude, basse, pour le ton miel de l'or */}
      <Lightformer form="rect" intensity={2.4} color="#ffcf8a" position={[0, -3, 3]} rotation={[-Math.PI / 4, 0, 0]} scale={[6, 1.2, 1]} />
    </Environment>
  );
}

export type BlasonSceneProps = {
  url: string;
  mode: BlasonMode;
  paused: boolean;
  /** couleur de fond ; null = transparent (pages claires) */
  background: string | null;
  tilt: () => Tilt;
  onReady: () => void;
  /** rendu haute définition (génération de l'image fixe) */
  highQuality?: boolean;
};

export default function BlasonScene({ url, mode, paused, background, tilt, onReady, highQuality }: BlasonSceneProps) {
  const hero = mode === "hero";
  // mobile : moins d'anticrénelage, de paillettes et de pixels, pour rester fluide sur un Android moyen
  const [coarse] = useState(() => window.matchMedia("(pointer: coarse)").matches);
  const detail = highQuality ? 12 : hero && !coarse ? 9 : 6;
  return (
    <Canvas
      // pas de correction de ton ACES : elle assombrit l'or ; même rendu avec ou sans post-traitement
      flat
      frameloop={paused ? "never" : "always"}
      dpr={highQuality ? 2 : mode === "small" ? 1 : coarse ? [1, 1.25] : [1, 1.5]}
      gl={{ antialias: false, alpha: background == null, powerPreference: "high-performance" }}
    >
      {background && <color attach="background" args={[background]} />}
      {/* légère contre-plongée : le blason domine, majestueux */}
      <PerspectiveCamera makeDefault position={[0, -0.9, 6.4]} fov={28} onUpdate={(c) => c.lookAt(0, 0.1, 0)} />
      <ambientLight intensity={0.15} />
      {/* principale chaude, légèrement de côté */}
      <directionalLight position={[4, 3, 5]} intensity={1.6} color="#ffe1b0" />
      {/* contre-jour doux : détache la silhouette du noir */}
      <directionalLight position={[-3, 2.5, -5]} intensity={1.8} color="#fff6e6" />
      <Suspense fallback={null}>
        <StudioReflections />
        <Emblem url={url} mode={mode} detail={detail} tilt={tilt} onReady={onReady} />
      </Suspense>
      {mode !== "small" && !highQuality && (
        <Sparkles count={hero ? (coarse ? 36 : 50) : 20} scale={[5, 3.6, 2.4]} size={1.4} speed={0.12} opacity={0.55} noise={0.4} color="#e9d29a" />
      )}
      {/* même pipeline dans tous les modes : l'or a le même rendu partout.
          Bloom très discret, seulement sur les reflets les plus forts. */}
      <EffectComposer multisampling={coarse || mode === "small" ? 0 : 4}>
        <Bloom intensity={hero ? 0.35 : 0.25} luminanceThreshold={0.82} luminanceSmoothing={0.12} mipmapBlur radius={0.55} />
      </EffectComposer>
    </Canvas>
  );
}
