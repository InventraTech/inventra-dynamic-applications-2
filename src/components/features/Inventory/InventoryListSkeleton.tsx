export default function InventoryListSkeleton() {
    return (
        <div className="grid min-w-0 gap-4 px-4 pb-8 pt-5 sm:gap-5 sm:px-6 sm:pt-6" aria-hidden="true">
            <div className="min-h-44 rounded-3xl bg-brand motion-safe:animate-pulse" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 large-text:grid-cols-1">
                {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-20 rounded-3xl bg-surface motion-safe:animate-pulse" />)}
            </div>
            <div className="min-h-80 rounded-3xl bg-surface shadow-history-card motion-safe:animate-pulse" />
        </div>
    );
}
