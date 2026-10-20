import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {dirname, extname, resolve, sep} from "node:path";
import {fileURLToPath} from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 4173);
const mime = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".webp": "image/webp",
    ".jpg": "image/jpeg",
    ".woff2": "font/woff2"
};

const server = createServer(async (request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405, {Allow: "GET, HEAD"}).end();
        return;
    }
    try {
        const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
        const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
        const target = resolve(root, relative);
        const publicFile = ["index.html", "registration.html", "deposit-preview.html", "iframe-test.html"].includes(relative) || /^(css|js|assets)\//.test(relative);
        if (!publicFile || !target.startsWith(root + sep) || relative.split(/[\\/]/).some((part) => part.startsWith("."))) {
            response.writeHead(404).end("Not found");
            return;
        }
        const file = await readFile(target);
        response.writeHead(200, {
            "Content-Type": `${mime[extname(target)] || "application/octet-stream"}${/\.(html|css|js|svg)$/.test(target) ? "; charset=utf-8" : ""}`,
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff"
        });
        response.end(request.method === "HEAD" ? undefined : file);
    } catch {
        response.writeHead(404).end("Not found");
    }
});
server.on("error", (error) => {
    console.error(`Could not start the preview server: ${error.message}`);
    process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => {
    const actualPort = server.address().port;
    console.log(`Full landing and registration flow: http://127.0.0.1:${actualPort}/`);
    console.log(`Landing preview without navigation: http://127.0.0.1:${actualPort}/?preview=1`);
    console.log(`Registration wrapper: http://127.0.0.1:${actualPort}/registration.html`);
    console.log(`Deposit popup preview: http://127.0.0.1:${actualPort}/deposit-preview.html`);
    console.log(`Iframe compatibility test: http://127.0.0.1:${actualPort}/iframe-test.html`);
});
