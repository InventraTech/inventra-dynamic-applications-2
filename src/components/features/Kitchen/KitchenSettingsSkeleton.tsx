function SkeletonBlock({ className = "" }: { className?: string }) {
    return <div aria-hidden="true" className={`rounded-2xl bg-history-card-header motion-safe:animate-pulse ${className}`} />;
}

function KitchenSettingsSkeleton() {
    return (
        <div className="grid min-w-0 gap-5 px-4 pb-8 pt-5 sm:px-6 sm:pt-6" aria-busy="true">
            <p className="sr-only" role="status" aria-live="polite">Carregando dados da cozinha…</p>
            <SkeletonBlock className="min-h-48 rounded-4xl bg-brand" />
            <div className="grid min-w-0 gap-5 xl:grid-cols-3 large-text:grid-cols-1">
                <div className="grid min-w-0 content-start gap-5 xl:col-span-2">
                    <section className="grid min-w-0 gap-6 rounded-4xl bg-surface p-5 shadow-history-card sm:p-8" aria-hidden="true">
                        <div className="flex items-center gap-4"><SkeletonBlock className="size-13 shrink-0" /><div className="grid flex-1 gap-2"><SkeletonBlock className="h-6 w-48 max-w-full" /><SkeletonBlock className="h-4 w-72 max-w-full" /></div></div>
                        <div className="grid gap-5"><SkeletonBlock className="h-24" /><SkeletonBlock className="h-24" /><SkeletonBlock className="h-24" /></div>
                        <SkeletonBlock className="h-16" />
                        <div className="flex justify-between gap-4"><SkeletonBlock className="h-5 w-56 max-w-full" /><SkeletonBlock className="h-11 w-48 max-w-full" /></div>
                    </section>
                    <section className="grid min-w-0 gap-6 rounded-4xl bg-surface p-5 shadow-history-card sm:p-8" aria-hidden="true">
                        <div className="flex items-center gap-4"><SkeletonBlock className="size-13 shrink-0" /><div className="grid flex-1 gap-2"><SkeletonBlock className="h-6 w-48 max-w-full" /><SkeletonBlock className="h-4 w-64 max-w-full" /></div></div>
                        <SkeletonBlock className="h-48" /><SkeletonBlock className="h-24" />
                    </section>
                    <section className="grid min-w-0 gap-6 rounded-4xl bg-surface p-5 shadow-history-card sm:p-8" aria-hidden="true">
                        <div className="flex items-center gap-4"><SkeletonBlock className="size-13 shrink-0" /><div className="grid flex-1 gap-2"><SkeletonBlock className="h-6 w-40 max-w-full" /><SkeletonBlock className="h-4 w-72 max-w-full" /></div></div>
                        <SkeletonBlock className="h-28" /><SkeletonBlock className="h-28" />
                    </section>
                </div>
                <aside className="grid min-w-0 content-start gap-5">
                    <section className="grid min-w-0 gap-4 rounded-4xl bg-surface p-5 shadow-history-card" aria-hidden="true"><SkeletonBlock className="h-7 w-40 max-w-full" /><SkeletonBlock className="h-56" /></section>
                    <section className="grid min-w-0 gap-4 rounded-4xl bg-surface p-5 shadow-history-card" aria-hidden="true"><SkeletonBlock className="h-7 w-48 max-w-full" /><SkeletonBlock className="h-20" /><SkeletonBlock className="h-11" /></section>
                    <SkeletonBlock className="min-h-32 rounded-3xl" />
                </aside>
            </div>
        </div>
    );
}

export default KitchenSettingsSkeleton;
