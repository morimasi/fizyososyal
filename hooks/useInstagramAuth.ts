"use client";

import { useState, useCallback } from "react";

interface InstagramAuthState {
    isConnected: boolean;
    accountId: string | null;
    isLoading: boolean;
    error: string | null;
}

export function useInstagramAuth(initialAccountId?: string | null): InstagramAuthState & {
    connect: () => Promise<void>;
    disconnect: () => void;
} {
    const [state, setState] = useState<InstagramAuthState>({
        isConnected: !!initialAccountId,
        accountId: initialAccountId ?? null,
        isLoading: false,
        error: null,
    });

    const connect = useCallback(async () => {
        setState((s) => ({ ...s, isLoading: true, error: null }));
        try {
            const res = await fetch("/api/instagram/auth", { method: "POST" });
            const data = await res.json();
            if (data.authUrl) {
                window.location.href = data.authUrl;
            } else {
                throw new Error("Auth URL alınamadı");
            }
        } catch (err) {
            setState((s) => ({
                ...s,
                isLoading: false,
                error: err instanceof Error ? err.message : "Bağlantı hatası",
            }));
        }
    }, []);

    const disconnect = useCallback(() => {
        setState({ isConnected: false, accountId: null, isLoading: false, error: null });
    }, []);

    return { ...state, connect, disconnect };
}
