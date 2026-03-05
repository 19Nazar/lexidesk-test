import React from "react";
import { VoiceState } from "../types";

const DELAYS = [0, 0.1, 0.2, 0.3, 0.2, 0.1, 0, 0.1, 0.2, 0.3, 0.2, 0.1];

export const VoiceVisualizer: React.FC<{ state: VoiceState }> = ({ state }) => {
    const label = {
        idle: "Tap to speak",
        listening: "Listening...",
        speaking: "AI is speaking",
        processing: "Connecting...",
    }[state];

    const barClass =
        state === "idle"
            ? "h-1 opacity-30"
            : state === "listening"
              ? "animate-bar-listen"
              : "animate-bar-speak";

    return (
        <div className="px-5 py-6 flex flex-col items-center gap-3 shrink-0 bg-gradient-to-b from-surface to-transparent">
            <div className="flex items-center gap-[3px] h-10">
                {DELAYS.map((delay, i) => (
                    <div
                        key={i}
                        className={`w-1 rounded-full bg-gradient-to-b from-accent to-accent2 transition-all ${barClass}`}
                        style={{ animationDelay: `${delay}s` }}
                    />
                ))}
            </div>
            <span className="text-xs font-medium text-muted uppercase tracking-widest font-dm">
                {label}
            </span>
        </div>
    );
};
