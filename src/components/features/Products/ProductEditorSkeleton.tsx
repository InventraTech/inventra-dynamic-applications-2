function ProductEditorSkeleton() {
    return (
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(17rem,0.8fr)]" aria-busy="true" aria-label="Carregando formulário do produto">
            <p className="sr-only" role="status" aria-live="polite">Carregando dados do produto e opções do formulário…</p>
            <div className="flex min-w-0 flex-col gap-5 rounded-3xl bg-surface p-5 shadow-history-card sm:p-7" aria-hidden="true">
                <span className="h-6 w-40 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" />
                {["a", "b", "c", "d", "e"].map((field) => <div className="flex flex-col gap-2" key={field}><span className="h-3 w-24 rounded-full bg-history-card-header motion-safe:animate-pulse" /><span className="h-12 rounded-xl bg-history-card-header motion-safe:animate-pulse" /></div>)}
                <span className="h-11 w-full rounded-xl bg-sidebar-active motion-safe:animate-pulse sm:w-48" />
            </div>
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-3xl bg-surface p-6 shadow-history-card" aria-hidden="true"><span className="size-32 rounded-2xl bg-history-card-header motion-safe:animate-pulse" /><span className="h-10 w-36 rounded-full bg-sidebar-active motion-safe:animate-pulse" /></div>
        </div>
    );
}

export default ProductEditorSkeleton;
