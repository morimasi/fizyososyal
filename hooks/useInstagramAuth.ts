"use client";

import { useState, useCallback, useEffect } from "react";

interface InstagramAuthState {
    isConnected: boolean;
    accountId: string | null;
    username: string | null;
    isLoading: boolean;
    error: string | null;
}

export function useInstagramAuth(_initialAccountId?: string | null): InstagramAuthState & {
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    refresh: () => Promise<void>;
} {
    const [state, setState] = useState<InstagramAuthState>({
        isConnected: false,
        accountId: null,
        username: null,
        isLoading: true,
        error: null,
    });

    // DB'den gerçek bağlantı durumunu çek
    const refresh = useCallback(async () => {
        setState(s => ({ ...s, isLoading: true, error: null }));
        try {
            const res = await fetch("/api/instagram/status");
            const data = await res.json();
            setState({
                isConnected: data.connected,
                accountId: data.accountId ?? null,
                username: data.username ?? null,
                isLoading: false,
                error: null,
            });
        } catch {
            setState(s => ({ ...s, isLoading: false, error: "Durum sorgulanamadı" }));
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const connect = useCallback(async () => {
        setState(s => ({ ...s, isLoading: true, error: null }));
        try {
            const res = await fetch("/api/instagram/auth", { method: "POST" });
            const data = await res.json();
            if (data.authUrl) {
                window.location.href = data.authUrl;
            } else {
                throw new Error("Auth URL alınamadı");
            }
        } catch (err) {
            setState(s => ({
                ...s,
                isLoading: false,
                error: err instanceof Error ? err.message : "Bağlantı hatası",
            }));
        }
    }, []);

    const disconnect = useCallback(async () => {
        setState(s => ({ ...s, isLoading: true, error: null }));
        try {
            const res = await fetch("/api/instagram/status", { method: "DELETE" });
            if (!res.ok) throw new Error("Bağlantı kesilemedi");
            setState({ isConnected: false, accountId: null, username: null, isLoading: false, error: null });
        } catch (err) {
            setState(s => ({
                ...s,
                isLoading: false,
                error: err instanceof Error ? err.message : "Bağlantı kesme hatası",
            }));
        }
    }, []);

    return { ...state, connect, disconnect, refresh };
}
