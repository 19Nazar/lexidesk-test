import axios from "axios";

const API_URL =
    (typeof import.meta !== "undefined" &&
        (import.meta as any).env?.VITE_API_URL) ||
    "http://localhost:3001";

export const api = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
});

export interface ChatMessage {
    role: "user" | "assistant";
    text: string;
    timestamp: string;
}

export interface Conversation {
    id: string;
    userId: string;
    messages: ChatMessage[];
    summary: string | null;
    leadCollected: boolean;
    createdAt: string;
}

export interface LeadData {
    userId: string;
    conversationId?: string;
    name: string;
    email: string;
    phone?: string;
}

export const conversationsApi = {
    create: (userId: string) =>
        api
            .post<Conversation>("/conversations", { userId })
            .then((r) => r.data),

    update: (
        id: string,
        data: { messages?: ChatMessage[]; leadCollected?: boolean },
    ) =>
        api
            .patch<Conversation>(`/conversations/${id}`, data)
            .then((r) => r.data),

    summarize: (id: string) =>
        api
            .post<Conversation>(`/conversations/${id}/summarize`)
            .then((r) => r.data),

    getByUser: (userId: string) =>
        api.get<Conversation[]>(`/conversations/${userId}`).then((r) => r.data),
};

export const leadsApi = {
    create: (data: LeadData) => api.post("/leads", data).then((r) => r.data),
};

export const elevenLabsApi = {
    getSignedUrl: (userId: string) =>
        api
            .get<{
                signedUrl: string;
                agentId: string;
            }>(`/elevenlabs/signed-url/${userId}`)
            .then((r) => r.data),
};

export const promptsApi = {
    get: (userId: string) =>
        api.get<{ content: string }>(`/prompts/${userId}`).then((r) => r.data),

    update: (userId: string, content: string) =>
        api.put(`/prompts/${userId}`, { content }).then((r) => r.data),
};
