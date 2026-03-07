import React from "react";
import { createRoot } from "react-dom/client";
import { Widget } from "./components/Widget";
import { PromptEditor } from "./components/PromptEditor";
import "./index.css";

const style = document.createElement("style");
document.head.appendChild(style);

const userId = import.meta.env.VITE_USER_ID || "demo-user-id";
const mode = new URLSearchParams(window.location.search).get("mode");

const container = document.getElementById("root")!;
const root = createRoot(container);

if (mode === "editor") {
    root.render(
        <React.StrictMode>
            <PromptEditor userId={userId} />
        </React.StrictMode>,
    );
} else {
    root.render(
        <React.StrictMode>
            <div
                style={{
                    minHeight: "100vh",
                    background: "#0a0a0f",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "sans-serif",
                    color: "#e8e8f0",
                    gap: 16,
                }}
            >
                <h1 style={{ fontSize: 32, fontWeight: 700 }}>
                    AI Voice Widget Demo
                </h1>
                <p style={{ color: "#6b6b80" }}>
                    Click the button in the bottom-right corner
                </p>
                <a
                    href="?mode=editor"
                    style={{
                        color: "#6c63ff",
                        textDecoration: "underline",
                        fontSize: 14,
                    }}
                >
                    Open Prompt Editor →
                </a>
            </div>
            <div id="ai-voice-widget-root">
                <Widget
                    config={{
                        userId,
                        agentName: "AI",
                        buttonText: "Talk to AI",
                        agentAvatar: "🌙",
                    }}
                />
            </div>
        </React.StrictMode>,
    );
}
