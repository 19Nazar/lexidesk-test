export type VoiceState = "idle" | "listening" | "speaking" | "processing";
export type ChatMode = "voice" | "text";
export type WidgetState = "closed" | "opening" | "open" | "closing";

export interface WidgetConfig {
    userId: string;
    apiUrl?: string;
    primaryColor?: string;
    buttonText?: string;
    agentName?: string;
    agentAvatar?: string;
}

export interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    text: string;
    timestamp: Date;
    type?: "text" | "lead-form";
}
