import { MotionProvider } from "@/components/ui/MotionProvider";

/** Animations (filtres, galerie, formulaire) : chargées seulement sur ces pages, pas sur l'accueil. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <MotionProvider>{children}</MotionProvider>;
}
