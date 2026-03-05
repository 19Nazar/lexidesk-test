import { useState, useCallback, useRef, useEffect } from "react";
import { ChatMode, VoiceState } from "../types";
import { elevenLabsApi } from "../api";

interface UseElevenLabsOptions {
    userId: string;
    onTranscript: (text: string, role: "user" | "assistant") => void;
}

// ElevenLabs Conversational AI WebSocket client
// Uses the official @elevenlabs/client SDK when available
export function useElevenLabs({ userId, onTranscript }: UseElevenLabsOptions) {
    const [voiceState, setVoiceState] = useState<VoiceState>("idle");
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<any>(null);

    const onTranscriptRef = useRef(onTranscript);
    useEffect(() => {
        onTranscriptRef.current = onTranscript;
    }, [onTranscript]);

    const connect = useCallback(
        async (mode?: ChatMode) => {
            try {
                setVoiceState("processing");
                const { signedUrl } = await elevenLabsApi.getSignedUrl(userId);
                const { Conversation } = await import("@elevenlabs/client");
                const client = await Conversation.startSession({
                    signedUrl,
                    onConnect: () => {
                        setIsConnected(true);
                        setVoiceState(mode === "voice" ? "listening" : "idle");
                    },
                    onDisconnect: () => {
                        setIsConnected(false);
                        setVoiceState("idle");
                    },
                    onError: (message: string) => {
                        console.error("ElevenLabs error:", message);
                        setVoiceState("idle");
                    },
                    onModeChange: ({ mode }: { mode: string }) => {
                        if (mode === "speaking") setVoiceState("speaking");
                        else if (mode === "listening")
                            setVoiceState("listening");
                    },
                    onMessage: ({
                        message,
                        source,
                    }: {
                        message: string;
                        source: string;
                    }) => {
                        // Используем ref — всегда актуальная функция, connect не пересоздаётся
                        if (source === "ai")
                            onTranscriptRef.current(message, "assistant");
                        else if (source === "user")
                            onTranscriptRef.current(message, "user");
                    },
                    textOnly: mode === "text",
                });
                clientRef.current = client;
            } catch (err) {
                console.error("Failed to connect to ElevenLabs:", err);
                setVoiceState("idle");
            }
        },
        [userId], // ← убрали onTranscript из зависимостей
    );
    const sendUserMessage = useCallback(async (text: string) => {
        try {
            if (clientRef.current) {
                await clientRef.current.sendUserActivity();
                await clientRef.current.sendUserMessage(text);
                clientRef.current = null;
            }
        } catch (error) {
            console.error(
                "Error disconnect: ",
                error instanceof Error ? error.message : "",
            );
        }
    }, []);

    const disconnect = useCallback(async () => {
        try {
            if (clientRef.current) {
                await clientRef.current.sendUserActivity();
                await clientRef.current.endSession();
                clientRef.current = null;
            }
            setIsConnected(false);
            setVoiceState("idle");
        } catch (error) {
            console.error(
                "Error disconnect: ",
                error instanceof Error ? error.message : "",
            );
        }
    }, []);

    return {
        voiceState,
        isConnected,
        connect,
        disconnect,
        sendUserMessage,
    };
}
