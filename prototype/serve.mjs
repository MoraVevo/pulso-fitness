// Servidor local del prototipo de análisis por video. No se publica en Pages.
// Sirve prototype/ en la raíz y monta dist/vendor/ en /vendor para probar MediaPipe.
// Implementa peticiones Range: sin ellas el navegador trata el video como no
// buscable y los seeks vuelven siempre al fotograma 0.
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join, normalize, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./", import.meta.url));
const vendor = join(root, "..", "dist", "vendor");
const port = process.env.PORT || 4174;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
  ".task": "application/octet-stream",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

async function resolveFile(urlPath) {
  let base, relative;
  if (urlPath.startsWith("/vendor/")) {
    base = vendor;
    relative = urlPath.slice("/vendor/".length);
  } else {
    base = root;
    relative = urlPath === "/" ? "video-analysis.html" : urlPath.slice(1);
  }
  const target = normalize(join(base, relative));
  if (!target.startsWith(normalize(base))) return null;
  try {
    const info = await stat(target);
    if (info.isDirectory()) return null;
    return { file: target, size: info.size };
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://x");
    // Guardar el fixture exportado durante la sesión de prueba.
    if (req.method === "POST" && url.pathname === "/save-fixture") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const { writeFile } = await import("node:fs/promises");
      const out = join(root, "fixture.json");
      await writeFile(out, Buffer.concat(chunks));
      res.writeHead(200, { "content-type": "application/json" });
      res.end('{"ok":true}');
      return;
    }
    const found = await resolveFile(decodeURIComponent(url.pathname));
    if (!found) {
      res.writeHead(404).end("No encontrado");
      return;
    }
    const { file, size } = found;
    const type = mime[extname(file).toLowerCase()] || "application/octet-stream";
    const range = req.headers.range;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      let start = match && match[1] ? parseInt(match[1], 10) : 0;
      let end = match && match[2] ? parseInt(match[2], 10) : size - 1;
      if (isNaN(start) || start >= size || end >= size || start > end) {
        res.writeHead(416, { "content-range": `bytes */${size}` }).end();
        return;
      }
      res.writeHead(206, {
        "content-type": type,
        "content-length": end - start + 1,
        "content-range": `bytes ${start}-${end}/${size}`,
        "accept-ranges": "bytes",
        "cache-control": "no-store",
      });
      createReadStream(file, { start, end }).pipe(res);
      return;
    }
    res.writeHead(200, {
      "content-type": type,
      "content-length": size,
      "accept-ranges": "bytes",
      "cache-control": "no-store",
    });
    createReadStream(file).pipe(res);
  } catch (err) {
    res.writeHead(500).end(String(err));
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Prototipo en http://127.0.0.1:${port}`);
});
