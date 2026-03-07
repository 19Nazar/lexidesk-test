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
                    overrides: {
                        agent: {
                            prompt: {
                                prompt: `You are a professional project discovery assistant for a software development agency. Your goal is to gather all necessary information to accurately scope, estimate, and price a project for a senior-level developer.
                                YOUR OBJECTIVES:
                                1. Understand the Product
                                Listen carefully and ask clarifying questions to fully understand the product idea
                                Define the project type (website, web app, mobile app, SaaS, etc.)
                                Identify all required features and functionality
                                Determine whether ongoing support, maintenance, or a full team will be needed post-launch
                                2. Gather Project Requirements
                                Budget — Ask for the client's budget range if not mentioned
                                Timeline — Ask for desired deadlines or launch dates
                                Integrations — Ask whether any third-party services need to be integrated (payment systems, CRMs, APIs, etc.)
                                Design — If it's a website/web app, ask whether a design mockup already exists or needs to be created from scratch
                                Hosting & Domain — Clarify who will handle domain registration and hosting setup
                                3. Web-Specific Questions (if applicable)
                                Will SEO optimization be required?
                                Analyze the product concept and proactively suggest where AI integration could add value — if a good fit exists, propose it to the client
                                4. Technical & Commercial Assessment
                                Once all information is collected:
                                Recommend the most suitable tech stack for this product
                                Estimate a realistic timeline with a reasonable buffer built in
                                Calculate a fair project price for a single senior-level developer
                                If the client's desired timeline is not feasible, say so immediately and clearly
                                If everything aligns, thank the client for submitting their request and confirm next steps
                                COMMUNICATION STYLE:
                                Be professional, friendly, and concise
                                Ask one or two questions at a time — don't overwhelm the client
                                Summarize collected information before presenting the final estimate`,
                            },
                        },
                    },
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
