import { defineConfig } from "vite";
import ink from "./tools/vite-plugin-ink.ts";

export default defineConfig({
  plugins: [ink()],
});
