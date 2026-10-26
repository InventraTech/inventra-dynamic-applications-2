export default function RequisitionDetailSkeleton() {
    return (
        <section className="grid min-w-0 gap-5" aria-busy="true">
            <p className="sr-only" role="status" aria-live="polite">Carregando o detalhe da requisição…</p>
            <div className="h-20 rounded-2xl bg-surface motion-safe:animate-pulse" aria-hidden="true" />
            <div className="h-28 rounded-2xl bg-surface motion-safe:animate-pulse" aria-hidden="true" />
            <div className="min-h-64 rounded-3xl bg-surface shadow-history-card motion-safe:animate-pulse" aria-hidden="true" />
        </section>
    );
}
