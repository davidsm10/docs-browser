import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import zipPack from "vite-plugin-zip-pack";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    viteStaticCopy({
      targets: [{ src: "*.tar.xz", dest: "./" }],
    }),
    zipPack({ outDir: "./dist", outFileName: "app.xdc" }),
  ],
});
