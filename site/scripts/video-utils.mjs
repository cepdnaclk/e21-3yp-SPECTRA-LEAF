import { access, copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const repoRoot = path.resolve(siteRoot, "..");
export const docsRoot = path.resolve(repoRoot, "docs");
export const docsAssets = path.resolve(docsRoot, "assets");
export const backupRoot = path.resolve(siteRoot, ".video-backup");
export const publicAssets = path.resolve(siteRoot, "public", "assets");
export const videoNames = ["video1.mp4", "video2.mp4"];
export const scrubVideoNames = ["video1-scrub.mp4", "video2-scrub.mp4"];
export const completeVideoNames = ["complete vedio.mp4", "complete-vedio-scroll.mp4"];
export const legacyVideoNames = ["vedio1.mp4", "vedio2.mp4"];

export function assertInside(parent, child, label) {
  const relative = path.relative(parent, child);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} resolved outside the permitted directory.`);
  }
}

export async function verifyFile(filePath, label = filePath) {
  await access(filePath);
  const details = await stat(filePath);
  if (!details.isFile() || details.size <= 0) {
    throw new Error(`${label} is missing or empty: ${filePath}`);
  }
  return details.size;
}

export async function copyVerified(source, destination) {
  await verifyFile(source, "Source video");
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
  await verifyFile(destination, "Copied video");
}
