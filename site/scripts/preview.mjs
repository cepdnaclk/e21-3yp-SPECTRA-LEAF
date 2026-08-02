import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { docsRoot } from "./video-utils.mjs";

const prefix = "/e21-3yp-SPECTRA-LEAF";
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

createServer((request, response) => {
  let pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  if (pathname === "/") {
    response.writeHead(302, { Location: `${prefix}/` });
    response.end();
    return;
  }
  if (pathname.startsWith(prefix)) pathname = pathname.slice(prefix.length);
  const relative = pathname.replace(/^\/+/, "") || "index.html";
  let file = path.resolve(docsRoot, relative);
  if (!file.startsWith(docsRoot)) {
    response.writeHead(403).end();
    return;
  }
  try {
    if (statSync(file).isDirectory()) file = path.join(file, "index.html");
    response.writeHead(200, {
      "Content-Type": types[path.extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    createReadStream(path.join(docsRoot, "404.html")).pipe(response);
  }
}).listen(4173, "127.0.0.1", () => {
  console.log(`Preview: http://127.0.0.1:4173${prefix}/`);
});
