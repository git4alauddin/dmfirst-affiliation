import {cp, mkdir, rm} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "dist");
const publicEntries = [
    "index.html",
    "registration.html",
    "deposit-preview.html",
    "iframe-test.html",
    "css",
    "js",
    "assets",
];

// Recreate only this project's generated dist directory on every build.
await rm(output, {recursive: true, force: true});
await mkdir(output, {recursive: true});
for (const entry of publicEntries) {
    await cp(resolve(root, entry), resolve(output, entry), {recursive: true});
}
console.log("Built public site in dist/ (HTML, CSS, JavaScript, and assets only).");
