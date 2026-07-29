import path from "node:path";
import {
  assertInside,
  completeVideoNames,
  copyVerified,
  docsAssets,
  publicAssets,
  repoRoot,
  scrubVideoNames,
  verifyFile,
  videoNames,
} from "./video-utils.mjs";

assertInside(repoRoot, docsAssets, "Documentation assets");
assertInside(repoRoot, publicAssets, "Public assets");

for (const name of videoNames) {
  await copyVerified(path.join(docsAssets, name), path.join(publicAssets, name));
}

for (const name of scrubVideoNames) {
  await verifyFile(path.join(publicAssets, name), `Scroll-optimized ${name}`);
}

for (const name of completeVideoNames) {
  await verifyFile(path.join(publicAssets, name), `Complete film asset ${name}`);
}

console.log("Verified the original and scroll-optimized development video assets.");
