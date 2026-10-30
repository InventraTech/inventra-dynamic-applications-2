import type { ComponentPropsWithoutRef } from "react";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral" | "brand";

interface StatusBadgeProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
    label: string;
    tone: StatusTone;
}

const toneClasses: Record<StatusTone, string> = {
    success: "border-feedback-success bg-feedback-success-bg text-feedback-success",
    warning: "border-history-status-observation-text bg-history-status-observation-bg text-history-status-observation-text",
    danger: "border-feedback-error bg-feedback-error-bg text-feedback-error",
    info: "border-feedback-info bg-feedback-info-bg text-feedback-info",
    neutral: "border-history-border bg-history-card-header text-history-muted",
    brand: "border-sidebar-divider bg-sidebar-active text-sidebar-purple",
};

export default function StatusBadge({ label, tone, className = "", ...props }: StatusBadgeProps) {
    return (
        <span className={`inline-flex min-h-7 max-w-full items-center rounded-full border px-3 py-1 text-xs font-semibold leading-normal wrap-anywhere ${toneClasses[tone]} ${className}`.trim()} {...props}>
            {label}
        </span>
    );
}
