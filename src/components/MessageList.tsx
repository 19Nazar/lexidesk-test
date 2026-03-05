import React, { useEffect, useRef } from "react";
import { Message } from "../types";
import { LeadForm } from "./LeadForm";

interface Props {
    messages: Message[];
    showLeadForm: boolean;
    isTyping: boolean;
    onLeadSubmit: (name: string, email: string, phone: string) => Promise<void>;
    onLeadSkip: () => void;
}

export const MessageList: React.FC<Props> = ({
    messages,
    showLeadForm,
    isTyping,
    onLeadSubmit,
    onLeadSkip,
}) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, showLeadForm, isTyping]);

    const formatTime = (d: Date) =>
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5 [scrollbar-width:thin] [scrollbar-color:rgba(108,99,255,0.2)_transparent]">
            {messages.map((msg) => {
                if (msg.role === "system") {
                    return (
                        <div
                            key={msg.id}
                            className="mx-auto w-full max-w-[90%] bg-surface2 border border-[rgba(108,99,255,0.2)] rounded-2xl px-4 py-3 text-xs text-muted font-dm leading-relaxed whitespace-pre-wrap animate-bubble-in"
                        >
                            {msg.text}
                        </div>
                    );
                }
                return (
                    <div
                        key={msg.id}
                        className={`flex flex-col gap-0.5 animate-bubble-in ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                        <div
                            className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed text-[#e8e8f0] font-dm ${
                                msg.role === "user"
                                    ? "bg-accent rounded-2xl rounded-br-[4px]"
                                    : "bg-surface2 border border-[rgba(108,99,255,0.2)] rounded-2xl rounded-bl-[4px]"
                            }`}
                        >
                            {msg.text}
                        </div>
                        <span className="text-[10px] text-muted px-1">
                            {formatTime(msg.timestamp)}
                        </span>
                    </div>
                );
            })}

            {isTyping && (
                <div className="flex items-start">
                    <div className="flex items-center gap-1 px-3.5 py-2.5 bg-surface2 border border-[rgba(108,99,255,0.2)] rounded-2xl rounded-bl-[4px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted animate-typing-1" />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted animate-typing-2" />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted animate-typing-3" />
                    </div>
                </div>
            )}

            {showLeadForm && (
                <LeadForm onSubmit={onLeadSubmit} onSkip={onLeadSkip} />
            )}
            <div ref={bottomRef} />
        </div>
    );
};
