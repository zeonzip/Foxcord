import * as esbuild from 'esbuild';
import fs from 'node:fs/promises';
import { createPackage } from '@electron/asar';

await fs.copyFile("../core/dist/preload-hook.js", "./dist/asar/preload-hook.js");

await esbuild.build({
    entryPoints: {
        "bootstrap": "./src/bootstrap.ts",
        "foxcord-trampoline": "./src/trampoline.ts"
    },
    bundle: true,
    minify: true,
    outdir: "./dist/asar",
    format: "cjs",
    packages: "external",
});

await fs.copyFile("./package.json", "./dist/asar/package.json");
await createPackage("./dist/asar", "./dist/app.asar")