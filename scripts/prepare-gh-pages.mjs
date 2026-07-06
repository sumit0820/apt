import { cpSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = "dist/client";

cpSync(join(outDir, "index.html"), join(outDir, "404.html"));
writeFileSync(join(outDir, ".nojekyll"), "\n");

console.log("GitHub Pages artifacts ready in dist/client");
