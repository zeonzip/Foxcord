import * as path from "node:path";
import * as esbuild from "esbuild";

await esbuild.build({
	entryPoints: ["src/universal/preload.ts"],
	bundle: true,
	minify: true,
	outfile: "dist/preload-hook.js",
	jsx: "automatic",
	jsxImportSource: "bsjd",

	loader: {
		".css": "text",
	},

	alias: {
		"bsjd/jsx-runtime": path.resolve("build/runtime/runtime.ts"),
	},
});
