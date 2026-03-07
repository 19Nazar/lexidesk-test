import { createRoot } from "react-dom/client";
import { Widget } from "./components/Widget";
import { WidgetConfig } from "./types";
import widgetStyles from "./index.css?inline"; // ← импорт CSS как строка

export function initWidget(config: WidgetConfig) {
    let host = document.getElementById("ai-voice-widget-host");
    if (!host) {
        host = document.createElement("div");
        host.id = "ai-voice-widget-host";

        host.style.cssText = "position:fixed;bottom:0;right:0;z-index:999999;";
        document.body.appendChild(host);
    }

    const shadow = host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = widgetStyles;
    shadow.appendChild(style);

    const container = document.createElement("div");
    shadow.appendChild(container);

    createRoot(container).render(<Widget config={config} />);
}

// Auto-init
function autoInit() {
    const script =
        (document.currentScript as HTMLScriptElement | null) ??
        (document.querySelector(
            "script[data-user-id]",
        ) as HTMLScriptElement | null);

    if (!script) return;

    const userId = script.getAttribute("data-user-id");
    if (!userId) return;

    initWidget({
        userId,
        apiUrl: script.getAttribute("data-api-url") ?? undefined,
        agentName: script.getAttribute("data-agent-name") ?? undefined,
        buttonText: script.getAttribute("data-button-text") ?? undefined,
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
} else {
    autoInit();
}

declare global {
    interface Window {
        LexideskTest: { init: typeof initWidget };
    }
}
window.LexideskTest = { init: initWidget };
