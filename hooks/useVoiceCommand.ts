"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface VoiceCommandResult {
    transcript: string;
    topic: string;
    postType: string;
    tone: string;
    message: string;
}

interface UseVoiceCommandReturn {
    isListening: boolean;
    transcript: string;
    result: VoiceCommandResult | null;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    reset: () => void;
}

export function useVoiceCommand(): UseVoiceCommandReturn {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [result, setResult] = useState<VoiceCommandResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // @ts-ignore
        const SpeechRecognition =
            window.SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError("Tarayıcınız sesli komut desteklemiyor.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "tr-TR";
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            const current = Array.from(event.results)
                .map((r) => r[0].transcript)
                .join("");
            setTranscript(current);
        };

        recognition.onend = async () => {
            setIsListening(false);
            if (transcript) {
                await processCommand(transcript);
            }
        };

        recognition.onerror = (event) => {
            setError(`Ses hatası: ${event.error}`);
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }, [transcript]);

    const processCommand = useCallback(async (text: string) => {
        try {
            const res = await fetch("/api/ai/generate-text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: text, tone: "samimi" }),
            });
            // Voice command processing — Gemini ile parse et
            const parsed = await res.json();
            setResult({
                transcript: text,
                topic: text,
                postType: "egzersiz",
                tone: "samimi",
                message: `"${text}" konusunda içerik hazırlanıyor...`,
                ...parsed,
            });
        } catch {
            setError("Komut işlenemedi.");
        }
    }, []);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) return;
        setError(null);
        setTranscript("");
        setResult(null);
        setIsListening(true);
        recognitionRef.current.start();
    }, []);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
    }, []);

    const reset = useCallback(() => {
        setTranscript("");
        setResult(null);
        setError(null);
    }, []);

    return { isListening, transcript, result, error, startListening, stopListening, reset };
}
