// Prépare les modèles 3D : assets/models/<nom>-source.glb → public/models/<nom>.glb
// 1. calcule des normales lisses si elles manquent (sinon rendu en facettes)
// 2. matériau non métallique si aucun réglage n'est fourni (sinon glTF le traite en métal pur : rendu noir)
// 3. optimise : textures WebP 1024 px, géométrie compressée Meshopt (cible < 1 Mo)
import { execFileSync } from "node:child_process";
import { readdirSync, statSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { NodeIO } from "@gltf-transform/core";

const src = "assets/models";
const only = process.argv[2]; // optionnel : ne traiter qu'un modèle, ex. `npm run optimize:model sacs`
const io = new NodeIO();

/**
 * Normales lisses : chaque sommet reçoit la moyenne (pondérée par l'aire) des faces qui le touchent,
 * en regroupant les sommets par position pour lisser aussi les coutures d'UV. Le maillage reste indexé.
 */
function smoothNormals(doc) {
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      if (prim.getAttribute("NORMAL")) continue;
      const pos = prim.getAttribute("POSITION").getArray();
      const count = pos.length / 3;
      const index = prim.getIndices()?.getArray() ?? Uint32Array.from({ length: count }, (_, i) => i);
      const key = (i) => `${pos[3 * i].toFixed(5)},${pos[3 * i + 1].toFixed(5)},${pos[3 * i + 2].toFixed(5)}`;
      const acc = new Map();
      for (let t = 0; t < index.length; t += 3) {
        const [a, b, c] = [index[t], index[t + 1], index[t + 2]];
        const ux = pos[3 * b] - pos[3 * a], uy = pos[3 * b + 1] - pos[3 * a + 1], uz = pos[3 * b + 2] - pos[3 * a + 2];
        const vx = pos[3 * c] - pos[3 * a], vy = pos[3 * c + 1] - pos[3 * a + 1], vz = pos[3 * c + 2] - pos[3 * a + 2];
        const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
        for (const v of [a, b, c]) {
          const k = key(v);
          const s = acc.get(k) ?? [0, 0, 0];
          s[0] += n[0]; s[1] += n[1]; s[2] += n[2];
          acc.set(k, s);
        }
      }
      const out = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const [x, y, z] = acc.get(key(i)) ?? [0, 1, 0];
        const l = Math.hypot(x, y, z) || 1;
        out.set([x / l, y / l, z / l], 3 * i);
      }
      const buffer = doc.getRoot().listBuffers()[0];
      prim.setAttribute("NORMAL", doc.createAccessor().setType("VEC3").setArray(out).setBuffer(buffer));
    }
  }
}

for (const file of readdirSync(src).filter((f) => f.endsWith("-source.glb"))) {
  const name = file.replace("-source.glb", "");
  if (only && name !== only) continue;
  const tmp = join(tmpdir(), `${name}-normals.glb`);
  const out = join("public/models", `${name}.glb`);
  const doc = await io.read(join(src, file));
  smoothNormals(doc);
  for (const mat of doc.getRoot().listMaterials()) {
    if (!mat.getMetallicRoughnessTexture()) mat.setMetallicFactor(0).setRoughnessFactor(0.55);
  }
  await io.write(tmp, doc);
  execFileSync("npx", ["gltf-transform", "optimize", tmp, out, "--texture-compress", "webp", "--texture-size", "1024", "--compress", "meshopt"], { stdio: "inherit" });
  rmSync(tmp);
  console.log(`${out} : ${(statSync(out).size / 1024).toFixed(0)} Ko`);
}
