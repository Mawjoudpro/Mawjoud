import { PhotoSlot } from "@/components/ui/PhotoSlot";

/** Pièce jointe photo dans une bulle : image arrondie (14 px, soit le rayon de la bulle moins sa marge). */
export function ChatImage({ src, alt, caption, ratio = "4/5" }: { src?: string | null; alt: string; caption: string; ratio?: string }) {
  return <PhotoSlot src={src} alt={alt} caption={caption} tone={3} ratio={ratio} sizes="260px" className="rounded-[14px]" />;
}
