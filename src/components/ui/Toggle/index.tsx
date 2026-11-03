import type { ComponentPropsWithoutRef } from "react";

interface ToggleProps extends Omit<ComponentPropsWithoutRef<"button">, "onClick" | "aria-label"> {
    enabled: boolean;
    onToggle: () => void;
    ariaLabel: string;
}

function Toggle({ enabled, onToggle, ariaLabel, className = "", ...props }: ToggleProps) {
    const trackColor = enabled
        ? "bg-brand adjusted-contrast:bg-sidebar-purple"
        : "bg-gray-300 adjusted-contrast:bg-history-card-header";

    return (
        <button {...props} className={`relative flex h-8.5 w-14 shrink-0 cursor-pointer rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sidebar-purple disabled:cursor-not-allowed disabled:opacity-50 ${trackColor} ${className}`} onClick={onToggle} type="button" role="switch" aria-checked={enabled} aria-label={ariaLabel}>
            <span className={`absolute left-1 top-1 size-6.5 rounded-full bg-white transition-transform duration-250 adjusted-contrast:bg-surface ${enabled ? "translate-x-5.5" : "translate-x-0"}`} aria-hidden="true" />
        </button>
    );
}

export default Toggle;
