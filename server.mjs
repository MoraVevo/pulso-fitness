import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve("dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
  ".task": "application/octet-stream",
  ".mp4": "video/mp4",
};
http
  .createServer((req, res) => {
    let file;
    try {
      file = path.resolve(
        root,
        "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
      );
    } catch {
      res.writeHead(400).end();
      return;
    }
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    if (file === root) file = path.join(root, "index.html");
    // Rango de bytes: el navegador lo usa para buscar dentro de los videos y
    // para descargar el modelo por partes. GitHub Pages lo soporta de serie.
    const size = fs.statSync(file).size;
    const type = types[path.extname(file)] || "application/octet-stream";
    const range = req.headers.range;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      let start = match && match[1] ? parseInt(match[1], 10) : 0;
      let end = match && match[2] ? parseInt(match[2], 10) : size - 1;
      if (isNaN(start) || start >= size || end >= size || start > end) {
        res.writeHead(416, { "Content-Range": `bytes */${size}` }).end();
        return;
      }
      res.writeHead(206, {
        "Content-Type": type,
        "Content-Length": end - start + 1,
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache",
      });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }
    res
      .writeHead(200, {
        "Content-Type": type,
        "Content-Length": size,
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache",
      });
    fs.createReadStream(file).pipe(res);
  })
  .listen(4173, "127.0.0.1", () => console.log("Local: http://127.0.0.1:4173"));
