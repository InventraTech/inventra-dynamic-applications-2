import { useEffect, useState } from "react";

interface ThinkingIndicatorProps {
    responding: boolean;
}

export default function ThinkingIndicator({ responding }: ThinkingIndicatorProps) {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        const startedAt = Date.now();
        const intervalId = window.setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, []);

    return (
        <div className="mr-auto flex items-center gap-3 rounded-2xl bg-history-card-header px-4 py-3 font-k2d text-sm text-history-muted" role="status" aria-live="polite" aria-atomic="true">
            <span className="size-3 motion-safe:animate-pulse rounded-full bg-brand" aria-hidden="true" />
            <span aria-hidden="true">{responding ? "Caixito está escrevendo a resposta" : "Caixito está consultando os dados da cozinha"} · {elapsedSeconds}s</span>
            <span className="sr-only">{responding ? "O assistente está escrevendo sua resposta." : "O assistente está consultando os dados da cozinha."}</span>
        </div>
    );
}
