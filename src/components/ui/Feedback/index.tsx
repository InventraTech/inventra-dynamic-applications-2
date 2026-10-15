import type { ComponentPropsWithoutRef } from "react";
import { useAccessibility } from "../../../context/accessibility";
import type { VisualAlerts } from "../../../types/accessibility";

interface FeedbackProps extends ComponentPropsWithoutRef<"p"> {
    severity?: "error" | "success" | "info";
    appearance?: VisualAlerts;
}

const colors = {
    error: "border-feedback-error text-feedback-error bg-feedback-error-bg",
    success: "border-feedback-success text-feedback-success bg-feedback-success-bg",
    info: "border-feedback-info text-feedback-info bg-feedback-info-bg",
};

function Feedback({ severity = "info", appearance, children, className = "", ...props }: FeedbackProps) {
    const { settings } = useAccessibility();
    const mode = appearance ?? settings.visualAlerts;
    return (
        <p {...props} role={severity === "error" ? "alert" : "status"} aria-atomic="true" className={`flex min-w-0 items-start gap-2 rounded-xl border text-sm leading-relaxed ${colors[severity]} ${mode === "icon-color" ? "px-2 py-1" : "px-3 py-2"} ${className}`}>
            {mode !== "banner" && <span className="shrink-0 font-bold" aria-hidden="true">{severity === "error" ? "!" : severity === "success" ? "✓" : "i"}</span>}
            <span className="min-w-0 wrap-anywhere">{children}</span>
        </p>
    );
}

export default Feedback;
