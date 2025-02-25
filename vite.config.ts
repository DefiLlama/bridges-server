import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/server/index.ts"),
        startCron: path.resolve(__dirname, "src/server/startCron.ts"),
      },
      formats: ["cjs"],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ["fastify", "@fastify/cors", ...Object.keys(require("./package.json").dependencies)],
    },
    ssr: true,
    target: "node16",
    outDir: "dist",
  },
});
