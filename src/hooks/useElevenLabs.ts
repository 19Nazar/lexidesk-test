import { useState, useCallback, useRef, useEffect } from "react";
import { ChatMode, VoiceState } from "../types";
import { elevenLabsApi } from "../api";
import { Conversation, Status } from "@elevenlabs/client";
interface UseElevenLabsOptions {
    userId: string;
    onTranscript: (text: string, role: "user" | "assistant") => void;
}

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
            console.log("useElevenLabs connect");

            if (clientRef.current) {
                console.warn("Already connected, skipping");
                return;
            }
            try {
                setVoiceState("processing");
                const { signedUrl } = await elevenLabsApi.getSignedUrl(userId);

                const client = await Conversation.startSession({
                    signedUrl,
                    onConnect: () => {
                        console.log("Conversation connect");

                        setIsConnected(true);
                        setVoiceState(mode === "voice" ? "listening" : "idle");
                    },
                    onDisconnect: () => {
                        console.log("Conversation disconnect");

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
                        if (source === "ai")
                            onTranscriptRef.current(message, "assistant");
                        else if (source === "user")
                            onTranscriptRef.current(message, "user");
                    },
                    onStatusChange: ({ status }: { status: Status }) => {
                        console.log("status", status);
                    },
                    textOnly: mode === "text",
                });

                clientRef.current = client;
            } catch (err) {
                console.error("Failed to connect to ElevenLabs:", err);
                setVoiceState("idle");
            }
        },
        [userId],
    );

    const sendUserMessage = useCallback(async (text: string) => {
        try {
            if (clientRef.current) {
                await clientRef.current.sendUserMessage(text);
            }
        } catch (error) {
            console.error(
                "Error sendUserMessage:",
                error instanceof Error ? error.message : "",
            );
        }
    }, []);

    const disconnect = useCallback(async () => {
        try {
            console.log("useElevenLabs disconnect");
            if (clientRef.current) {
                await clientRef.current.sendUserActivity();
                await clientRef.current.endSession();
                clientRef.current = null;
            }
            setIsConnected(false);
            setVoiceState("idle");
        } catch (error) {
            console.error(
                "Error disconnect:",
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
