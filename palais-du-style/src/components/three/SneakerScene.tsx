"use client";

/**
 * Sneaker 3D du hero. Chargée à la demande (dynamic import, ssr:false) : tout three.js est ici.
 * Le modèle est normalisé (Box3) pour occuper la même place quel que soit le fichier fourni.
 */
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, useGLTF } from "@react-three/drei";
import { Box3, Group, MathUtils, Vector3 } from "three";

const TURN_SECONDS = 24; // un tour lent toutes les 24 s

function Model({ url, onReady }: { url: string; onReady: () => void }) {
  const { scene } = useGLTF(url, false, true);
  const spin = useRef<Group>(null);
  const fitted = useMemo(() => {
    const root = scene.clone(true);
    const box = new Box3().setFromObject(root);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const s = 3 / Math.max(size.x, size.z, size.y * 1.6);
    return { root, s, offset: center.multiplyScalar(-s) };
  }, [scene]);

  useEffect(() => onReady(), [onReady]);

  useFrame((state, dt) => {
    if (!spin.current) return;
    spin.current.rotation.y += (Math.min(dt, 0.05) * Math.PI * 2) / TURN_SECONDS;
    // légère inclinaison vers le pointeur (souris ou doigt), très amortie
    spin.current.rotation.x = MathUtils.damp(spin.current.rotation.x, state.pointer.y * -0.12, 2, dt);
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.6} floatingRange={[-0.06, 0.06]}>
      <group ref={spin} rotation={[0, -0.6, 0]}>
        <primitive object={fitted.root} scale={fitted.s} position={fitted.offset} />
      </group>
    </Float>
  );
}

export default function SneakerScene({ url, paused, onReady }: { url: string; paused: boolean; onReady: () => void }) {
  return (
    <Canvas frameloop={paused ? "never" : "always"} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} camera={{ position: [0, 0.6, 5.2], fov: 30 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <Suspense fallback={null}>
        {/* reflets de studio locaux (aucun fichier HDR téléchargé) */}
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={2.5} position={[-4, 2, 3]} rotation={[0, Math.PI / 3, 0]} scale={[5, 1.5, 1]} />
          <Lightformer form="rect" intensity={1.5} position={[4, 1, 3]} rotation={[0, -Math.PI / 3, 0]} scale={[4, 1, 1]} />
          <Lightformer form="rect" intensity={1} position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[6, 6, 1]} />
        </Environment>
        <Model url={url} onReady={onReady} />
        <ContactShadows position={[0, -0.95, 0]} opacity={0.35} scale={6} blur={2.6} far={2} color="#0e0e0c" />
      </Suspense>
    </Canvas>
  );
}
