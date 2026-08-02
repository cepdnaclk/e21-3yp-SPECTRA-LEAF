import { copyFile, cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  assertInside,
  backupRoot,
  completeVideoNames,
  copyVerified,
  docsAssets,
  docsRoot,
  legacyVideoNames,
  repoRoot,
  scrubVideoNames,
  siteRoot,
  verifyFile,
  videoNames,
} from "./video-utils.mjs";

const exportRoot = path.resolve(siteRoot, "out");
assertInside(repoRoot, docsRoot, "Documentation output");
assertInside(siteRoot, exportRoot, "Next.js export");

await mkdir(docsRoot, { recursive: true });
for (const entry of await readdir(docsRoot, { withFileTypes: true })) {
  const target = path.resolve(docsRoot, entry.name);
  assertInside(docsRoot, target, "Generated documentation entry");
  await rm(target, { recursive: true, force: true });
}
await cp(exportRoot, docsRoot, { recursive: true });
await mkdir(docsAssets, { recursive: true });

for (const name of videoNames) {
  await copyVerified(path.join(backupRoot, name), path.join(docsAssets, name));
}
for (const name of legacyVideoNames) {
  try {
    await copyVerified(path.join(backupRoot, name), path.join(docsAssets, name));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}
for (const name of scrubVideoNames) {
  await verifyFile(path.join(docsAssets, name), `Exported scroll-optimized ${name}`);
}
for (const name of completeVideoNames) {
  await verifyFile(path.join(docsAssets, name), `Exported complete film asset ${name}`);
}

await writeFile(path.join(docsRoot, ".nojekyll"), "", "utf8");
await copyFile(path.join(docsRoot, "index.html"), path.join(docsRoot, "404.html"));

console.log("Finalized GitHub Pages output in docs with protected videos and .nojekyll.");
