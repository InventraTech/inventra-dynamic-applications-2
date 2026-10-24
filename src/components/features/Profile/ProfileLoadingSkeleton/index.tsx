function ProfileLoadingSkeleton() {
    return (
        <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] large-text:grid-cols-1" aria-busy="true" aria-label="Carregando dados do perfil">
            <p className="sr-only" role="status" aria-live="polite">Carregando seus dados de perfil…</p>
            <div className="flex min-w-0 flex-col gap-5">
                <div className="min-h-56 rounded-3xl bg-surface p-6 shadow-history-card motion-safe:animate-pulse">
                    <div className="h-6 w-40 rounded-full bg-history-card-header" />
                    <div className="mt-6 flex items-center gap-4">
                        <div className="size-24 rounded-full bg-history-card-header" />
                        <div className="flex-1 space-y-3"><div className="h-4 w-2/3 rounded-full bg-history-card-header" /><div className="h-4 w-1/3 rounded-full bg-history-card-header" /></div>
                    </div>
                </div>
                <div className="min-h-72 rounded-3xl bg-surface p-6 shadow-history-card motion-safe:animate-pulse">
                    <div className="h-6 w-48 rounded-full bg-history-card-header" />
                    <div className="mt-6 h-12 rounded-xl bg-history-card-header" />
                    <div className="mt-5 h-12 rounded-xl bg-history-card-header" />
                    <div className="mt-6 h-11 w-36 rounded-xl bg-history-card-header" />
                </div>
            </div>
            <div className="min-h-96 rounded-3xl bg-surface p-6 shadow-history-card motion-safe:animate-pulse">
                <div className="h-6 w-44 rounded-full bg-history-card-header" />
                <div className="mt-6 h-12 rounded-xl bg-history-card-header" />
                <div className="mt-5 h-12 rounded-xl bg-history-card-header" />
                <div className="mt-5 h-12 rounded-xl bg-history-card-header" />
                <div className="mt-6 h-11 w-40 rounded-xl bg-history-card-header" />
            </div>
        </section>
    );
}

export default ProfileLoadingSkeleton;
