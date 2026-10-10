import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Capacitor (Android) and Tauri (Windows/iOS) both serve the built app from a
// local/custom scheme, not from "/", so asset URLs must stay relative.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "www",
    emptyOutDir: true,
  },
});
