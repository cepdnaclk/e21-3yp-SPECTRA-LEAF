import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataRoot = path.join(siteRoot, "public", "data");
const metadataPath = path.join(dataRoot, "index.json");

const metadata = JSON.parse(await readFile(metadataPath, "utf8"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function jpegDimensions(buffer) {
  assert(buffer[0] === 0xff && buffer[1] === 0xd8, "Expected a JPEG image.");

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    const isStartOfFrame = [
      0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
      0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
    ].includes(marker);

    if (isStartOfFrame) {
      return {
        width: buffer.readUInt16BE(offset + 7),
        height: buffer.readUInt16BE(offset + 5),
      };
    }

    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }

    const segmentLength = buffer.readUInt16BE(offset + 2);
    assert(segmentLength >= 2, "Invalid JPEG segment length.");
    offset += 2 + segmentLength;
  }

  throw new Error("Could not read JPEG dimensions.");
}

async function validateImage(filename, expectedWidth, expectedHeight) {
  const dimensions = jpegDimensions(await readFile(path.join(dataRoot, filename)));
  assert(
    dimensions.width === expectedWidth && dimensions.height === expectedHeight,
    `${filename} must be ${expectedWidth}x${expectedHeight}; found ${dimensions.width}x${dimensions.height}.`,
  );
}

assert(metadata.visibility === true, "visibility must be true.");
assert(metadata.title === "SPECTRA LEAF", "Use the official project title.");
assert(Array.isArray(metadata.team) && metadata.team.length === 4, "Exactly four team members are required.");
assert(Array.isArray(metadata.supervisors) && metadata.supervisors.length >= 1, "At least one supervisor is required.");
assert(Array.isArray(metadata.tags) && metadata.tags.length > 0, "At least one project tag is required.");
assert(metadata.image === "cover_page.jpg", "image must point to cover_page.jpg.");
assert(metadata.thumbnail === "thumbnail.jpg", "thumbnail must point to thumbnail.jpg.");

for (const member of metadata.team) {
  assert(member.name && member.email && member.eNumber, "Every team member needs a name, email and eNumber.");
  assert(/^e21\d{3}@eng\.pdn\.ac\.lk$/i.test(member.email), `Invalid student email: ${member.email}`);
  assert(/^E\/21\/\d{3}$/.test(member.eNumber), `Invalid registration number: ${member.eNumber}`);
}

for (const supervisor of metadata.supervisors) {
  assert(supervisor.name && supervisor.email, "Every supervisor needs a name and email.");
  assert(/@eng\.pdn\.ac\.lk$/i.test(supervisor.email), `Invalid supervisor email: ${supervisor.email}`);
}

await validateImage(metadata.image, 940, 352);
await validateImage(metadata.thumbnail, 640, 360);

console.log("Department project metadata and listing images are valid.");
