import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/server/index.ts"),
      formats: ["cjs"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: ["fastify", "@fastify/cors", ...Object.keys(require("./package.json").dependencies)],
    },
    ssr: true,
    target: "node16",
    outDir: "dist",
  },
});
