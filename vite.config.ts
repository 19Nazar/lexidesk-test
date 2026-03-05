import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ command }) => ({
    plugins: [react()],
    // В dev-режиме build.lib не нужен — работает обычный dev server с index.html
    ...(command === "build" && {
        build: {
            lib: {
                entry: resolve(__dirname, "src/widget-entry.tsx"),
                name: "AIVoiceWidget",
                fileName: "ai-voice-widget",
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
