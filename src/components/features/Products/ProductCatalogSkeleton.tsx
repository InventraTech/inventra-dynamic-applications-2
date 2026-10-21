function ProductCatalogSkeleton() {
    return (
        <div className="min-w-0 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5" aria-busy="true" aria-label="Carregando catálogo de produtos">
            <p className="sr-only" role="status" aria-live="polite">Carregando produtos…</p>
            <div className="flex min-w-0 flex-col gap-3" aria-hidden="true">
                <div className="hidden grid-cols-[minmax(14rem,2fr)_minmax(7rem,1fr)_5rem_minmax(8rem,1fr)_6rem_5rem] gap-4 rounded-xl bg-history-card-header px-4 py-3 md:grid">
                    {["Produto", "Categoria", "Unidade", "Código de barras", "Situação", "Ações"].map((item) => <span className="h-3 w-16 max-w-full rounded-full bg-history-avatar motion-safe:animate-pulse" key={item} />)}
                </div>
                {["a", "b", "c", "d", "e"].map((row) => (
                    <div className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-history-border px-2 py-3 md:grid-cols-[minmax(14rem,2fr)_minmax(7rem,1fr)_5rem_minmax(8rem,1fr)_6rem_5rem] md:gap-4" key={row}>
                        <span className="flex min-w-0 items-center gap-3">
                            <span className="size-11 shrink-0 rounded-xl bg-history-avatar motion-safe:animate-pulse" />
                            <span className="flex min-w-0 flex-1 flex-col gap-2">
                                <span className="h-3 w-36 max-w-full rounded-full bg-history-avatar motion-safe:animate-pulse" />
                                <span className="h-2.5 w-24 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" />
                            </span>
                        </span>
                        {["w-20", "w-10", "w-28", "w-14"].map((width) => <span className={`hidden h-3 ${width} max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse md:block`} key={`${row}-${width}`} />)}
                        <span className="flex gap-2"><span className="size-9 rounded-xl bg-history-card-header motion-safe:animate-pulse" /><span className="size-9 rounded-xl bg-history-card-header motion-safe:animate-pulse" /></span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductCatalogSkeleton;
