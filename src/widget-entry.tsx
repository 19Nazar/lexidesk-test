import { createRoot } from "react-dom/client";
import { Widget } from "./components/Widget";
import { WidgetConfig } from "./types";

function injectStyles() {
    if (document.getElementById("ai-voice-widget-styles")) return;
    const style = document.createElement("style");
    style.id = "ai-voice-widget-styles";
    document.head.appendChild(style);
}

function createWidgetRoot() {
    let root = document.getElementById("ai-voice-widget-root");
    if (!root) {
        root = document.createElement("div");
        root.id = "ai-voice-widget-root";
        document.body.appendChild(root);
    }
    return root;
}

export function initWidget(config: WidgetConfig) {
    injectStyles();
    const container = createWidgetRoot();
    const reactRoot = createRoot(container);
    reactRoot.render(<Widget config={config} />);
}

// Auto-init from data attributes
function autoInit() {
    const script = document.currentScript as HTMLScriptElement | null;
    if (!script) return;

    const userId = script.getAttribute("data-user-id");
    const apiUrl = script.getAttribute("data-api-url");
    const primaryColor = script.getAttribute("data-primary-color");
    const buttonText = script.getAttribute("data-button-text");
    const agentName = script.getAttribute("data-agent-name");

    if (userId) {
        initWidget({
            userId,
            apiUrl: apiUrl ?? undefined,
            primaryColor: primaryColor ?? undefined,
            buttonText: buttonText ?? undefined,
            agentName: agentName ?? undefined,
        });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
} else {
    autoInit();
}

// Expose globally for manual init
declare global {
    interface Window {
        AIVoiceWidget: { init: typeof initWidget };
    }
}

window.AIVoiceWidget = { init: initWidget };
