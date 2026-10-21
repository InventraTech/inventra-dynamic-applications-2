function ProductDetailSkeleton() {
    return (
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]" aria-busy="true" aria-label="Carregando detalhes do produto">
            <p className="sr-only" role="status" aria-live="polite">Carregando produto, fornecedores e parâmetros da cozinha…</p>
            <div className="flex min-w-0 flex-col gap-5" aria-hidden="true">
                <div className="flex min-w-0 flex-wrap items-center gap-4 rounded-3xl bg-surface p-5 shadow-history-card sm:p-7"><span className="size-24 shrink-0 rounded-2xl bg-history-card-header motion-safe:animate-pulse" /><span className="flex min-w-0 flex-1 flex-col gap-3"><span className="h-6 w-56 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" /><span className="h-4 w-36 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" /><span className="h-8 w-28 rounded-full bg-sidebar-active motion-safe:animate-pulse" /></span></div>
                <div className="flex min-h-52 flex-col gap-4 rounded-3xl bg-surface p-5 shadow-history-card sm:p-7"><span className="h-5 w-40 rounded-full bg-history-card-header motion-safe:animate-pulse" />{["a", "b", "c"].map((row) => <span className="h-12 rounded-xl bg-history-card-header motion-safe:animate-pulse" key={row} />)}</div>
            </div>
            <div className="flex min-h-80 flex-col gap-4 rounded-3xl bg-surface p-5 shadow-history-card sm:p-7" aria-hidden="true"><span className="h-5 w-40 rounded-full bg-history-card-header motion-safe:animate-pulse" /><span className="h-3 w-52 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" />{["a", "b", "c", "d"].map((row) => <span className="h-11 rounded-xl bg-history-card-header motion-safe:animate-pulse" key={row} />)}</div>
        </div>
    );
}

export default ProductDetailSkeleton;
