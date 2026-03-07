import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ command }) => ({
    plugins: [react()],
    define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
        "process.env": "{}",
    },
    ...(command === "build" && {
        build: {
            lib: {
                entry: resolve(__dirname, "src/widget-entry.tsx"),
                name: "LexideskTest",
                fileName: "lexidesk-test",
                formats: ["iife"],
            },
            rollupOptions: {
                external: [],
            },
        },
    }),
    server: {
        port: 5173,
    },
}));
