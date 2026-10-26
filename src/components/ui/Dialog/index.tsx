import { useEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";

interface DialogProps extends Omit<ComponentPropsWithoutRef<"dialog">, "open" | "children" | "onClose" | "onCancel"> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
}

export default function Dialog({ open, onOpenChange, children, className = "", ...props }: DialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

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
            className={`m-auto max-h-dvh w-11/12 max-w-xl overflow-y-auto rounded-3xl border border-history-border bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/50 ${className}`.trim()}
        >
            {children}
        </dialog>
    );
}
