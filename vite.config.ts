import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ command, mode }) => ({
    plugins: [react()],
    define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
        "process.env": "{}",
    },
    build:
        mode === "widget"
            ? {
                  // npm run build -- --mode widget → собирает iife виджет
                  lib: {
                      entry: resolve(__dirname, "src/widget-entry.tsx"),
                      name: "LexideskTest",
                      fileName: "lexidesk-test",
                      formats: ["iife"],
                  },
                  rollupOptions: {
                      external: [],
                  },
              }
            : {
                  // npm run build → собирает обычную статику
                  outDir: "dist",
                  rollupOptions: {
                      input: resolve(__dirname, "index.html"),
                  },
              },
    server: {
        port: 5173,
        allowedHosts: true,
    },
    preview: {
        allowedHosts: true,
    },
}));
