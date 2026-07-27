import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import {
  assertInside,
  backupRoot,
  copyVerified,
  docsAssets,
  docsRoot,
  legacyVideoNames,
  repoRoot,
  verifyFile,
  videoNames,
} from "./video-utils.mjs";

assertInside(repoRoot, docsRoot, "Documentation output");
assertInside(repoRoot, backupRoot, "Video backup");

await mkdir(backupRoot, { recursive: true });

for (const name of videoNames) {
  const source = path.join(docsAssets, name);
  await verifyFile(source, `Protected ${name}`);
  await copyVerified(source, path.join(backupRoot, name));
}

for (const name of legacyVideoNames) {
  const source = path.join(docsAssets, name);
  try {
    await verifyFile(source, `Legacy protected ${name}`);
    await copyVerified(source, path.join(backupRoot, name));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

await mkdir(docsRoot, { recursive: true });
for (const entry of await readdir(docsRoot, { withFileTypes: true })) {
  const target = path.resolve(docsRoot, entry.name);
  assertInside(docsRoot, target, "Generated documentation entry");
  await rm(target, { recursive: true, force: true });
}

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

console.log("Backed up protected videos, cleaned docs safely, and restored video assets.");
