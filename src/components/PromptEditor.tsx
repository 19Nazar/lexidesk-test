import React, { useEffect, useState } from "react";
import { promptsApi } from "../api";

export const PromptEditor: React.FC<{ userId: string }> = ({ userId }) => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        promptsApi.get(userId).then((d) => {
            setContent(d.content);
            setLoading(false);
        });
    }, [userId]);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            await promptsApi.update(userId, content);
            setSaved(true);
            window.location.href = "/";
            setTimeout(() => setSaved(false), 3000);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-base flex items-center justify-center p-6 font-dm">
            <div className="w-full max-w-[680px] bg-surface border border-[rgba(108,99,255,0.2)] rounded-3xl p-10 flex flex-col gap-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                <h1 className="font-syne font-bold text-[28px] bg-gradient-to-br from-[#e8e8f0] to-accent bg-clip-text text-transparent">
                    Agent System Prompt
                </h1>
                <p className="text-muted text-sm leading-relaxed">
                    Customize how your AI assistant behaves. This prompt sets
                    the tone, personality, and instructions for every
                    conversation.
                </p>

                {loading ? (
                    <div className="text-muted">Loading...</div>
                ) : (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter your system prompt here..."
                        className="bg-surface2 border border-[rgba(108,99,255,0.2)] rounded-[14px] p-4 text-sm text-[#e8e8f0] outline-none resize-y min-h-[200px] font-dm leading-relaxed focus:border-accent transition-colors"
                    />
                )}

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="bg-gradient-to-br from-accent to-accent2 border-none rounded-xl px-7 py-3.5 text-[15px] font-syne font-semibold text-white cursor-pointer hover:opacity-90 hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                    >
                        {saving ? "Saving..." : "Save Prompt"}
                    </button>
                    {saved && (
                        <span className="text-green-400 text-sm font-medium">
                            ✓ Saved successfully
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
