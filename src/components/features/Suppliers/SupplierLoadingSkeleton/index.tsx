function SupplierLoadingSkeleton() {
    return (
        <div className="flex min-w-0 flex-col gap-4 px-4 pb-8 pt-5 sm:gap-5 sm:px-6 sm:pt-6" aria-busy="true">
            <p className="sr-only" role="status" aria-live="polite">Carregando fornecedores da plataforma…</p>
            <div className="min-h-44 rounded-3xl bg-brand motion-safe:animate-pulse" aria-hidden="true" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
                {["total", "ativos", "inativos"].map((card) => <div key={card} className="h-20 rounded-3xl bg-surface shadow-history-card motion-safe:animate-pulse" />)}
            </div>
            <div className="min-h-96 rounded-3xl bg-surface shadow-history-card motion-safe:animate-pulse" aria-hidden="true" />
        </div>
    );
}

export default SupplierLoadingSkeleton;
