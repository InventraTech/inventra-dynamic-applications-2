import { useMemo } from "react";

import type { AIConversationSummary } from "../../../../types/ai";
import Button from "../../../ui/Button";
import Feedback from "../../../ui/Feedback";
import Loading from "../../../ui/Loading";
import SearchField from "../../../ui/SearchField";

interface ConversationSidebarProps {
    history: AIConversationSummary[];
    activeHistory: AIConversationSummary | null;
    loading: boolean;
    error: string | null;
    searchValue: string;
    onSearch: (query: string) => void;
    onNew: () => void;
    onOpen: (conversation: AIConversationSummary) => void;
}

function getGroupLabel(dateValue: string): string {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Outras conversas";
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (date >= startOfToday) return "Hoje";
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    if (date >= startOfYesterday) return "Ontem";
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);
    if (date >= startOfWeek) return "Esta semana";
    return "Anteriores";
}

function formatConversationDate(dateValue: string): string {
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? "Data indisponível" : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

export default function ConversationSidebar({ history, activeHistory, loading, error, searchValue, onSearch, onNew, onOpen }: ConversationSidebarProps) {
    // O histórico pode ter até 100 sessões; evita reagrupar a lista a cada busca.
    const groups = useMemo(() => {
        const grouped = new Map<string, AIConversationSummary[]>();
        for (const conversation of history) {
            const group = getGroupLabel(conversation.started_at);
            grouped.set(group, [...(grouped.get(group) ?? []), conversation]);
        }
        return [...grouped.entries()];
    }, [history]);

    return (
        <aside aria-label="Conversas do assistente" className="flex min-h-80 min-w-0 flex-col gap-4 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5 2xl:h-full 2xl:min-h-0">
            <Button variant="standard" onClick={onNew} className="w-full justify-start px-4 py-3 text-base">
                <span className="inline-flex size-7 items-center justify-center rounded-lg bg-on-brand/15 text-lg" aria-hidden="true">＋</span>
                Nova conversa
            </Button>
            <SearchField label="Buscar conversas" variant="subtle" placeholder="Buscar conversas" value={searchValue} onChange={(event) => onSearch(event.target.value)} />

            <div className="min-h-0 flex-1 overflow-y-auto pr-1" aria-busy={loading}>
                {loading ? <p role="status" aria-live="polite" className="sr-only">Atualizando conversas…</p> : null}
                {loading && history.length === 0 ? <Loading loadingText="Carregando conversas" /> : null}
                {error ? <Feedback severity="error" className="mb-3">{error}</Feedback> : null}
                {!loading && !error && groups.length === 0 ? <p className="rounded-2xl bg-history-card-header px-4 py-5 text-center text-sm text-history-muted">Suas conversas anteriores aparecerão aqui.</p> : null}
                <div className="space-y-5">
                    {groups.map(([group, conversations]) => (
                        <section key={group} aria-label={group}>
                            <h2 className="mb-2 px-2 font-k2d text-xs font-bold uppercase tracking-wide text-history-muted">{group}</h2>
                            <ul className="space-y-1">
                                {conversations.map((conversation) => {
                                    const title = conversation.titulo?.trim() || conversation.summary || "Conversa sem título";
                                    const selected = activeHistory?.doc_id === conversation.doc_id;
                                    return (
                                        <li key={conversation.doc_id}>
                                            <button
                                                type="button"
                                                onClick={() => onOpen(conversation)}
                                                aria-current={selected ? "page" : undefined}
                                                className={`w-full rounded-2xl px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${selected ? "bg-sidebar-active text-sidebar-purple" : "text-ink hover:bg-history-card-header"}`}
                                            >
                                                <span className="block truncate font-k2d text-sm font-semibold">{title}</span>
                                                <span className="mt-1 block truncate font-k2d text-xs text-history-muted">{conversation.summary || "Abra para consultar as mensagens."}</span>
                                                <time className="mt-2 block font-k2d text-xs text-history-muted" dateTime={conversation.started_at}>{formatConversationDate(conversation.started_at)}</time>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ))}
                </div>
            </div>
            <p className="rounded-2xl bg-sidebar-active px-4 py-3 font-k2d text-xs leading-relaxed text-sidebar-purple"><span className="mr-2 font-bold" aria-hidden="true">ⓘ</span>Uma cozinha por conversa. As consultas usam a cozinha da sua conta.</p>
        </aside>
    );
}
