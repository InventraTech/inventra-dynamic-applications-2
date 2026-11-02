function SkeletonBlock({ className = "" }: { className?: string }) {
    return <div aria-hidden="true" className={`rounded-2xl bg-history-card-header motion-safe:animate-pulse ${className}`} />;
}

function KitchenSettingsSkeleton() {
    return (
        <div className="grid min-w-0 gap-4 px-4 pb-6 pt-4 sm:px-5 sm:pt-5" aria-busy="true">
            <p className="sr-only" role="status" aria-live="polite">Carregando dados da cozinha…</p>
            <SkeletonBlock className="min-h-40 rounded-3xl bg-brand" />
            <div className="grid min-w-0 gap-4 xl:grid-cols-3 large-text:grid-cols-1">
                <div className="grid min-w-0 content-start gap-4 xl:col-span-2">
                    <section className="grid min-w-0 gap-4 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5" aria-hidden="true">
                        <div className="flex items-center gap-3"><SkeletonBlock className="size-11 shrink-0" /><div className="grid flex-1 gap-1.5"><SkeletonBlock className="h-5 w-40 max-w-full" /><SkeletonBlock className="h-4 w-64 max-w-full" /></div></div>
                        <div className="grid gap-4"><SkeletonBlock className="h-12" /><SkeletonBlock className="h-12" /><SkeletonBlock className="h-12" /></div>
                        <SkeletonBlock className="h-12" />
                        <div className="flex justify-between gap-3"><SkeletonBlock className="h-4 w-48 max-w-full" /><SkeletonBlock className="h-10 w-40 max-w-full" /></div>
                    </section>
                    <section className="grid min-w-0 gap-4 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5" aria-hidden="true">
                        <div className="flex items-center gap-3"><SkeletonBlock className="size-11 shrink-0" /><div className="grid flex-1 gap-1.5"><SkeletonBlock className="h-5 w-40 max-w-full" /><SkeletonBlock className="h-4 w-60 max-w-full" /></div></div>
                        <SkeletonBlock className="h-36" /><SkeletonBlock className="h-20" />
                    </section>
                    <section className="grid min-w-0 gap-4 rounded-3xl bg-surface p-4 shadow-history-card sm:p-5" aria-hidden="true">
                        <div className="flex items-center gap-3"><SkeletonBlock className="size-11 shrink-0" /><div className="grid flex-1 gap-1.5"><SkeletonBlock className="h-5 w-36 max-w-full" /><SkeletonBlock className="h-4 w-64 max-w-full" /></div></div>
                        <SkeletonBlock className="h-20" /><SkeletonBlock className="h-20" />
                    </section>
                </div>
                <aside className="grid min-w-0 content-start gap-4">
                    <section className="grid min-w-0 gap-3 rounded-3xl bg-surface p-4 shadow-history-card" aria-hidden="true"><SkeletonBlock className="h-6 w-36 max-w-full" /><SkeletonBlock className="h-44" /></section>
                    <section className="grid min-w-0 gap-3 rounded-3xl bg-surface p-4 shadow-history-card" aria-hidden="true"><SkeletonBlock className="h-6 w-44 max-w-full" /><SkeletonBlock className="h-16" /><SkeletonBlock className="h-10" /></section>
                    <SkeletonBlock className="min-h-28 rounded-3xl" />
                </aside>
            </div>
        </div>
    );
}

export default KitchenSettingsSkeleton;
