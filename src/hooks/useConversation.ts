import { useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message } from "../types";
import { conversationsApi, leadsApi, ChatMessage } from "../api";

interface UseConversationOptions {
    userId: string;
}

export function useConversation({ userId }: UseConversationOptions) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [leadCollected, setLeadCollected] = useState(false);
    const [showLeadForm, setShowLeadForm] = useState(false);
    const userMessageCount = useRef(0);

    const startConversation = useCallback(async () => {
        const conv = await conversationsApi.create(userId);
        setConversationId(conv.id);
        return conv.id;
    }, [userId]);

    const cleanMessage = useCallback(() => {
        setMessages([]);
    }, [setMessages]);

    const addMessage = useCallback(
        async (role: "user" | "assistant", text: string) => {
            const msg: Message = {
                id: uuidv4(),
                role,
                text,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, msg]);

            if (role === "user") {
                userMessageCount.current += 1;
                // Show lead form after 2nd user message
                if (userMessageCount.current === 2 && !leadCollected) {
                    setTimeout(() => setShowLeadForm(true), 800);
                }
            }

            // Persist to backend
            if (conversationId) {
                setMessages((current) => {
                    const apiMessages: ChatMessage[] = current
                        .filter((m) => m.role !== "system")
                        .map((m) => ({
                            role: m.role as "user" | "assistant",
                            text: m.text,
                            timestamp: m.timestamp.toISOString(),
                        }));
                    conversationsApi
                        .update(conversationId, { messages: apiMessages })
                        .catch((error) => {
                            console.error(
                                "Error conversations: ",
                                error instanceof Error ? error.message : "",
                            );
                        });
                    return current;
                });
            }

            return msg;
        },
        [conversationId, leadCollected],
    );

    const submitLead = useCallback(
        async (name: string, email: string, phone: string) => {
            await leadsApi.create({
                userId,
                conversationId: conversationId ?? undefined,
                name,
                email,
                phone,
            });

            if (conversationId) {
                await conversationsApi.update(conversationId, {
                    leadCollected: true,
                });
            }

            setLeadCollected(true);
            setShowLeadForm(false);
        },
        [userId, conversationId],
    );

    const endConversation = useCallback(async () => {
        if (conversationId) {
            try {
                const result = await conversationsApi.summarize(conversationId);
                if (result.summary) {
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: uuidv4(),
                            role: "system" as const,
                            text: `📋 Conversation summary:\n${result.summary}`,
                            timestamp: new Date(),
                        },
                    ]);
                }
            } catch (e) {
                console.error("Failed to summarize", e);
            }
        }

        setConversationId(null);
        setLeadCollected(false);
        setShowLeadForm(false);
        userMessageCount.current = 0;
    }, [conversationId]);

    return {
        messages,
        conversationId,
        leadCollected,
        showLeadForm,
        startConversation,
        addMessage,
        submitLead,
        endConversation,
        setShowLeadForm,
        cleanMessage,
    };
}
