// Builds index.html from src/index.html as one self-contained file.
// pi-web previews HTML in a sandboxed srcdoc iframe, so relative URLs do not resolve:
// every screenshot is inlined as a data URI. Usage: node build.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const here = import.meta.dirname;
const types = { webp: "image/webp", png: "image/png", jpg: "image/jpeg" };

const html = readFileSync(join(here, "src/index.html"), "utf8").replace(
  /<!--SHOT:([\w-]+)-->\s*<div class="ph">[\s\S]*?<\/div>/g,
  (placeholder, name) => {
    for (const [ext, type] of Object.entries(types)) {
      const file = join(here, "assets", `${name}.${ext}`);
      if (existsSync(file)) {
        const data = readFileSync(file).toString("base64");
        return `<img src="data:${type};base64,${data}" alt="">`;
      }
    }
    console.warn(`missing screenshot: assets/${name}.*`);
    return placeholder;
  },
);

writeFileSync(join(here, "index.html"), html);
console.log(`index.html: ${(Buffer.byteLength(html) / 1024).toFixed(0)} KiB`);
