function ProfileLoadingSkeleton() {
    return (
        <div className="flex min-w-0 flex-col gap-5 bg-linear-to-b from-history-background-start to-history-background-end px-4 pb-10 pt-5 sm:px-6 sm:pt-6 xl:px-8 adjusted-contrast:bg-none adjusted-contrast:bg-history-background-start" aria-busy="true">
            <p className="sr-only" role="status" aria-live="polite">Carregando seus dados de perfil…</p>
            <div className="mx-auto grid w-full max-w-7xl min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,0.72fr)] large-text:grid-cols-1">
                <div className="flex min-w-0 flex-col gap-5">
                    <section className="min-w-0 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6" aria-hidden="true">
                        <div className="h-6 w-40 rounded-full bg-history-card-header motion-safe:animate-pulse" />
                        <div className="mt-2 h-4 max-w-2xl rounded-full bg-history-card-header motion-safe:animate-pulse" />
                        <div className="mt-5 flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
                            <div className="size-24 shrink-0 rounded-full bg-history-card-header motion-safe:animate-pulse" />
                            <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
                                <div className="h-5 w-48 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" />
                                <div className="h-4 w-64 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" />
                                <div className="mt-1 flex flex-wrap gap-2">
                                    <div className="h-11 w-32 rounded-xl bg-history-card-header motion-safe:animate-pulse" />
                                    <div className="h-11 w-28 rounded-xl bg-history-card-header motion-safe:animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="min-w-0 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6" aria-hidden="true">
                        <div className="h-6 w-44 rounded-full bg-history-card-header motion-safe:animate-pulse" />
                        <div className="mt-2 h-4 w-72 max-w-full rounded-full bg-history-card-header motion-safe:animate-pulse" />
                        <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-2"><div className="h-4 w-28 rounded-full bg-history-card-header motion-safe:animate-pulse" /><div className="h-11 rounded-xl bg-history-card-header motion-safe:animate-pulse" /></div>
                            <div className="flex flex-col gap-2"><div className="h-4 w-16 rounded-full bg-history-card-header motion-safe:animate-pulse" /><div className="h-11 rounded-xl bg-history-card-header motion-safe:animate-pulse" /></div>
                        </div>
                        <div className="mt-5 h-11 w-32 rounded-xl bg-history-card-header motion-safe:animate-pulse" />
                    </section>
                </div>

                <div className="flex min-w-0 flex-col gap-5">
                    <section className="min-w-0 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6" aria-hidden="true">
                        <div className="h-6 w-32 rounded-full bg-history-card-header motion-safe:animate-pulse" />
                        <div className="mt-2 h-4 max-w-xl rounded-full bg-history-card-header motion-safe:animate-pulse" />
                        <div className="mt-5 flex flex-col gap-4">
                            <div className="flex flex-col gap-2"><div className="h-4 w-24 rounded-full bg-history-card-header motion-safe:animate-pulse" /><div className="h-11 rounded-xl bg-history-card-header motion-safe:animate-pulse" /></div>
                            <div className="flex flex-col gap-2"><div className="h-4 w-28 rounded-full bg-history-card-header motion-safe:animate-pulse" /><div className="h-11 rounded-xl bg-history-card-header motion-safe:animate-pulse" /></div>
                            <div className="flex flex-col gap-2"><div className="h-4 w-36 rounded-full bg-history-card-header motion-safe:animate-pulse" /><div className="h-11 rounded-xl bg-history-card-header motion-safe:animate-pulse" /></div>
                        </div>
                        <div className="mt-5 h-11 w-36 rounded-xl bg-history-card-header motion-safe:animate-pulse" />
                    </section>

                    <section className="min-w-0 rounded-3xl bg-surface p-5 shadow-history-card sm:p-6" aria-hidden="true">
                        <div className="h-6 w-40 rounded-full bg-history-card-header motion-safe:animate-pulse" />
                        <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 large-text:grid-cols-1">
                            <div className="h-20 rounded-2xl bg-history-card-header motion-safe:animate-pulse" />
                            <div className="h-20 rounded-2xl bg-history-card-header motion-safe:animate-pulse" />
                            <div className="h-20 rounded-2xl bg-history-card-header motion-safe:animate-pulse" />
                            <div className="h-20 rounded-2xl bg-history-card-header motion-safe:animate-pulse" />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default ProfileLoadingSkeleton;
