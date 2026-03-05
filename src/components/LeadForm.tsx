import React, { useState } from "react";
import { z } from "zod";

const schema = z.object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
});

interface Props {
    onSubmit: (name: string, email: string, phone: string) => Promise<void>;
    onSkip: () => void;
}

export const LeadForm: React.FC<Props> = ({ onSubmit, onSkip }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [errors, setErrors] = useState<
        Partial<Record<"name" | "email", string>>
    >({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const result = schema.safeParse({ name, email, phone });
        if (!result.success) {
            const fe: typeof errors = {};
            result.error.errors.forEach((e) => {
                fe[e.path[0] as "name" | "email"] = e.message;
            });
            setErrors(fe);
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            await onSubmit(name, email, phone);
        } finally {
            setLoading(false);
        }
    };

    const inputCls =
        "w-full bg-base border border-[rgba(108,99,255,0.2)] rounded-[10px] px-3 py-2 text-[13px] text-[#e8e8f0] outline-none font-dm placeholder:text-muted focus:border-accent transition-colors";
    const labelCls =
        "text-[11px] font-semibold text-muted uppercase tracking-[0.06em]";

    return (
        <div className="bg-surface2 border border-[rgba(108,99,255,0.2)] rounded-2xl p-4 flex flex-col gap-3 animate-bubble-in mx-auto w-full max-w-[90%]">
            <div className="font-syne font-bold text-sm text-[#e8e8f0]">
                Let's stay in touch
            </div>

            <div className="flex flex-col gap-1">
                <label className={labelCls}>Your Name</label>
                <input
                    type="text"
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls}
                />
                {errors.name && (
                    <span className="text-[11px] text-accent2">
                        {errors.name}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <label className={labelCls}>Email</label>
                <input
                    type="email"
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                />
                {errors.email && (
                    <span className="text-[11px] text-accent2">
                        {errors.email}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <label className={labelCls}>Phone (optional)</label>
                <input
                    type="tel"
                    placeholder="+1 555 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputCls}
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-br from-accent to-accent2 border-none rounded-[10px] py-2.5 text-[13px] font-syne font-semibold text-white cursor-pointer hover:opacity-90 hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Saving..." : "Send My Details →"}
            </button>

            <button
                onClick={onSkip}
                className="bg-transparent border-none text-[11px] text-muted cursor-pointer text-center underline hover:text-[#e8e8f0] transition-colors"
            >
                Skip for now
            </button>
        </div>
    );
};
