import { defineConfig } from "tsdown";

export default defineConfig({
	entry: "./src/index.ts",
	format: "esm",
	outDir: "./dist",
	clean: true,
	noExternal: [/@toiletadvisor\/.*/],
	external: ["argon2", "node-gyp-build", "node-gyp-build-optional-packages"],
});
