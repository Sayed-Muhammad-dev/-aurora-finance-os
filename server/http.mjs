import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handle, config } from "./backend.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  production = process.argv.includes("--production");
const port = Number(
  process.env.API_PORT ||
    { aurora: 5313, averra: 5314, kinetic: 5315 }[config.id],
);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};
export async function respond(req, res) {
  try {
    const url = new URL(
        req.url,
        `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`,
      ),
      pathname = decodeURIComponent(url.pathname);
    if (pathname.startsWith("/api/app/")) {
      const chunks = [];
      let bytes = 0;
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > 300000) {
          res.writeHead(413, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Request too large." }));
          return;
        }
        chunks.push(chunk);
      }
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers))
        if (value !== undefined)
          headers.set(key, Array.isArray(value) ? value.join(",") : value);
      const response = await handle(
        new Request(url, {
          method: req.method,
          headers,
          body: ["GET", "HEAD"].includes(req.method)
            ? undefined
            : Buffer.concat(chunks),
        }),
      );
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405);
      res.end("Method not allowed");
      return;
    }
    let relative, base;
    if (
      pathname === "/workspace" ||
      pathname === "/workspace/" ||
      pathname === "/workspace.html"
    ) {
      relative = "workspace.html";
      base = path.join(root, "public");
    } else if (pathname.startsWith("/workspace-assets/")) {
      relative = pathname.slice(1);
      base = path.join(root, "public");
    } else if (config.id === "averra") {
      relative = pathname === "/" ? "index.html" : pathname.slice(1);
      base = root;
      if (
        !/^[\w-]+\.html$/.test(relative) &&
        !/^src\/(js|styles|assets)\//.test(relative)
      ) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
    } else if (production) {
      relative = pathname.slice(1) || "index.html";
      base = path.join(root, "dist");
    } else {
      res.writeHead(404);
      res.end("Open the frontend dev server for the public application.");
      return;
    }
    let file = path.resolve(base, relative);
    if (
      !file.startsWith(path.resolve(base) + path.sep) ||
      !mime[path.extname(file)] ||
      relative.split(/[\\/]/).some((p) => p.startsWith("."))
    ) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    try {
      await stat(file);
    } catch {
      if (production && config.id !== "averra" && !path.extname(relative))
        file = path.join(base, "index.html");
      else {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
    }
    res.writeHead(200, {
      "Content-Type": mime[path.extname(file)],
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": pathname.startsWith("/workspace")
        ? "no-store"
        : "no-cache",
    });
    res.end(req.method === "HEAD" ? "" : await readFile(file));
  } catch (e) {
    console.error("HTTP request failed:", e.code || e.name);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Request could not be completed." }));
  }
}
if (!process.env.VERCEL) {
  http
    .createServer(respond)
    .listen(port, "127.0.0.1", () =>
      console.log(
        `${config.name} API and workspace: http://127.0.0.1:${port}/workspace`,
      ),
    );
}
