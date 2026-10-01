"use client";

/**
 * Modèle 3D de la pièce centrale (si content/hero-products.json en indique un et que l'appareil suit).
 * Un seul Canvas pour toute la vitrine : il change de modèle avec la pièce active.
 */
import { Component, Suspense, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, useGLTF } from "@react-three/drei";
import { Box3, Group, Vector3 } from "three";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url, false, true);
  const spin = useRef<Group>(null);
  const fitted = useMemo(() => {
    const root = scene.clone(true);
    const box = new Box3().setFromObject(root);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const s = 2.6 / Math.max(size.x, size.y, size.z);
    return { root, s, offset: center.multiplyScalar(-s) };
  }, [scene]);
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += (Math.min(dt, 0.05) * Math.PI * 2) / 24; // rotation lente : un tour en 24 s
  });
  return (
    <Float speed={1.4} rotationIntensity={0} floatIntensity={0.5} floatingRange={[-0.06, 0.06]}>
      <group ref={spin} rotation={[0.12, -0.6, 0]}>
        <primitive object={fitted.root} scale={fitted.s} position={fitted.offset} />
      </group>
    </Float>
  );
}

/** L'éclairage « studio » vient d'un CDN : s'il échoue, on garde les lumières locales sans casser la scène. */
class Optional extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function HeroModel({ url }: { url: string }) {
  return (
    <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0.4, 5.4], fov: 32 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} />
      <Optional>
        <Suspense fallback={null}>
          <Environment preset="studio" />
        </Suspense>
      </Optional>
      <Suspense fallback={null}>
        <Model url={url} />
        <ContactShadows position={[0, -1.35, 0]} opacity={0.35} scale={6} blur={2.6} far={2} color="#0e0e0c" />
      </Suspense>
    </Canvas>
  );
}
