import React, { useState, useCallback, useRef } from "react";
import { WidgetConfig, WidgetState, ChatMode } from "../types";
import { useConversation } from "../hooks/useConversation";
import { useElevenLabs } from "../hooks/useElevenLabs";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { MessageList } from "./MessageList";

interface WidgetProps {
    config: WidgetConfig;
}

const MicIcon = () => (
    <svg
        className="w-7 h-7 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

const CloseIcon = () => (
    <svg
        className="w-[18px] h-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const SendIcon = () => (
    <svg
        className="w-[18px] h-[18px] text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

export const Widget: React.FC<WidgetProps> = ({ config }) => {
    const [widgetState, setWidgetState] = useState<WidgetState>("closed");
    const [chatMode, setChatMode] = useState<ChatMode>("text");
    const [textInput, setTextInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const {
        messages,
        showLeadForm,
        startConversation,
        addMessage,
        submitLead,
        endConversation,
        setShowLeadForm,
        cleanMessage,
    } = useConversation({ userId: config.userId });

    const handleTranscript = useCallback(
        (text: string, role: "user" | "assistant") => {
            addMessage(role, text);
            if (role === "assistant") setIsTyping(false);
        },
        [addMessage],
    );

    const { voiceState, isConnected, connect, disconnect, sendUserMessage } =
        useElevenLabs({
            userId: config.userId,
            onTranscript: handleTranscript,
        });

    const openWidget = useCallback(async () => {
        setWidgetState("opening");
        setTimeout(() => setWidgetState("open"), 10);
        await startConversation();
        console.log("openWidget", chatMode);
        await connect(chatMode);
    }, [chatMode, connect, startConversation, addMessage]);

    const closeWidget = useCallback(async () => {
        setWidgetState("closing");
        await disconnect();
        // await endConversation();
        setTimeout(() => setWidgetState("closed"), 250);
    }, [disconnect, endConversation]);

    const switchMode = useCallback(
        async (mode: ChatMode) => {
            if (mode === chatMode) return;

            cleanMessage();

            await disconnect();

            setChatMode(mode);
            console.log("switchMode", widgetState);

            if (widgetState === "open") {
                await connect(mode);
            }
        },
        [chatMode, widgetState, connect, disconnect, messages, addMessage],
    );

    const sendTextMessage = useCallback(async () => {
        const text = textInput.trim();
        if (!text) return;
        setTextInput("");
        await addMessage("user", text);
        await sendUserMessage(text);
        setIsTyping(true);
    }, [textInput, addMessage]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendTextMessage();
        }
    };

    const agentName = config.agentName ?? "AI Assistant";
    const buttonText = config.buttonText ?? "Talk to AI";
    const statusText = {
        idle: "Online",
        listening: "Listening...",
        speaking: "Speaking...",
        processing: "Connecting...",
    }[voiceState];

    if (widgetState === "closed") {
        return (
            <div className="fixed bottom-6 right-6 z-[999999]">
                <button
                    onClick={openWidget}
                    title={buttonText}
                    aria-label={buttonText}
                    className="relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-accent to-accent2 shadow-[0_8px_32px_rgba(108,99,255,0.5)] hover:scale-[1.08] hover:shadow-[0_12px_40px_rgba(108,99,255,0.65)] transition-all ease-in-out duration-200"
                >
                    <span className="absolute inset-[-6px] rounded-full border-2 border-accent opacity-40 animate-pulse-ring pointer-events-none" />
                    <span className="absolute inset-[-12px] rounded-full border-2 border-accent opacity-20 animate-pulse-ring-2 pointer-events-none" />
                    <MicIcon />
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-[999999] flex flex-col items-end gap-3">
            <div
                className={`
                    w-[380px] h-[580px] sm:w-[calc(100vw-32px)] sm:h-[70vh] md:w-[380px] md:h-[580px]
                    bg-base rounded-[20px] flex flex-col overflow-hidden
                    border border-[rgba(108,99,255,0.2)]
                    shadow-[0_32px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(108,99,255,0.15)]
                    origin-bottom-right
                    ${widgetState === "closing" ? "animate-panel-close" : "animate-panel-open"}
        `}
            >
                {/* Header */}
                <div className="bg-surface px-5 py-4 flex items-center gap-3 border-b border-[rgba(108,99,255,0.2)] shrink-0">
                    <div
                        className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-lg bg-gradient-to-br from-accent to-accent2 ${voiceState === "speaking" ? "animate-avatar-pulse" : ""}`}
                    >
                        {config.agentAvatar ?? "🤖"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-syne font-bold text-[15px] text-[#e8e8f0] leading-tight">
                            {agentName}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-accent mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-dot-blink" />
                            {statusText}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-full flex flex-col">
                            <div className="flex items-center">
                                {(["voice", "text"] as ChatMode[]).map(
                                    (mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => switchMode(mode)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                                                chatMode === mode
                                                    ? "text-accent border-accent bg-accent/10"
                                                    : "text-muted border-[rgba(108,99,255,0.2)] bg-surface2 hover:text-accent hover:border-accent hover:bg-accent/10"
                                            }`}
                                        >
                                            {mode === "voice"
                                                ? "🎙 Voice"
                                                : "💬 Text"}
                                        </button>
                                    ),
                                )}
                            </div>
                            <button
                                onClick={async () => {
                                    await disconnect();
                                    await endConversation();
                                }}
                                className="px-3 py-1 rounded-full text-xs font-medium border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
                            >
                                End chat
                            </button>
                        </div>

                        <button
                            onClick={closeWidget}
                            aria-label="Close"
                            className="text-muted hover:text-[#e8e8f0] transition-colors p-1 rounded-lg flex items-center justify-center ml-1"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                {chatMode === "voice" && (
                    <VoiceVisualizer
                        state={isConnected ? voiceState : "idle"}
                    />
                )}

                <MessageList
                    messages={messages}
                    showLeadForm={showLeadForm}
                    isTyping={isTyping}
                    onLeadSubmit={submitLead}
                    onLeadSkip={() => setShowLeadForm(false)}
                />

                {chatMode === "text" && (
                    <div className="px-4 py-3 border-t border-[rgba(108,99,255,0.2)] flex gap-2 items-end shrink-0 bg-surface">
                        <textarea
                            ref={textareaRef}
                            placeholder="Type your message..."
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            className="flex-1 bg-surface2 border border-[rgba(108,99,255,0.2)] rounded-[14px] px-3.5 py-2.5 text-sm text-[#e8e8f0] outline-none resize-none min-h-[44px] max-h-[100px] leading-relaxed font-dm placeholder:text-muted focus:border-accent transition-colors"
                        />
                        <button
                            onClick={sendTextMessage}
                            disabled={!textInput.trim()}
                            aria-label="Send"
                            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-accent to-accent2 hover:scale-[1.08] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            <SendIcon />
                        </button>
                    </div>
                )}

                <div className="text-center py-2 text-[10px] text-muted opacity-50 shrink-0 font-dm">
                    Powered by 19Nazar
                </div>
            </div>
        </div>
    );
};
