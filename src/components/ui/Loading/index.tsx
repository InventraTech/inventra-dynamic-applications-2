import type { LoadingProps } from "../../../types/loading";

function Loading({loadingText = "Carregando..."}: LoadingProps) {
    return (
        <div className="z-10 flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
            <div className="size-9 animate-spin rounded-full border-4 border-sidebar-divider border-t-sidebar-purple bg-surface" aria-hidden="true" />
            <p className="text-lg font-semibold text-sidebar-purple">{loadingText}</p>
        </div>
    );
}

export default Loading;
