import type { ReactNode } from "react";

interface SettingRowProps {
    title: string;
    description?: string;
    children: ReactNode;
}

function SettingRow({ title, description, children }: SettingRowProps) {
    return (
        <div className="flex min-w-0 items-center justify-between gap-4">
            <div className="min-w-0">
                <p className="font-k2d text-sm font-semibold leading-snug text-sidebar-text">{title}</p>
                {description && <p className="mt-1 max-w-prose font-k2d text-xs leading-relaxed text-history-muted">{description}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">{children}</div>
        </div>
    );
}

export default SettingRow;
