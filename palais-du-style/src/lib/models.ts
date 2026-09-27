import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Vérifie au build qu'un modèle 3D existe dans /public.
 * Si le fichier est absent, le site garde l'image fixe, sans requête inutile côté client.
 */
export function modelAvailable(url: string | null | undefined): url is string {
  return !!url && existsSync(join(process.cwd(), "public", url));
}
