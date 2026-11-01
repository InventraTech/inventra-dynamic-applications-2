import { useEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";

interface DialogProps extends Omit<ComponentPropsWithoutRef<"dialog">, "open" | "children" | "onClose" | "onCancel"> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
    placement?: "center" | "top" | "right";
}

export default function Dialog({ open, onOpenChange, children, className = "", placement = "center", ...props }: DialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const placementClasses = placement === "right"
        ? "my-0 ml-auto mr-0 h-dvh max-h-dvh w-full max-w-2xl overflow-hidden rounded-l-3xl rounded-r-none border-r-0"
        : placement === "top"
            ? "mx-auto mt-4 mb-auto max-h-[calc(100dvh-2rem)] overflow-hidden"
            : "m-auto max-h-dvh overflow-y-auto";

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
        return () => { if (dialog.open) dialog.close(); };
    }, [open]);

    return (
        <dialog
            {...props}
            ref={dialogRef}
            onCancel={(event) => { event.preventDefault(); onOpenChange(false); }}
            onClick={(event) => { if (event.target === event.currentTarget) onOpenChange(false); }}
            className={`${!open ? "hidden" : ""} ${placementClasses} ${placement === "right" ? "" : "w-11/12 max-w-xl rounded-3xl"} border border-history-border bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/50 ${className}`.trim()}
        >
            {children}
        </dialog>
    );
}
