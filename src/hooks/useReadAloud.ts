import { useCallback, useEffect, useRef, useState } from "react";
import type { ReadAloudControls } from "../types/accessibility";

export function useReadAloud(rate: number): ReadAloudControls {
    const supported = typeof window !== "undefined" && "speechSynthesis" in window;
    const [state, setState] = useState<"idle" | "reading" | "paused" | "error">("idle");
    const generation = useRef(0);

    const stop = useCallback(() => {
        generation.current += 1;
        if (supported) window.speechSynthesis.cancel();
        setState("idle");
    }, [supported]);

    const speak = useCallback((text: string) => {
        if (!supported || !text.trim()) return;
        window.speechSynthesis.cancel();
        const currentGeneration = ++generation.current;
        const chunks: string[] = [];
        let chunk = "";
        for (const word of text.replace(/\s+/g, " ").trim().split(" ")) {
            if (chunk.length + word.length > 180 && chunk) { chunks.push(chunk); chunk = ""; }
            chunk += `${chunk ? " " : ""}${word}`;
        }
        if (chunk) chunks.push(chunk);
        let index = 0;
        setState("reading");

        function next() {
            if (generation.current !== currentGeneration) return;
            if (index >= chunks.length) { setState("idle"); return; }
            const utterance = new SpeechSynthesisUtterance(chunks[index++]);
            utterance.lang = "pt-BR";
            utterance.rate = rate;
            utterance.onend = next;
            utterance.onerror = (event) => {
                if (generation.current === currentGeneration) setState(event.error === "interrupted" || event.error === "canceled" ? "idle" : "error");
            };
            window.speechSynthesis.speak(utterance);
        }
        next();
    }, [supported, rate]);

    useEffect(() => () => { generation.current += 1; if (supported) window.speechSynthesis.cancel(); }, [rate, supported]);

    function pause() { if (supported) { window.speechSynthesis.pause(); setState("paused"); } }
    function resume() { if (supported) { window.speechSynthesis.resume(); setState("reading"); } }
    return { supported, state, speak, stop, pause, resume };
}
